import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma, setPrismaContext } from '@/lib/prisma'

interface Context {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: Context) {
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
    return NextResponse.json({ error: { code: 404, message: 'Not found' } }, { status: 404 })
  }

  // Ensure order belongs to this customer — never trust URL param alone
  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      customerId: customer.id,
      tenantId: session.user.tenantId,
      deletedAt: null,
    },
    include: {
      documents: { where: { deletedAt: null } },
      orderData: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: { code: 404, message: 'Not found' } }, { status: 404 })
  }

  return NextResponse.json({ data: order })
}
