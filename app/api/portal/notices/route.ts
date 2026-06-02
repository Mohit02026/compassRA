import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma, setPrismaContext } from '@/lib/prisma'

export async function GET() {
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
    return NextResponse.json({ data: { items: [] } })
  }

  const notices = await prisma.legalNotice.findMany({
    where: { customerId: customer.id, tenantId: session.user.tenantId },
    orderBy: { receivedAt: 'desc' },
  })

  const items = notices.map((n) => ({
    id: n.id,
    filename: n.filename,
    receivedAt: n.receivedAt.toISOString(),
    forwardedAt: n.forwardedAt?.toISOString() ?? null,
  }))

  return NextResponse.json({ data: { items } })
}
