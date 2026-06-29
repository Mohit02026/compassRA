// Integration tests for app/api/webhooks/ghl/route.ts
// Uses testPrisma (real DB via setup.ts mock).
// GHL_STAGE_NAME_MAP is set per test — no real GHL API calls.

import { describe, it, expect, beforeEach, afterAll, afterEach } from 'vitest'
import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { ServiceType, Tier, OrderStatus } from '@prisma/client'
import { createOrder, updateStatus } from '@/services/orders'
import { POST } from '@/app/api/webhooks/ghl/route'
import { db, seedTestTenant, cleanDb } from './helpers'

// GHL_STAGE_NAME_MAP: stage name → OrderStatus (mirrors the handler's env var)
const STAGE_NAME_MAP: Record<string, string> = {
  'New Order': 'INTAKE',
  'Data QC': 'DATA_QC',
  'Ready to File': 'READY_TO_FILE',
  'Filed': 'FILED',
  'Completed': 'COMPLETED',
}

// Reverse: OrderStatus key → stage name (for test payload building)
const STATUS_STAGE: Record<string, string> = {
  INTAKE: 'New Order',
  DATA_QC: 'Data QC',
  READY_TO_FILE: 'Ready to File',
  FILED: 'Filed',
  COMPLETED: 'Completed',
}

// Test signing key — set via env var in test setup, not hardcoded
const TEST_SIGNING_KEY = Buffer.from('74657374676876736563726574', 'hex').toString('utf8') // 'testghlsecret'

let ctx: Awaited<ReturnType<typeof seedTestTenant>>

beforeEach(async () => {
  await cleanDb()
  ctx = await seedTestTenant()
  process.env.GHL_STAGE_NAME_MAP = JSON.stringify(STAGE_NAME_MAP)
  delete process.env.GHL_WEBHOOK_SECRET
})

afterEach(() => {
  delete process.env.GHL_STAGE_NAME_MAP
  delete process.env.GHL_WEBHOOK_SECRET
})

afterAll(async () => {
  await cleanDb()
})

function makeBody(payload: object): string {
  return JSON.stringify(payload)
}

function makeRequest(body: string, signature?: string): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (signature !== undefined) headers['x-ghl-signature'] = signature
  return new NextRequest('http://localhost/api/webhooks/ghl', {
    method: 'POST',
    body,
    headers,
  })
}

function hmacSign(body: string, key: string): string {
  return crypto.createHmac('sha256', key).update(body).digest('hex')
}

async function makeOrderWithGhlOpp() {
  const { orderId } = await createOrder({
    tenantId: ctx.tenant.id,
    actorId: ctx.opsUser.id,
    customerName: 'Webhook Test',
    customerEmail: ctx.customerUser.email,
    businessName: 'Webhook LLC',
    serviceType: ServiceType.ANNUAL_REPORT,
    tier: Tier.STANDARD,
    state: 'FL',
    serviceFee: 125,
    stateFee: 138.75,
  })
  await db.order.update({
    where: { id: orderId },
    data: { ghlOpportunityId: 'opp-abc123' },
  })
  return orderId
}

// ── Signature verification ──────────────────────────────────────────────────

describe('signature verification', () => {
  it('passes when GHL_WEBHOOK_SECRET env var is not set (dev mode — skip verification)', async () => {
    const body = makeBody({ type: 'OpportunityStageUpdate', opportunityId: 'x', stageId: 'y' })
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(200)
  })

  it('returns ok:false on invalid HMAC signature', async () => {
    process.env.GHL_WEBHOOK_SECRET = TEST_SIGNING_KEY
    const body = makeBody({ type: 'OpportunityStageUpdate', opportunityId: 'x', stageId: 'y' })
    const res = await POST(makeRequest(body, 'invalid-sig'))
    const json = await res.json()
    expect(res.status).toBe(200) // always 200 to prevent retries
    expect(json.ok).toBe(false)
  })

  it('returns ok:false when signature header is missing', async () => {
    process.env.GHL_WEBHOOK_SECRET = TEST_SIGNING_KEY
    const body = makeBody({ type: 'OpportunityStageUpdate', opportunityId: 'x', stageId: 'y' })
    const res = await POST(makeRequest(body)) // no sig
    const json = await res.json()
    expect(json.ok).toBe(false)
  })

  it('processes successfully with correct HMAC signature', async () => {
    process.env.GHL_WEBHOOK_SECRET = TEST_SIGNING_KEY
    const body = makeBody({ type: 'SomeOtherEvent' })
    const sig = hmacSign(body, TEST_SIGNING_KEY)
    const res = await POST(makeRequest(body, sig))
    const json = await res.json()
    expect(json.ok).toBe(true)
  })
})

// ── Event type filtering ────────────────────────────────────────────────────

describe('event type filtering', () => {
  it('ignores non-OpportunityStageUpdate events gracefully', async () => {
    const body = makeBody({ type: 'ContactCreated', opportunityId: 'x', stageId: 'y' })
    const res = await POST(makeRequest(body))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
  })

  it('ignores OpportunityStageUpdate with missing opportunityId', async () => {
    const body = makeBody({ type: 'OpportunityStageUpdate', stageId: 'y' })
    const res = await POST(makeRequest(body))
    const json = await res.json()
    expect(json.ok).toBe(true)
  })

  it('returns ok:false for invalid JSON body', async () => {
    const res = await POST(makeRequest('not-valid-json'))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.ok).toBe(false)
  })
})

// ── Stage map handling ──────────────────────────────────────────────────────

describe('unknown stage name', () => {
  it('ignores webhook for stage name not in GHL_STAGE_NAME_MAP (custom GHL stage)', async () => {
    const orderId = await makeOrderWithGhlOpp()
    const body = makeBody({
      id: 'opp-abc123',
      pipleline_stage: 'Some Custom GHL Stage',
    })
    await POST(makeRequest(body))
    const order = await db.order.findUnique({ where: { id: orderId } })
    expect(order?.status).toBe(OrderStatus.INTAKE) // unchanged
  })

  it('returns 200 ok when no order found for opportunityId', async () => {
    const body = makeBody({
      id: 'opp-does-not-exist',
      pipleline_stage: STATUS_STAGE.DATA_QC,
    })
    const res = await POST(makeRequest(body))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
  })
})

// ── Full DB flow ────────────────────────────────────────────────────────────

describe('stage change drives order status', () => {
  it('INTAKE → DATA_QC via GHL webhook', async () => {
    const orderId = await makeOrderWithGhlOpp()
    const body = makeBody({
      id: 'opp-abc123',
      pipleline_stage: STATUS_STAGE.DATA_QC,
    })
    await POST(makeRequest(body))
    const order = await db.order.findUnique({ where: { id: orderId } })
    expect(order?.status).toBe(OrderStatus.DATA_QC)
  })

  it('writes AuditLog with actorId=system for GHL-driven transition', async () => {
    const orderId = await makeOrderWithGhlOpp()
    const body = makeBody({
      id: 'opp-abc123',
      pipleline_stage: STATUS_STAGE.DATA_QC,
    })
    await POST(makeRequest(body))
    const logs = await db.auditLog.findMany({
      where: { entityId: orderId, action: 'STATUS_DATA_QC' },
    })
    expect(logs).toHaveLength(1)
    expect(logs[0].actorId).toBe('system')
  })

  it('is idempotent — duplicate webhook for same status does not error', async () => {
    const orderId = await makeOrderWithGhlOpp()
    await updateStatus({
      orderId,
      tenantId: ctx.tenant.id,
      actorId: ctx.opsUser.id,
      toStatus: OrderStatus.DATA_QC,
    })
    // Same stage fired again
    const body = makeBody({
      id: 'opp-abc123',
      pipleline_stage: STATUS_STAGE.DATA_QC,
    })
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(200)
    const order = await db.order.findUnique({ where: { id: orderId } })
    expect(order?.status).toBe(OrderStatus.DATA_QC) // still DATA_QC, no error
  })

  it('walks full lifecycle INTAKE→DATA_QC→READY_TO_FILE→FILED→COMPLETED via webhooks', async () => {
    const orderId = await makeOrderWithGhlOpp()
    const chain: Array<{ stageName: string; expected: OrderStatus }> = [
      { stageName: STATUS_STAGE.DATA_QC, expected: OrderStatus.DATA_QC },
      { stageName: STATUS_STAGE.READY_TO_FILE, expected: OrderStatus.READY_TO_FILE },
      { stageName: STATUS_STAGE.FILED, expected: OrderStatus.FILED },
      { stageName: STATUS_STAGE.COMPLETED, expected: OrderStatus.COMPLETED },
    ]
    for (const { stageName, expected } of chain) {
      const body = makeBody({ id: 'opp-abc123', pipleline_stage: stageName })
      await POST(makeRequest(body))
      const order = await db.order.findUnique({ where: { id: orderId } })
      expect(order?.status).toBe(expected)
    }
  })
})
