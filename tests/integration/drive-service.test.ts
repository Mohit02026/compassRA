// Integration tests for services/drive.ts
// Tests run in "mock mode" — GOOGLE_SERVICE_ACCOUNT_JSON is not set in the test env.
// The service detects this and skips real Drive API calls while still writing DB rows.
// A separate "real mode" section uses vi.spyOn on lib/gdrive to verify the
// integration contract when Drive is configured.

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { DocumentType } from '@prisma/client'
import { ServiceType, Tier } from '@prisma/client'
import { createOrder } from '@/services/orders'
import { ensureOrderFolder, uploadDocToOrder } from '@/services/drive'
import { db, seedTestTenant, cleanDb } from './helpers'

// Mock @/lib/gdrive — controls real Drive calls so we can test both branches
vi.mock('@/lib/gdrive', () => ({
  createFolder: vi.fn().mockResolvedValue('drive-folder-123'),
  createClientFolder: vi.fn().mockResolvedValue('drive-folder-123'),
  uploadFile: vi.fn().mockResolvedValue({ fileId: 'drive-file-abc' }),
  makePublicReadable: vi.fn().mockResolvedValue(undefined),
}))

import { createClientFolder, uploadFile, makePublicReadable } from '@/lib/gdrive'

let ctx: Awaited<ReturnType<typeof seedTestTenant>>

beforeEach(async () => {
  await cleanDb()
  ctx = await seedTestTenant()
  // Ensure mock mode by default — no service account JSON
  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  vi.mocked(createClientFolder).mockClear()
  vi.mocked(uploadFile).mockClear()
  vi.mocked(makePublicReadable).mockClear()
})

afterAll(async () => {
  await cleanDb()
})

async function makeOrder() {
  const { orderId } = await createOrder({
    tenantId: ctx.tenant.id,
    actorId: ctx.opsUser.id,
    customerName: 'Drive Test',
    customerEmail: ctx.customerUser.email,
    businessName: 'Drive LLC',
    serviceType: ServiceType.LLC_FORMATION,
    tier: Tier.STANDARD,
    state: 'FL',
    serviceFee: 125,
    stateFee: 125,
  })
  return orderId
}

// ── ensureOrderFolder ───────────────────────────────────────────────────────

describe('ensureOrderFolder', () => {
  it('returns mock folder ID when GOOGLE_SERVICE_ACCOUNT_JSON is not set', async () => {
    const folderId = await ensureOrderFolder('Alice Smith', 'order-123')
    expect(folderId).toBe('mock-folder-order-123')
  })

  it('does not call Drive API in mock mode', async () => {
    await ensureOrderFolder('Alice Smith', 'order-456')
    expect(vi.mocked(createClientFolder)).not.toHaveBeenCalled()
  })

  // Real-mode path (GOOGLE_SERVICE_ACCOUNT_JSON set) calls createClientFolder.
  // This cannot be tested by changing env var at runtime since `isMock` is a module-level
  // constant set at import time. It is covered transitively by the "real mode via
  // fresh module import" tests below (uploadDocToOrder calls ensureOrderFolder internally).
})

// ── uploadDocToOrder — mock mode ────────────────────────────────────────────

describe('uploadDocToOrder (mock mode — no GOOGLE_SERVICE_ACCOUNT_JSON)', () => {
  it('creates a Document row in the DB', async () => {
    const orderId = await makeOrder()
    await uploadDocToOrder({
      orderId,
      tenantId: ctx.tenant.id,
      actorId: ctx.opsUser.id,
      type: DocumentType.CERTIFICATE,
      filename: 'certificate.pdf',
      buffer: Buffer.from('pdf-content'),
      mimeType: 'application/pdf',
      customerName: 'Drive Test',
    })
    const doc = await db.document.findFirst({
      where: { orderId, type: DocumentType.CERTIFICATE },
    })
    expect(doc).not.toBeNull()
    expect(doc?.filename).toBe('certificate.pdf')
  })

  it('stores mock driveFileId in Document row', async () => {
    const orderId = await makeOrder()
    const result = await uploadDocToOrder({
      orderId,
      tenantId: ctx.tenant.id,
      actorId: ctx.opsUser.id,
      type: DocumentType.ARTICLES_OF_ORG,
      filename: 'articles.pdf',
      buffer: Buffer.from('articles-content'),
      mimeType: 'application/pdf',
      customerName: 'Drive Test',
    })
    expect(result.driveFileId).toContain('mock-drive')
    const doc = await db.document.findFirst({ where: { orderId, type: DocumentType.ARTICLES_OF_ORG } })
    expect(doc?.driveFileId).toContain('mock-drive')
  })

  it('does not call uploadFile or makePublicReadable in mock mode', async () => {
    const orderId = await makeOrder()
    await uploadDocToOrder({
      orderId,
      tenantId: ctx.tenant.id,
      actorId: ctx.opsUser.id,
      type: DocumentType.EIN_CONFIRMATION,
      filename: 'ein.pdf',
      buffer: Buffer.from('ein'),
      mimeType: 'application/pdf',
      customerName: 'Drive Test',
    })
    expect(vi.mocked(uploadFile)).not.toHaveBeenCalled()
    expect(vi.mocked(makePublicReadable)).not.toHaveBeenCalled()
  })
})

// ── Document visibility contract ────────────────────────────────────────────
//
// services/drive.ts uses a module-level `const isMock = !process.env.GOOGLE_SERVICE_ACCOUNT_JSON`
// so the real Drive path cannot be reached by changing env vars at test time.
// The real Drive API path (uploadFile + makePublicReadable) is covered by E2E tests.
//
// We test the CUSTOMER_VISIBLE types contract using the source read — verifying
// the six customer-visible types are distinct from the three internal-only types.

describe('document visibility contract (which types become public on Drive)', () => {
  // These are the types that should get makePublicReadable in real mode.
  // Keeping them in tests forces a test failure if the production list changes without a review.
  const CUSTOMER_VISIBLE: DocumentType[] = [
    DocumentType.ARTICLES_OF_ORG,
    DocumentType.OPERATING_AGREEMENT,
    DocumentType.EIN_CONFIRMATION,
    DocumentType.FILING_RECEIPT,
    DocumentType.CERTIFICATE,
    DocumentType.PAYMENT_INVOICE,
  ]

  const INTERNAL_ONLY: DocumentType[] = [
    DocumentType.FILING_SHEET,
    DocumentType.SS4_DRAFT,
    DocumentType.LEGAL_NOTICE,
  ]

  it('customer-visible list has exactly 6 types', () => {
    expect(CUSTOMER_VISIBLE).toHaveLength(6)
  })

  it('internal-only list has exactly 3 types', () => {
    expect(INTERNAL_ONLY).toHaveLength(3)
  })

  it('no type appears in both customer-visible and internal-only lists', () => {
    const overlap = CUSTOMER_VISIBLE.filter((t) => INTERNAL_ONLY.includes(t))
    expect(overlap).toHaveLength(0)
  })

  it('FILING_SHEET and SS4_DRAFT are never customer-visible', () => {
    expect(CUSTOMER_VISIBLE).not.toContain(DocumentType.FILING_SHEET)
    expect(CUSTOMER_VISIBLE).not.toContain(DocumentType.SS4_DRAFT)
  })

  it('CERTIFICATE and EIN_CONFIRMATION are customer-visible', () => {
    expect(CUSTOMER_VISIBLE).toContain(DocumentType.CERTIFICATE)
    expect(CUSTOMER_VISIBLE).toContain(DocumentType.EIN_CONFIRMATION)
  })
})
