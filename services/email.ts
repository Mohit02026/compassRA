import { getResend, FROM, isMock } from '@/lib/resend'
import { render } from '@react-email/components'
import WelcomeEmail from '@/emails/WelcomeEmail'
import OrderFiledEmail from '@/emails/OrderFiledEmail'
import OrderCompletedEmail from '@/emails/OrderCompletedEmail'
import ExceptionEmail from '@/emails/ExceptionEmail'

const portalUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

interface WelcomeEmailPayload {
  to: string
  customerName: string
  businessName: string
  serviceType: string
  tempPassword: string
}

export async function sendWelcome(payload: WelcomeEmailPayload): Promise<void> {
  const { to, customerName, businessName, serviceType, tempPassword } = payload

  if (isMock) {
    console.log(`[Email mock] WelcomeEmail → ${to}`)
    console.log(`  customer: ${customerName}, business: ${businessName}`)
    console.log(`  temp password: ${tempPassword}`)
    return
  }

  const html = await render(
    WelcomeEmail({ customerName, businessName, serviceType, tempPassword, portalUrl: `${portalUrl}/login` })
  )

  await getResend().emails.send({
    from: FROM,
    to,
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
    to: payload.to,
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
    to: payload.to,
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
    to: payload.to,
    subject: 'Action needed on your filing',
    html,
  })
}
