import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { processReminders } from '@/services/reminders'

function isValidCronSecret(provided: string | null): boolean {
  const expected = process.env.CRON_SECRET
  if (!provided || !expected) return false

  const providedBuf = Buffer.from(provided)
  const expectedBuf = Buffer.from(expected)
  if (providedBuf.length !== expectedBuf.length) return false
  return timingSafeEqual(providedBuf, expectedBuf)
}

// Called daily at 9am ET by an external scheduler (Railway cron or similar).
// Protected by CRON_SECRET — never expose this route publicly without the header.
export async function GET(req: NextRequest) {
  if (!isValidCronSecret(req.headers.get('x-cron-secret'))) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }

  try {
    // Process reminders for all tenants
    const tenants = await prisma.tenant.findMany({ select: { id: true } })

    const results = await Promise.all(
      tenants.map((t) => processReminders(t.id))
    )

    const totals = results.reduce(
      (acc, r) => ({
        processed: acc.processed + r.processed,
        sent: acc.sent + r.sent,
        errors: acc.errors + r.errors,
      }),
      { processed: 0, sent: 0, errors: 0 }
    )

    console.log(`[Cron/reminders] processed=${totals.processed} sent=${totals.sent} errors=${totals.errors}`)

    return NextResponse.json({ data: totals })
  } catch (err) {
    console.error('[Cron/reminders] Fatal error:', err)
    return NextResponse.json(
      { error: { code: 500, message: 'Cron failed' } },
      { status: 500 }
    )
  }
}
