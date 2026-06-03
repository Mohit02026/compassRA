// Integration tests for services/ghl.ts — pushOrderToGHL()
// Mocks @/lib/ghl so no real GHL API calls are made.
// Uses testPrisma (real DB) for order setup and assertion.

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { ServiceType, Tier } from '@prisma/client'
import { createOrder } from '@/services/orders'
import { pushOrderToGHL } from '@/services/ghl'
import { db, seedTestTenant, cleanDb } from './helpers'

// @/lib/ghl is mocked in each test via per-call mock values.
// The top-level mock is established here so imports are resolved correctly.
vi.mock('@/lib/ghl', () => ({
  createOrUpdateContact: vi.fn().mockResolvedValue({ id: 'ghl-contact-aaa', email: 'test@example.com' }),
  createOpportunity: vi.fn().mockResolvedValue({ id: 'ghl-opp-bbb', name: 'Test Opp', pipelineStageId: 'stage-x' }),
  updateOpportunityStage: vi.fn().mockResolvedValue(undefined),
  enrollContactInWorkflow: vi.fn().mockResolvedValue(undefined),
  getStageId: vi.fn().mockReturnValue('ghl-stage-intake'),
}))

import { createOrUpdateContact, createOpportunity, getStageId } from '@/lib/ghl'

const STAGE_MAP = JSON.stringify({ INTAKE: 'ghl-stage-intake', DATA_QC: 'ghl-stage-dataqc' })

let ctx: Awaited<ReturnType<typeof seedTestTenant>>

beforeEach(async () => {
  await cleanDb()
  ctx = await seedTestTenant()
  process.env.GHL_PIPELINE_ID = 'pipeline-test-123'
  process.env.GHL_LOCATION_ID = 'location-test-456'
  process.env.GHL_STAGE_MAP = STAGE_MAP
  vi.mocked(createOrUpdateContact).mockClear().mockResolvedValue({ id: 'ghl-contact-aaa', email: 'test@example.com' })
  vi.mocked(createOpportunity).mockClear().mockResolvedValue({ id: 'ghl-opp-bbb', name: 'Test Opp', pipelineStageId: 'ghl-stage-intake' })
  vi.mocked(getStageId).mockClear().mockReturnValue('ghl-stage-intake')
})

afterAll(async () => {
  await cleanDb()
  delete process.env.GHL_PIPELINE_ID
  delete process.env.GHL_LOCATION_ID
  delete process.env.GHL_STAGE_MAP
})

async function makeOrder(opts: { name?: string; email?: string; phone?: string } = {}) {
  const { orderId } = await createOrder({
    tenantId: ctx.tenant.id,
    actorId: ctx.opsUser.id,
    customerName: opts.name ?? 'Alice Smith',
    customerEmail: opts.email ?? ctx.customerUser.email,
    businessName: 'Alice LLC',
    serviceType: ServiceType.LLC_FORMATION,
    tier: Tier.STANDARD,
    state: 'FL',
    serviceFee: 125,
    stateFee: 125,
    customerPhone: opts.phone,
  })
  return orderId
}

// ── Configuration guards ────────────────────────────────────────────────────

describe('configuration validation', () => {
  it('throws when GHL_PIPELINE_ID is not set', async () => {
    delete process.env.GHL_PIPELINE_ID
    const orderId = await makeOrder()
    await expect(pushOrderToGHL(orderId, ctx.tenant.id)).rejects.toThrow('GHL_PIPELINE_ID')
  })

  it('throws when GHL_LOCATION_ID is not set', async () => {
    delete process.env.GHL_LOCATION_ID
    const orderId = await makeOrder()
    await expect(pushOrderToGHL(orderId, ctx.tenant.id)).rejects.toThrow('GHL_LOCATION_ID')
  })

  it('throws when INTAKE stage is missing from GHL_STAGE_MAP', async () => {
    vi.mocked(getStageId).mockReturnValue(null)
    const orderId = await makeOrder()
    await expect(pushOrderToGHL(orderId, ctx.tenant.id)).rejects.toThrow('stage map missing INTAKE')
  })

  it('throws when order does not exist', async () => {
    await expect(pushOrderToGHL('non-existent-order-id', ctx.tenant.id)).rejects.toThrow('Order not found')
  })
})

// ── GHL API calls ───────────────────────────────────────────────────────────

describe('GHL API calls', () => {
  it('calls createOrUpdateContact with correct name parts', async () => {
    const orderId = await makeOrder({ name: 'Alice Smith', email: `a-${Date.now()}@example.com` })
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const callArgs = vi.mocked(createOrUpdateContact).mock.lastCall![0]
    expect(callArgs.firstName).toBe('Alice')
    expect(callArgs.lastName).toBe('Smith')
    expect(callArgs.locationId).toBe('location-test-456')
  })

  it('handles single-word names (no lastName)', async () => {
    const orderId = await makeOrder({ name: 'Madonna', email: `madonna-${Date.now()}@example.com` })
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const callArgs = vi.mocked(createOrUpdateContact).mock.lastCall![0]
    expect(callArgs.firstName).toBe('Madonna')
    expect(callArgs.lastName).toBeUndefined()
  })

  it('includes phone in GHL contact when present', async () => {
    const orderId = await makeOrder({ phone: '+1-813-555-0100', email: `ph-${Date.now()}@example.com` })
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const callArgs = vi.mocked(createOrUpdateContact).mock.lastCall![0]
    expect(callArgs.phone).toBe('+1-813-555-0100')
  })

  it('calls createOpportunity with correct pipeline and stage', async () => {
    const orderId = await makeOrder({ email: `opp-${Date.now()}@example.com` })
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const callArgs = vi.mocked(createOpportunity).mock.lastCall![0]
    expect(callArgs.pipelineId).toBe('pipeline-test-123')
    expect(callArgs.pipelineStageId).toBe('ghl-stage-intake')
    expect(callArgs.contactId).toBe('ghl-contact-aaa')
  })

  it('includes monetary value in opportunity', async () => {
    const orderId = await makeOrder({ email: `mv-${Date.now()}@example.com` })
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const callArgs = vi.mocked(createOpportunity).mock.lastCall![0]
    expect(callArgs.monetaryValue).toBe(250) // 125 + 125
  })

  it('includes correct service type tag', async () => {
    const orderId = await makeOrder({ email: `tag-${Date.now()}@example.com` })
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const callArgs = vi.mocked(createOrUpdateContact).mock.lastCall![0]
    expect(callArgs.tags).toContain('compass-client')
    expect(callArgs.tags).toContain('llc-formation')
  })
})

// ── DB side effects ─────────────────────────────────────────────────────────

describe('DB side effects', () => {
  it('stores ghlOpportunityId on the Order row', async () => {
    const orderId = await makeOrder({ email: `dbstore-${Date.now()}@example.com` })
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const order = await db.order.findUnique({ where: { id: orderId } })
    expect(order?.ghlOpportunityId).toBe('ghl-opp-bbb')
  })

  it('writes AuditLog GHL_PUSHED entry', async () => {
    const orderId = await makeOrder({ email: `audit-${Date.now()}@example.com` })
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const log = await db.auditLog.findFirst({
      where: { entityId: orderId, action: 'GHL_PUSHED' },
    })
    expect(log).not.toBeNull()
    expect(log?.actorId).toBe('system')
    expect((log?.meta as { ghlContactId: string }).ghlContactId).toBe('ghl-contact-aaa')
    expect((log?.meta as { ghlOpportunityId: string }).ghlOpportunityId).toBe('ghl-opp-bbb')
  })

  it('returns ghlContactId and ghlOpportunityId', async () => {
    const orderId = await makeOrder({ email: `return-${Date.now()}@example.com` })
    const result = await pushOrderToGHL(orderId, ctx.tenant.id)

    expect(result.ghlContactId).toBe('ghl-contact-aaa')
    expect(result.ghlOpportunityId).toBe('ghl-opp-bbb')
  })
})

// ── Tenant isolation ────────────────────────────────────────────────────────

describe('tenant isolation', () => {
  it('cannot push an order that belongs to another tenant', async () => {
    const otherCtx = await seedTestTenant('ghl-other')
    const { orderId } = await createOrder({
      tenantId: otherCtx.tenant.id,
      actorId: otherCtx.opsUser.id,
      customerName: 'Other',
      customerEmail: otherCtx.customerUser.email,
      businessName: 'Other LLC',
      serviceType: ServiceType.ANNUAL_REPORT,
      tier: Tier.STANDARD,
      state: 'FL',
      serviceFee: 100,
      stateFee: 100,
    })
    // Try to push using wrong tenantId
    await expect(pushOrderToGHL(orderId, ctx.tenant.id)).rejects.toThrow('Order not found')
  })
})
