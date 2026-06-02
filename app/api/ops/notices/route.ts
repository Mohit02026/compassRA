import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma, setPrismaContext } from '@/lib/prisma'
import { uploadToR2 } from '@/lib/r2'
import { z } from 'zod'
import { sendLegalNotice } from '@/services/email'

const bodySchema = z.object({
  customerId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }
  if (session.user.role !== 'OPS' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  await setPrismaContext(session.user.tenantId)

  const formData = await req.formData()
  const file = formData.get('file')
  const customerIdRaw = formData.get('customerId')

  const parsed = bodySchema.safeParse({ customerId: customerIdRaw })
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 400, message: parsed.error.issues[0]?.message ?? 'Invalid input' } },
      { status: 400 }
    )
  }

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: { code: 400, message: 'File is required' } }, { status: 400 })
  }

  const { customerId } = parsed.data

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, tenantId: session.user.tenantId, deletedAt: null },
    include: { user: true },
  })

  if (!customer) {
    return NextResponse.json({ error: { code: 404, message: 'Customer not found' } }, { status: 404 })
  }

  // Find most recent order for business name in notification
  const recentOrder = await prisma.order.findFirst({
    where: { customerId, tenantId: session.user.tenantId, deletedAt: null },
    include: { orderData: { where: { key: 'businessName' } } },
    orderBy: { createdAt: 'desc' },
  })

  const businessName =
    recentOrder?.orderData.find((d) => d.key === 'businessName')?.value ?? customer.name

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = (file as File).name
  const r2Key = `${session.user.tenantId}/legal-notices/${customerId}/${Date.now()}-${filename}`

  await uploadToR2(r2Key, buffer, (file as File).type || 'application/octet-stream')

  const notice = await prisma.legalNotice.create({
    data: {
      tenantId: session.user.tenantId,
      customerId,
      r2Key,
      filename,
      receivedAt: new Date(),
    },
  })

  // Fire-and-forget — non-blocking
  void sendLegalNotice({
    to: customer.email,
    customerName: customer.name,
    businessName,
  })

  return NextResponse.json({ data: { id: notice.id } }, { status: 201 })
}
