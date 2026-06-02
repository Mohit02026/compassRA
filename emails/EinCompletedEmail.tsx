import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Preview,
} from '@react-email/components'

interface EinCompletedEmailProps {
  customerName: string
  businessName: string
  portalUrl: string
}

export default function EinCompletedEmail({
  customerName,
  businessName,
  portalUrl,
}: EinCompletedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your EIN for {businessName} is ready — download it from your portal</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>Compass</Text>
          </Section>

          <Text style={greeting}>Hi {customerName},</Text>

          <Text style={paragraph}>
            Your Employer Identification Number (EIN) for <strong>{businessName}</strong> has
            been confirmed with the IRS.
          </Text>

          <Text style={paragraph}>
            Your EIN confirmation letter is now available to download from your portal.
            Keep this document — you&apos;ll need it to open a business bank account and file taxes.
          </Text>

          <Section style={ctaSection}>
            <Link href={portalUrl} style={ctaButton}>
              Download EIN Confirmation
            </Link>
          </Section>

          <Text style={paragraph}>
            Your LLC is now fully active with both a state filing number and a federal EIN.
            Filed. Done. Active.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Compass Registered Agent &mdash; Florida LLC filing, done by a real person.
            <br />
            Flat fee. No surprise charges. Verified on Sunbiz.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#f5f5f7',
  fontFamily: '"DM Sans", -apple-system, sans-serif',
}
const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px',
  borderRadius: '12px',
  maxWidth: '560px',
}
const logoSection: React.CSSProperties = { marginBottom: '32px' }
const logoText: React.CSSProperties = { fontSize: '20px', fontWeight: '700', color: '#1a2744', margin: '0' }
const greeting: React.CSSProperties = { fontSize: '16px', color: '#1a2744', fontWeight: '600', margin: '0 0 16px' }
const paragraph: React.CSSProperties = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const ctaSection: React.CSSProperties = { margin: '28px 0' }
const ctaButton: React.CSSProperties = {
  backgroundColor: '#1a2744',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr: React.CSSProperties = { borderColor: '#e8e8e8', margin: '28px 0' }
const footer: React.CSSProperties = { fontSize: '12px', color: '#999', lineHeight: '1.6' }
