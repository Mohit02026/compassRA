// Integration tests for app/api/public/checkout/route.ts
// Mocks @/lib/stripe so no real Stripe API calls are made.
// Uses testPrisma (real DB) for order creation.

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { ServiceType, Tier } from '@prisma/client'
import { POST } from '@/app/api/public/checkout/route'
import { db, seedTestTenant, cleanDb } from './helpers'

// Mock @/lib/stripe — we don't want a real STRIPE_SECRET_KEY in tests
vi.mock('@/lib/stripe', () => ({
  stripe: vi.fn().mockReturnValue({
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: 'pi_test_checkout_001',
        client_secret: 'pi_test_checkout_001_secret_xyz',
        amount: 26375,
        currency: 'usd',
      }),
    },
  }),
  constructStripeEvent: vi.fn(),
}))

import { stripe } from '@/lib/stripe'

let ctx: Awaited<ReturnType<typeof seedTestTenant>>

beforeEach(async () => {
  await cleanDb()
  ctx = await seedTestTenant()
  // The checkout route looks up tenant by slug='compass' — rename to match.
  await db.tenant.update({ where: { id: ctx.tenant.id }, data: { slug: 'compass' } })
  vi.mocked(stripe().paymentIntents.create).mockClear()
})

afterAll(async () => {
  await cleanDb()
})

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/public/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const basePayload = () => ({
  customerName: 'Jane Doe',
  customerEmail: `jane-${Date.now()}@example.com`,
  serviceType: ServiceType.ANNUAL_REPORT,
  tier: Tier.STANDARD,
  businessName: 'Doe Holdings LLC',
  serviceFee: 125,
  stateFee: 138.75,
})

// ── Configuration guards ────────────────────────────────────────────────────

describe('configuration', () => {
  it('returns 500 when no compass tenant exists in DB', async () => {
    // Wipe DB so there is no tenant with slug='compass' — simulates unseeded environment.
    await cleanDb()
    const res = await POST(makeRequest(basePayload()))
    const json = await res.json()
    expect(res.status).toBe(500)
    expect(json.error.code).toBe(500)
  })
})

// ── Input validation ────────────────────────────────────────────────────────

describe('input validation', () => {
  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/public/checkout', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.error.code).toBe(400)
  })

  it('returns 400 when customerEmail is missing', async () => {
    const { customerEmail: _omit, ...rest } = basePayload()
    const res = await POST(makeRequest(rest))
    expect(res.status).toBe(400)
  })

  it('returns 400 when customerEmail is invalid format', async () => {
    const res = await POST(makeRequest({ ...basePayload(), customerEmail: 'not-an-email' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when businessName is missing', async () => {
    const { businessName: _omit, ...rest } = basePayload()
    const res = await POST(makeRequest(rest))
    expect(res.status).toBe(400)
  })

  it('returns 400 when serviceType is invalid', async () => {
    const res = await POST(makeRequest({ ...basePayload(), serviceType: 'INVALID_SERVICE' }))
    expect(res.status).toBe(400)
  })
})

// ── Happy path ──────────────────────────────────────────────────────────────

describe('successful checkout', () => {
  it('returns 201 with clientSecret and orderId', async () => {
    const res = await POST(makeRequest(basePayload()))
    const json = await res.json()
    expect(res.status).toBe(201)
    expect(json.data.clientSecret).toBeTruthy()
    expect(json.data.orderId).toBeTruthy()
  })

  it('creates an Order in the DB', async () => {
    const email = `create-test-${Date.now()}@example.com`
    const res = await POST(makeRequest({ ...basePayload(), customerEmail: email }))
    const json = await res.json()
    const order = await db.order.findUnique({ where: { id: json.data.orderId } })
    expect(order).not.toBeNull()
    expect(order?.tenantId).toBe(ctx.tenant.id)
    expect(order?.status).toBe('INTAKE')
  })

  it('stores paymentRef (Stripe PaymentIntent ID) on the order', async () => {
    const email = `payref-${Date.now()}@example.com`
    const res = await POST(makeRequest({ ...basePayload(), customerEmail: email }))
    const json = await res.json()
    const order = await db.order.findUnique({ where: { id: json.data.orderId } })
    expect(order?.paymentRef).toBe('pi_test_checkout_001')
  })

  it('creates Stripe PaymentIntent with correct amount in cents', async () => {
    const res = await POST(makeRequest(basePayload()))
    expect(res.status).toBe(201)
    const piCreate = vi.mocked(stripe().paymentIntents.create)
    const callArgs = piCreate.mock.lastCall![0] as { amount: number; currency: string }
    expect(callArgs.amount).toBe(26375) // $263.75 × 100
    expect(callArgs.currency).toBe('usd')
  })

  it('includes orderId and tenantId in Stripe PaymentIntent metadata', async () => {
    const email = `meta-${Date.now()}@example.com`
    const res = await POST(makeRequest({ ...basePayload(), customerEmail: email }))
    const json = await res.json()
    const piCreate = vi.mocked(stripe().paymentIntents.create)
    const callArgs = piCreate.mock.lastCall![0] as unknown as { metadata: { orderId: string; tenantId: string } }
    expect(callArgs.metadata.orderId).toBe(json.data.orderId)
    expect(callArgs.metadata.tenantId).toBe(ctx.tenant.id)
  })

  it('auto-creates customer User with CUSTOMER role for new email', async () => {
    const email = `newcustomer-${Date.now()}@example.com`
    await POST(makeRequest({ ...basePayload(), customerEmail: email }))
    const user = await db.user.findFirst({ where: { email } })
    expect(user).not.toBeNull()
    expect(user?.role).toBe('CUSTOMER')
    expect(user?.mustChangePwd).toBe(true)
  })
})

// ── Add-on pricing ──────────────────────────────────────────────────────────

describe('add-on pricing', () => {
  it('adds EIN ($75) to Stripe amount when addOnEin is true', async () => {
    const email = `addon-ein-${Date.now()}@example.com`
    await POST(makeRequest({ ...basePayload(), customerEmail: email, addOnEin: true }))
    const piCreate = vi.mocked(stripe().paymentIntents.create)
    const callArgs = piCreate.mock.lastCall![0] as { amount: number }
    expect(callArgs.amount).toBe(33875) // $263.75 + $75 = $338.75
  })

  it('adds Operating Agreement ($50) to amount when addOnOperatingAgreement is true', async () => {
    const email = `addon-oa-${Date.now()}@example.com`
    await POST(makeRequest({ ...basePayload(), customerEmail: email, addOnOperatingAgreement: true }))
    const piCreate = vi.mocked(stripe().paymentIntents.create)
    const callArgs = piCreate.mock.lastCall![0] as { amount: number }
    expect(callArgs.amount).toBe(31375) // $263.75 + $50
  })

  it('adds Certificate of Status ($9) to amount when addOnCertificateOfStatus is true', async () => {
    const email = `addon-cos-${Date.now()}@example.com`
    await POST(makeRequest({ ...basePayload(), customerEmail: email, addOnCertificateOfStatus: true }))
    const piCreate = vi.mocked(stripe().paymentIntents.create)
    const callArgs = piCreate.mock.lastCall![0] as { amount: number }
    expect(callArgs.amount).toBe(26375 + 900) // $263.75 + $9
  })

  it('adds all three add-ons combined', async () => {
    const email = `addon-all-${Date.now()}@example.com`
    await POST(makeRequest({
      ...basePayload(),
      customerEmail: email,
      addOnEin: true,
      addOnOperatingAgreement: true,
      addOnCertificateOfStatus: true,
    }))
    const piCreate = vi.mocked(stripe().paymentIntents.create)
    const callArgs = piCreate.mock.lastCall![0] as { amount: number }
    expect(callArgs.amount).toBe(26375 + 7500 + 5000 + 900) // $263.75 + $75 + $50 + $9
  })
})

// ── Tenant isolation ────────────────────────────────────────────────────────

describe('tenant scoping', () => {
  it('order is created under COMPASS_TENANT_ID, not user-supplied tenantId', async () => {
    const maliciousTenantId = 'other-tenant-id-injection'
    const injectedPayload = {
      ...basePayload(),
      customerEmail: `iso-${Date.now()}@example.com`,
      tenantId: maliciousTenantId, // extra field — Zod strips unknown keys
    }
    const res = await POST(makeRequest(injectedPayload))
    const json = await res.json()
    const order = await db.order.findUnique({ where: { id: json.data.orderId } })
    expect(order?.tenantId).toBe(ctx.tenant.id)
    expect(order?.tenantId).not.toBe(maliciousTenantId)
  })
})
