'use client'

// Live preview of IRS Form SS-4.
// Design: real physical document — large typewriter values on full-width rules,
// prose sentences, IRS letterhead, readable fonts. Not a stacked form UI.
// SSN/ITIN always masked.

const REASON_LABELS: Record<string, string> = {
  'new-business':    'Started new business',
  'hired-employees': 'Hired employees',
  'banking':         'Banking purposes',
  'other':           'Other',
}

export interface EINFormData {
  llcName: string
  memberCount: string
  mailingStreet: string
  mailingCity: string
  mailingState: string
  mailingZip: string
  county: string
  responsiblePartyName: string
  taxIdType: 'ssn' | 'itin'
  taxId: string
  businessPurpose: string
  businessStartDate: string
  applyReason: string
  isUsCitizen: boolean
}

interface Props { form: EINFormData; step: number }

const SERIF = '"Times New Roman", Times, Georgia, serif'
const MONO  = '"Courier New", Courier, monospace'
const INK   = '#1C1006'
const FADED = '#9C7D50'
const NAVY  = '#1A3A6B'
const LINE  = '#8B6A3A'
const ACTIVE_LINE = '#1A3A6B'

// ─── Typed value on a rule line ───────────────────────────────────────────────
function TypedLine({
  value,
  active,
  masked,
  label,
  size = 11,
}: {
  value: string
  active: boolean
  masked?: boolean
  label?: string
  size?: number
}) {
  const filled  = value.trim().length > 0
  const lineCol = filled && active && !masked ? ACTIVE_LINE : LINE

  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <div style={{ fontFamily: SERIF, fontSize: 8.5, color: active ? NAVY : FADED, fontStyle: 'italic', marginBottom: 4, transition: 'color 0.2s' }}>
          {label}
        </div>
      )}
      <div style={{
        borderBottom: `1px solid ${lineCol}`,
        minHeight: size + 7,
        paddingBottom: 3,
        paddingLeft: 2,
        transition: 'border-color 0.2s',
      }}>
        <span style={{
          fontFamily: MONO,
          fontSize: size,
          color: masked ? '#8B6A3A' : (filled ? (active ? NAVY : INK) : 'transparent'),
          letterSpacing: masked ? '0.12em' : '0.01em',
          transition: 'color 0.2s',
        }}>
          {filled ? value : '​'}
        </span>
      </div>
    </div>
  )
}

// ─── Horizontal row of fields ─────────────────────────────────────────────────
function TypedRow({ fields, active }: {
  fields: Array<{ label: string; value: string; flex: number | string; masked?: boolean }>
  active: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
      {fields.map(({ label, value, flex, masked }) => {
        const filled  = value.trim().length > 0
        const lineCol = filled && active && !masked ? ACTIVE_LINE : LINE
        return (
          <div key={label} style={{ flex }}>
            <div style={{ fontFamily: SERIF, fontSize: 8.5, color: active ? NAVY : FADED, fontStyle: 'italic', marginBottom: 4, transition: 'color 0.2s' }}>
              {label}
            </div>
            <div style={{ borderBottom: `1px solid ${lineCol}`, minHeight: 19, paddingBottom: 3, paddingLeft: 2, transition: 'border-color 0.2s' }}>
              <span style={{
                fontFamily: MONO,
                fontSize: 10.5,
                color: masked ? '#8B6A3A' : (filled ? (active ? NAVY : INK) : 'transparent'),
                letterSpacing: masked ? '0.10em' : '0.01em',
              }}>
                {filled ? value : '​'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Numbered line section ─────────────────────────────────────────────────────
function SS4Section({ num, label, active, children }: {
  num: string
  label: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      marginBottom: 12,
      borderLeft: `2px solid ${active ? NAVY : 'transparent'}`,
      paddingLeft: active ? 6 : 0,
      transition: 'all 0.2s',
    }}>
      <span style={{
        fontFamily: SERIF,
        fontSize: 9,
        fontWeight: 900,
        color: active ? NAVY : '#5A4020',
        flexShrink: 0,
        width: 20,
        paddingTop: 1,
        transition: 'color 0.2s',
      }}>
        {num}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: SERIF,
          fontSize: 9,
          color: active ? NAVY : '#5A4020',
          marginBottom: 5,
          lineHeight: 1.45,
          fontStyle: 'italic',
          transition: 'color 0.2s',
        }}>
          {label}
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function EINDocumentPreview({ form, step }: Props) {
  const active = step === 1

  const cityStateZip = [form.mailingCity, form.mailingState || 'FL', form.mailingZip]
    .filter(Boolean).join(', ')

  const countyState = form.county
    ? `${form.county} County, ${form.mailingState || 'FL'}`
    : ''

  return (
    <div style={{ position: 'sticky', top: 24, maxHeight: 'calc(100vh - 3rem)', display: 'flex', flexDirection: 'column' }}>

      {/* Tab */}
      <div style={{
        background: '#1A3A6B',
        borderRadius: '8px 8px 0 0',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ color: 'white', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-jakarta)' }}>
          Live Document Preview
        </span>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'var(--font-jakarta)' }}>
          IRS Form SS-4
        </span>
      </div>

      {/* Parchment paper */}
      <div style={{
        background: '#F5E6C4',
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E"),
          linear-gradient(160deg, #F8EDD4 0%, #F0DDB2 50%, #EDD8AC 100%)
        `,
        border: '1px solid #C8A96E',
        borderTop: 'none',
        borderRadius: '0 0 8px 8px',
        overflowY: 'auto',
        flex: 1,
        boxShadow: '0 8px 32px rgba(100,70,20,0.20), inset 0 0 60px rgba(180,130,60,0.05)',
      }}>
        <div style={{ padding: '22px 24px' }}>

          {/* ── IRS LETTERHEAD ── */}
          <div style={{ borderBottom: `2.5px solid ${INK}`, paddingBottom: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Left: Form name */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 4 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 9, color: FADED }}>Form</span>
                  <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 900, color: INK, letterSpacing: '-0.01em', lineHeight: 1 }}>SS-4</span>
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 10.5, fontWeight: 700, color: INK, lineHeight: 1.35, maxWidth: 170 }}>
                  Application for Employer<br />Identification Number
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 8, color: FADED, marginTop: 3, lineHeight: 1.4 }}>
                  (Under authority of the Internal Revenue Code)<br />
                  Dept. of the Treasury — Internal Revenue Service
                </div>
              </div>

              {/* Right: OMB + EIN box */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 7.5, color: FADED, marginBottom: 6 }}>
                  OMB No. 1545-0003
                </div>
                <div style={{ border: `0.75px solid ${LINE}`, padding: '5px 10px', minWidth: 88, background: 'rgba(255,255,255,0.30)' }}>
                  <div style={{ fontFamily: SERIF, fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: FADED, marginBottom: 12 }}>
                    EIN
                  </div>
                  <div style={{ borderBottom: `0.75px solid ${LINE}` }} />
                </div>
                <div style={{ marginTop: 6 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    background: '#FFF0C0',
                    border: '0.75px solid #B89030',
                    borderRadius: 2,
                    fontFamily: SERIF,
                    fontSize: 7,
                    fontWeight: 700,
                    letterSpacing: '0.10em',
                    color: '#8A6800',
                    textTransform: 'uppercase',
                  }}>
                    Draft Preview
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── LINE 1 — Legal name ── */}
          <SS4Section num="1" label="Legal name of entity (or individual) for whom the EIN is being requested" active={active}>
            <TypedLine value={form.llcName} active={active} size={12} />
          </SS4Section>

          {/* ── LINE 2 — Trade name ── */}
          <SS4Section num="2" label="Trade name of business (if different from name on line 1)" active={false}>
            <TypedLine value="" active={false} />
          </SS4Section>

          <div style={{ borderBottom: `0.5px solid ${LINE}`, margin: '4px 0 12px', opacity: 0.4 }} />

          {/* ── LINES 4a / 4b ── */}
          <SS4Section num="4a" label="Mailing address (street, apt./suite no., or P.O. box)" active={active}>
            <TypedLine value={form.mailingStreet} active={active} />
          </SS4Section>

          <SS4Section num="4b" label="City, state, and ZIP code" active={active}>
            <TypedLine value={cityStateZip} active={active} />
          </SS4Section>

          {/* ── LINE 6 ── */}
          <SS4Section num="6" label="County and state where principal business is located" active={active}>
            <TypedLine value={countyState} active={active} />
          </SS4Section>

          <div style={{ borderBottom: `0.5px solid ${LINE}`, margin: '4px 0 12px', opacity: 0.4 }} />

          {/* ── LINES 7a / 7b ── */}
          <SS4Section num="7a" label="Name of responsible party" active={active}>
            <TypedLine value={form.responsiblePartyName} active={active} />
          </SS4Section>

          <SS4Section num="7b" label={`${form.taxIdType === 'itin' ? 'ITIN' : 'SSN'} of responsible party (encrypted — shown masked)`} active={false}>
            <TypedLine
              value={form.taxId ? '•  •  •  –  •  •  –  •  •  •  •' : ''}
              active={false}
              masked
            />
          </SS4Section>

          <div style={{ borderBottom: `0.5px solid ${LINE}`, margin: '4px 0 12px', opacity: 0.4 }} />

          {/* ── LINES 8a / 8b / 8c side by side ── */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, borderLeft: `2px solid transparent`, paddingLeft: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: 8.5, color: '#5A4020', marginBottom: 5, fontStyle: 'italic' }}>
                <strong style={{ fontStyle: 'normal' }}>8a</strong> Is this application for an LLC?
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Yes', 'No'].map((opt) => (
                  <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: 11, height: 11,
                      border: `1px solid ${LINE}`,
                      background: opt === 'Yes' ? INK : 'rgba(255,255,255,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {opt === 'Yes' && <span style={{ color: 'white', fontSize: 7, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontFamily: SERIF, fontSize: 9, color: INK }}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 8.5, color: active ? NAVY : '#5A4020', fontStyle: 'italic', marginBottom: 5, transition: 'color 0.2s' }}>
                <strong style={{ fontStyle: 'normal' }}>8b</strong> Number of LLC members
              </div>
              <TypedLine value={form.memberCount} active={active} size={11} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 8.5, color: '#5A4020', fontStyle: 'italic', marginBottom: 5 }}>
                <strong style={{ fontStyle: 'normal' }}>8c</strong> Organized in U.S.?
              </div>
              <TypedLine value="Yes" active={false} size={11} />
            </div>
          </div>

          <div style={{ borderBottom: `0.5px solid ${LINE}`, margin: '4px 0 12px', opacity: 0.4 }} />

          {/* ── LINES 9a / 10 / 11 / 12 / 16 ── */}
          <SS4Section num="9a" label="Type of entity" active={false}>
            <TypedLine value="Limited Liability Company (LLC)" active={false} />
          </SS4Section>

          <SS4Section num="10" label="Reason for applying" active={active}>
            <TypedLine value={REASON_LABELS[form.applyReason] ?? ''} active={active} />
          </SS4Section>

          <TypedRow
            active={active}
            fields={[
              { label: '11. Date business started (Mo./Day/Yr.):', value: form.businessStartDate, flex: 3 },
              { label: '12. Closing month of accounting year:', value: 'December', flex: 2 },
            ]}
          />

          <SS4Section num="16" label="Describe the principal activity of your business" active={active}>
            <TypedLine value={form.businessPurpose} active={active} />
          </SS4Section>

          {/* Non-US notice */}
          {!form.isUsCitizen && (
            <div style={{
              padding: '8px 10px',
              background: '#FFF8E0',
              border: '0.75px solid #C8A600',
              borderRadius: 3,
              marginBottom: 12,
              fontFamily: SERIF,
              fontSize: 8.5,
              color: '#7A5A00',
              lineHeight: 1.55,
            }}>
              <strong>Non-U.S. national:</strong> IRS online application not available.
              Compass prepares this SS-4 and submits by fax to the IRS on your behalf. Flat fee — $175.
            </div>
          )}

          <div style={{ borderBottom: `1.5px solid ${INK}`, margin: '12px 0' }} />

          {/* ── THIRD-PARTY DESIGNEE / SIGNATURE ── */}
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: INK, marginBottom: 8 }}>
              Third-Party Designee
            </div>
            <div style={{
              padding: '8px 10px',
              background: 'rgba(26,58,107,0.06)',
              border: '0.75px solid #8AAAD0',
              borderRadius: 3,
              marginBottom: 12,
            }}>
              <div style={{ fontFamily: SERIF, fontSize: 9.5, fontWeight: 700, color: INK, marginBottom: 2 }}>
                Compass Registered Agent, LLC
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 8.5, color: FADED }}>
                Authorized to receive the EIN and related IRS correspondence on your behalf.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 2 }}>
                <div style={{ fontFamily: SERIF, fontSize: 8.5, color: FADED, fontStyle: 'italic', marginBottom: 16 }}>
                  Signature of applicant / authorized representative
                </div>
                <div style={{ borderBottom: `1px solid ${INK}` }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SERIF, fontSize: 8.5, color: FADED, fontStyle: 'italic', marginBottom: 16 }}>
                  Date
                </div>
                <div style={{ borderBottom: `1px solid ${INK}` }} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 18, paddingTop: 10, borderTop: `0.5px solid ${LINE}`, textAlign: 'center' }}>
            <div style={{ fontFamily: SERIF, fontSize: 8, color: '#A07840' }}>
              For Privacy Act and Paperwork Reduction Act Notice, see separate instructions.
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 7.5, color: '#C0A060', marginTop: 2 }}>
              Cat. No. 16055N · Form SS-4 (Rev. 12-2023)
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
