import {
  Html, Head, Body, Container, Section, Text, Link, Hr
} from '@react-email/components'

interface Props {
  customerName: string
  businessName: string
  daysUntilDue: number
  dueDate: string        // e.g. "May 1, 2027"
  portalUrl: string
}

export default function AnnualReportReminderEmail({
  customerName,
  businessName,
  daysUntilDue,
  dueDate,
  portalUrl,
}: Props) {
  const urgent = daysUntilDue <= 7

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f8fb', fontFamily: 'DM Sans, sans-serif' }}>
        <Container style={{ maxWidth: 520, margin: '40px auto', backgroundColor: '#fff', borderRadius: 12, padding: 32 }}>
          {urgent && (
            <Section style={{ backgroundColor: '#fef3cd', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
              <Text style={{ fontSize: 13, color: '#7a5800', margin: 0, fontWeight: 600 }}>
                ⚠️ {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} remaining
              </Text>
            </Section>
          )}

          <Text style={{ fontSize: 22, fontWeight: 700, color: '#1a2e4a', margin: '0 0 8px' }}>
            {urgent
              ? 'Your annual report is due soon.'
              : `Annual report due in ${daysUntilDue} days.`}
          </Text>

          <Text style={{ fontSize: 15, color: '#555', margin: '0 0 24px' }}>
            Hi {customerName} — your annual report for <strong>{businessName}</strong> is due on{' '}
            <strong>{dueDate}</strong>. File on time to keep your LLC active on Sunbiz — no
            surprise charges, flat fee.
          </Text>

          <Section style={{ backgroundColor: '#f0f4ff', borderRadius: 8, padding: '14px 18px', marginBottom: 24 }}>
            <Text style={{ fontSize: 13, color: '#1a2e4a', margin: 0 }}>
              Due date: <strong>{dueDate}</strong>
              {daysUntilDue <= 30
                ? ' — late fees apply after May 1'
                : ''}
            </Text>
          </Section>

          <Link
            href={portalUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#1a2e4a',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View your filing status →
          </Link>

          <Hr style={{ margin: '28px 0', borderColor: '#e5e9f0' }} />

          <Text style={{ fontSize: 13, color: '#aaa' }}>
            You're receiving this because Compass is your registered agent.
            To stop reminders, reply to this email.
          </Text>
          <Text style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>
            Compass Registered Agent · Flat fee. Filed. Done. Active.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
