import { getResend, FROM, isMock, resolveRecipient } from '@/lib/resend'
import { render } from '@react-email/components'
import WelcomeEmail from '@/emails/WelcomeEmail'
import OrderFiledEmail from '@/emails/OrderFiledEmail'
import OrderCompletedEmail from '@/emails/OrderCompletedEmail'
import ExceptionEmail from '@/emails/ExceptionEmail'
import AnnualReportReminderEmail from '@/emails/AnnualReportReminderEmail'
import LegalNoticeEmail from '@/emails/LegalNoticeEmail'
import EinCompletedEmail from '@/emails/EinCompletedEmail'

const portalUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

interface WelcomeEmailPayload {
  to: string
  customerName: string
  businessName: string
  serviceType: string
  tempPassword?: string // absent when customer set their own password during checkout
}

export async function sendWelcome(payload: WelcomeEmailPayload): Promise<void> {
  const { to, customerName, businessName, serviceType, tempPassword } = payload

  if (isMock) {
    console.log(`[Email mock] WelcomeEmail → ${to}`)
    console.log(`  customer: ${customerName}, business: ${businessName}`)
    if (tempPassword) console.log(`  temp password: ${tempPassword}`)
    return
  }

  const html = await render(
    WelcomeEmail({ customerName, businessName, serviceType, tempPassword, portalUrl: `${portalUrl}/login` })
  )

  await getResend().emails.send({
    from: FROM,
    to: resolveRecipient(to),
    subject: `Your ${businessName} filing has started`,
    html,
  })
}

interface FiledPayload {
  to: string
  customerName: string
  orderId: string
}

export async function sendOrderFiled(payload: FiledPayload): Promise<void> {
  if (isMock) {
    console.log(`[Email mock] OrderFiledEmail → ${payload.to}`)
    return
  }

  const html = await render(
    OrderFiledEmail({ ...payload, portalUrl: `${portalUrl}/portal/dashboard` })
  )

  await getResend().emails.send({
    from: FROM,
    to: resolveRecipient(payload.to),
    subject: 'Your filing has been submitted',
    html,
  })
}

interface CompletedPayload {
  to: string
  customerName: string
  orderId: string
}

export async function sendOrderCompleted(payload: CompletedPayload): Promise<void> {
  if (isMock) {
    console.log(`[Email mock] OrderCompletedEmail → ${payload.to}`)
    return
  }

  const html = await render(
    OrderCompletedEmail({ ...payload, portalUrl: `${portalUrl}/portal/dashboard` })
  )

  await getResend().emails.send({
    from: FROM,
    to: resolveRecipient(payload.to),
    subject: 'Your LLC is active — documents ready',
    html,
  })
}

interface ExceptionPayload {
  to: string
  customerName: string
  orderId: string
  note?: string
}

export async function sendException(payload: ExceptionPayload): Promise<void> {
  if (isMock) {
    console.log(`[Email mock] ExceptionEmail → ${payload.to}`)
    return
  }

  const html = await render(
    ExceptionEmail({ ...payload, portalUrl: `${portalUrl}/portal/dashboard` })
  )

  await getResend().emails.send({
    from: FROM,
    to: resolveRecipient(payload.to),
    subject: 'Action needed on your filing',
    html,
  })
}

// Internal ops alert — plain text, no customer template. Used for workflow warnings.
interface OpsAlertPayload {
  subject: string
  body: string
}

export async function sendOpsAlert(payload: OpsAlertPayload): Promise<void> {
  const opsEmail = process.env.OPS_ALERT_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? ''
  if (!opsEmail) return

  if (isMock) {
    console.warn(`[Email mock] OpsAlert → ${opsEmail}: ${payload.subject}`)
    return
  }

  await getResend().emails.send({
    from: FROM,
    to: opsEmail,
    subject: `[Compass Ops] ${payload.subject}`,
    text: payload.body,
  })
}

interface ReminderEmailPayload {
  to: string
  customerName: string
  businessName: string
  daysUntilDue: number
  dueDate: string
}

export async function sendAnnualReportReminder(payload: ReminderEmailPayload): Promise<void> {
  if (isMock) {
    console.log(`[Email mock] AnnualReportReminderEmail → ${payload.to} (${payload.daysUntilDue}d)`)
    return
  }

  const html = await render(
    AnnualReportReminderEmail({ ...payload, portalUrl: `${portalUrl}/portal/dashboard` })
  )

  const subject =
    payload.daysUntilDue <= 7
      ? `⚠️ Annual report due in ${payload.daysUntilDue} day${payload.daysUntilDue !== 1 ? 's' : ''}`
      : `Annual report reminder — ${payload.dueDate}`

  await getResend().emails.send({
    from: FROM,
    to: resolveRecipient(payload.to),
    subject,
    html,
  })
}

interface LegalNoticePayload {
  to: string
  customerName: string
  businessName: string
}

export async function sendLegalNotice(payload: LegalNoticePayload): Promise<void> {
  if (isMock) {
    console.log(`[Email mock] LegalNoticeEmail → ${payload.to}`)
    console.log(`  business: ${payload.businessName}`)
    return
  }

  const html = await render(
    LegalNoticeEmail({
      customerName: payload.customerName,
      businessName: payload.businessName,
      portalUrl: `${portalUrl}/portal/notices`,
    })
  )

  await getResend().emails.send({
    from: FROM,
    to: resolveRecipient(payload.to),
    subject: `You have a new legal notice — ${payload.businessName}`,
    html,
  })
}

interface EinCompletedPayload {
  to: string
  customerName: string
  businessName: string
}

export async function sendEinCompleted(payload: EinCompletedPayload): Promise<void> {
  if (isMock) {
    console.log(`[Email mock] EinCompletedEmail → ${payload.to}`)
    console.log(`  business: ${payload.businessName}`)
    return
  }

  const html = await render(
    EinCompletedEmail({
      customerName: payload.customerName,
      businessName: payload.businessName,
      portalUrl: `${portalUrl}/portal/documents`,
    })
  )

  await getResend().emails.send({
    from: FROM,
    to: resolveRecipient(payload.to),
    subject: `Your EIN for ${payload.businessName} is confirmed`,
    html,
  })
}
