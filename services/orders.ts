import { prisma, setPrismaContext } from '@/lib/prisma'
import { ServiceType, Tier, OrderStatus } from '@prisma/client'
import { encrypt, SENSITIVE_KEYS } from '@/lib/encryption'
import { uploadToR2 } from '@/lib/r2'
import { generateFilingSheet, generateArticlesOfOrg } from '@/services/pdf'
import { generateSS4 } from '@/services/ss4'
import { sendWelcome, sendOrderFiled, sendOrderCompleted, sendException, sendOpsAlert } from '@/services/email'
import { createCustomerWithUser } from '@/services/customers'
import { updateOpportunityStage, getStageId } from '@/lib/ghl'
import { lookupByDocNumber } from '@/services/sunbiz'

// Compass RA constants — used in Articles of Org
// Address confirmed via SunBiz (Document # L25000307072, filed 07/10/2025)
const RA_NAME = 'Compass Registered Agent, LLC'
const RA_STREET = '625 Court St Ste 100'
const RA_CITY = 'Clearwater'
const RA_COUNTY = 'Pinellas'
const RA_STATE = 'FL'
const RA_ZIP = '33756'

// Parse a combined address string: "123 Main St, Miami, FL 33101"
// Produced by the LLC form: `${street}, ${city}, ${state} ${zip}`
function parseAddress(address: string): { street: string; city: string; state: string; zip: string } {
  const m = address.match(/^(.+?),\s*(.+?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/)
  if (m) return { street: m[1], city: m[2], state: m[3], zip: m[4] }
  return { street: address, city: '', state: 'FL', zip: '' }
}

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
  password?: string // inline account password from checkout; if absent a temp password is emailed

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

  // LLC Formation extras
  managementType?: string
  effectiveDate?: string
  members?: Array<{ name: string; ownershipPct: string }>

  // Annual report extras
  flDocNumber?: string

  // EIN fields (stored in OrderData, sensitive ones encrypted)
  einTradeName?: string                  // Line 2 — DBA / trade name
  einMemberCount?: string
  einResponsibleParty?: string           // full name (concatenated)
  einResponsiblePartyFirstName?: string  // stored separately for IRS wizard copy-paste
  einResponsiblePartyMiddleName?: string
  einResponsiblePartyLastName?: string
  einResponsiblePartySuffix?: string
  einTaxIdType?: string
  einTaxId?: string           // stored under key 'ssn' or 'itin'; may be empty for non-US without ITIN
  einBusinessPurpose?: string // Line 16 — IRS category label or "Other: description"
  einDateStarted?: string
  einReasonApplying?: string
  einIsUSCitizen?: boolean
  einCounty?: string          // Line 6 — county (IRS-required, can't derive from city)
  einClosingMonth?: string              // Line 12 — fiscal year end month
  einEmployeesAgricultural?: string     // Line 13 — agricultural count
  einEmployeesHousehold?: string        // Line 13 — household count
  einEmployeesOther?: string            // Line 13 — other count
  einWants944?: boolean                 // Line 14 — Form 944 annual filing election
  einFirstWagesDate?: string            // Line 15 — conditional on any employees
  einProductService?: string            // Line 17 — principal product/service description
  einPreviousEin?: boolean              // Line 18 — previously issued EIN?
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
    password: input.password,
  })

  const totalAmount = input.serviceFee + input.stateFee

  // 2. Build add-on list — EIN_FILING orders are the EIN itself, not an add-on
  const addOns: string[] = []
  if (input.addOnEin && input.serviceType !== ServiceType.EIN_FILING) addOns.push('EIN')
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

  // LLC Formation extras
  if (input.serviceType === ServiceType.LLC_FORMATION) {
    if (input.managementType) orderDataFields.managementType = input.managementType
    if (input.effectiveDate) orderDataFields.effectiveDate = input.effectiveDate
    if (input.members && input.members.length > 0) {
      orderDataFields.members = JSON.stringify(input.members)
    }
  }

  // Annual report extras
  if (input.flDocNumber) {
    orderDataFields.flDocNumber = input.flDocNumber
  }

  // EIN fields — stored individually for structured access
  if (input.addOnEin) {
    if (input.einTradeName)                   orderDataFields.einTradeName = input.einTradeName
    if (input.einMemberCount)                 orderDataFields.einMemberCount = input.einMemberCount
    if (input.einResponsibleParty)            orderDataFields.einResponsibleParty = input.einResponsibleParty
    if (input.einResponsiblePartyFirstName)   orderDataFields.einResponsiblePartyFirstName = input.einResponsiblePartyFirstName
    if (input.einResponsiblePartyMiddleName)  orderDataFields.einResponsiblePartyMiddleName = input.einResponsiblePartyMiddleName
    if (input.einResponsiblePartyLastName)    orderDataFields.einResponsiblePartyLastName = input.einResponsiblePartyLastName
    if (input.einResponsiblePartySuffix)      orderDataFields.einResponsiblePartySuffix = input.einResponsiblePartySuffix
    if (input.einBusinessPurpose)   orderDataFields.einBusinessPurpose = input.einBusinessPurpose
    if (input.einDateStarted)       orderDataFields.einDateStarted = input.einDateStarted
    if (input.einReasonApplying)    orderDataFields.einReasonApplying = input.einReasonApplying
    if (input.einCounty)            orderDataFields.einCounty = input.einCounty
    if (input.einClosingMonth)               orderDataFields.einClosingMonth = input.einClosingMonth
    if (input.einEmployeesAgricultural)      orderDataFields.einEmployeesAgricultural = input.einEmployeesAgricultural
    if (input.einEmployeesHousehold)         orderDataFields.einEmployeesHousehold = input.einEmployeesHousehold
    if (input.einEmployeesOther)             orderDataFields.einEmployeesOther = input.einEmployeesOther
    if (input.einWants944 !== undefined)     orderDataFields.einWants944 = String(input.einWants944)
    if (input.einFirstWagesDate)             orderDataFields.einFirstWagesDate = input.einFirstWagesDate
    if (input.einProductService)             orderDataFields.einProductService = input.einProductService
    if (input.einPreviousEin !== undefined)  orderDataFields.einPreviousEin = String(input.einPreviousEin)
    orderDataFields.einIsUSCitizen = String(input.einIsUSCitizen ?? true)
    // Store taxIdType as a plain key so GHL note can display "SSN" or "ITIN"
    if (input.einTaxIdType) orderDataFields.einTaxIdType = input.einTaxIdType
    // Tax ID stored under 'ssn' or 'itin' — both are SENSITIVE_KEYS; optional for non-US nationals
    if (input.einTaxId && input.einTaxIdType) {
      orderDataFields[input.einTaxIdType] = input.einTaxId
    }
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

  // Articles of Org — LLC Formation orders only (Bridget's QC reference for SunBiz filing)
  if (input.serviceType === ServiceType.LLC_FORMATION) {
    void generateAndUploadArticlesOfOrg({
      order,
      tenantId: input.tenantId,
      businessName: input.businessName,
      principalAddress: input.principalAddress,
      mailingAddress: input.mailingAddress,
      managementType: input.managementType,
      members: input.members,
      effectiveDate: input.effectiveDate,
      organizerName: input.organizerName ?? input.customerName,
      organizerDate: new Date().toISOString().split('T')[0],
    })
  }

  // SS-4 draft — EIN add-on orders (Bridget retrieves encrypted SSN/ITIN separately)
  if (input.addOnEin) {
    void generateAndUploadSS4({
      order,
      tenantId: input.tenantId,
      businessName: input.businessName,
      principalAddress: input.principalAddress,
      mailingAddress: input.mailingAddress,
      organizerName: input.organizerName ?? input.customerName,
      einTradeName: input.einTradeName,
      einMemberCount: input.einMemberCount,
      einResponsibleParty: input.einResponsibleParty,
      einTaxIdType: input.einTaxIdType,
      einTaxId: input.einTaxId,
      einBusinessPurpose: input.einBusinessPurpose,
      einDateStarted: input.einDateStarted,
      einReasonApplying: input.einReasonApplying,
      einIsUSCitizen: input.einIsUSCitizen,
      einCounty: input.einCounty,
      einClosingMonth: input.einClosingMonth,
      einEmployeesAgricultural: input.einEmployeesAgricultural,
      einEmployeesHousehold: input.einEmployeesHousehold,
      einEmployeesOther: input.einEmployeesOther,
      einWants944: input.einWants944,
      einFirstWagesDate: input.einFirstWagesDate,
      einProductService: input.einProductService,
      einPreviousEin: input.einPreviousEin,
      members: input.members,
    })
  }

  // 6. SunBiz entity snapshot — annual report orders only (fire-and-forget).
  // Stores the entity state as-of order creation so ops sees what SunBiz showed at
  // checkout time, independent of future status changes on the FL registry.
  if (input.serviceType === ServiceType.ANNUAL_REPORT && input.flDocNumber) {
    void snapshotSunbizEntity(order.id, input.flDocNumber)
  }

  // 7. Fire welcome email in background (non-blocking).
  // tempPassword is null when the customer chose their own password during checkout —
  // the email still sends, it just omits the credentials block.
  sendWelcome({
    to: input.customerEmail,
    customerName: input.customerName,
    businessName: input.businessName,
    serviceType: input.serviceType,
    tempPassword: tempPassword ?? undefined,
  }).catch((err) => console.error('[Email] sendWelcome failed:', err))

  return { orderId: order.id, customerId }
}

async function snapshotSunbizEntity(orderId: string, docNumber: string): Promise<void> {
  try {
    const entity = await lookupByDocNumber(docNumber)
    if (!entity) return
    await prisma.orderData.create({
      data: { orderId, key: 'sunbizSnapshot', value: JSON.stringify(entity) },
    })
  } catch (err) {
    console.error('[orders] sunbiz snapshot failed:', err)
  }
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

async function generateAndUploadArticlesOfOrg(params: {
  order: { id: string }
  tenantId: string
  businessName: string
  principalAddress?: string
  mailingAddress?: string
  managementType?: string
  members?: Array<{ name: string; ownershipPct: string }>
  effectiveDate?: string
  organizerName?: string
  organizerDate: string
}): Promise<void> {
  try {
    const principal = parseAddress(params.principalAddress ?? '')
    const mailing = params.mailingAddress ? parseAddress(params.mailingAddress) : null
    const mgmt = params.managementType === 'manager-managed' ? 'manager-managed' : 'member-managed'
    const memberTitle = mgmt === 'manager-managed' ? 'Manager' : 'Member'
    const memberList =
      params.members && params.members.length > 0
        ? params.members.map((m) => ({
            name: m.name,
            title: memberTitle,
            address: params.principalAddress ?? '',
            ownershipPct: m.ownershipPct,
          }))
        : [{ name: params.organizerName ?? '—', title: memberTitle, address: params.principalAddress ?? '', ownershipPct: '100' }]

    const buffer = await generateArticlesOfOrg({
      orderId: params.order.id,
      generatedAt: params.organizerDate,
      llcName: params.businessName,
      principalStreet: principal.street,
      principalCity: principal.city,
      principalState: principal.state || 'FL',
      principalZip: principal.zip,
      mailingStreet: mailing?.street,
      mailingCity: mailing?.city,
      mailingState: mailing?.state,
      mailingZip: mailing?.zip,
      raName: RA_NAME,
      raStreet: RA_STREET,
      raCity: RA_CITY,
      raCounty: RA_COUNTY,
      raState: RA_STATE,
      raZip: RA_ZIP,
      managementType: mgmt,
      members: memberList,
      effectiveDate: params.effectiveDate,
      organizerName: params.organizerName ?? '—',
      organizerDate: params.organizerDate,
    })

    const r2Key = `${params.tenantId}/orders/${params.order.id}/articles-of-org.pdf`
    await uploadToR2(r2Key, buffer, 'application/pdf')

    await prisma.document.create({
      data: {
        orderId: params.order.id,
        tenantId: params.tenantId,
        type: 'ARTICLES_OF_ORG',
        r2Key,
        filename: 'articles-of-org.pdf',
      },
    })
  } catch (err) {
    console.error('[PDF] Failed to generate/upload articles of org:', err)
  }
}

async function generateAndUploadSS4(params: {
  order: { id: string }
  tenantId: string
  businessName: string
  principalAddress?: string
  mailingAddress?: string
  organizerName?: string
  einTradeName?: string
  einMemberCount?: string
  einResponsibleParty?: string
  einTaxIdType?: string
  einTaxId?: string
  einBusinessPurpose?: string
  einDateStarted?: string
  einReasonApplying?: string
  einIsUSCitizen?: boolean
  einCounty?: string
  einClosingMonth?: string
  einEmployeesAgricultural?: string
  einEmployeesHousehold?: string
  einEmployeesOther?: string
  einWants944?: boolean
  einFirstWagesDate?: string
  einProductService?: string
  einPreviousEin?: boolean
  members?: Array<{ name: string; ownershipPct: string }>
}): Promise<void> {
  try {
    const addr = parseAddress(params.mailingAddress ?? params.principalAddress ?? '')
    const cityStateZip = [addr.city, addr.state, addr.zip].filter(Boolean).join(', ')
    const memberCount =
      params.einMemberCount ?? (params.members ? String(params.members.length) : '1')

    // Use explicitly provided county if available; fall back to city as proxy.
    const county = params.einCounty ?? addr.city ?? '—'

    const buffer = await generateSS4({
      orderId: params.order.id,
      generatedAt: new Date().toISOString().split('T')[0],
      legalName: params.businessName,
      tradeName: params.einTradeName,
      mailingStreet: addr.street || '—',
      mailingCityStateZip: cityStateZip || '—',
      county,
      state: addr.state || 'FL',
      responsiblePartyName: params.einResponsibleParty ?? params.organizerName ?? '—',
      taxIdType: params.einTaxIdType === 'itin' ? 'itin' : 'ssn',
      hasTaxId: !!(params.einTaxId),
      memberCount,
      isForeignLLC: !(params.einIsUSCitizen ?? true),
      entityType: 'Limited Liability Company (LLC)',
      reasonApplying: params.einReasonApplying ?? 'Started new business',
      dateStarted: params.einDateStarted ?? new Date().toISOString().split('T')[0],
      closingMonth: params.einClosingMonth ?? 'December',
      employeesAgricultural: params.einEmployeesAgricultural ?? '0',
      employeesHousehold: params.einEmployeesHousehold ?? '0',
      employeesOther: params.einEmployeesOther ?? '0',
      wants944: params.einWants944 ?? false,
      firstWagesDate: params.einFirstWagesDate,
      businessPurpose: params.einBusinessPurpose ?? '—',
      productService: params.einProductService ?? '—',
      previousEin: params.einPreviousEin ?? false,
    })

    const r2Key = `${params.tenantId}/orders/${params.order.id}/ss4-draft.pdf`
    await uploadToR2(r2Key, buffer, 'application/pdf')

    await prisma.document.create({
      data: {
        orderId: params.order.id,
        tenantId: params.tenantId,
        type: 'SS4_DRAFT',
        r2Key,
        filename: 'ss4-draft.pdf',
      },
    })
  } catch (err) {
    console.error('[PDF] Failed to generate/upload SS-4 draft:', err)
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

  // Sync to GHL when the transition originated from Compass (not the GHL webhook itself).
  // actorId === 'system' means GHL triggered this — skip to avoid echo loop.
  // Non-blocking: GHL sync failure never fails the Compass update.
  if (input.actorId !== 'system' && order.ghlOpportunityId) {
    const stageId = getStageId(input.toStatus)
    if (stageId) {
      void updateOpportunityStage(order.ghlOpportunityId, stageId).catch((err) =>
        console.error('[GHL sync] updateOpportunityStage failed (non-fatal):', err)
      )
    }
  }

  // Fire email async — each status has its own template
  const email = order.customer.user.email
  const customerName = order.customer.name

  if (input.toStatus === OrderStatus.FILED) {
    void sendOrderFiled({ to: email, customerName, orderId: order.id })
  } else if (input.toStatus === OrderStatus.COMPLETED) {
    // Verify required docs exist before notifying customer.
    // Don't block (avoids GHL desync) — alert ops and continue.
    const requiredDoc = await prisma.document.findFirst({
      where: {
        orderId: input.orderId,
        type: { in: ['FILING_RECEIPT', 'CERTIFICATE'] },
        deletedAt: null,
      },
    })
    if (!requiredDoc) {
      console.warn(`[updateStatus] Order ${input.orderId} completed without filing receipt or certificate`)
      void sendOpsAlert({
        subject: `Missing docs — order ${input.orderId} marked Completed`,
        body: `Order ${input.orderId} (${order.serviceType}) for ${order.customer.name} was marked Completed but has no filing receipt or certificate uploaded.\n\nPlease upload the required documents in the ops portal:\n${process.env.NEXT_PUBLIC_APP_URL}/ops/orders/${input.orderId}\n\nSource: actorId=${input.actorId}`,
      })
      await prisma.auditLog.create({
        data: {
          tenantId: input.tenantId,
          actorId: 'system',
          entityType: 'Order',
          entityId: input.orderId,
          action: 'WARN_MISSING_DOCS',
          meta: { message: 'Completed without filing receipt or certificate', source: input.actorId },
        },
      })
    }
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
