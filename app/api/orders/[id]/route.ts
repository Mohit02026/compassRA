import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@/lib/auth'
import { getOrder, updateStatus, isLegalTransition } from '@/services/orders'
import { OrderStatus } from '@prisma/client'
import { z } from 'zod'

interface Context {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }
  if (session.user.role !== 'OPS' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  const order = await getOrder(params.id, session.user.tenantId)
  if (!order) {
    return NextResponse.json({ error: { code: 404, message: 'Order not found' } }, { status: 404 })
  }

  return NextResponse.json({ data: order })
}

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }
  if (session.user.role !== 'OPS' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  const body = await req.json()
  const parsed = updateStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 400, message: 'Invalid input', details: parsed.error.flatten() } },
      { status: 400 }
    )
  }

  // Validate the transition is legal before hitting the service
  const order = await getOrder(params.id, session.user.tenantId)
  if (!order) {
    return NextResponse.json({ error: { code: 404, message: 'Order not found' } }, { status: 404 })
  }

  if (!isLegalTransition(order.status, parsed.data.status)) {
    return NextResponse.json(
      { error: { code: 400, message: `Cannot transition from ${order.status} to ${parsed.data.status}` } },
      { status: 400 }
    )
  }

  try {
    await updateStatus({
      orderId: params.id,
      tenantId: session.user.tenantId,
      actorId: session.user.id,
      toStatus: parsed.data.status,
      note: parsed.data.note,
    })

    return NextResponse.json({ data: { success: true } })
  } catch (err) {
    console.error('[PATCH /api/orders/[id]]', err)
    Sentry.captureException(err)
    return NextResponse.json(
      { error: { code: 500, message: 'Failed to update status' } },
      { status: 500 }
    )
  }
}
