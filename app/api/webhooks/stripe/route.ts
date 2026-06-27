// Stripe → Compass webhook receiver.
// Handles payment_intent.succeeded → confirms payment + pushes to GHL.
// Handles payment_intent.payment_failed → audit log + ops alert.
// Handles charge.dispute.created → audit log + ops alert.
// Handles charge.refunded → audit log + ops alert.
//
// Idempotency: WebhookEvent table prevents duplicate processing.

import { NextRequest, NextResponse } from 'next/server'
import { constructStripeEvent } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { pushOrderToGHL } from '@/services/ghl'
import { sendOpsAlert } from '@/services/email'
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
    } else if (event.type === 'payment_intent.payment_failed') {
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
    } else if (event.type === 'charge.dispute.created') {
      await handleDisputeCreated(event.data.object as Stripe.Dispute)
    } else if (event.type === 'charge.refunded') {
      await handleChargeRefunded(event.data.object as Stripe.Charge)
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
  // Look up by paymentRef (PaymentIntent ID stored at checkout) — do NOT trust metadata.tenantId
  const order = await prisma.order.findFirst({
    where: { paymentRef: intent.id, deletedAt: null },
  })

  if (!order) {
    console.warn(`[Stripe webhook] No order found for paymentIntent ${intent.id}`)
    return
  }

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
    console.error(`[Stripe webhook] GHL push failed for order ${order.id}:`, err)
    // Alert ops so the order doesn't silently vanish from Bridget's queue
    void sendOpsAlert({
      subject: `GHL push failed — order ${order.id}`,
      body: `Order ${order.id} was confirmed in Compass but failed to push to GHL.\nPaymentIntent: ${intent.id}\nError: ${err instanceof Error ? err.message : String(err)}\n\nManually push this order to GHL via the ops dashboard.`,
    })
  }

  console.log(`[Stripe webhook] Payment confirmed for order ${order.id}`)
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { paymentRef: intent.id, deletedAt: null },
  })
  if (!order) return

  await prisma.auditLog.create({
    data: {
      tenantId: order.tenantId,
      actorId: 'system',
      entityType: 'Order',
      entityId: order.id,
      action: 'PAYMENT_FAILED',
      meta: {
        paymentIntentId: intent.id,
        amount: intent.amount,
        reason: intent.last_payment_error?.message ?? 'unknown',
      },
    },
  })

  void sendOpsAlert({
    subject: `Payment failed — order ${order.id}`,
    body: `PaymentIntent ${intent.id} failed for order ${order.id}.\nAmount: $${(intent.amount / 100).toFixed(2)}\nReason: ${intent.last_payment_error?.message ?? 'unknown'}\n\nStripe may retry automatically. Check the Stripe dashboard for next steps.`,
  })

  console.log(`[Stripe webhook] Payment failed for order ${order.id}`)
}

async function handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  const paymentIntentId = typeof dispute.payment_intent === 'string'
    ? dispute.payment_intent
    : dispute.payment_intent?.id

  if (!paymentIntentId) return

  const order = await prisma.order.findFirst({
    where: { paymentRef: paymentIntentId, deletedAt: null },
  })
  if (!order) return

  await prisma.auditLog.create({
    data: {
      tenantId: order.tenantId,
      actorId: 'system',
      entityType: 'Order',
      entityId: order.id,
      action: 'DISPUTE_CREATED',
      meta: { disputeId: dispute.id, amount: dispute.amount, reason: dispute.reason },
    },
  })

  void sendOpsAlert({
    subject: `Dispute filed — order ${order.id}`,
    body: `A chargeback dispute has been filed on order ${order.id}.\nDispute ID: ${dispute.id}\nAmount: $${(dispute.amount / 100).toFixed(2)}\nReason: ${dispute.reason}\n\nReview in Stripe dashboard and hold document delivery until resolved.`,
  })

  console.log(`[Stripe webhook] Dispute ${dispute.id} on order ${order.id}`)
}

async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) return

  const order = await prisma.order.findFirst({
    where: { paymentRef: paymentIntentId, deletedAt: null },
  })
  if (!order) return

  await prisma.auditLog.create({
    data: {
      tenantId: order.tenantId,
      actorId: 'system',
      entityType: 'Order',
      entityId: order.id,
      action: 'CHARGE_REFUNDED',
      meta: { chargeId: charge.id, amountRefunded: charge.amount_refunded },
    },
  })

  void sendOpsAlert({
    subject: `Refund issued — order ${order.id}`,
    body: `Charge ${charge.id} on order ${order.id} was refunded $${(charge.amount_refunded / 100).toFixed(2)}.\n\nVerify document delivery status in the ops dashboard.`,
  })

  console.log(`[Stripe webhook] Refund on order ${order.id}`)
}
