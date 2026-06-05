import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createOrder } from '@/services/orders'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { ServiceType, Tier } from '@prisma/client'

// Public — no auth. Validates body, creates order, creates Stripe PaymentIntent.
const checkoutSchema = z.object({
  // Customer
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),

  // Order
  serviceType: z.nativeEnum(ServiceType),
  tier: z.nativeEnum(Tier).default('STANDARD'),
  businessName: z.string().min(1),
  serviceFee: z.number().min(0),
  stateFee: z.number().min(0),

  // Optional fields — passed through to orderData
  principalAddress: z.string().optional(),
  mailingAddress: z.string().optional(),
  addOnEin: z.boolean().optional(),
  addOnOperatingAgreement: z.boolean().optional(),
  addOnCertificateOfStatus: z.boolean().optional(),
  internalNotes: z.string().optional(),

  // LLC Formation extras — needed for Articles of Org PDF generation
  managementType: z.string().optional(),
  effectiveDate: z.string().optional(),
  // LLC form sends {name, ownership}; normalize to {name, ownershipPct} for createOrder
  members: z.array(z.object({ name: z.string(), ownership: z.string().optional() })).optional(),
  organizerName: z.string().optional(),

  // EIN standalone order — service fee already includes EIN price; skip add-on charge
  einOnly: z.boolean().optional(),

  // EIN-specific fields (flat — not nested) — encrypted server-side where sensitive
  einMemberCount: z.string().optional(),
  einResponsibleParty: z.string().optional(),
  einTaxIdType: z.string().optional(),
  einTaxId: z.string().optional(),
  einBusinessPurpose: z.string().optional(),
  einDateStarted: z.string().optional(),
  einReasonApplying: z.string().optional(),
  einIsUSCitizen: z.boolean().optional(),
  einCounty: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const tenantId = process.env.COMPASS_TENANT_ID
  if (!tenantId) {
    return NextResponse.json(
      { error: { code: 500, message: 'Server misconfiguration' } },
      { status: 500 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: { code: 400, message: 'Invalid JSON' } },
      { status: 400 }
    )
  }

  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 400, message: 'Invalid input', details: parsed.error.flatten() } },
      { status: 400 }
    )
  }

  const data = parsed.data
  // einOnly: standalone EIN order — serviceFee already covers the EIN price.
  // Don't add the $75 add-on on top; that's for LLC Formation + EIN bundles.
  const totalAmount = data.serviceFee + data.stateFee +
    (data.addOnEin && !data.einOnly ? 75 : 0) +
    (data.addOnOperatingAgreement ? 50 : 0) +
    (data.addOnCertificateOfStatus ? 9 : 0)

  try {
    // 1. Create order — customer + user auto-created inside
    // Use tenantId as actorId for public orders (no authenticated actor)
    const { orderId } = await createOrder({
      tenantId,
      actorId: tenantId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      businessName: data.businessName,
      serviceType: data.serviceType,
      tier: data.tier,
      state: 'FL',
      principalAddress: data.principalAddress,
      mailingAddress: data.mailingAddress,
      serviceFee: data.serviceFee,
      stateFee: data.stateFee,
      // einOnly drives SS-4 generation for standalone EIN orders where addOnEin is false
      addOnEin: data.addOnEin || data.einOnly,
      addOnOperatingAgreement: data.addOnOperatingAgreement,
      addOnCertificateOfStatus: data.addOnCertificateOfStatus,
      internalNotes: data.internalNotes,
      managementType: data.managementType,
      effectiveDate: data.effectiveDate,
      members: data.members?.map((m) => ({ name: m.name, ownershipPct: m.ownership ?? '' })),
      organizerName: data.organizerName ?? data.customerName,
      einMemberCount: data.einMemberCount,
      einResponsibleParty: data.einResponsibleParty,
      einTaxIdType: data.einTaxIdType,
      einTaxId: data.einTaxId,
      einBusinessPurpose: data.einBusinessPurpose,
      einDateStarted: data.einDateStarted,
      einReasonApplying: data.einReasonApplying,
      einIsUSCitizen: data.einIsUSCitizen,
      einCounty: data.einCounty,
    })

    // 2. Create Stripe PaymentIntent
    const paymentIntent = await stripe().paymentIntents.create({
      amount: Math.round(totalAmount * 100), // cents
      currency: 'usd',
      metadata: { orderId, tenantId },
      automatic_payment_methods: { enabled: true },
      description: `Compass — ${data.serviceType} for ${data.businessName}`,
    })

    // 3. Store paymentRef on order
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentRef: paymentIntent.id },
    })

    if (!paymentIntent.client_secret) {
      throw new Error('Stripe did not return a client_secret')
    }

    return NextResponse.json(
      { data: { clientSecret: paymentIntent.client_secret, orderId } },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/public/checkout]', err)
    return NextResponse.json(
      { error: { code: 500, message: 'Failed to create order' } },
      { status: 500 }
    )
  }
}
