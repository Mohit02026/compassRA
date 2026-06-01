import { getResend, FROM, isMock } from '@/lib/resend'
import { render } from '@react-email/components'
import WelcomeEmail from '@/emails/WelcomeEmail'

interface WelcomeEmailPayload {
  to: string
  customerName: string
  businessName: string
  serviceType: string
  tempPassword: string
}

export async function sendWelcome(payload: WelcomeEmailPayload): Promise<void> {
  const { to, customerName, businessName, serviceType, tempPassword } = payload
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`

  if (isMock) {
    console.log(`[Email mock] WelcomeEmail → ${to}`)
    console.log(`  customer: ${customerName}, business: ${businessName}`)
    console.log(`  temp password: ${tempPassword}`)
    return
  }

  const html = await render(
    WelcomeEmail({ customerName, businessName, serviceType, tempPassword, portalUrl })
  )

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Your ${businessName} filing has started`,
    html,
  })
}
