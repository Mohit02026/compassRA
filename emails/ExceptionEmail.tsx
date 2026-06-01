import {
  Html, Head, Body, Container, Section, Text, Link, Hr
} from '@react-email/components'

interface Props {
  customerName: string
  orderId: string
  note?: string
  portalUrl: string
}

export default function ExceptionEmail({ customerName, orderId, note, portalUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f8fb', fontFamily: 'DM Sans, sans-serif' }}>
        <Container style={{ maxWidth: 520, margin: '40px auto', backgroundColor: '#fff', borderRadius: 12, padding: 32 }}>
          <Text style={{ fontSize: 22, fontWeight: 700, color: '#1a2e4a', margin: '0 0 8px' }}>
            We need something from you.
          </Text>
          <Text style={{ fontSize: 15, color: '#555', margin: '0 0 24px' }}>
            Hi {customerName} — there's a hold on your filing. Our team is reviewing it and may reach out shortly.
          </Text>
          {note && (
            <Section style={{ backgroundColor: '#fef3cd', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
              <Text style={{ fontSize: 14, color: '#7a5800', margin: 0 }}>{note}</Text>
            </Section>
          )}
          <Section>
            <Text style={{ fontSize: 13, color: '#888', margin: '0 0 4px' }}>Order reference</Text>
            <Text style={{ fontSize: 14, color: '#1a2e4a', fontWeight: 600, fontFamily: 'monospace' }}>{orderId}</Text>
          </Section>
          <Hr style={{ margin: '24px 0', borderColor: '#e5e9f0' }} />
          <Text style={{ fontSize: 14, color: '#555' }}>
            Check your order status in the{' '}
            <Link href={portalUrl} style={{ color: '#3b6bdc' }}>customer portal</Link>{' '}
            or reply to this email with any questions.
          </Text>
          <Text style={{ fontSize: 13, color: '#aaa', marginTop: 32 }}>
            Compass Registered Agent · No surprise charges, ever.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
