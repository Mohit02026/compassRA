import * as Sentry from '@sentry/nextjs'
import { prisma, setPrismaContext } from '@/lib/prisma'
import { OrderStatus, ServiceType } from '@prisma/client'
import { sendAnnualReportReminder } from '@/services/email'
import { enrollContactInWorkflow } from '@/lib/ghl'

// Reminder intervals in days before due date — matches workflow spec
const REMINDER_INTERVALS = [90, 60, 30, 14, 7, 3] as const
type ReminderType = '90day' | '60day' | '30day' | '14day' | '7day' | '3day'

function daysToType(days: number): ReminderType {
  return `${days}day` as ReminderType
}

function formatDueDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function daysUntil(date: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86400000)
}

export interface ProcessRemindersResult {
  processed: number
  sent: number
  errors: number
}

// Called daily by cron. Idempotent — checks sentAt before sending.
export async function processReminders(tenantId: string): Promise<ProcessRemindersResult> {
  await setPrismaContext(tenantId)

  const now = new Date()
  let processed = 0
  let sent = 0
  let errors = 0

  // Find all annual report orders with a due date that are not yet completed
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      deletedAt: null,
      serviceType: ServiceType.ANNUAL_REPORT,
      dueDate: { not: null },
      status: { notIn: [OrderStatus.COMPLETED] },
    },
    include: {
      customer: { include: { user: true } },
      reminders: true,
      orderData: true,
    },
  })

  for (const order of orders) {
    if (!order.dueDate) continue

    const days = daysUntil(order.dueDate)

    for (const interval of REMINDER_INTERVALS) {
      // Only send if we're within the window (0–1 days past the target)
      if (days > interval || days < interval - 1) continue

      const type = daysToType(interval)
      processed++

      // Idempotency check — skip if already sent for this order+type
      const existing = order.reminders.find(
        (r) => r.type === type && r.sentAt !== null
      )
      if (existing) continue

      // Find existing reminder row or create one
      let reminder = order.reminders.find((r) => r.type === type)
      if (!reminder) {
        reminder = await prisma.reminder.create({
          data: {
            orderId: order.id,
            customerId: order.customerId,
            type,
            sendAt: now,
          },
        })
      }

      try {
        // GHL SMS automation takes priority when a workflow ID is configured.
        // Compass also sends the email as a fallback — GHL deduplicates on its end.
        const ghlWorkflowId = process.env[`GHL_REMINDER_WORKFLOW_${interval}DAY`]
        const ghlContactId = order.orderData.find((d) => d.key === 'ghlContactId')?.value

        if (ghlWorkflowId && ghlContactId) {
          await enrollContactInWorkflow(ghlContactId, ghlWorkflowId)
        }

        // Always send Resend email as well (audit trail + portal CTA)
        await sendAnnualReportReminder({
          to: order.customer.user.email,
          customerName: order.customer.name,
          businessName: order.orderData.find((d) => d.key === 'businessName')?.value ?? 'your LLC',
          daysUntilDue: interval,
          dueDate: formatDueDate(order.dueDate),
        })

        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { sentAt: now },
        })

        sent++
      } catch (err) {
        console.error(`[Reminders] Failed to send ${type} for order ${order.id}:`, err)
        Sentry.captureException(err, { tags: { reminderType: type, orderId: order.id } })
        errors++
      }
    }
  }

  return { processed, sent, errors }
}
