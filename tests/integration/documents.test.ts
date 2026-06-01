import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { ServiceType, Tier, OrderStatus, DocumentType } from '@prisma/client'
import { createOrder, updateStatus } from '@/services/orders'
import { uploadDocument, getDownloadUrl, listDocuments } from '@/services/documents'
import { db, seedTestTenant, cleanDb } from './helpers'

let ctx: Awaited<ReturnType<typeof seedTestTenant>>

beforeEach(async () => {
  await cleanDb()
  ctx = await seedTestTenant()
})

afterAll(async () => {
  await cleanDb()
})

async function makeOrder() {
  const { orderId } = await createOrder({
    tenantId: ctx.tenant.id,
    actorId: ctx.opsUser.id,
    customerName: 'Doc Test',
    customerEmail: ctx.customerUser.email,
    businessName: 'Doc LLC',
    serviceType: ServiceType.ANNUAL_REPORT,
    tier: Tier.STANDARD,
    state: 'FL',
    serviceFee: 125,
    stateFee: 138.75,
  })
  return orderId
}

describe('uploadDocument', () => {
  it('creates a Document row', async () => {
    const orderId = await makeOrder()
    const doc = await uploadDocument({
      orderId,
      tenantId: ctx.tenant.id,
      actorId: ctx.opsUser.id,
      type: DocumentType.FILING_RECEIPT,
      filename: 'receipt.pdf',
      buffer: Buffer.from('test'),
      contentType: 'application/pdf',
    })
    expect(doc.id).toBeTruthy()
    expect(doc.type).toBe(DocumentType.FILING_RECEIPT)
  })

  it('uploading CERTIFICATE auto-completes a FILED order', async () => {
    const orderId = await makeOrder()
    await updateStatus({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, toStatus: OrderStatus.REVIEW })
    await updateStatus({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, toStatus: OrderStatus.FILED })

    await uploadDocument({
      orderId,
      tenantId: ctx.tenant.id,
      actorId: ctx.opsUser.id,
      type: DocumentType.CERTIFICATE,
      filename: 'cert.pdf',
      buffer: Buffer.from('cert'),
      contentType: 'application/pdf',
    })

    const order = await db.order.findUnique({ where: { id: orderId } })
    expect(order?.status).toBe(OrderStatus.COMPLETED)
    expect(order?.completedAt).toBeTruthy()
  })

  it('CERTIFICATE upload on non-FILED order does not complete it', async () => {
    const orderId = await makeOrder()
    // Still INTAKE — cert upload should not trigger completion
    await uploadDocument({
      orderId,
      tenantId: ctx.tenant.id,
      actorId: ctx.opsUser.id,
      type: DocumentType.CERTIFICATE,
      filename: 'cert.pdf',
      buffer: Buffer.from('cert'),
      contentType: 'application/pdf',
    })
    const order = await db.order.findUnique({ where: { id: orderId } })
    expect(order?.status).toBe(OrderStatus.INTAKE)
  })
})

describe('getDownloadUrl', () => {
  it('returns a presigned URL (mocked)', async () => {
    const orderId = await makeOrder()
    const doc = await uploadDocument({
      orderId,
      tenantId: ctx.tenant.id,
      actorId: ctx.opsUser.id,
      type: DocumentType.FILING_SHEET,
      filename: 'sheet.pdf',
      buffer: Buffer.from('pdf'),
      contentType: 'application/pdf',
    })
    const url = await getDownloadUrl(doc.id, ctx.tenant.id)
    expect(url).toContain('mock-r2')
  })

  it('throws for non-existent document', async () => {
    await expect(getDownloadUrl('bad-id', ctx.tenant.id)).rejects.toThrow('Document not found')
  })

  it('tenant isolation — cannot get URL for another tenant doc', async () => {
    const other = await seedTestTenant('doc-iso')
    const otherOrderId = (await createOrder({
      tenantId: other.tenant.id,
      actorId: other.opsUser.id,
      customerName: 'Other',
      customerEmail: other.customerUser.email,
      businessName: 'Other LLC',
      serviceType: ServiceType.ANNUAL_REPORT,
      tier: Tier.STANDARD,
      state: 'FL',
      serviceFee: 100,
      stateFee: 100,
    })).orderId

    const doc = await uploadDocument({
      orderId: otherOrderId,
      tenantId: other.tenant.id,
      actorId: other.opsUser.id,
      type: DocumentType.FILING_SHEET,
      filename: 'f.pdf',
      buffer: Buffer.from('x'),
      contentType: 'application/pdf',
    })

    await expect(getDownloadUrl(doc.id, ctx.tenant.id)).rejects.toThrow('Document not found')
  })
})

describe('listDocuments', () => {
  it('returns documents for the tenant', async () => {
    const orderId = await makeOrder()
    await uploadDocument({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, type: DocumentType.FILING_SHEET, filename: 'a.pdf', buffer: Buffer.from('a'), contentType: 'application/pdf' })
    await uploadDocument({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, type: DocumentType.FILING_RECEIPT, filename: 'b.pdf', buffer: Buffer.from('b'), contentType: 'application/pdf' })

    const docs = await listDocuments(ctx.tenant.id)
    // 2 uploaded + 1 filing sheet from createOrder background task (may or may not run in test)
    expect(docs.length).toBeGreaterThanOrEqual(2)
    expect(docs.every((d) => d.tenantId === ctx.tenant.id)).toBe(true)
  })

  it('filters by orderId', async () => {
    const orderId1 = await makeOrder()
    const orderId2 = (await createOrder({
      tenantId: ctx.tenant.id,
      actorId: ctx.opsUser.id,
      customerName: 'Another',
      customerEmail: `another-${Date.now()}@test.com`,
      businessName: 'Another LLC',
      serviceType: ServiceType.ANNUAL_REPORT,
      tier: Tier.STANDARD,
      state: 'FL',
      serviceFee: 100,
      stateFee: 100,
    })).orderId

    await uploadDocument({ orderId: orderId1, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, type: DocumentType.FILING_RECEIPT, filename: 'r1.pdf', buffer: Buffer.from('1'), contentType: 'application/pdf' })
    await uploadDocument({ orderId: orderId2, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, type: DocumentType.FILING_RECEIPT, filename: 'r2.pdf', buffer: Buffer.from('2'), contentType: 'application/pdf' })

    const docs = await listDocuments(ctx.tenant.id, orderId1)
    expect(docs.every((d) => d.orderId === orderId1)).toBe(true)
  })
})
