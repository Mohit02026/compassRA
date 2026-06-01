import {
  Html, Head, Body, Container, Section, Text, Link, Hr
} from '@react-email/components'

interface Props {
  customerName: string
  orderId: string
  portalUrl: string
}

export default function OrderCompletedEmail({ customerName, orderId, portalUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f8fb', fontFamily: 'DM Sans, sans-serif' }}>
        <Container style={{ maxWidth: 520, margin: '40px auto', backgroundColor: '#fff', borderRadius: 12, padding: 32 }}>
          <Text style={{ fontSize: 22, fontWeight: 700, color: '#1a2e4a', margin: '0 0 8px' }}>
            Your LLC is active.
          </Text>
          <Text style={{ fontSize: 15, color: '#555', margin: '0 0 24px' }}>
            Hi {customerName} — your filing is confirmed on Sunbiz. Your documents are ready to download in your portal.
          </Text>
          <Section>
            <Text style={{ fontSize: 13, color: '#888', margin: '0 0 4px' }}>Order reference</Text>
            <Text style={{ fontSize: 14, color: '#1a2e4a', fontWeight: 600, fontFamily: 'monospace' }}>{orderId}</Text>
          </Section>
          <Hr style={{ margin: '24px 0', borderColor: '#e5e9f0' }} />
          <Text style={{ fontSize: 14, color: '#555' }}>
            Download your documents from your{' '}
            <Link href={`${portalUrl}/documents`} style={{ color: '#3b6bdc' }}>document vault</Link>.
            No surprise charges — flat fee, done.
          </Text>
          <Text style={{ fontSize: 13, color: '#aaa', marginTop: 32 }}>
            Compass Registered Agent · Flat fee. Filed. Done. Active.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
