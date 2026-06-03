// Integration tests for app/api/webhooks/stripe/route.ts
// Mocks @/lib/stripe so no real Stripe signing is needed.
// Mocks @/services/ghl so no real GHL push occurs.
// Uses testPrisma (real DB) via setup.ts.

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { ServiceType, Tier, PaymentStatus } from '@prisma/client'
import { createOrder } from '@/services/orders'
import { POST } from '@/app/api/webhooks/stripe/route'
import { db, seedTestTenant, cleanDb } from './helpers'

// Mock @/lib/stripe so constructStripeEvent returns a controlled fake event
vi.mock('@/lib/stripe', () => ({
  stripe: vi.fn(),
  constructStripeEvent: vi.fn(),
}))

// Mock @/services/ghl — tested separately; GHL push is fire-and-forget here
vi.mock('@/services/ghl', () => ({
  pushOrderToGHL: vi.fn().mockResolvedValue({ ghlContactId: 'c1', ghlOpportunityId: 'o1' }),
}))

import type Stripe from 'stripe'
import { constructStripeEvent } from '@/lib/stripe'
import { pushOrderToGHL } from '@/services/ghl'

// Type-safe helper to configure constructStripeEvent mock for a given event
function mockStripeEvent(event: object) {
  vi.mocked(constructStripeEvent).mockReturnValue(event as Stripe.Event)
}

function makeStripeEvent(type: string, data: object, eventId = `evt_test_${Date.now()}`): object {
  return {
    id: eventId,
    type,
    data: { object: data },
    created: Math.floor(Date.now() / 1000),
  }
}

function makePaymentIntentEvent(paymentIntentId: string, amount = 26375) {
  return makeStripeEvent('payment_intent.succeeded', {
    id: paymentIntentId,
    object: 'payment_intent',
    amount,
    currency: 'usd',
    status: 'succeeded',
  })
}

function makeRequest(body: Buffer | string, sig = 'sig-header'): NextRequest {
  const buf = typeof body === 'string' ? Buffer.from(body) : body
  // NextRequest in test env requires Uint8Array / ReadableStream — cast via Uint8Array
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body: new Uint8Array(buf),
    headers: {
      'stripe-signature': sig,
      'content-type': 'application/octet-stream',
    },
  })
}

let ctx: Awaited<ReturnType<typeof seedTestTenant>>

beforeEach(async () => {
  await cleanDb()
  ctx = await seedTestTenant()
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  vi.mocked(constructStripeEvent).mockReset()
  vi.mocked(pushOrderToGHL).mockClear()
})

afterAll(async () => {
  await cleanDb()
  delete process.env.STRIPE_WEBHOOK_SECRET
})

async function makeOrderWithPaymentRef(paymentRef: string) {
  const { orderId } = await createOrder({
    tenantId: ctx.tenant.id,
    actorId: ctx.opsUser.id,
    customerName: 'Stripe Test',
    customerEmail: ctx.customerUser.email,
    businessName: 'Stripe LLC',
    serviceType: ServiceType.ANNUAL_REPORT,
    tier: Tier.STANDARD,
    state: 'FL',
    serviceFee: 125,
    stateFee: 138.75,
  })
  await db.order.update({ where: { id: orderId }, data: { paymentRef } })
  return orderId
}

// ── Signature / auth ────────────────────────────────────────────────────────

describe('request validation', () => {
  it('returns ok:false when stripe-signature header is missing', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: Buffer.from('{}'),
      headers: { 'content-type': 'application/octet-stream' },
    })
    const res = await POST(req)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.ok).toBe(false)
  })

  it('returns ok:false when STRIPE_WEBHOOK_SECRET env var is missing', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET
    const res = await POST(makeRequest(Buffer.from('{}'), 'sig'))
    const json = await res.json()
    expect(json.ok).toBe(false)
  })

  it('returns ok:false when constructStripeEvent throws (invalid signature)', async () => {
    vi.mocked(constructStripeEvent).mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature for payload')
    })
    const res = await POST(makeRequest(Buffer.from('{}'), 'bad-sig'))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.ok).toBe(false)
  })
})

// ── payment_intent.succeeded ────────────────────────────────────────────────

describe('payment_intent.succeeded', () => {
  it('marks order paymentStatus=CONFIRMED', async () => {
    const piId = `pi_test_${Date.now()}`
    const orderId = await makeOrderWithPaymentRef(piId)
    const event = makePaymentIntentEvent(piId)
    mockStripeEvent(event)

    const res = await POST(makeRequest(Buffer.from(JSON.stringify(event))))
    expect(res.status).toBe(200)

    const order = await db.order.findUnique({ where: { id: orderId } })
    expect(order?.paymentStatus).toBe(PaymentStatus.CONFIRMED)
  })

  it('writes PAYMENT_CONFIRMED AuditLog entry', async () => {
    const piId = `pi_test_audit_${Date.now()}`
    const orderId = await makeOrderWithPaymentRef(piId)
    const event = makePaymentIntentEvent(piId)
    mockStripeEvent(event)

    await POST(makeRequest(Buffer.from(JSON.stringify(event))))

    const log = await db.auditLog.findFirst({
      where: { entityId: orderId, action: 'PAYMENT_CONFIRMED' },
    })
    expect(log).not.toBeNull()
    expect(log?.actorId).toBe('system')
  })

  it('calls pushOrderToGHL after payment confirmation', async () => {
    const piId = `pi_test_ghl_${Date.now()}`
    const orderId = await makeOrderWithPaymentRef(piId)
    const event = makePaymentIntentEvent(piId)
    mockStripeEvent(event)

    await POST(makeRequest(Buffer.from(JSON.stringify(event))))
    expect(vi.mocked(pushOrderToGHL)).toHaveBeenCalledWith(orderId, ctx.tenant.id)
  })

  it('is idempotent — duplicate event ID is a no-op', async () => {
    const piId = `pi_test_idem_${Date.now()}`
    const orderId = await makeOrderWithPaymentRef(piId)
    const event = makePaymentIntentEvent(piId, 26375)
    mockStripeEvent(event)

    // First call — processes
    await POST(makeRequest(Buffer.from(JSON.stringify(event))))
    const callCount1 = vi.mocked(pushOrderToGHL).mock.calls.length

    // Second call — idempotency check hits WebhookEvent table, skips
    await POST(makeRequest(Buffer.from(JSON.stringify(event))))
    const callCount2 = vi.mocked(pushOrderToGHL).mock.calls.length

    expect(callCount2).toBe(callCount1) // not called again
    const logs = await db.auditLog.findMany({
      where: { entityId: orderId, action: 'PAYMENT_CONFIRMED' },
    })
    expect(logs).toHaveLength(1) // only one, not doubled
  })

  it('records WebhookEvent for idempotency', async () => {
    const piId = `pi_test_evt_${Date.now()}`
    await makeOrderWithPaymentRef(piId)
    const event = makePaymentIntentEvent(piId)
    mockStripeEvent(event)

    await POST(makeRequest(Buffer.from(JSON.stringify(event))))

    const evt = await db.webhookEvent.findUnique({
      where: { provider_eventId: { provider: 'stripe', eventId: (event as { id: string }).id } },
    })
    expect(evt).not.toBeNull()
  })

  it('returns ok:true and records event even for unknown paymentIntent (graceful)', async () => {
    const event = makePaymentIntentEvent('pi_no_matching_order_abc')
    mockStripeEvent(event)

    const res = await POST(makeRequest(Buffer.from(JSON.stringify(event))))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(vi.mocked(pushOrderToGHL)).not.toHaveBeenCalled()
  })

  it('GHL push failure is non-fatal — payment is still confirmed', async () => {
    vi.mocked(pushOrderToGHL).mockRejectedValueOnce(new Error('GHL is down'))

    const piId = `pi_test_ghlfail_${Date.now()}`
    const orderId = await makeOrderWithPaymentRef(piId)
    const event = makePaymentIntentEvent(piId)
    mockStripeEvent(event)

    const res = await POST(makeRequest(Buffer.from(JSON.stringify(event))))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)

    // Payment still confirmed even though GHL failed
    const order = await db.order.findUnique({ where: { id: orderId } })
    expect(order?.paymentStatus).toBe(PaymentStatus.CONFIRMED)
  })
})

// ── Other event types ───────────────────────────────────────────────────────

describe('other Stripe event types', () => {
  it('records event in WebhookEvent table for unhandled types', async () => {
    const event = makeStripeEvent('payment_intent.payment_failed', { id: 'pi_fail_001' }, 'evt_fail_001')
    mockStripeEvent(event)

    const res = await POST(makeRequest(Buffer.from(JSON.stringify(event))))
    const json = await res.json()
    expect(json.ok).toBe(true)

    const evt = await db.webhookEvent.findUnique({
      where: { provider_eventId: { provider: 'stripe', eventId: 'evt_fail_001' } },
    })
    expect(evt).not.toBeNull()
  })
})
