import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { OrderStatus, ServiceType, Tier } from '@prisma/client'
import { createOrder, getOrder, updateStatus, listOrders } from '@/services/orders'
import { db, seedTestTenant, cleanDb } from './helpers'

let ctx: Awaited<ReturnType<typeof seedTestTenant>>

beforeEach(async () => {
  await cleanDb()
  ctx = await seedTestTenant()
})

afterAll(async () => {
  await cleanDb()
})

const baseOrder = () => ({
  tenantId: ctx.tenant.id,
  actorId: ctx.opsUser.id,
  customerName: 'Jane Doe',
  customerEmail: ctx.customerUser.email,
  businessName: 'Doe LLC',
  serviceType: ServiceType.ANNUAL_REPORT,
  tier: Tier.STANDARD,
  state: 'FL',
  serviceFee: 125,
  stateFee: 138.75,
})

// Helper: advance order through the full lifecycle
async function advanceTo(orderId: string, status: OrderStatus) {
  const chain: OrderStatus[] = [
    OrderStatus.DATA_QC,
    OrderStatus.READY_TO_FILE,
    OrderStatus.FILED,
    OrderStatus.COMPLETED,
  ]
  for (const s of chain) {
    await updateStatus({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, toStatus: s })
    if (s === status) break
  }
}

describe('createOrder', () => {
  it('creates order and returns orderId + customerId', async () => {
    const result = await createOrder(baseOrder())
    expect(result.orderId).toBeTruthy()
    expect(result.customerId).toBeTruthy()
  })

  it('sets initial status to INTAKE', async () => {
    const { orderId } = await createOrder(baseOrder())
    const order = await getOrder(orderId, ctx.tenant.id)
    expect(order?.status).toBe(OrderStatus.INTAKE)
  })

  it('writes totalAmount = serviceFee + stateFee', async () => {
    const { orderId } = await createOrder(baseOrder())
    const order = await getOrder(orderId, ctx.tenant.id)
    expect(Number(order?.totalAmount)).toBeCloseTo(263.75)
  })

  it('stores businessName in orderData', async () => {
    const { orderId } = await createOrder(baseOrder())
    const data = await db.orderData.findFirst({ where: { orderId, key: 'businessName' } })
    expect(data?.value).toBe('Doe LLC')
  })

  it('writes AuditLog entry on creation', async () => {
    const { orderId } = await createOrder(baseOrder())
    const logs = await db.auditLog.findMany({ where: { entityId: orderId } })
    expect(logs).toHaveLength(1)
    expect(logs[0].action).toBe('ORDER_CREATED')
  })

  it('idempotent customer creation — same email reuses customer', async () => {
    await createOrder(baseOrder())
    await createOrder({ ...baseOrder(), businessName: 'Second LLC' })
    const customers = await db.customer.findMany({ where: { tenantId: ctx.tenant.id } })
    expect(customers).toHaveLength(1)
  })
})

describe('updateStatus', () => {
  it('INTAKE → DATA_QC succeeds', async () => {
    const { orderId } = await createOrder(baseOrder())
    await updateStatus({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, toStatus: OrderStatus.DATA_QC })
    const order = await getOrder(orderId, ctx.tenant.id)
    expect(order?.status).toBe(OrderStatus.DATA_QC)
  })

  it('sets filedAt when transitioning to FILED', async () => {
    const { orderId } = await createOrder(baseOrder())
    await advanceTo(orderId, OrderStatus.FILED)
    const order = await getOrder(orderId, ctx.tenant.id)
    expect(order?.filedAt).toBeTruthy()
  })

  it('sets completedAt when transitioning to COMPLETED', async () => {
    const { orderId } = await createOrder(baseOrder())
    await advanceTo(orderId, OrderStatus.COMPLETED)
    const order = await getOrder(orderId, ctx.tenant.id)
    expect(order?.completedAt).toBeTruthy()
  })

  it('writes AuditLog on each transition', async () => {
    const { orderId } = await createOrder(baseOrder())
    await updateStatus({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, toStatus: OrderStatus.DATA_QC })
    const logs = await db.auditLog.findMany({ where: { entityId: orderId }, orderBy: { createdAt: 'asc' } })
    expect(logs).toHaveLength(2) // ORDER_CREATED + STATUS_DATA_QC
    expect(logs[1].action).toBe('STATUS_DATA_QC')
  })

  it('throws on illegal transition', async () => {
    const { orderId } = await createOrder(baseOrder())
    await expect(
      updateStatus({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, toStatus: OrderStatus.COMPLETED })
    ).rejects.toThrow(/Illegal transition/)
  })

  it('EXCEPTION → DATA_QC (reopen) succeeds', async () => {
    const { orderId } = await createOrder(baseOrder())
    await updateStatus({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, toStatus: OrderStatus.DATA_QC })
    await updateStatus({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, toStatus: OrderStatus.EXCEPTION })
    await updateStatus({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, toStatus: OrderStatus.DATA_QC })
    const order = await getOrder(orderId, ctx.tenant.id)
    expect(order?.status).toBe(OrderStatus.DATA_QC)
  })
})

describe('listOrders', () => {
  it('returns orders for the tenant', async () => {
    await createOrder(baseOrder())
    await createOrder({ ...baseOrder(), businessName: 'Second LLC' })
    const { items } = await listOrders(ctx.tenant.id)
    expect(items).toHaveLength(2)
  })

  it('filters by status', async () => {
    const { orderId } = await createOrder(baseOrder())
    await createOrder({ ...baseOrder(), businessName: 'Second LLC' })
    await updateStatus({ orderId, tenantId: ctx.tenant.id, actorId: ctx.opsUser.id, toStatus: OrderStatus.DATA_QC })

    const { items } = await listOrders(ctx.tenant.id, { status: OrderStatus.DATA_QC })
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(orderId)
  })

  it('tenant isolation — does not return other tenant orders', async () => {
    await createOrder(baseOrder())
    const other = await seedTestTenant('other')
    await createOrder({ ...baseOrder(), tenantId: other.tenant.id, actorId: other.opsUser.id, customerEmail: other.customerUser.email })

    const { items } = await listOrders(ctx.tenant.id)
    expect(items).toHaveLength(1)
    expect(items[0].tenantId).toBe(ctx.tenant.id)
  })

  it('cursor pagination works', async () => {
    for (let i = 0; i < 3; i++) {
      await createOrder({ ...baseOrder(), businessName: `LLC ${i}`, customerEmail: `c${i}-${Date.now()}@test.com` })
    }
    const page1 = await listOrders(ctx.tenant.id, { limit: 2 })
    expect(page1.items).toHaveLength(2)
    expect(page1.hasMore).toBe(true)
    expect(page1.nextCursor).toBeTruthy()

    const page2 = await listOrders(ctx.tenant.id, { limit: 2, cursor: page1.nextCursor })
    expect(page2.items).toHaveLength(1)
    expect(page2.hasMore).toBe(false)
  })
})

describe('getOrder', () => {
  it('returns null for non-existent order', async () => {
    const order = await getOrder('non-existent-id', ctx.tenant.id)
    expect(order).toBeNull()
  })

  it('tenant isolation — cannot fetch another tenant order', async () => {
    const other = await seedTestTenant('iso')
    const { orderId } = await createOrder({ ...baseOrder(), tenantId: other.tenant.id, actorId: other.opsUser.id, customerEmail: other.customerUser.email })
    const order = await getOrder(orderId, ctx.tenant.id)
    expect(order).toBeNull()
  })
})
