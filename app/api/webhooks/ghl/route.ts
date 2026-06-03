// GHL → Compass webhook receiver.
// GHL fires this on opportunity stage changes.
// Compass updates its own order status — never pushes back to GHL (one-directional).
//
// Signature verification: GHL sends X-GHL-Signature as HMAC-SHA256 of raw body
// keyed with GHL_WEBHOOK_SECRET. We verify before processing.

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { updateStatus } from '@/services/orders'
import { OrderStatus } from '@prisma/client'

// GHL pipeline stage ID → Compass OrderStatus
// Driven by GHL_STAGE_MAP env var: {"INTAKE":"stageId1","DATA_QC":"stageId2",...}
function buildReverseStageMap(): Record<string, OrderStatus> {
  const raw = process.env.GHL_STAGE_MAP
  if (!raw) return {}
  try {
    const forward = JSON.parse(raw) as Record<string, string>
    const reverse: Record<string, OrderStatus> = {}
    for (const [status, stageId] of Object.entries(forward)) {
      reverse[stageId] = status as OrderStatus
    }
    return reverse
  } catch {
    return {}
  }
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.GHL_WEBHOOK_SECRET
  // If no secret configured, skip verification (dev/test only)
  if (!secret) return true
  if (!signature) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  // timingSafeEqual requires equal-length buffers — length mismatch means invalid sig
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length) return false
  return crypto.timingSafeEqual(sigBuf, expBuf)
}

interface GhlWebhookPayload {
  type: string
  opportunityId?: string
  stageId?: string
  locationId?: string
}

// Always return 200 to prevent GHL retry storms — log errors server-side only.
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-ghl-signature')

  if (!verifySignature(rawBody, signature)) {
    console.error('[GHL webhook] Invalid signature')
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  let payload: GhlWebhookPayload
  try {
    payload = JSON.parse(rawBody) as GhlWebhookPayload
  } catch {
    console.error('[GHL webhook] Invalid JSON')
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  // Only handle opportunity stage change events
  if (payload.type !== 'OpportunityStageUpdate' || !payload.opportunityId || !payload.stageId) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  try {
    await handleStageChange(payload.opportunityId, payload.stageId)
  } catch (err) {
    // Log and return 200 — don't let GHL retry
    console.error('[GHL webhook] Error handling stage change:', err)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

async function handleStageChange(opportunityId: string, stageId: string): Promise<void> {
  const reverseMap = buildReverseStageMap()
  const newStatus = reverseMap[stageId]

  if (!newStatus) {
    // Unknown stage — GHL may have custom stages we don't track
    console.log(`[GHL webhook] Unknown stageId ${stageId} — ignoring`)
    return
  }

  // Find the order by GHL opportunity ID
  const order = await prisma.order.findFirst({
    where: { ghlOpportunityId: opportunityId, deletedAt: null },
  })

  if (!order) {
    console.warn(`[GHL webhook] No order found for opportunityId ${opportunityId}`)
    return
  }

  // Skip if already at this status (idempotent)
  if (order.status === newStatus) return

  // Use system actor for GHL-driven transitions
  await updateStatus({
    orderId: order.id,
    tenantId: order.tenantId,
    actorId: 'system',
    toStatus: newStatus,
    note: `Stage updated via GHL webhook (stageId: ${stageId})`,
  })

  console.log(`[GHL webhook] Order ${order.id}: ${order.status} → ${newStatus}`)
}
