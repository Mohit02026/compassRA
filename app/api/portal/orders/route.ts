import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma, setPrismaContext } from '@/lib/prisma'

// Returns all orders belonging to the logged-in customer
export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }
  if (session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  await setPrismaContext(session.user.tenantId)

  // Find the customer record linked to this user
  const customer = await prisma.customer.findFirst({
    where: { userId: session.user.id, tenantId: session.user.tenantId, deletedAt: null },
  })

  if (!customer) {
    return NextResponse.json({ data: [] })
  }

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id, tenantId: session.user.tenantId, deletedAt: null },
    include: { documents: { where: { deletedAt: null } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: orders })
}
