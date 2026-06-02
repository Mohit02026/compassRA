import { prisma, setPrismaContext } from '@/lib/prisma'
import { ServiceType, Tier, OrderStatus } from '@prisma/client'
import { encrypt, SENSITIVE_KEYS } from '@/lib/encryption'
import { uploadToR2 } from '@/lib/r2'
import { generateFilingSheet } from '@/services/pdf'
import { sendWelcome, sendOrderFiled, sendOrderCompleted, sendException } from '@/services/email'
import { createCustomerWithUser } from '@/services/customers'

// Legal status transitions — driven by GHL webhook stage changes
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  INTAKE:        [OrderStatus.DATA_QC],
  DATA_QC:       [OrderStatus.READY_TO_FILE, OrderStatus.EXCEPTION],
  READY_TO_FILE: [OrderStatus.FILED, OrderStatus.EXCEPTION],
  FILED:         [OrderStatus.COMPLETED, OrderStatus.EXCEPTION],
  COMPLETED:     [],
  EXCEPTION:     [OrderStatus.DATA_QC],
}

export function isLegalTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export interface CreateOrderInput {
  tenantId: string
  actorId: string

  // Customer
  customerName: string
  customerEmail: string
  customerPhone?: string

  // Business
  businessName: string
  serviceType: ServiceType
  tier: Tier
  state: string
  principalAddress?: string
  mailingAddress?: string

  // Organizer
  organizerName?: string
  organizerEmail?: string
  organizerPhone?: string

  // Filing details
  dueDate?: Date
  serviceFee: number
  stateFee: number
  paymentRef?: string
  internalNotes?: string

  // Add-ons
  addOnEin?: boolean
  addOnOperatingAgreement?: boolean
  addOnCertificateOfStatus?: boolean
}

export interface CreateOrderResult {
  orderId: string
  customerId: string
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  await setPrismaContext(input.tenantId)

  // 1. Create customer + user
  const { customerId, tempPassword } = await createCustomerWithUser({
    tenantId: input.tenantId,
    name: input.customerName,
    email: input.customerEmail,
    phone: input.customerPhone,
  })

  const totalAmount = input.serviceFee + input.stateFee

  // 2. Build add-on list
  const addOns: string[] = []
  if (input.addOnEin) addOns.push('EIN')
  if (input.addOnOperatingAgreement) addOns.push('Operating Agreement')
  if (input.addOnCertificateOfStatus) addOns.push('Certificate of Status')

  // 3. Build OrderData key-value pairs — encrypt sensitive keys
  const orderDataFields: Record<string, string> = {
    businessName: input.businessName,
    principalAddress: input.principalAddress ?? '',
    mailingAddress: input.mailingAddress ?? '',
    organizerName: input.organizerName ?? '',
    organizerEmail: input.organizerEmail ?? '',
    organizerPhone: input.organizerPhone ?? '',
    addOns: addOns.join(','),
    serviceFee: String(input.serviceFee),
    stateFee: String(input.stateFee),
  }

  // 4. Create order + orderData in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        tenantId: input.tenantId,
        customerId,
        serviceType: input.serviceType,
        status: OrderStatus.INTAKE,
        tier: input.tier,
        state: input.state,
        totalAmount,
        dueDate: input.dueDate,
        internalNotes: input.internalNotes,
        paymentRef: input.paymentRef,
      },
    })

    await tx.orderData.createMany({
      data: Object.entries(orderDataFields).map(([key, value]) => ({
        orderId: o.id,
        key,
        value: SENSITIVE_KEYS.has(key) ? encrypt(value) : value,
      })),
    })

    await tx.auditLog.create({
      data: {
        tenantId: input.tenantId,
        actorId: input.actorId,
        entityType: 'Order',
        entityId: o.id,
        action: 'ORDER_CREATED',
        meta: { serviceType: input.serviceType, tier: input.tier },
      },
    })

    return o
  })

  // 5. Fire PDF generation + upload in background (non-blocking)
  void generateAndUploadFilingSheet({
    order,
    tenantId: input.tenantId,
    businessName: input.businessName,
    addOns,
    organizerName: input.organizerName,
    organizerEmail: input.organizerEmail,
    organizerPhone: input.organizerPhone,
    principalAddress: input.principalAddress,
    mailingAddress: input.mailingAddress,
    internalNotes: input.internalNotes,
  })

  // 6. Fire welcome email in background (non-blocking)
  void sendWelcome({
    to: input.customerEmail,
    customerName: input.customerName,
    businessName: input.businessName,
    serviceType: input.serviceType,
    tempPassword,
  })

  return { orderId: order.id, customerId }
}

async function generateAndUploadFilingSheet(params: {
  order: { id: string; serviceType: ServiceType; state: string }
  tenantId: string
  businessName: string
  addOns: string[]
  organizerName?: string
  organizerEmail?: string
  organizerPhone?: string
  principalAddress?: string
  mailingAddress?: string
  internalNotes?: string
}): Promise<void> {
  try {
    const buffer = await generateFilingSheet({
      orderId: params.order.id,
      generatedAt: new Date().toISOString().split('T')[0],
      businessName: params.businessName,
      serviceType: params.order.serviceType,
      state: params.order.state,
      principalAddress: params.principalAddress,
      mailingAddress: params.mailingAddress,
      organizerName: params.organizerName,
      organizerEmail: params.organizerEmail,
      organizerPhone: params.organizerPhone,
      addOns: params.addOns,
      internalNotes: params.internalNotes,
    })

    const r2Key = `${params.tenantId}/orders/${params.order.id}/filing-sheet.pdf`
    await uploadToR2(r2Key, buffer, 'application/pdf')

    await prisma.document.create({
      data: {
        orderId: params.order.id,
        tenantId: params.tenantId,
        type: 'FILING_SHEET',
        r2Key,
        filename: 'filing-sheet.pdf',
      },
    })
  } catch (err) {
    // Non-blocking — log but don't crash the order creation
    console.error('[PDF] Failed to generate/upload filing sheet:', err)
  }
}

export interface UpdateStatusInput {
  orderId: string
  tenantId: string
  actorId: string
  toStatus: OrderStatus
  note?: string
}

export async function updateStatus(input: UpdateStatusInput): Promise<void> {
  await setPrismaContext(input.tenantId)

  const order = await prisma.order.findFirst({
    where: { id: input.orderId, tenantId: input.tenantId, deletedAt: null },
    include: { customer: { include: { user: true } } },
  })

  if (!order) throw new Error('Order not found')
  if (!isLegalTransition(order.status, input.toStatus)) {
    throw new Error(`Illegal transition: ${order.status} → ${input.toStatus}`)
  }

  const timestamps: Record<string, Date> = {}
  if (input.toStatus === OrderStatus.FILED) timestamps.filedAt = new Date()
  if (input.toStatus === OrderStatus.COMPLETED) timestamps.completedAt = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: input.orderId },
      data: { status: input.toStatus, ...timestamps },
    })

    await tx.auditLog.create({
      data: {
        tenantId: input.tenantId,
        actorId: input.actorId,
        entityType: 'Order',
        entityId: input.orderId,
        action: `STATUS_${input.toStatus}`,
        meta: { from: order.status, to: input.toStatus, note: input.note },
      },
    })
  })

  // Fire email async — each status has its own template
  const email = order.customer.user.email
  const customerName = order.customer.name

  if (input.toStatus === OrderStatus.FILED) {
    void sendOrderFiled({ to: email, customerName, orderId: order.id })
  } else if (input.toStatus === OrderStatus.COMPLETED) {
    void sendOrderCompleted({ to: email, customerName, orderId: order.id })
    // Perpetual annual report re-scheduling — recurring revenue engine
    if (order.serviceType === ServiceType.ANNUAL_REPORT && order.dueDate) {
      void scheduleNextYearReminders(order.id, order.customerId, order.dueDate, input.tenantId)
    }
  } else if (input.toStatus === OrderStatus.EXCEPTION) {
    void sendException({ to: email, customerName, orderId: order.id, note: input.note })
  }
}

// On annual report completion, create next year's reminder rows
async function scheduleNextYearReminders(
  orderId: string,
  customerId: string,
  currentDueDate: Date,
  tenantId: string
): Promise<void> {
  try {
    await setPrismaContext(tenantId)
    const nextDueDate = new Date(currentDueDate)
    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)

    const INTERVALS = [90, 60, 30, 14, 7, 3]
    await prisma.reminder.createMany({
      data: INTERVALS.map((days) => ({
        orderId,
        customerId,
        type: `${days}day`,
        sendAt: new Date(nextDueDate.getTime() - days * 86400000),
        sentAt: null,
      })),
    })
  } catch (err) {
    console.error('[Reminders] Failed to schedule next year reminders:', err)
  }
}

export async function getOrder(orderId: string, tenantId: string) {
  await setPrismaContext(tenantId)
  return prisma.order.findFirst({
    where: { id: orderId, tenantId, deletedAt: null },
    include: {
      customer: { include: { user: true } },
      orderData: true,
      documents: { where: { deletedAt: null } },
    },
  })
}

export async function listOrders(
  tenantId: string,
  opts: {
    status?: OrderStatus
    cursor?: string
    limit?: number
  } = {}
) {
  await setPrismaContext(tenantId)
  const limit = Math.min(opts.limit ?? 50, 100)

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      deletedAt: null,
      ...(opts.status ? { status: opts.status } : {}),
    },
    include: {
      customer: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  })

  const hasMore = orders.length > limit
  const items = hasMore ? orders.slice(0, limit) : orders
  const nextCursor = hasMore ? items[items.length - 1].id : undefined

  return { items, nextCursor, hasMore }
}
