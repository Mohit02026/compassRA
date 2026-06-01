import {
  Html, Head, Body, Container, Section, Text, Link, Hr
} from '@react-email/components'

interface Props {
  customerName: string
  orderId: string
  portalUrl: string
}

export default function OrderFiledEmail({ customerName, orderId, portalUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f8fb', fontFamily: 'DM Sans, sans-serif' }}>
        <Container style={{ maxWidth: 520, margin: '40px auto', backgroundColor: '#fff', borderRadius: 12, padding: 32 }}>
          <Text style={{ fontSize: 22, fontWeight: 700, color: '#1a2e4a', margin: '0 0 8px' }}>
            Your filing has been submitted.
          </Text>
          <Text style={{ fontSize: 15, color: '#555', margin: '0 0 24px' }}>
            Hi {customerName} — we've submitted your filing to the state. You'll hear from us once it's confirmed active on Sunbiz.
          </Text>
          <Section>
            <Text style={{ fontSize: 13, color: '#888', margin: '0 0 4px' }}>Order reference</Text>
            <Text style={{ fontSize: 14, color: '#1a2e4a', fontWeight: 600, fontFamily: 'monospace' }}>{orderId}</Text>
          </Section>
          <Hr style={{ margin: '24px 0', borderColor: '#e5e9f0' }} />
          <Text style={{ fontSize: 14, color: '#555' }}>
            Track your filing status anytime in your{' '}
            <Link href={portalUrl} style={{ color: '#3b6bdc' }}>customer portal</Link>.
          </Text>
          <Text style={{ fontSize: 13, color: '#aaa', marginTop: 32 }}>
            Compass Registered Agent · Flat fee. Filed. Done. Active.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
