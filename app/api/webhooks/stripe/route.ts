// Stripe → Compass webhook receiver.
// Handles payment_intent.succeeded → confirms payment on the matching order
// → pushes the order to GHL as the first and only Compass→GHL push.
//
// Idempotency: WebhookEvent table prevents duplicate processing.

import { NextRequest, NextResponse } from 'next/server'
import { constructStripeEvent } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { pushOrderToGHL } from '@/services/ghl'
import { PaymentStatus } from '@prisma/client'
import Stripe from 'stripe'

// Always return 200 — Stripe retries on non-2xx and we handle idempotency ourselves.
export async function POST(req: NextRequest) {
  const rawBody = await req.arrayBuffer()
  const payload = Buffer.from(rawBody)
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !secret) {
    console.error('[Stripe webhook] Missing signature or secret')
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  let event: Stripe.Event
  try {
    event = constructStripeEvent(payload, sig, secret)
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  // Idempotency — skip if already processed
  const alreadyProcessed = await prisma.webhookEvent.findUnique({
    where: { provider_eventId: { provider: 'stripe', eventId: event.id } },
  })
  if (alreadyProcessed) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
    }
    // Mark processed — even if we didn't handle this event type
    await prisma.webhookEvent.create({
      data: { provider: 'stripe', eventId: event.id },
    })
  } catch (err) {
    console.error(`[Stripe webhook] Error handling ${event.type}:`, err)
    // Don't record as processed — allow Stripe to retry
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent): Promise<void> {
  // Orders store paymentRef as the Stripe PaymentIntent ID
  const order = await prisma.order.findFirst({
    where: { paymentRef: intent.id, deletedAt: null },
  })

  if (!order) {
    // May be an intent not linked to a Compass order (test, partial, etc.)
    console.warn(`[Stripe webhook] No order found for paymentIntent ${intent.id}`)
    return
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
      meta: { paymentIntentId: intent.id, amount: intent.amount },
    },
  })

  // Push to GHL — one-time only, fires right after payment confirmation
  try {
    await pushOrderToGHL(order.id, order.tenantId)
  } catch (err) {
    // GHL push failure is non-fatal — order is still confirmed. Log for manual retry.
    console.error(`[Stripe webhook] GHL push failed for order ${order.id}:`, err)
  }

  console.log(`[Stripe webhook] Payment confirmed for order ${order.id}`)
}
