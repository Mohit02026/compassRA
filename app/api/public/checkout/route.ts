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
  const totalAmount = data.serviceFee + data.stateFee +
    (data.addOnEin ? 75 : 0) +
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
      addOnEin: data.addOnEin,
      addOnOperatingAgreement: data.addOnOperatingAgreement,
      addOnCertificateOfStatus: data.addOnCertificateOfStatus,
      internalNotes: data.internalNotes,
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
