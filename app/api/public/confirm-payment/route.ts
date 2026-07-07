// Called from /checkout/success after Stripe redirects back.
// Verifies the PaymentIntent actually succeeded (server-side Stripe check),
// marks the order confirmed, and pushes to GHL.
// Idempotent — safe to call multiple times for the same PaymentIntent.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { pushOrderToGHL } from '@/services/ghl'
import { PaymentStatus } from '@prisma/client'
import { checkRateLimit, getClientIp } from '@/lib/ratelimit'

const schema = z.object({
  paymentIntentId: z.string().startsWith('pi_'),
})

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(`confirm-payment:${getClientIp(req.headers)}`, 20, 3600)
  if (!limited.success) {
    return NextResponse.json(
      { error: { code: 429, message: 'Too many requests. Please try again later.' } },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid paymentIntentId' }, { status: 400 })
  }

  const { paymentIntentId } = parsed.data

  // Verify with Stripe — never trust the client alone
  let intent
  try {
    intent = await stripe().paymentIntents.retrieve(paymentIntentId)
  } catch (err) {
    console.error('[confirm-payment] Stripe retrieve failed:', err)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  if (intent.status !== 'succeeded') {
    // Payment not done yet — could be processing, return ok and let webhook handle it
    return NextResponse.json({ ok: false, status: intent.status }, { status: 200 })
  }

  const order = await prisma.order.findFirst({
    where: { paymentRef: paymentIntentId, deletedAt: null },
  })

  if (!order) {
    // PI not linked to a Compass order — nothing to do
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // Already confirmed — idempotent
  if (order.paymentStatus === PaymentStatus.CONFIRMED) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // Mark payment confirmed
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: PaymentStatus.CONFIRMED },
  })

  await prisma.auditLog.create({
    data: {
      tenantId: order.tenantId,
      actorId: 'system',
      entityType: 'Order',
      entityId: order.id,
      action: 'PAYMENT_CONFIRMED',
      meta: { paymentIntentId, source: 'success-page', amount: intent.amount },
    },
  })

  // GHL push — skip if webhook already did it
  if (!order.ghlOpportunityId) {
    try {
      await pushOrderToGHL(order.id, order.tenantId)
    } catch (err) {
      console.error('[confirm-payment] GHL push failed:', err)
    }
  }

  console.log(`[confirm-payment] Payment confirmed for order ${order.id}`)
  return NextResponse.json({ ok: true }, { status: 200 })
}
