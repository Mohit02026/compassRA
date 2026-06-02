// GHL integration service.
// pushOrderToGHL() is called ONCE after Stripe payment is confirmed.
// No echo-back on webhook receipt — one-directional from GHL to Compass after that.

import { prisma, setPrismaContext } from '@/lib/prisma'
import { createOrUpdateContact, createOpportunity, getStageId } from '@/lib/ghl'
import { ServiceType } from '@prisma/client'

const SERVICE_LABELS: Record<ServiceType, string> = {
  ANNUAL_REPORT: 'Annual Report',
  LLC_FORMATION: 'LLC Formation',
  RA_TAKEOVER: 'RA Takeover',
}

export interface PushOrderResult {
  ghlContactId: string
  ghlOpportunityId: string
}

// Push a newly-paid order into GHL as a Contact + Opportunity.
// Stores ghlOpportunityId on the Order for future webhook matching.
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
  if (!pipelineId || !locationId) {
    throw new Error('GHL_PIPELINE_ID or GHL_LOCATION_ID is not set')
  }

  const intakeStageId = getStageId('INTAKE')
  if (!intakeStageId) throw new Error('GHL stage map missing INTAKE entry')

  const businessName = order.orderData.find((d) => d.key === 'businessName')?.value ?? ''
  const addOns = order.orderData.find((d) => d.key === 'addOns')?.value ?? ''

  // Split customer name into first/last for GHL contact
  const nameParts = order.customer.name.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || undefined

  // 1. Create or update GHL contact
  const contact = await createOrUpdateContact({
    firstName,
    lastName,
    email: order.customer.user.email,
    phone: order.customer.phone ?? undefined,
    locationId,
    tags: ['compass-client', order.serviceType.toLowerCase().replace('_', '-')],
  })

  // 2. Create opportunity in the pipeline at INTAKE stage
  const opportunityName = `${businessName} — ${SERVICE_LABELS[order.serviceType]}`
  const opportunity = await createOpportunity({
    name: opportunityName,
    pipelineId,
    pipelineStageId: intakeStageId,
    contactId: contact.id,
    monetaryValue: Number(order.totalAmount),
  })

  // 3. Store GHL opportunity ID on the order for webhook matching
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
        ghlContactId: contact.id,
        ghlOpportunityId: opportunity.id,
        addOns: addOns || null,
      },
    },
  })

  return { ghlContactId: contact.id, ghlOpportunityId: opportunity.id }
}
