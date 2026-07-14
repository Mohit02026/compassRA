// GHL → Compass webhook receiver.
// GHL fires this via Workflow → "Send Data to Webhook" action on opportunity stage change.
//
// Actual GHL payload shape (from live test):
//   id: opportunity ID
//   pipleline_stage: stage name (GHL's typo — "pipleline" not "pipeline")
//   pipeline_id: pipeline ID
//   email, contact_id, full_name, etc.
//
// Stage name → OrderStatus driven by GHL_STAGE_NAME_MAP env var.
// GHL_WEBHOOK_SECRET: optional HMAC-SHA256 signing. Leave empty to skip (dev/test).
// _ts: optional Unix timestamp (seconds) added by GHL workflow. When present + secret is set,
//      rejected if older than 5 minutes to prevent replay attacks.
// Always return 200 — prevents GHL retry storms.

import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { updateStatus } from '@/services/orders'
import { OrderStatus } from '@prisma/client'

// GHL_STAGE_NAME_MAP env var: {"New Order":"INTAKE","Data QC":"DATA_QC",...}
function getStatusFromStageName(stageName: string): OrderStatus | null {
  const raw = process.env.GHL_STAGE_NAME_MAP
  if (!raw) return null
  try {
    const map = JSON.parse(raw) as Record<string, string>
    const status = map[stageName]
    if (!status) return null
    return status as OrderStatus
  } catch {
    return null
  }
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.GHL_WEBHOOK_SECRET
  // No secret configured — skip verification (dev/test)
  if (!secret) return true
  if (!signature) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length) return false
  return crypto.timingSafeEqual(sigBuf, expBuf)
}

// Replay attack protection: reject if _ts is present and older than 5 minutes.
// Add _ts (current Unix timestamp in seconds) to the GHL workflow webhook body to enable this.
// Skipped when GHL_WEBHOOK_SECRET is not set (dev/test) or when _ts is absent.
function validateTimestamp(payload: GhlWebhookPayload): boolean {
  const secret = process.env.GHL_WEBHOOK_SECRET
  if (!secret || payload._ts === undefined) return true

  const ageMs = Date.now() - payload._ts * 1000
  return ageMs < 5 * 60 * 1000
}

// Matches actual GHL "Send Data to Webhook" payload.
// Field names are GHL's own — including the "pipleline" typo.
interface GhlWebhookPayload {
  id?: string              // GHL opportunity ID
  pipleline_stage?: string // stage name — GHL's typo, not ours
  pipeline_id?: string
  email?: string
  full_name?: string
  _ts?: number             // Unix timestamp (seconds) — add to GHL workflow for replay protection
  [key: string]: unknown
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-ghl-signature')

  if (!verifySignature(rawBody, signature)) {
    console.error('[GHL webhook] Invalid signature')
    Sentry.captureMessage('[GHL webhook] Invalid signature', 'warning')
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  let payload: GhlWebhookPayload
  try {
    payload = JSON.parse(rawBody) as GhlWebhookPayload
  } catch {
    console.error('[GHL webhook] Invalid JSON')
    Sentry.captureMessage('[GHL webhook] Invalid JSON', 'warning')
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  if (!validateTimestamp(payload)) {
    console.error('[GHL webhook] Replay attack detected — _ts too old')
    Sentry.captureMessage('[GHL webhook] Replay attack detected — _ts too old', 'warning')
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  const { id: opportunityId, pipleline_stage: stageName, pipeline_id: pipelineId } = payload

  // Only process events from our pipeline
  const ourPipelineId = process.env.GHL_PIPELINE_ID
  if (ourPipelineId && pipelineId && pipelineId !== ourPipelineId) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  if (!opportunityId || !stageName) {
    // Missing fields — could be a non-opportunity event, ignore silently
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const newStatus = getStatusFromStageName(stageName)
  if (!newStatus) {
    // Stage name not in our map — GHL may have custom stages we don't track
    console.log(`[GHL webhook] Unknown stage name "${stageName}" — ignoring`)
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  try {
    await handleStageChange(opportunityId, newStatus)
  } catch (err) {
    console.error('[GHL webhook] Error handling stage change:', err)
    Sentry.captureException(err, { tags: { opportunityId } })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

async function handleStageChange(
  opportunityId: string,
  newStatus: OrderStatus
): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { ghlOpportunityId: opportunityId, deletedAt: null },
  })

  if (!order) {
    // Normal during dev — test opportunities in GHL have no matching Compass order
    console.log(`[GHL webhook] No order found for opportunityId ${opportunityId} — skipping`)
    return
  }

  // Idempotent — skip if already at target status
  if (order.status === newStatus) return

  await updateStatus({
    orderId: order.id,
    tenantId: order.tenantId,
    actorId: 'system',
    toStatus: newStatus,
    note: `Stage updated via GHL webhook`,
  })

  console.log(`[GHL webhook] Order ${order.id}: ${order.status} → ${newStatus}`)
}
