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

interface WelcomeEmailProps {
  customerName: string
  businessName: string
  serviceType: string
  tempPassword?: string
  portalUrl: string
}

export default function WelcomeEmail({
  customerName,
  businessName,
  serviceType,
  tempPassword,
  portalUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {businessName} filing has started — sign in to track progress</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logoText}>Compass</Text>
          </Section>

          <Text style={greeting}>Hi {customerName},</Text>

          <Text style={paragraph}>
            We&apos;ve received your order for <strong>{businessName}</strong> ({serviceType}).
            A person on our team is handling your filing.
          </Text>

          <Text style={paragraph}>
            You can track your filing progress, see each stage as it moves forward,
            and download your documents once everything is complete.
          </Text>

          {/* CTA */}
          <Section style={ctaSection}>
            <Link href={portalUrl} style={ctaButton}>
              Sign in to your portal
            </Link>
          </Section>

          {tempPassword ? (
            <Text style={paragraph}>
              Your temporary password is: <strong style={code}>{tempPassword}</strong>
              <br />
              You&apos;ll be asked to set a new one when you first sign in.
            </Text>
          ) : (
            <Text style={paragraph}>
              Use the email and password you created during checkout to sign in.
            </Text>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            Compass Registered Agent &mdash; Florida LLC filing, done by a person.
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

const logoSection: React.CSSProperties = {
  marginBottom: '32px',
}

const logoText: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1a2744',
  margin: '0',
}

const greeting: React.CSSProperties = {
  fontSize: '16px',
  color: '#1a2744',
  fontWeight: '600',
  margin: '0 0 16px',
}

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  color: '#444',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const ctaSection: React.CSSProperties = {
  margin: '28px 0',
}

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

const code: React.CSSProperties = {
  backgroundColor: '#f0f0f0',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '14px',
}

const hr: React.CSSProperties = {
  borderColor: '#e8e8e8',
  margin: '28px 0',
}

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#999',
  lineHeight: '1.6',
}
