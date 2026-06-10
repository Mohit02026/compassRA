// GHL integration service.
// pushOrderToGHL() is called ONCE after Stripe payment is confirmed.
// Sends: Contact + Opportunity (pipeline card) + rich Note with all order details.

import { prisma, setPrismaContext } from '@/lib/prisma'
import { createOrUpdateContact, createOpportunity, createContactNote, uploadMediaToGHL, getStageId } from '@/lib/ghl'
import { downloadFromR2 } from '@/lib/r2'
import { ServiceType, Tier } from '@prisma/client'

const SERVICE_LABELS: Record<ServiceType, string> = {
  ANNUAL_REPORT: 'Annual Report',
  LLC_FORMATION: 'LLC Formation',
  RA_TAKEOVER:   'RA Takeover',
  EIN_FILING:    'EIN Filing',
}

const TIER_LABELS: Record<Tier, string> = {
  SELF_SERVE:  'Self-Serve',
  STANDARD:    'Standard',
  WHITE_GLOVE: 'White Glove',
}

export interface PushOrderResult {
  ghlContactId: string
  ghlOpportunityId: string
}

// ── Note formatter ─────────────────────────────────────────────────────────────
// All data Compass has at payment time, formatted for Bridget to read in GHL.

export interface OrderNoteData {
  orderId: string
  shortId: string
  serviceLabel: string
  tierLabel: string
  businessName: string
  state: string
  principalAddress: string
  mailingAddress: string
  managementType: string
  members: Array<{ name: string; ownershipPct: string }>
  effectiveDate: string
  organizerName: string
  organizerEmail: string
  organizerPhone: string
  addOns: string[]
  serviceFee: string
  stateFee: string
  totalAmount: number
  // EIN-specific (only present when EIN add-on ordered)
  einTradeName?: string
  einResponsibleParty?: string
  einTaxIdType?: string
  einBusinessPurpose?: string
  einDateStarted?: string
  einReasonApplying?: string
  einIsUSCitizen?: string
  einMemberCount?: string
  einCounty?: string
  einClosingMonth?: string
  einEmployeesAgricultural?: string
  einEmployeesHousehold?: string
  einEmployeesOther?: string
  einWants944?: string
  einFirstWagesDate?: string
  einProductService?: string
  einPreviousEin?: string
  // Annual report
  flDocNumber?: string
  // For Bridget to cross-reference Compass portal
  compassPortalUrl: string
  // GHL-hosted filing sheet URL (permanent, no expiry)
  filingSheetUrl?: string
}

export function buildOrderNote(d: OrderNoteData): string {
  const lines: string[] = []

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push(`COMPASS ORDER — ${d.serviceLabel}`)
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push(`Ref:   #${d.shortId}`)
  lines.push(`Tier:  ${d.tierLabel}`)
  lines.push('')

  lines.push('BUSINESS')
  lines.push(`  Name:    ${d.businessName || '—'}`)
  lines.push(`  State:   ${d.state}`)
  if (d.managementType) lines.push(`  Mgmt:    ${d.managementType}`)
  if (d.effectiveDate)  lines.push(`  Effective: ${d.effectiveDate}`)
  if (d.members.length > 0) {
    lines.push('  Members:')
    for (const m of d.members) {
      lines.push(`    • ${m.name}${m.ownershipPct ? ` — ${m.ownershipPct}%` : ''}`)
    }
  }
  lines.push('')

  lines.push('ORGANIZER')
  if (d.organizerName)  lines.push(`  Name:  ${d.organizerName}`)
  if (d.organizerEmail) lines.push(`  Email: ${d.organizerEmail}`)
  if (d.organizerPhone) lines.push(`  Phone: ${d.organizerPhone}`)
  lines.push('')

  lines.push('ADDRESS')
  if (d.principalAddress) lines.push(`  Principal: ${d.principalAddress}`)
  if (d.mailingAddress && d.mailingAddress !== d.principalAddress) {
    lines.push(`  Mailing:   ${d.mailingAddress}`)
  }
  lines.push('')

  lines.push('PAYMENT')
  lines.push(`  Service fee:    $${Number(d.serviceFee || 0).toFixed(2)}`)
  if (Number(d.stateFee) > 0) {
    lines.push(`  State fee:      $${Number(d.stateFee).toFixed(2)}`)
  }
  if (d.addOns.length > 0) {
    for (const a of d.addOns) lines.push(`  ${a} add-on:    included`)
  }
  lines.push(`  TOTAL:          $${d.totalAmount.toFixed(2)}`)
  lines.push('')

  if (d.addOns.length > 0) {
    lines.push(`ADD-ONS: ${d.addOns.join(', ')}`)
    lines.push('')
  }

  // EIN section
  if (d.einResponsibleParty || d.einBusinessPurpose) {
    lines.push('EIN DETAILS')
    if (d.einTradeName)        lines.push(`  Trade name (DBA): ${d.einTradeName}`)
    if (d.einResponsibleParty) lines.push(`  Responsible party: ${d.einResponsibleParty}`)
    if (d.einTaxIdType)        lines.push(`  Tax ID type: ${d.einTaxIdType.toUpperCase()} (value encrypted — see Compass)`)
    if (d.einMemberCount)      lines.push(`  Member count: ${d.einMemberCount}`)
    if (d.einBusinessPurpose)  lines.push(`  Business activity: ${d.einBusinessPurpose}`)
    if (d.einDateStarted)      lines.push(`  Date started: ${d.einDateStarted}`)
    if (d.einClosingMonth)     lines.push(`  Fiscal year end: ${d.einClosingMonth}`)
    if (d.einReasonApplying)   lines.push(`  Reason: ${d.einReasonApplying}`)
    if (d.einCounty)           lines.push(`  County: ${d.einCounty}`)
    if (d.einEmployeesAgricultural || d.einEmployeesHousehold || d.einEmployeesOther) {
      lines.push(`  Employees (Agri/Household/Other): ${d.einEmployeesAgricultural ?? 0}/${d.einEmployeesHousehold ?? 0}/${d.einEmployeesOther ?? 0}`)
    }
    if (d.einFirstWagesDate)    lines.push(`  First wages date: ${d.einFirstWagesDate}`)
    if (d.einWants944)          lines.push(`  Form 944 annual filing: ${d.einWants944}`)
    if (d.einProductService)    lines.push(`  Product/service (Line 17): ${d.einProductService}`)
    if (d.einPreviousEin)       lines.push(`  Previously issued EIN: ${d.einPreviousEin}`)
    if (d.einIsUSCitizen)       lines.push(`  US citizen/resident: ${d.einIsUSCitizen}`)
    lines.push('')
  }

  // Annual report
  if (d.flDocNumber) {
    lines.push(`FL DOCUMENT NUMBER: ${d.flDocNumber}`)
    lines.push('')
  }

  lines.push('COMPASS PORTAL')
  lines.push(`  ${d.compassPortalUrl}`)
  if (d.filingSheetUrl) {
    lines.push('')
    lines.push('FILING SHEET PDF')
    lines.push(`  ${d.filingSheetUrl}`)
  }
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return lines.join('\n')
}

// ── Push ──────────────────────────────────────────────────────────────────────

export async function pushOrderToGHL(orderId: string, tenantId: string): Promise<PushOrderResult> {
  await setPrismaContext(tenantId)

  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId, deletedAt: null },
    include: {
      customer: { include: { user: true } },
      orderData: true,
    },
  })

  if (!order) throw new Error(`Order not found: ${orderId}`)

  const pipelineId = process.env.GHL_PIPELINE_ID
  const locationId = process.env.GHL_LOCATION_ID
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'https://compassregisteredagent.com'

  if (!pipelineId || !locationId) {
    throw new Error('GHL_PIPELINE_ID or GHL_LOCATION_ID is not set')
  }

  const intakeStageId = getStageId('INTAKE')
  if (!intakeStageId) throw new Error('GHL stage map missing INTAKE entry')

  // ── Extract all OrderData fields ────────────────────────────────────────────
  const get = (key: string) => order.orderData.find((d) => d.key === key)?.value ?? ''

  const businessName   = get('businessName')
  const principalAddr  = get('principalAddress')
  const mailingAddr    = get('mailingAddress')
  const organizerName  = get('organizerName')
  const organizerEmail = get('organizerEmail')
  const organizerPhone = get('organizerPhone')
  const managementType = get('managementType')
  const effectiveDate  = get('effectiveDate')
  const serviceFee     = get('serviceFee')
  const stateFee       = get('stateFee')
  const addOnsRaw      = get('addOns')   // "EIN,Operating Agreement"
  const flDocNumber    = get('flDocNumber')
  const membersRaw     = get('members')  // JSON string

  // EIN fields
  const einTradeName         = get('einTradeName')
  const einResponsibleParty  = get('einResponsibleParty')
  const einTaxIdType         = get('einTaxIdType')
  const einBusinessPurpose   = get('einBusinessPurpose')
  const einDateStarted       = get('einDateStarted')
  const einReasonApplying    = get('einReasonApplying')
  const einIsUSCitizen       = get('einIsUSCitizen')
  const einMemberCount       = get('einMemberCount')
  const einCounty            = get('einCounty')
  const einClosingMonth            = get('einClosingMonth')
  const einEmployeesAgricultural   = get('einEmployeesAgricultural')
  const einEmployeesHousehold      = get('einEmployeesHousehold')
  const einEmployeesOther          = get('einEmployeesOther')
  const einWants944                = get('einWants944')
  const einFirstWagesDate          = get('einFirstWagesDate')
  const einProductService          = get('einProductService')
  const einPreviousEin             = get('einPreviousEin')

  const addOns: string[] = addOnsRaw ? addOnsRaw.split(',').map((a) => a.trim()).filter(Boolean) : []

  let members: Array<{ name: string; ownershipPct: string }> = []
  try {
    if (membersRaw) members = JSON.parse(membersRaw) as typeof members
  } catch { /* malformed JSON — skip */ }

  // ── GHL push ────────────────────────────────────────────────────────────────
  const nameParts = order.customer.name.trim().split(' ')
  const firstName = nameParts[0]
  const lastName  = nameParts.slice(1).join(' ') || undefined

  const shortId      = order.id.slice(-8).toUpperCase()
  const serviceLabel = SERVICE_LABELS[order.serviceType]
  const tierLabel    = TIER_LABELS[order.tier]
  const addOnSuffix  = addOns.length > 0 ? ` + ${addOns.join(', ')}` : ''
  const opportunityName = `${businessName} — ${serviceLabel}${addOnSuffix} [${tierLabel}] · #${shortId}`

  const tags = [
    'compass-client',
    order.serviceType.toLowerCase().replace(/_/g, '-'),
    order.tier.toLowerCase().replace(/_/g, '-'),
    ...(addOns.length > 0 ? ['has-addons'] : []),
    order.state.toLowerCase(),
  ]

  // 1. Create / upsert contact
  const contact = await createOrUpdateContact({
    firstName,
    lastName,
    email: order.customer.user.email,
    phone: order.customer.phone ?? undefined,
    locationId,
    tags,
  })

  // 2. Create opportunity (status: 'open' is required by GHL)
  const opportunity = await createOpportunity({
    name: opportunityName,
    pipelineId,
    pipelineStageId: intakeStageId,
    contactId: contact.id,
    status: 'open',
    monetaryValue: Number(order.totalAmount),
  })

  // 3. Upload the best available QC document to GHL media library — non-fatal if it fails.
  // For LLC Formation: prefer ARTICLES_OF_ORG (mirrors the customer preview / SunBiz form).
  // For all other service types: use FILING_SHEET (ops summary).
  let filingSheetUrl: string | undefined
  try {
    const preferredType =
      order.serviceType === 'LLC_FORMATION' ? 'ARTICLES_OF_ORG'
      : order.serviceType === 'EIN_FILING'  ? 'SS4_DRAFT'
      : 'FILING_SHEET'
    const fallbackType = 'FILING_SHEET'

    let doc = await prisma.document.findFirst({
      where: { orderId: order.id, type: preferredType, deletedAt: null },
    })
    // Fall back to FILING_SHEET if ARTICLES_OF_ORG hasn't generated yet
    if (!doc && preferredType !== fallbackType) {
      doc = await prisma.document.findFirst({
        where: { orderId: order.id, type: fallbackType, deletedAt: null },
      })
    }

    if (doc?.r2Key) {
      const pdfBuffer = await downloadFromR2(doc.r2Key)
      if (pdfBuffer.length > 0) {
        const filename =
          doc.type === 'ARTICLES_OF_ORG' ? `articles-of-org-${shortId}.pdf`
          : doc.type === 'SS4_DRAFT'     ? `ss4-draft-${shortId}.pdf`
          : `filing-sheet-${shortId}.pdf`
        const uploaded = await uploadMediaToGHL(pdfBuffer, filename)
        filingSheetUrl = uploaded.url
      }
    }
  } catch (err) {
    console.error('[GHL] Document upload failed (non-fatal):', err)
  }

  // 4. Add rich note to the contact — non-fatal if it fails
  const compassPortalUrl = `${appUrl}/ops/orders/${order.id}`
  const noteBody = buildOrderNote({
    orderId:  order.id,
    shortId,
    serviceLabel,
    tierLabel,
    businessName,
    state:           order.state,
    principalAddress: principalAddr,
    mailingAddress:  mailingAddr,
    managementType,
    members,
    effectiveDate,
    organizerName,
    organizerEmail,
    organizerPhone,
    addOns,
    serviceFee,
    stateFee,
    totalAmount: Number(order.totalAmount),
    einTradeName:        einTradeName || undefined,
    einResponsibleParty: einResponsibleParty || undefined,
    einTaxIdType:        einTaxIdType || undefined,
    einBusinessPurpose:  einBusinessPurpose || undefined,
    einDateStarted:      einDateStarted || undefined,
    einReasonApplying:   einReasonApplying || undefined,
    einIsUSCitizen:      einIsUSCitizen || undefined,
    einMemberCount:      einMemberCount || undefined,
    einCounty:           einCounty || undefined,
    einClosingMonth:           einClosingMonth || undefined,
    einEmployeesAgricultural:  einEmployeesAgricultural || undefined,
    einEmployeesHousehold:     einEmployeesHousehold || undefined,
    einEmployeesOther:         einEmployeesOther || undefined,
    einWants944:               einWants944 || undefined,
    einFirstWagesDate:         einFirstWagesDate || undefined,
    einProductService:         einProductService || undefined,
    einPreviousEin:            einPreviousEin || undefined,
    flDocNumber:         flDocNumber || undefined,
    compassPortalUrl,
    filingSheetUrl,
  })

  try {
    await createContactNote(contact.id, noteBody)
  } catch (err) {
    console.error('[GHL] createContactNote failed:', err)
  }

  // 5. Store opportunity ID for webhook matching
  await prisma.order.update({
    where: { id: orderId },
    data: { ghlOpportunityId: opportunity.id },
  })

  await prisma.auditLog.create({
    data: {
      tenantId,
      actorId: 'system',
      entityType: 'Order',
      entityId: orderId,
      action: 'GHL_PUSHED',
      meta: {
        ghlContactId:     contact.id,
        ghlOpportunityId: opportunity.id,
        opportunityName,
        addOns: addOns.length > 0 ? addOns : null,
      },
    },
  })

  return { ghlContactId: contact.id, ghlOpportunityId: opportunity.id }
}
