import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma, setPrismaContext } from '@/lib/prisma'
import { getPresignedUrl } from '@/lib/r2'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }
  if (session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  await setPrismaContext(session.user.tenantId)

  const customer = await prisma.customer.findFirst({
    where: { userId: session.user.id, tenantId: session.user.tenantId, deletedAt: null },
  })

  if (!customer) {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  const notice = await prisma.legalNotice.findFirst({
    where: { id: params.id, customerId: customer.id, tenantId: session.user.tenantId },
  })

  if (!notice) {
    return NextResponse.json({ error: { code: 404, message: 'Not found' } }, { status: 404 })
  }

  const url = await getPresignedUrl(notice.r2Key)
  return NextResponse.json({ data: { url } })
}
