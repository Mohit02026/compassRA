// Integration tests for pushOrderToGHL() — EIN_FILING orders.
// Covers: correct service label, EIN details in note, SS4_DRAFT document
// preference, addOns list empty, opportunity name format.
// Mocks @/lib/ghl and @/lib/r2 — no real API calls.

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { ServiceType, Tier } from '@prisma/client'
import { createOrder } from '@/services/orders'
import { pushOrderToGHL } from '@/services/ghl'
import { db, seedTestTenant, cleanDb } from './helpers'

vi.mock('@/lib/ghl', () => ({
  createOrUpdateContact: vi.fn().mockResolvedValue({ id: 'ghl-contact-ein', email: 'test@example.com' }),
  createOpportunity: vi.fn().mockResolvedValue({ id: 'ghl-opp-ein', name: 'Test EIN Opp', pipelineStageId: 'stage-intake' }),
  updateOpportunityStage: vi.fn().mockResolvedValue(undefined),
  enrollContactInWorkflow: vi.fn().mockResolvedValue(undefined),
  getStageId: vi.fn().mockReturnValue('ghl-stage-intake'),
  createContactNote: vi.fn().mockResolvedValue({}),
  uploadMediaToGHL: vi.fn().mockResolvedValue({ url: 'https://ghl.test/file.pdf' }),
}))

vi.mock('@/lib/r2', () => ({
  uploadToR2: vi.fn().mockResolvedValue(undefined),
  downloadFromR2: vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock pdf')),
  getPresignedUrl: vi.fn().mockResolvedValue('https://r2.test/presigned'),
}))

// Mock PDF generators so createOrder doesn't fail without react-pdf setup
vi.mock('@/services/pdf', () => ({
  generateFilingSheet: vi.fn().mockResolvedValue(Buffer.from('%PDF filing')),
  generateArticlesOfOrg: vi.fn().mockResolvedValue(Buffer.from('%PDF articles')),
}))
vi.mock('@/services/ss4', () => ({
  generateSS4: vi.fn().mockResolvedValue(Buffer.from('%PDF ss4')),
}))
vi.mock('@/services/email', () => ({
  sendWelcome: vi.fn().mockResolvedValue(undefined),
  sendOrderFiled: vi.fn().mockResolvedValue(undefined),
  sendOrderCompleted: vi.fn().mockResolvedValue(undefined),
  sendException: vi.fn().mockResolvedValue(undefined),
  sendOpsAlert: vi.fn().mockResolvedValue(undefined),
}))

import {
  createOrUpdateContact,
  createOpportunity,
  createContactNote,
  uploadMediaToGHL,
  getStageId,
} from '@/lib/ghl'

const STAGE_MAP = JSON.stringify({ INTAKE: 'ghl-stage-intake', DATA_QC: 'ghl-stage-dataqc' })

let ctx: Awaited<ReturnType<typeof seedTestTenant>>

beforeEach(async () => {
  await cleanDb()
  ctx = await seedTestTenant()
  process.env.GHL_PIPELINE_ID = 'pipeline-test-123'
  process.env.GHL_LOCATION_ID = 'location-test-456'
  process.env.GHL_STAGE_MAP = STAGE_MAP
  process.env.NEXT_PUBLIC_APP_URL = 'https://compassregisteredagent.com'
  vi.mocked(createOrUpdateContact).mockClear().mockResolvedValue({ id: 'ghl-contact-ein', email: 'test@example.com' })
  vi.mocked(createOpportunity).mockClear().mockResolvedValue({ id: 'ghl-opp-ein', name: 'Test EIN Opp', pipelineStageId: 'ghl-stage-intake' })
  vi.mocked(createContactNote).mockClear().mockResolvedValue({})
  vi.mocked(getStageId).mockClear().mockReturnValue('ghl-stage-intake')
}, 30000)

afterAll(async () => {
  await cleanDb()
  delete process.env.GHL_PIPELINE_ID
  delete process.env.GHL_LOCATION_ID
  delete process.env.GHL_STAGE_MAP
  delete process.env.NEXT_PUBLIC_APP_URL
})

// Minimal EIN_FILING order with no add-ons — used for document preference tests
// so no background SS4 generation is triggered.
async function makeEinOrderNoAddOns(email?: string) {
  const { orderId } = await createOrder({
    tenantId: ctx.tenant.id,
    actorId: ctx.tenant.id,
    customerName: 'Jane Doe',
    customerEmail: email ?? `no-addons-${Date.now()}@example.com`,
    businessName: 'Sunshine Ventures LLC',
    serviceType: ServiceType.EIN_FILING,
    tier: Tier.STANDARD,
    state: 'FL',
    serviceFee: 75,
    stateFee: 0,
    addOnEin: false, // no SS4 background task
  })
  return orderId
}

async function makeEinOrder(email?: string) {
  const { orderId } = await createOrder({
    tenantId: ctx.tenant.id,
    actorId: ctx.tenant.id,
    customerName: 'Jane Doe',
    customerEmail: email ?? ctx.customerUser.email,
    businessName: 'Sunshine Ventures LLC',
    serviceType: ServiceType.EIN_FILING,
    tier: Tier.STANDARD,
    state: 'FL',
    serviceFee: 75,
    stateFee: 0,
    principalAddress: '123 Main St, Miami, FL 33101',
    mailingAddress: '123 Main St, Miami, FL 33101',
    // einOnly handled by checkout route; createOrder uses addOnEin to gate EIN data
    addOnEin: true,
    einResponsibleParty: 'Jane Doe',
    einResponsiblePartyFirstName: 'Jane',
    einResponsiblePartyLastName: 'Doe',
    einTaxIdType: 'ssn',
    einTaxId: '123-45-6789',
    einBusinessPurpose: 'Professional services',
    einDateStarted: '2026-01-01',
    einReasonApplying: 'new-business',
    einIsUSCitizen: true,
    einCounty: 'Miami-Dade',
    einClosingMonth: 'December',
    einEmployeesAgricultural: '0',
    einEmployeesHousehold: '0',
    einEmployeesOther: '0',
    einWants944: false,
    einProductService: 'Consulting',
    einPreviousEin: false,
    einMemberCount: '1',
    einTradeName: 'Sunshine',
  })
  return orderId
}

// ── Service label ────────────────────────────────────────────────────────────

describe('GHL service label', () => {
  it('opportunity name contains "EIN Filing" — not "LLC Formation"', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const oppCall = vi.mocked(createOpportunity).mock.lastCall![0] as { name: string }
    expect(oppCall.name).toContain('EIN Filing')
    expect(oppCall.name).not.toContain('LLC Formation')
  })

  it('opportunity name contains business name and short ID', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const oppCall = vi.mocked(createOpportunity).mock.lastCall![0] as { name: string }
    expect(oppCall.name).toContain('Sunshine Ventures LLC')
    expect(oppCall.name).toMatch(/#[A-Z0-9]{8}/)
  })
})

// ── GHL contact ──────────────────────────────────────────────────────────────

describe('GHL contact creation', () => {
  it('creates a contact for the customer', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)
    expect(vi.mocked(createOrUpdateContact)).toHaveBeenCalledOnce()
  })

  it('tags contact with "ein-filing" service tag', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const contactCall = vi.mocked(createOrUpdateContact).mock.lastCall![0] as { tags: string[] }
    expect(contactCall.tags).toContain('ein-filing')
    expect(contactCall.tags).toContain('compass-client')
  })
})

// ── GHL note content ─────────────────────────────────────────────────────────

describe('GHL note — EIN details', () => {
  it('note body contains EIN DETAILS section', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const noteCall = vi.mocked(createContactNote).mock.lastCall
    expect(noteCall).not.toBeNull()
    const noteBody = noteCall![1] as string
    expect(noteBody).toContain('EIN DETAILS')
  })

  it('note body contains responsible party name', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const noteBody = vi.mocked(createContactNote).mock.lastCall![1] as string
    expect(noteBody).toContain('Jane Doe')
  })

  it('note body shows SSN type and never prints plaintext tax ID', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const noteBody = vi.mocked(createContactNote).mock.lastCall![1] as string
    // Tax ID type label must appear; raw SSN must never appear
    expect(noteBody).toContain('Tax ID type: SSN')
    expect(noteBody).not.toContain('123-45-6789')
  })

  it('note body contains business activity', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const noteBody = vi.mocked(createContactNote).mock.lastCall![1] as string
    expect(noteBody).toContain('Professional services')
  })

  it('note body does NOT include ADD-ONS section for standalone EIN', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const noteBody = vi.mocked(createContactNote).mock.lastCall![1] as string
    // addOns is empty for EIN_FILING — 'ADD-ONS:' line must not appear
    expect(noteBody).not.toMatch(/ADD-ONS:/)
  })

  it('note body includes compass portal URL', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const noteBody = vi.mocked(createContactNote).mock.lastCall![1] as string
    expect(noteBody).toContain('COMPASS PORTAL')
    expect(noteBody).toContain(orderId)
  })
})

// ── GHL opportunity ──────────────────────────────────────────────────────────

describe('GHL opportunity', () => {
  it('opportunity created in correct pipeline with INTAKE stage', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const oppCall = vi.mocked(createOpportunity).mock.lastCall![0] as {
      pipelineId: string
      pipelineStageId: string
      status: string
    }
    expect(oppCall.pipelineId).toBe('pipeline-test-123')
    expect(oppCall.pipelineStageId).toBe('ghl-stage-intake')
    expect(oppCall.status).toBe('open')
  })

  it('stores ghlOpportunityId on the order after push', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const order = await db.order.findUnique({ where: { id: orderId } })
    expect(order?.ghlOpportunityId).toBe('ghl-opp-ein')
  })

  it('writes GHL_PUSHED AuditLog entry', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const log = await db.auditLog.findFirst({
      where: { entityId: orderId, action: 'GHL_PUSHED' },
    })
    expect(log).not.toBeNull()
    expect(log?.meta).toMatchObject({
      ghlContactId: 'ghl-contact-ein',
      ghlOpportunityId: 'ghl-opp-ein',
    })
  })

  it('monetary value equals order totalAmount', async () => {
    const orderId = await makeEinOrder()
    await pushOrderToGHL(orderId, ctx.tenant.id)

    const oppCall = vi.mocked(createOpportunity).mock.lastCall![0] as { monetaryValue: number }
    expect(oppCall.monetaryValue).toBe(75)
  })
})

// ── Document preference ──────────────────────────────────────────────────────

describe('GHL document upload preference', () => {
  it('prefers SS4_DRAFT document for EIN_FILING orders — uploads with ss4 filename', async () => {
    const orderId = await makeEinOrderNoAddOns()

    await db.document.create({
      data: {
        orderId,
        tenantId: ctx.tenant.id,
        type: 'SS4_DRAFT',
        r2Key: `${ctx.tenant.id}/orders/${orderId}/ss4-draft.pdf`,
        filename: 'ss4-draft.pdf',
      },
    })

    await pushOrderToGHL(orderId, ctx.tenant.id)

    // uploadMediaToGHL called with ss4-draft filename (not filing-sheet or articles-of-org)
    const uploadCall = vi.mocked(uploadMediaToGHL).mock.lastCall
    expect(uploadCall).not.toBeNull()
    expect(uploadCall![1]).toContain('ss4-draft')
    expect(uploadCall![1]).not.toContain('articles-of-org')
    expect(uploadCall![1]).not.toContain('filing-sheet')
  })

  it('falls back to FILING_SHEET when no SS4_DRAFT exists — uploads with filing-sheet filename', async () => {
    const orderId = await makeEinOrderNoAddOns() // no background SS4 task

    await db.document.create({
      data: {
        orderId,
        tenantId: ctx.tenant.id,
        type: 'FILING_SHEET',
        r2Key: `${ctx.tenant.id}/orders/${orderId}/filing-sheet.pdf`,
        filename: 'filing-sheet.pdf',
      },
    })

    await pushOrderToGHL(orderId, ctx.tenant.id)

    const uploadCall = vi.mocked(uploadMediaToGHL).mock.lastCall
    expect(uploadCall).not.toBeNull()
    expect(uploadCall![1]).toContain('filing-sheet')
  })
})
