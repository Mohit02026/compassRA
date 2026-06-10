'use client'

// Live preview of IRS Form SS-4.
// Design: mirrors LLCDocumentPreview — parchment paper, typewriter values on
// full-width rules, serif/mono fonts, active fields highlight in navy blue.
// SSN/ITIN always masked. Side-by-side pairs align underlines via alignItems: flex-end.

const REASON_LABELS: Record<string, string> = {
  'new-business':    'Started new business',
  'hired-employees': 'Hired employees',
  'banking':         'Banking purposes',
  'other':           'Other',
}

export interface EINFormData {
  llcName: string
  tradeName: string
  memberCount: string
  mailingStreet: string
  mailingCity: string
  mailingState: string
  mailingZip: string
  county: string
  responsiblePartyFirstName: string
  responsiblePartyMiddleName: string
  responsiblePartyLastName: string
  responsiblePartySuffix: string
  taxIdType: 'ssn' | 'itin'
  taxId: string
  businessActivity: string
  businessActivityOther: string
  businessStartDate: string
  applyReason: string
  closingMonth: string
  employeesAgricultural: string
  employeesHousehold: string
  employeesOther: string
  wants944: boolean
  firstWagesDate: string
  productService: string
  previousEin: boolean
  isUsCitizen: boolean
}

interface Props { form: EINFormData; step: number }

// ─── Colours — exactly matching LLCDocumentPreview ────────────────────────────
const SERIF = '"Times New Roman", Times, Georgia, serif'
const MONO  = '"Courier New", Courier, monospace'
const INK         = '#1C1006'
const FADED       = '#9C7D50'
const NAVY        = '#1A3A6B'   // matches LLC active colour
const LINE        = '#8B6A3A'
const ACTIVE_LINE = '#1A3A6B'

// ─── Typed value on a rule line — matches LLC TypedLine exactly ───────────────
function TypedLine({
  value,
  active,
  masked,
  label,
  note,
  size = 13,
}: {
  value: string
  active: boolean
  masked?: boolean
  label?: string
  note?: string
  size?: number
}) {
  const filled  = value.trim().length > 0
  const lineCol = filled && active && !masked ? ACTIVE_LINE : LINE

  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <div style={{
          fontFamily: SERIF,
          fontSize: 10,
          color: active ? NAVY : FADED,
          fontStyle: 'italic',
          marginBottom: 5,
          transition: 'color 0.2s',
        }}>
          {label}
        </div>
      )}
      <div style={{
        borderBottom: `1.5px solid ${lineCol}`,
        minHeight: size + 10,
        paddingBottom: 4,
        paddingLeft: 2,
        transition: 'border-color 0.2s',
      }}>
        <span style={{
          fontFamily: MONO,
          fontSize: size,
          fontWeight: active && !masked ? 600 : 400,
          color: masked ? FADED : (filled ? (active ? NAVY : INK) : 'transparent'),
          letterSpacing: masked ? '0.12em' : '0.01em',
          transition: 'color 0.2s',
        }}>
          {filled ? value : '​'}
        </span>
      </div>
      {note && (
        <div style={{ fontFamily: SERIF, fontSize: 9, color: FADED, marginTop: 4, fontStyle: 'italic' }}>
          {note}
        </div>
      )}
    </div>
  )
}

// ─── Horizontal row of typed fields — matches LLC TypedRow exactly ────────────
function TypedRow({ fields, active }: {
  fields: Array<{ label: string; value: string; flex: number | string; masked?: boolean }>
  active: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
      {fields.map(({ label, value, flex, masked }) => {
        const filled  = value.trim().length > 0
        const lineCol = filled && active && !masked ? ACTIVE_LINE : LINE
        return (
          <div key={label} style={{ flex }}>
            <div style={{
              fontFamily: SERIF,
              fontSize: 10,
              color: active ? NAVY : FADED,
              fontStyle: 'italic',
              marginBottom: 5,
              transition: 'color 0.2s',
            }}>
              {label}
            </div>
            <div style={{
              borderBottom: `1.5px solid ${lineCol}`,
              minHeight: 24,
              paddingBottom: 4,
              paddingLeft: 2,
              transition: 'border-color 0.2s',
            }}>
              <span style={{
                fontFamily: MONO,
                fontSize: 12.5,
                fontWeight: active && !masked ? 600 : 400,
                color: masked ? FADED : (filled ? (active ? NAVY : INK) : 'transparent'),
                letterSpacing: masked ? '0.10em' : '0.01em',
                transition: 'color 0.2s',
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

// ─── SS-4 line section ────────────────────────────────────────────────────────
// Number is small bold inline prefix. Label is normal weight (NOT italic) —
// matches how LLC uses Article titles. No double-italic layers.
function SS4Section({ num, label, active, children }: {
  num: string
  label: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{
      marginBottom: 18,
      borderLeft: `2.5px solid ${active ? NAVY : 'transparent'}`,
      paddingLeft: active ? 10 : 0,
      transition: 'all 0.25s',
    }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: 10.5,
          fontWeight: 900,
          color: active ? NAVY : '#5A4020',
          marginRight: 5,
          transition: 'color 0.25s',
        }}>
          {num}
        </span>
        <span style={{
          fontFamily: SERIF,
          fontSize: 10.5,
          fontWeight: 400,
          color: active ? NAVY : '#5A4020',
          transition: 'color 0.25s',
        }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

// ─── Side-by-side pair — aligns underlines at the bottom ─────────────────────
// alignItems: flex-end ensures both TypedLine underlines sit on the same baseline
// regardless of how many lines the label wraps to.
function SideBySide({ children, gap = 20 }: { children: React.ReactNode; gap?: number }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-end', marginBottom: 4 }}>
      {children}
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

  const businessActivityLabel = form.businessActivity === 'other'
    ? (form.businessActivityOther ? `Other: ${form.businessActivityOther}` : 'Other')
    : form.businessActivity

  const responsiblePartyFullName = [
    form.responsiblePartyFirstName,
    form.responsiblePartyMiddleName,
    form.responsiblePartyLastName,
    form.responsiblePartySuffix,
  ].filter(Boolean).join(' ')

  const taxIdLabel = form.taxIdType === 'itin' ? 'ITIN (masked)' : 'SSN (masked)'

  return (
    <div style={{ position: 'sticky', top: 24, maxHeight: 'calc(100vh - 3rem)', display: 'flex', flexDirection: 'column' }}>

      {/* Tab bar — matches LLC exactly */}
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

      {/* Parchment paper — matches LLC exactly */}
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
        <div style={{ padding: '30px 36px' }}>

          {/* ── IRS LETTERHEAD ── */}
          <div style={{
            borderBottom: `2px solid ${INK}`,
            paddingBottom: 18,
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Left: Form name */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 6 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 12, color: FADED }}>Form</span>
                  <span style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 900, color: INK, letterSpacing: '-0.01em', lineHeight: 1 }}>SS-4</span>
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.35, maxWidth: 220 }}>
                  Application for Employer<br />Identification Number
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 10.5, color: FADED, marginTop: 5, lineHeight: 1.55 }}>
                  (Under authority of the Internal Revenue Code)<br />
                  Dept. of the Treasury — Internal Revenue Service
                </div>
              </div>

              {/* Right: OMB + EIN box */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 10, color: FADED, marginBottom: 10 }}>
                  OMB No. 1545-0003
                </div>
                <div style={{ border: `0.75px solid ${LINE}`, padding: '8px 16px', minWidth: 100, background: 'rgba(255,255,255,0.30)' }}>
                  <div style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: FADED, marginBottom: 14 }}>
                    EIN
                  </div>
                  <div style={{ borderBottom: `0.75px solid ${LINE}` }} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 12px',
                    background: '#FFF0C0',
                    border: '0.75px solid #B89030',
                    borderRadius: 3,
                    fontFamily: SERIF,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: '#8A6800',
                    textTransform: 'uppercase',
                  }}>
                    Draft Preview
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── LINES 1 / 2 side-by-side ── */}
          <SideBySide>
            <div style={{ flex: 3 }}>
              <SS4Section num="1" label="Legal name of entity (or individual) for whom the EIN is being requested" active={active}>
                <TypedLine value={form.llcName} active={active} size={12} />
              </SS4Section>
            </div>
            <div style={{ flex: 2 }}>
              <SS4Section num="2" label="Trade name (if different from line 1)" active={active}>
                <TypedLine value={form.tradeName} active={active} />
              </SS4Section>
            </div>
          </SideBySide>

          <div style={{ borderBottom: `0.5px solid ${LINE}`, margin: '0 0 18px', opacity: 0.4 }} />

          {/* ── LINES 4a / 4b side-by-side ── */}
          <SideBySide>
            <div style={{ flex: 3 }}>
              <SS4Section num="4a" label="Mailing address (street, apt./suite no., or P.O. box)" active={active}>
                <TypedLine value={form.mailingStreet} active={active} />
              </SS4Section>
            </div>
            <div style={{ flex: 2 }}>
              <SS4Section num="4b" label="City, state, and ZIP code" active={active}>
                <TypedLine value={cityStateZip} active={active} />
              </SS4Section>
            </div>
          </SideBySide>

          {/* ── LINE 6 ── */}
          <SS4Section num="6" label="County and state where principal business is located" active={active}>
            <TypedLine value={countyState} active={active} />
          </SS4Section>

          <div style={{ borderBottom: `0.5px solid ${LINE}`, margin: '0 0 18px', opacity: 0.4 }} />

          {/* ── LINES 7a / 7b side-by-side ── */}
          <SideBySide>
            <div style={{ flex: 3 }}>
              <SS4Section num="7a" label="Name of responsible party" active={active}>
                <TypedLine value={responsiblePartyFullName} active={active} />
              </SS4Section>
            </div>
            <div style={{ flex: 2 }}>
              <SS4Section num="7b" label={taxIdLabel} active={false}>
                <TypedLine
                  value={form.taxId ? '•••–••–••••' : ''}
                  active={false}
                  masked
                />
              </SS4Section>
            </div>
          </SideBySide>

          <div style={{ borderBottom: `0.5px solid ${LINE}`, margin: '0 0 18px', opacity: 0.4 }} />

          {/* ── LINES 8a / 8b / 8c ── */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <SS4Section num="8a" label="Is this application for an LLC?" active={false}>
                <div style={{ display: 'flex', gap: 14 }}>
                  {['Yes', 'No'].map((opt) => (
                    <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 13, height: 13,
                        border: `1px solid ${LINE}`,
                        background: opt === 'Yes' ? INK : 'rgba(255,255,255,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {opt === 'Yes' && <span style={{ color: 'white', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                      </div>
                      <span style={{ fontFamily: SERIF, fontSize: 11.5, color: INK }}>{opt}</span>
                    </div>
                  ))}
                </div>
              </SS4Section>
            </div>
            <div style={{ flex: 1 }}>
              <SS4Section num="8b" label="Number of LLC members" active={active}>
                <TypedLine value={form.memberCount} active={active} />
              </SS4Section>
            </div>
            <div style={{ flex: 1 }}>
              <SS4Section num="8c" label="If 8a is Yes, was the LLC organized in the U.S.?" active={false}>
                <TypedLine value="Yes" active={false} />
              </SS4Section>
            </div>
          </div>

          <div style={{ borderBottom: `0.5px solid ${LINE}`, margin: '0 0 18px', opacity: 0.4 }} />

          {/* ── LINES 9a / 10 ── */}
          <SS4Section num="9a" label="Type of entity" active={false}>
            <TypedLine value="Limited Liability Company (LLC)" active={false} />
          </SS4Section>

          <SS4Section num="10" label="Reason for applying" active={active}>
            <TypedLine value={REASON_LABELS[form.applyReason] ?? ''} active={active} />
          </SS4Section>

          {/* ── LINES 11 / 12 ── */}
          <TypedRow
            active={active}
            fields={[
              { label: '11. Date business started (Mo./Day/Yr.):', value: form.businessStartDate, flex: 3 },
              { label: '12. Closing month of accounting year:', value: form.closingMonth || 'December', flex: 2 },
            ]}
          />

          {/* ── LINE 13 ── */}
          <TypedRow
            active={active}
            fields={[
              { label: '13. Agricultural employees', value: form.employeesAgricultural || '0', flex: 1 },
              { label: '13. Household employees', value: form.employeesHousehold || '0', flex: 1 },
              { label: '13. Other employees', value: form.employeesOther || '0', flex: 1 },
            ]}
          />

          {/* ── LINES 14 / 15 ── */}
          <TypedRow
            active={active}
            fields={[
              { label: '14. File Form 944 annually?', value: form.wants944 ? 'Yes' : 'No', flex: 1 },
              { label: '15. First date wages paid:', value: form.firstWagesDate || 'N/A', flex: 1 },
            ]}
          />

          {/* ── LINES 16 / 17 / 18 ── */}
          <SS4Section num="16" label="Principal business activity" active={active}>
            <TypedLine value={businessActivityLabel} active={active} />
          </SS4Section>

          <SS4Section num="17" label="Principal line of merchandise sold, specific construction work done, products produced, or services provided" active={active}>
            <TypedLine value={form.productService} active={active} />
          </SS4Section>

          <SS4Section num="18" label="Has the applicant entity ever applied for and received an EIN?" active={active}>
            <TypedLine value={form.previousEin ? 'Yes' : 'No'} active={active} />
          </SS4Section>

          {/* Non-US notice */}
          {!form.isUsCitizen && (
            <div style={{
              padding: '10px 12px',
              background: '#FFF8E0',
              border: '0.75px solid #C8A600',
              borderRadius: 3,
              marginBottom: 18,
              fontFamily: SERIF,
              fontSize: 11,
              color: '#7A5A00',
              lineHeight: 1.55,
            }}>
              <strong>Non-U.S. national:</strong> IRS online application not available.
              Compass prepares this SS-4 and submits by fax to the IRS on your behalf. Flat fee — $175.
            </div>
          )}

          <div style={{ borderBottom: `1.5px solid ${INK}`, margin: '18px 0' }} />

          {/* ── THIRD-PARTY DESIGNEE ── */}
          <div>
            <div style={{
              fontFamily: SERIF,
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: INK,
              marginBottom: 10,
            }}>
              Third-Party Designee
            </div>
            <div style={{
              padding: '10px 12px',
              background: 'rgba(26,58,107,0.06)',
              border: '0.75px solid #8AAAD0',
              borderRadius: 3,
              marginBottom: 14,
            }}>
              <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: INK, marginBottom: 3 }}>
                Compass Registered Agent, LLC
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 10.5, color: FADED }}>
                Authorized to receive the EIN and related IRS correspondence on your behalf.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 2 }}>
                <div style={{ fontFamily: SERIF, fontSize: 10.5, color: FADED, fontStyle: 'italic', marginBottom: 20 }}>
                  Signature of applicant / authorized representative
                </div>
                <div style={{ borderBottom: `1px solid ${INK}` }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SERIF, fontSize: 10.5, color: FADED, fontStyle: 'italic', marginBottom: 20 }}>
                  Date
                </div>
                <div style={{ borderBottom: `1px solid ${INK}` }} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 18, paddingTop: 10, borderTop: `0.5px solid ${LINE}`, textAlign: 'center' }}>
            <div style={{ fontFamily: SERIF, fontSize: 10, color: '#A07840' }}>
              For Privacy Act and Paperwork Reduction Act Notice, see separate instructions.
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 9, color: '#C0A060', marginTop: 3 }}>
              Cat. No. 16055N · Form SS-4 (Rev. 12-2023)
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
