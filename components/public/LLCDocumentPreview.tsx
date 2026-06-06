'use client'

// Live preview of the Florida Articles of Organization.
// Design philosophy: looks like the ACTUAL FILED PAPER DOCUMENT.
// - Values appear large on full-width underlines (typewriter style)
// - Prose sentences with blanks, not stacked form labels
// - Generous section spacing like a real 8.5×11 document
// - No tiny 7px labels — everything readable

const RA_NAME    = 'Compass Registered Agent, LLC'
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

interface Props { form: LLCFormData; step: number }

function stepActive(article: 1 | 2 | 3 | 4 | 5, step: number) {
  if (step === 1) return article === 1 || article === 4 || article === 5
  if (step === 2) return article === 2 || article === 3
  return false
}

// ─── colours tuned for parchment background ───────────────────────────────────
const SERIF = '"Times New Roman", Times, Georgia, serif'
const MONO  = '"Courier New", Courier, monospace'
const INK   = '#1C1006'
const FADED = '#9C7D50'
const NAVY  = '#1A3A6B'
const LINE  = '#8B6A3A'      // underline colour on parchment
const ACTIVE_LINE = '#1A3A6B'

// ─── A typed value on a full-width rule line ─────────────────────────────────
// This is the core component: label on top as small descriptor,
// then the VALUE appears large on a proper underline — like a real typed form.
function TypedLine({
  label,
  value,
  active,
  note,
  mono = true,
  size = 13,
}: {
  label?: string
  value: string
  active: boolean
  note?: string
  mono?: boolean
  size?: number
}) {
  const filled  = value.trim().length > 0
  const lineCol = filled && active ? ACTIVE_LINE : LINE

  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <div style={{
          fontFamily: SERIF,
          fontSize: 10,
          color: active ? NAVY : FADED,
          marginBottom: 5,
          fontStyle: 'italic',
          transition: 'color 0.2s',
        }}>
          {label}
        </div>
      )}

      {/* The underline row */}
      <div style={{
        borderBottom: `1.5px solid ${lineCol}`,
        minHeight: size + 10,
        paddingBottom: 4,
        paddingLeft: 2,
        transition: 'border-color 0.2s',
        position: 'relative',
      }}>
        {filled ? (
          <span style={{
            fontFamily: mono ? MONO : SERIF,
            fontSize: size,
            color: active ? NAVY : INK,
            fontWeight: mono ? 400 : 600,
            transition: 'color 0.2s',
          }}>
            {value}
          </span>
        ) : (
          // Empty: invisible char keeps the line height
          <span style={{ fontFamily: MONO, fontSize: size, color: 'transparent' }}>‎</span>
        )}
      </div>

      {note && (
        <div style={{ fontFamily: SERIF, fontSize: 9, color: FADED, marginTop: 4, fontStyle: 'italic' }}>
          {note}
        </div>
      )}
    </div>
  )
}

// ─── Horizontal row of typed fields (City / State / Zip) ─────────────────────
function TypedRow({ fields, active }: {
  fields: Array<{ label: string; value: string; flex: number | string }>
  active: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
      {fields.map(({ label, value, flex }) => {
        const filled  = value.trim().length > 0
        const lineCol = filled && active ? ACTIVE_LINE : LINE
        return (
          <div key={label} style={{ flex }}>
            <div style={{ fontFamily: SERIF, fontSize: 10, color: active ? NAVY : FADED, marginBottom: 5, fontStyle: 'italic', transition: 'color 0.2s' }}>
              {label}
            </div>
            <div style={{
              borderBottom: `1.5px solid ${lineCol}`,
              minHeight: 24,
              paddingBottom: 4,
              paddingLeft: 2,
              transition: 'border-color 0.2s',
            }}>
              <span style={{ fontFamily: MONO, fontSize: 12.5, color: active && filled ? NAVY : INK, transition: 'color 0.2s' }}>
                {filled ? value : '​'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Article section ─────────────────────────────────────────────────────────
function Article({ num, title, active, children }: {
  num: string
  title: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{
      marginBottom: 26,
      borderLeft: `2.5px solid ${active ? NAVY : 'transparent'}`,
      paddingLeft: active ? 10 : 0,
      transition: 'all 0.25s',
    }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: 10.5,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: active ? NAVY : INK,
          transition: 'color 0.25s',
        }}>
          {num}
        </span>
        <span style={{
          fontFamily: SERIF,
          fontSize: 10.5,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: active ? NAVY : '#5A4020',
          marginLeft: 7,
          transition: 'color 0.25s',
        }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LLCDocumentPreview({ form, step }: Props) {
  const raName    = form.useCompassRA ? RA_NAME    : form.raName
  const raAddress = form.useCompassRA ? RA_ADDRESS : form.raAddress

  const effectiveLabel =
    form.effectiveType === 'immediate' ? 'Effective upon filing' : (form.effectiveDate || '')

  const mStreet = form.mailingSame ? form.principalStreet : form.mailingStreet
  const mCity   = form.mailingSame ? form.principalCity   : form.mailingCity
  const mState  = form.mailingSame ? (form.principalState || 'FL') : form.mailingState
  const mZip    = form.mailingSame ? form.principalZip    : form.mailingZip

  return (
    <div style={{ position: 'sticky', top: 24, maxHeight: 'calc(100vh - 3rem)', display: 'flex', flexDirection: 'column' }}>

      {/* Tab bar */}
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
          Articles of Organization · FL
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

        <div style={{ padding: '30px 36px' }}>

          {/* ── LETTERHEAD ── */}
          <div style={{
            textAlign: 'center',
            paddingBottom: 18,
            marginBottom: 24,
            borderBottom: `2px solid ${INK}`,
          }}>
            <div style={{
              fontFamily: SERIF,
              fontSize: 16,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: INK,
              lineHeight: 1.3,
            }}>
              Articles of Organization
            </div>
            <div style={{
              fontFamily: SERIF,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#5A4020',
              marginTop: 4,
            }}>
              Florida Limited Liability Company
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 14,
              marginTop: 9,
            }}>
              <span style={{ fontFamily: SERIF, fontSize: 9.5, color: FADED }}>Form CR2E047</span>
              <span style={{ color: '#C0964A', fontSize: 9.5 }}>·</span>
              <span style={{ fontFamily: SERIF, fontSize: 9.5, color: FADED }}>Filing Fee: $125.00</span>
              <span style={{ color: '#C0964A', fontSize: 9.5 }}>·</span>
              <span style={{ fontFamily: SERIF, fontSize: 9.5, color: FADED }}>Ch. 605, F.S.</span>
            </div>

            {/* DRAFT badge */}
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
                Draft Preview — Not a Filed Document
              </span>
            </div>
          </div>

          {/* ── ARTICLE I ── */}
          <Article num="Article I" title="Name of Limited Liability Company" active={stepActive(1, step)}>
            <div style={{ fontFamily: SERIF, fontSize: 11.5, color: INK, marginBottom: 10, lineHeight: 1.65 }}>
              The name of the Limited Liability Company is:
            </div>
            <TypedLine
              value={form.businessName}
              active={stepActive(1, step)}
              size={12}
              note='(Must end in "Limited Liability Company", "L.L.C.", or "LLC")'
            />
          </Article>

          {/* ── ARTICLE II ── */}
          <Article num="Article II" title="Principal Office Address" active={stepActive(2, step)}>
            <div style={{ fontFamily: SERIF, fontSize: 11.5, color: INK, marginBottom: 12, lineHeight: 1.65 }}>
              The mailing address and street address of the principal office of the Limited Liability Company is:
            </div>

            <TypedLine
              label="Street Address (No P.O. Box):"
              value={form.principalStreet}
              active={stepActive(2, step)}
            />

            <TypedRow
              active={stepActive(2, step)}
              fields={[
                { label: 'City:', value: form.principalCity, flex: 3 },
                { label: 'State:', value: form.principalState || 'FL', flex: 1 },
                { label: 'Zip Code:', value: form.principalZip, flex: 2 },
              ]}
            />

            {!form.mailingSame && (
              <>
                <div style={{ fontFamily: SERIF, fontSize: 11, color: FADED, fontStyle: 'italic', marginBottom: 10 }}>
                  Mailing address (if different from above):
                </div>
                <TypedLine label="Mailing Street Address:" value={mStreet} active={stepActive(2, step)} />
                <TypedRow
                  active={stepActive(2, step)}
                  fields={[
                    { label: 'City:', value: mCity, flex: 3 },
                    { label: 'State:', value: mState, flex: 1 },
                    { label: 'Zip Code:', value: mZip, flex: 2 },
                  ]}
                />
              </>
            )}
          </Article>

          {/* ── ARTICLE III ── */}
          <Article num="Article III" title="Registered Agent & Registered Office" active={stepActive(3, step)}>
            <div style={{ fontFamily: SERIF, fontSize: 11.5, color: INK, marginBottom: 12, lineHeight: 1.65 }}>
              The name and Florida street address of the registered agent is:
            </div>

            <TypedLine
              label="Name of Registered Agent:"
              value={raName}
              active={stepActive(3, step)}
            />
            <TypedLine
              label="Florida Street Address (No P.O. Box):"
              value={raAddress}
              active={stepActive(3, step)}
            />

            <div style={{
              marginTop: 2,
              padding: '8px 10px',
              background: stepActive(3, step) ? 'rgba(26,58,107,0.06)' : 'rgba(150,100,40,0.07)',
              border: `0.75px solid ${stepActive(3, step) ? '#8AAAD0' : '#C0964A60'}`,
              borderRadius: 3,
              fontFamily: SERIF,
              fontSize: 10.5,
              color: '#5A4020',
              lineHeight: 1.6,
              fontStyle: 'italic',
              transition: 'all 0.2s',
            }}>
              Having been named as registered agent and to accept service of process for the above stated
              limited liability company, I hereby accept the obligations of the position of registered agent.
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 10 }}>
              <div style={{ flex: 2 }}>
                <div style={{ fontFamily: SERIF, fontSize: 10.5, color: FADED, fontStyle: 'italic', marginBottom: 18 }}>
                  Signature of Registered Agent
                </div>
                <div style={{ borderBottom: `1px solid ${LINE}` }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SERIF, fontSize: 10.5, color: FADED, fontStyle: 'italic', marginBottom: 18 }}>
                  Date
                </div>
                <div style={{ borderBottom: `1px solid ${LINE}` }} />
              </div>
            </div>
          </Article>

          {/* ── ARTICLE IV ── */}
          <Article num="Article IV" title="Management" active={stepActive(4, step)}>
            <div style={{ fontFamily: SERIF, fontSize: 11.5, color: INK, marginBottom: 12, lineHeight: 1.65 }}>
              Name and address of each person authorized to manage and control the Limited Liability Company:
            </div>

            {/* Management type */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
              {[
                { val: 'member-managed', label: 'Authorized Member (AMBR)' },
                { val: 'manager-managed', label: 'Manager (MGR)' },
              ].map(({ val, label }) => {
                const sel = form.management === val
                const isAct = stepActive(4, step)
                return (
                  <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{
                      width: 13,
                      height: 13,
                      border: `1.5px solid ${sel && isAct ? NAVY : LINE}`,
                      background: sel ? (isAct ? NAVY : '#555') : 'rgba(255,255,255,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                    }}>
                      {sel && <span style={{ color: 'white', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{
                      fontFamily: SERIF,
                      fontSize: 11,
                      fontWeight: sel ? 700 : 400,
                      color: sel && isAct ? NAVY : (sel ? INK : FADED),
                      transition: 'color 0.2s',
                    }}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Members */}
            {form.members.map((m, i) => {
              const isAct = stepActive(4, step)
              const filled = m.name.trim().length > 0
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                    {/* Name field — full width */}
                    <div style={{ flex: 3 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 10.5, color: isAct ? NAVY : FADED, fontStyle: 'italic', marginBottom: 6, transition: 'color 0.2s' }}>
                        Name of {form.management === 'manager-managed' ? 'Manager' : 'Member'} {i + 1}:
                      </div>
                      <div style={{
                        borderBottom: `1px solid ${filled && isAct ? ACTIVE_LINE : LINE}`,
                        minHeight: 20,
                        paddingBottom: 3,
                        paddingLeft: 2,
                        transition: 'border-color 0.2s',
                      }}>
                        <span style={{ fontFamily: MONO, fontSize: 13, color: filled ? (isAct ? NAVY : INK) : 'transparent', transition: 'color 0.2s' }}>
                          {m.name || '​'}
                        </span>
                      </div>
                    </div>
                    {/* Ownership */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 10.5, color: isAct ? NAVY : FADED, fontStyle: 'italic', marginBottom: 6, transition: 'color 0.2s' }}>
                        % Owned:
                      </div>
                      <div style={{
                        borderBottom: `1px solid ${m.ownership && isAct ? ACTIVE_LINE : LINE}`,
                        minHeight: 20,
                        paddingBottom: 3,
                        paddingLeft: 2,
                        transition: 'border-color 0.2s',
                      }}>
                        <span style={{ fontFamily: MONO, fontSize: 13, color: m.ownership ? (isAct ? NAVY : INK) : 'transparent' }}>
                          {m.ownership ? `${m.ownership}%` : '​'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Blank member rows */}
            {form.members.length < 2 && Array.from({ length: 2 - form.members.length }, (_, i) => (
              <div key={`blank-${i}`} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 3, borderBottom: `1px solid ${LINE}`, minHeight: 20 }} />
                <div style={{ flex: 1, borderBottom: `1px solid ${LINE}`, minHeight: 20 }} />
              </div>
            ))}
          </Article>

          {/* ── ARTICLE V ── */}
          <Article num="Article V" title="Effective Date (Optional)" active={stepActive(5, step)}>
            <div style={{ fontFamily: SERIF, fontSize: 11.5, color: INK, marginBottom: 10, lineHeight: 1.65 }}>
              The effective date, if other than the date of filing:
            </div>
            <TypedLine
              value={effectiveLabel}
              active={stepActive(5, step)}
              note="Cannot be before the date of filing or more than 90 calendar days after."
            />
          </Article>

          {/* ── SIGNATURE BLOCK ── */}
          <div style={{ borderTop: `1.5px solid ${INK}`, paddingTop: 14, marginTop: 4 }}>
            <div style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: INK, marginBottom: 14 }}>
              Organizer / Authorized Representative
            </div>

            <TypedLine
              label="Printed Name:"
              value={form.contactName}
              active={stepActive(2, step)}
              mono={false}
              size={11}
            />

            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 2 }}>
                <div style={{ fontFamily: SERIF, fontSize: 10.5, color: FADED, fontStyle: 'italic', marginBottom: 20 }}>Signature</div>
                <div style={{ borderBottom: `1px solid ${INK}` }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SERIF, fontSize: 10.5, color: FADED, fontStyle: 'italic', marginBottom: 20 }}>Date</div>
                <div style={{ borderBottom: `1px solid ${INK}` }} />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontFamily: SERIF, fontSize: 10.5, color: FADED, fontStyle: 'italic', marginBottom: 8 }}>E-mail address (for annual report notification):</div>
              <div style={{ borderBottom: `1px solid ${LINE}`, minHeight: 16 }} />
            </div>
          </div>

          {/* ── Add-ons (step 3) ── */}
          {step === 3 && (form.addOnEin || form.addOnOperatingAgreement || form.addOnCertificateOfStatus) && (
            <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(26,58,107,0.07)', border: '0.75px solid #8AAAD0', borderRadius: 4 }}>
              <div style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: NAVY, marginBottom: 9 }}>
                Additional Services Ordered
              </div>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {form.addOnEin && <li style={{ fontFamily: SERIF, fontSize: 11.5, color: INK, marginBottom: 4 }}>EIN — Employer Identification Number (+$75)</li>}
                {form.addOnOperatingAgreement && <li style={{ fontFamily: SERIF, fontSize: 11.5, color: INK, marginBottom: 4 }}>Operating Agreement (+$50)</li>}
                {form.addOnCertificateOfStatus && <li style={{ fontFamily: SERIF, fontSize: 9.5, color: INK }}>Certificate of Status (+$9)</li>}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 18, paddingTop: 10, borderTop: `0.5px solid ${LINE}`, textAlign: 'center' }}>
            <div style={{ fontFamily: SERIF, fontSize: 10, color: '#A07840' }}>
              Filing Section · Division of Corporations · Florida Department of State
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 9, color: '#C0A060', marginTop: 3 }}>
              P.O. Box 6327 · Tallahassee, Florida 32314
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
