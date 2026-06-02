import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma, setPrismaContext } from '@/lib/prisma'
import { getPresignedUrl } from '@/lib/r2'
import { OrderStatus } from '@prisma/client'

interface Context {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }

  await setPrismaContext(session.user.tenantId)

  const doc = await prisma.document.findFirst({
    where: { id: params.id, tenantId: session.user.tenantId, deletedAt: null },
    include: { order: { include: { customer: true } } },
  })

  if (!doc) {
    return NextResponse.json({ error: { code: 404, message: 'Document not found' } }, { status: 404 })
  }

  // Customers can only download docs from completed orders
  if (session.user.role === 'CUSTOMER') {
    const customer = await prisma.customer.findFirst({
      where: { userId: session.user.id, tenantId: session.user.tenantId, deletedAt: null },
    })

    if (!customer || doc.order.customerId !== customer.id) {
      return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
    }

    if (doc.order.status !== OrderStatus.COMPLETED) {
      return NextResponse.json(
        { error: { code: 403, message: 'Documents available once your filing is completed' } },
        { status: 403 }
      )
    }
  }

  try {
    // Drive docs: return the webViewLink directly (already public-readable)
    if (doc.driveFileId && !doc.r2Key) {
      const url = `https://drive.google.com/file/d/${doc.driveFileId}/view`
      return NextResponse.json({ data: { url } })
    }

    if (!doc.r2Key) {
      return NextResponse.json(
        { error: { code: 404, message: 'Document has no download source' } },
        { status: 404 }
      )
    }

    const url = await getPresignedUrl(doc.r2Key)
    return NextResponse.json({ data: { url } })
  } catch (err) {
    console.error('[GET /api/documents/[id]/url]', err)
    return NextResponse.json(
      { error: { code: 500, message: 'Failed to generate download URL' } },
      { status: 500 }
    )
  }
}
