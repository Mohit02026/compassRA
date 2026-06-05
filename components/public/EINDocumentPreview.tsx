'use client'

// Live preview of IRS Form SS-4 as the customer fills the EIN form.
// Mirrors the actual SS-4 field layout (numbered lines) so the customer
// sees exactly what will be submitted to the IRS.
// SSN/ITIN is ALWAYS masked — never shown in the preview.

const REASON_LABELS: Record<string, string> = {
  'new-business': 'Started new business',
  'hired-employees': 'Hired employees',
  'banking': 'Banking purposes',
  'other': 'Other',
}

export interface EINFormData {
  llcName: string
  memberCount: string
  mailingStreet: string
  mailingCity: string
  mailingState: string
  mailingZip: string
  county: string          // required for SS-4 Line 6 — cannot be derived from city
  responsiblePartyName: string
  taxIdType: 'ssn' | 'itin'
  taxId: string
  businessPurpose: string
  businessStartDate: string
  applyReason: string
  isUsCitizen: boolean
}

interface Props {
  form: EINFormData
  step: number
}

export function EINDocumentPreview({ form, step }: Props) {
  const active = step === 1
  const cityStateZip = [form.mailingCity, form.mailingState || 'FL', form.mailingZip]
    .filter(Boolean)
    .join(', ')

  // Line 6: county + state — explicitly collected from the user.
  const countyState = form.county
    ? `${form.county} County, ${form.mailingState || 'FL'}`
    : ''

  return (
    <div className="sticky top-6 max-h-[calc(100vh-3rem)] flex flex-col">
      {/* Nav header */}
      <div
        className="rounded-t-lg px-4 py-2.5 flex items-center justify-between shrink-0"
        style={{ backgroundColor: 'var(--color-navy)' }}
      >
        <span
          className="text-white text-xs font-semibold"
          style={{ fontFamily: 'var(--font-jakarta)' }}
        >
          Document Preview
        </span>
        <span className="text-white/50 text-xs">IRS Form SS-4 Draft</span>
      </div>

      {/* Paper */}
      <div
        className="bg-white rounded-b-lg overflow-y-auto flex-1"
        style={{ border: '1px solid var(--color-border)', borderTop: 'none' }}
      >
        <div
          className="px-5 py-4"
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '10px',
            color: '#111',
            lineHeight: 1.5,
          }}
        >
          {/* IRS header */}
          <div className="mb-3 pb-2" style={{ borderBottom: '2px solid #1a2744' }}>
            <div className="flex justify-between items-start">
              <div>
                <p style={{ fontSize: '8px', color: '#555' }}>
                  Form{' '}
                  <strong style={{ fontSize: '12px', color: '#1a2744' }}>SS-4</strong>
                </p>
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#1a2744',
                    marginTop: '2px',
                  }}
                >
                  Application for Employer Identification Number
                </p>
                <p style={{ fontSize: '7.5px', color: '#777' }}>
                  Department of the Treasury — Internal Revenue Service
                </p>
              </div>
              <p style={{ fontSize: '8px', color: '#aaa' }}>OMB No. 1545-0003</p>
            </div>
            <p
              style={{
                fontSize: '8px',
                color: '#bbb',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginTop: '5px',
              }}
            >
              Draft preview — not submitted to IRS
            </p>
          </div>

          {/* Line 1 — legal name */}
          <Line num="1" label="Legal name of entity" active={active}>
            <Field value={form.llcName} active={active} />
          </Line>

          {/* Lines 4a / 4b — mailing address */}
          <Line
            num="4a"
            label="Mailing address (street, apt./suite no., or P.O. box)"
            active={active}
          >
            <Field value={form.mailingStreet} active={active} />
          </Line>
          <Line num="4b" label="City, state, and ZIP code" active={active}>
            <Field value={cityStateZip} active={active} />
          </Line>

          {/* Line 6 — county + state */}
          <Line
            num="6"
            label="County and state where principal business is located"
            active={active}
          >
            <Field value={countyState} active={active} />
          </Line>

          {/* Lines 7a / 7b — responsible party */}
          <div className="flex gap-1.5">
            <div style={{ flex: 2 }}>
              <Line num="7a" label="Name of responsible party" active={active}>
                <Field value={form.responsiblePartyName} active={active} />
              </Line>
            </div>
            <div style={{ flex: 1 }}>
              <Line
                num="7b"
                label={form.taxIdType === 'itin' ? 'ITIN' : 'SSN'}
                active={false}
              >
                {/* Always masked — never show the actual value */}
                <Field value={form.taxId ? '•••-••-••••' : ''} active={false} masked />
              </Line>
            </div>
          </div>

          {/* Lines 8a / 8b / 8c */}
          <div className="flex gap-1.5">
            <div style={{ flex: 1 }}>
              {/* 8a always Yes — we only form domestic LLCs */}
              <Line num="8a" label="Is this an LLC?" active={false}>
                <Field value="Yes" active={false} />
              </Line>
            </div>
            <div style={{ flex: 1 }}>
              <Line num="8b" label="Number of members" active={active}>
                <Field value={form.memberCount} active={active} />
              </Line>
            </div>
            <div style={{ flex: 1 }}>
              {/* 8c: "organized in U.S.?" — always Yes for a FL domestic LLC.
                  Non-US nationals can still form a domestic LLC. */}
              <Line num="8c" label="Organized in U.S.?" active={false}>
                <Field value="Yes" active={false} />
              </Line>
            </div>
          </div>

          {/* Line 9a — entity type */}
          <Line num="9a" label="Type of entity" active={false}>
            <Field value="Limited Liability Company (LLC)" active={false} />
          </Line>

          {/* Line 10 — reason */}
          <Line num="10" label="Reason for applying" active={active}>
            <Field value={REASON_LABELS[form.applyReason] ?? ''} active={active} />
          </Line>

          {/* Line 11 — date started */}
          <Line num="11" label="Date business started (Mo./Day/Yr.)" active={active}>
            <Field value={form.businessStartDate} active={active} />
          </Line>

          {/* Line 12 — fiscal year end (hardcoded December for all LLCs) */}
          <Line num="12" label="Closing month of accounting year" active={false}>
            <Field value="December" active={false} />
          </Line>

          {/* Line 16 — principal activity */}
          <Line num="16" label="Principal activity of your business" active={active}>
            <Field value={form.businessPurpose} active={active} />
          </Line>

          {/* Signature block */}
          <div className="mt-3 pt-2" style={{ borderTop: '1px solid #ddd' }}>
            <p
              style={{
                fontSize: '8.5px',
                fontWeight: 'bold',
                color: '#1a2744',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '3px',
              }}
            >
              Third-Party Designee
            </p>
            <p style={{ fontSize: '8px', color: '#888' }}>
              Compass Registered Agent, LLC — signs and submits to IRS on your behalf
            </p>
            <div
              style={{
                marginTop: '14px',
                borderBottom: '1px solid #888',
                width: '140px',
              }}
            />
            <p style={{ fontSize: '7.5px', color: '#aaa', marginTop: '2px' }}>
              Authorized Signature
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Line({
  num,
  label,
  active,
  children,
}: {
  num: string
  label: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="mb-2"
      style={{
        borderLeft: active
          ? '2px solid oklch(0.56 0.18 250)'
          : '2px solid transparent',
        paddingLeft: active ? '6px' : '8px',
        transition: 'border-color 0.2s',
      }}
    >
      <p
        style={{
          fontSize: '7.5px',
          fontWeight: 'bold',
          color: active ? 'oklch(0.56 0.18 250)' : '#666',
          marginBottom: '2px',
        }}
      >
        {num}. {label}
      </p>
      {children}
    </div>
  )
}

function Field({
  value,
  active,
  masked,
}: {
  value: string
  active: boolean
  masked?: boolean
}) {
  const isEmpty = !value.trim()
  return (
    <div
      style={{
        borderWidth: '0.5px',
        borderStyle: 'solid',
        borderColor: active && !isEmpty ? 'oklch(0.56 0.18 250)' : '#ccc',
        borderRadius: '2px',
        padding: '3px 5px',
        minHeight: '17px',
        backgroundColor: masked
          ? '#f5f5f5'
          : active && !isEmpty
            ? 'oklch(0.97 0.01 250)'
            : 'white',
        transition: 'all 0.15s',
      }}
    >
      <p
        style={{
          fontSize: '10px',
          color: isEmpty ? '#ccc' : masked ? '#999' : '#111',
          fontStyle: isEmpty ? 'italic' : 'normal',
          letterSpacing: masked && !isEmpty ? '0.08em' : 'normal',
        }}
      >
        {isEmpty ? 'Not filled yet' : value}
      </p>
    </div>
  )
}
