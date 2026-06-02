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
    return NextResponse.json({ error: { code: 404, message: 'Customer not found' } }, { status: 404 })
  }

  const order = await prisma.order.findFirst({
    where: { customerId: customer.id, tenantId: session.user.tenantId, deletedAt: null },
    include: { orderData: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!order) {
    return NextResponse.json({ data: null })
  }

  const get = (key: string) => order.orderData.find((d) => d.key === key)?.value ?? null

  return NextResponse.json({
    data: {
      businessName: get('businessName'),
      serviceType: order.serviceType,
      status: order.status,
      state: order.state,
      dueDate: order.dueDate?.toISOString() ?? null,
      flDocNumber: get('flDocNumber'),
      ghlOpportunityId: order.ghlOpportunityId,
    },
  })
}
