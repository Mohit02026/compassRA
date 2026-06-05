'use client'

// Live preview of the Articles of Organization as the customer fills the form.
// Mirrors the actual FL DR-621 field order so the customer sees what will be filed.

// Address confirmed via SunBiz (Document # L25000307072)
const RA_NAME = 'Compass Registered Agent, LLC'
const RA_ADDRESS = '625 Court St Ste 100, Clearwater, FL 33756'

export interface LLCFormData {
  businessName: string
  effectiveType: 'immediate' | 'future'
  effectiveDate: string
  management: 'member-managed' | 'manager-managed'
  members: Array<{ name: string; ownership: string }>
  contactName: string
  principalStreet: string
  principalCity: string
  principalState: string
  principalZip: string
  mailingSame: boolean
  mailingStreet: string
  mailingCity: string
  mailingState: string
  mailingZip: string
  useCompassRA: boolean
  raName: string
  raAddress: string
  addOnEin: boolean
  addOnOperatingAgreement: boolean
  addOnCertificateOfStatus: boolean
}

interface Props {
  form: LLCFormData
  step: number
}

// step 1 → Articles I, IV, V   step 2 → Articles II, III   step 3 → all
function isActive(article: 1 | 2 | 3 | 4 | 5, step: number): boolean {
  if (step === 1) return article === 1 || article === 4 || article === 5
  if (step === 2) return article === 2 || article === 3
  return false
}

export function LLCDocumentPreview({ form, step }: Props) {
  const raName = form.useCompassRA ? RA_NAME : form.raName
  const raAddress = form.useCompassRA ? RA_ADDRESS : form.raAddress

  const effectiveDateLabel =
    form.effectiveType === 'immediate'
      ? 'Immediate — upon filing'
      : form.effectiveDate || ''

  const mailingStreet = form.mailingSame ? form.principalStreet : form.mailingStreet
  const mailingCity  = form.mailingSame ? form.principalCity  : form.mailingCity
  const mailingState = form.mailingSame ? form.principalState : form.mailingState
  const mailingZip   = form.mailingSame ? form.principalZip   : form.mailingZip

  return (
    <div className="sticky top-6 max-h-[calc(100vh-3rem)] flex flex-col">
      {/* Header bar */}
      <div
        className="rounded-t-lg px-4 py-2.5 flex items-center justify-between shrink-0"
        style={{ backgroundColor: 'var(--color-navy)' }}
      >
        <span className="text-white text-xs font-semibold" style={{ fontFamily: 'var(--font-jakarta)' }}>
          Document Preview
        </span>
        <span className="text-white/50 text-xs">Articles of Organization</span>
      </div>

      {/* Paper */}
      <div
        className="bg-white rounded-b-lg overflow-y-auto flex-1"
        style={{ border: '1px solid var(--color-border)', borderTop: 'none' }}
      >
        <div className="px-6 py-5" style={{ fontFamily: 'Georgia, serif', fontSize: '11px', color: '#111', lineHeight: 1.6 }}>

          {/* Document title */}
          <div className="text-center mb-4 pb-3" style={{ borderBottom: '1px solid #ddd' }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Articles of Organization
            </p>
            <p style={{ fontSize: '10px', color: '#666', marginTop: '3px' }}>
              Florida Limited Liability Company · State of Florida
            </p>
          </div>

          <p className="text-center mb-4" style={{ fontSize: '8.5px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Draft preview — not a filed document
          </p>

          {/* Article I */}
          <Article title="Article I — Name of Limited Liability Company" active={isActive(1, step)}>
            <DocField
              label="LLC Name (must end in LLC, L.L.C., or Limited Liability Company)"
              value={form.businessName}
              active={isActive(1, step)}
            />
          </Article>

          {/* Article II */}
          <Article title="Article II — Principal Office Address" active={isActive(2, step)}>
            <DocField label="Street Address (no P.O. Box)" value={form.principalStreet} active={isActive(2, step)} />
            <div className="flex gap-2">
              <DocField label="City" value={form.principalCity} active={isActive(2, step)} flex={2} />
              <DocField label="State" value={form.principalState || 'FL'} active={false} flex={1} />
              <DocField label="ZIP" value={form.principalZip} active={isActive(2, step)} flex={1} />
            </div>
            {!form.mailingSame && (mailingStreet || mailingCity) && (
              <>
                <p style={{ fontSize: '9px', color: '#888', marginTop: '6px', marginBottom: '3px' }}>
                  Mailing Address (if different):
                </p>
                <DocField label="Mailing Street" value={mailingStreet} active={isActive(2, step)} />
                <div className="flex gap-2">
                  <DocField label="City" value={mailingCity} active={isActive(2, step)} flex={2} />
                  <DocField label="State" value={mailingState} active={false} flex={1} />
                  <DocField label="ZIP" value={mailingZip} active={isActive(2, step)} flex={1} />
                </div>
              </>
            )}
          </Article>

          {/* Article III */}
          <Article title="Article III — Registered Agent and Office" active={isActive(3, step)}>
            <DocField label="Name of Registered Agent" value={raName} active={isActive(3, step)} />
            <DocField label="Street Address of Registered Office" value={raAddress} active={isActive(3, step)} />
          </Article>

          {/* Article IV */}
          <Article title="Article IV — Management" active={isActive(4, step)}>
            <DocField
              label="Management Type"
              value={form.management === 'member-managed' ? 'Member-Managed' : 'Manager-Managed'}
              active={isActive(4, step)}
            />
            {form.members.map((m, i) => (
              <DocField
                key={i}
                label={`${form.management === 'manager-managed' ? 'Manager' : 'Member'} ${i + 1}`}
                value={m.name ? `${m.name}${m.ownership ? ` — ${m.ownership}%` : ''}` : ''}
                active={isActive(4, step)}
              />
            ))}
          </Article>

          {/* Article V */}
          <Article title="Article V — Effective Date" active={isActive(5, step)}>
            <DocField
              label="Effective Date"
              value={effectiveDateLabel}
              active={isActive(5, step)}
            />
          </Article>

          {/* Signature block */}
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid #ddd' }}>
            <p style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#1a2744', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Signature of Organizer
            </p>
            <DocField label="Name of Organizer" value={form.contactName} active={isActive(2, step)} />
            <div style={{ marginTop: '18px', borderBottom: '1px solid #555', width: '180px' }} />
            <p style={{ fontSize: '8px', color: '#aaa', marginTop: '3px' }}>Authorized Signature</p>
          </div>

          {/* Add-ons summary — step 3 only */}
          {step === 3 && (form.addOnEin || form.addOnOperatingAgreement || form.addOnCertificateOfStatus) && (
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid #ddd' }}>
              <p style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#1a2744', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Add-ons Ordered
              </p>
              <ul style={{ paddingLeft: '14px', margin: 0 }}>
                {form.addOnEin && <li style={{ fontSize: '10px', color: '#444' }}>EIN — Employer Identification Number</li>}
                {form.addOnOperatingAgreement && <li style={{ fontSize: '10px', color: '#444' }}>Operating Agreement</li>}
                {form.addOnCertificateOfStatus && <li style={{ fontSize: '10px', color: '#444' }}>Certificate of Status</li>}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function Article({
  title,
  active,
  children,
}: {
  title: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="mb-4 pb-3"
      style={{
        borderBottom: '1px solid #eee',
        borderLeft: active ? '2px solid oklch(0.56 0.18 250)' : '2px solid transparent',
        paddingLeft: active ? '8px' : '10px',
        transition: 'border-color 0.2s',
      }}
    >
      <p
        style={{
          fontSize: '9px',
          fontWeight: 'bold',
          color: active ? 'oklch(0.56 0.18 250)' : '#1a2744',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '6px',
          fontFamily: 'Helvetica, Arial, sans-serif',
        }}
      >
        {title}
      </p>
      {children}
    </div>
  )
}

function DocField({
  label,
  value,
  active,
  flex,
}: {
  label: string
  value: string
  active: boolean
  flex?: number
}) {
  const isEmpty = !value.trim()
  return (
    <div
      style={{
        flex: flex,
        borderWidth: '0.5px',
        borderStyle: 'solid',
        borderColor: active && !isEmpty ? 'oklch(0.56 0.18 250)' : '#ccc',
        borderRadius: '2px',
        padding: '4px 6px',
        marginBottom: '5px',
        backgroundColor: active && !isEmpty ? 'oklch(0.97 0.01 250)' : 'white',
        transition: 'all 0.15s',
      }}
    >
      <p style={{ fontSize: '7.5px', color: '#888', marginBottom: '1px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        {label}
      </p>
      <p
        style={{
          fontSize: '10px',
          color: isEmpty ? '#ccc' : '#111',
          fontStyle: isEmpty ? 'italic' : 'normal',
          minHeight: '14px',
        }}
      >
        {isEmpty ? 'Not filled yet' : value}
      </p>
    </div>
  )
}
