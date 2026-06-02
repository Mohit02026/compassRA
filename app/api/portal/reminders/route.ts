import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma, setPrismaContext } from '@/lib/prisma'
import { ServiceType } from '@prisma/client'

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

  const orders = await prisma.order.findMany({
    where: {
      customerId: customer.id,
      tenantId: session.user.tenantId,
      deletedAt: null,
      serviceType: ServiceType.ANNUAL_REPORT,
    },
    include: {
      reminders: { orderBy: { sendAt: 'asc' } },
    },
  })

  const items = orders.flatMap((o) =>
    o.reminders.map((r) => ({
      type: r.type,
      sendAt: r.sendAt.toISOString(),
      sentAt: r.sentAt?.toISOString() ?? null,
    }))
  )

  return NextResponse.json({ data: { items } })
}
