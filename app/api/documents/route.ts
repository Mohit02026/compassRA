import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@/lib/auth'
import { uploadDocument, listDocuments } from '@/services/documents'
import { DocumentType } from '@prisma/client'
import { z } from 'zod'

const uploadSchema = z.object({
  orderId: z.string().min(1),
  type: z.nativeEnum(DocumentType),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }
  if (session.user.role !== 'OPS' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const orderId = formData.get('orderId') as string | null
  const type = formData.get('type') as string | null

  if (!file || !orderId || !type) {
    return NextResponse.json(
      { error: { code: 400, message: 'file, orderId, and type are required' } },
      { status: 400 }
    )
  }

  const parsed = uploadSchema.safeParse({ orderId, type })
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 400, message: 'Invalid input', details: parsed.error.flatten() } },
      { status: 400 }
    )
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    const doc = await uploadDocument({
      orderId: parsed.data.orderId,
      tenantId: session.user.tenantId,
      actorId: session.user.id,
      type: parsed.data.type,
      filename: file.name,
      buffer,
      contentType: file.type || 'application/octet-stream',
    })

    return NextResponse.json({ data: doc }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/documents]', err)
    Sentry.captureException(err)
    return NextResponse.json(
      { error: { code: 500, message: 'Failed to upload document' } },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }
  if (session.user.role !== 'OPS' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId') ?? undefined

  const docs = await listDocuments(session.user.tenantId, orderId)
  return NextResponse.json({ data: docs })
}
