import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma, setPrismaContext } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }
  if (session.user.role !== 'OPS' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  await setPrismaContext(session.user.tenantId)

  const [counts, overdue] = await Promise.all([
    prisma.order.groupBy({
      by: ['status'],
      where: { tenantId: session.user.tenantId, deletedAt: null },
      _count: { id: true },
    }),
    prisma.order.count({
      where: {
        tenantId: session.user.tenantId,
        deletedAt: null,
        dueDate: { lt: new Date() },
        status: { notIn: [OrderStatus.COMPLETED] },
      },
    }),
  ])

  const byStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count.id])
  ) as Record<string, number>

  const total = Object.values(byStatus).reduce((a, b) => a + b, 0)

  return NextResponse.json({
    data: {
      total,
      overdue,
      byStatus: {
        INTAKE: byStatus.INTAKE ?? 0,
        REVIEW: byStatus.REVIEW ?? 0,
        FILED: byStatus.FILED ?? 0,
        COMPLETED: byStatus.COMPLETED ?? 0,
        EXCEPTION: byStatus.EXCEPTION ?? 0,
      },
    },
  })
}
