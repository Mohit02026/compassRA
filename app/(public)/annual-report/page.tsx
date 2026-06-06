'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const SERVICE_FEE = 125
const STATE_FEE = 138.75
const TOTAL = SERVICE_FEE + STATE_FEE

// ─── shared input style ────────────────────────────────────────────────────────
const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid oklch(0.88 0.015 245)',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 14,
  outline: 'none',
  background: 'white',
  color: 'oklch(0.22 0.06 245)',
  fontFamily: 'var(--font-dm)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...INPUT_STYLE, ...props.style }}
      onFocus={(e) => {
        e.target.style.borderColor = 'oklch(0.56 0.18 250)'
        e.target.style.boxShadow = '0 0 0 3px oklch(0.56 0.18 250 / 0.12)'
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'oklch(0.88 0.015 245)'
        e.target.style.boxShadow = 'none'
        props.onBlur?.(e)
      }}
    />
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.85)',
        boxShadow: '0 6px 28px oklch(0.22 0.06 245 / 0.11), 0 1px 4px oklch(0.22 0.06 245 / 0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
        padding: '22px 26px',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid oklch(0.93 0.01 245)' }}>
        <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, oklch(0.60 0.20 250) 0%, oklch(0.48 0.18 250) 100%)', flexShrink: 0, boxShadow: '0 2px 8px oklch(0.56 0.18 250 / 0.35)' }} />
        <h2 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 14.5, color: 'oklch(0.22 0.08 245)', letterSpacing: '-0.01em' }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children, required, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-jakarta)', color: 'oklch(0.34 0.06 245)', marginBottom: 6 }}>
        {label}
        {required && <span style={{ color: 'oklch(0.55 0.18 25)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 12, color: 'oklch(0.58 0.04 245)', marginTop: 5 }}>{hint}</p>}
    </div>
  )
}

const STEP_LABELS = ['Filing details', 'Review & pay']

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{
      marginBottom: 24,
      background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '0 2px 12px oklch(0.22 0.06 245 / 0.07)',
      padding: '14px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {Array.from({ length: total }, (_, i) => {
          const num = i + 1
          const done = num < step
          const active = num === step
          return (
            <div key={num} style={{ display: 'flex', alignItems: 'center', flex: i < total - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-jakarta)',
                  background: done
                    ? 'linear-gradient(135deg, oklch(0.60 0.20 250), oklch(0.50 0.18 250))'
                    : active
                      ? 'linear-gradient(135deg, oklch(0.26 0.08 245), oklch(0.20 0.07 245))'
                      : 'rgba(255,255,255,0.8)',
                  color: done || active ? 'white' : 'oklch(0.65 0.04 245)',
                  border: done || active ? 'none' : '1.5px solid oklch(0.86 0.015 245)',
                  boxShadow: done
                    ? '0 3px 10px oklch(0.56 0.18 250 / 0.35)'
                    : active ? '0 3px 10px oklch(0.22 0.06 245 / 0.30)' : 'none',
                  transition: 'all 0.3s', flexShrink: 0,
                }}>
                  {done ? '✓' : num}
                </div>
                <span style={{
                  fontSize: 10.5, fontFamily: 'var(--font-jakarta)',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'oklch(0.22 0.08 245)' : 'oklch(0.60 0.04 245)',
                  whiteSpace: 'nowrap',
                }}>
                  {STEP_LABELS[i]}
                </span>
              </div>
              {i < total - 1 && (
                <div style={{
                  flex: 1, height: 2, marginBottom: 24, marginLeft: 6, marginRight: 6, borderRadius: 1,
                  background: num < step
                    ? 'linear-gradient(90deg, oklch(0.56 0.18 250), oklch(0.52 0.16 250))'
                    : 'oklch(0.90 0.01 245)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface FormState {
  llcName: string
  docNumber: string
  contactName: string
  contactEmail: string
  contactPhone: string
  // Pre-filled from SunBiz
  status: string
  filingDate: string
  principalAddress: string
  registeredAgent: string
}

interface SunbizResult {
  name: string
  documentNumber: string
  status: string
  filingDate: string
  principalAddress: string
  mailingAddress: string
  registeredAgent: string
  registeredAgentAddress: string
}

export default function AnnualReportPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    llcName: '',
    docNumber: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    status: '',
    filingDate: '',
    principalAddress: '',
    registeredAgent: '',
  })

  const [sunbizState, setSunbizState] = useState<
    'idle' | 'loading' | 'found' | 'not-found' | 'error'
  >('idle')

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // ── Wire up Pull from SunBiz ──────────────────────────────────────────────
  async function handlePullFromSunbiz() {
    if (!form.docNumber.trim()) return
    setSunbizState('loading')

    try {
      const res = await fetch(
        `/api/sunbiz/lookup?docNumber=${encodeURIComponent(form.docNumber.trim())}`
      )

      if (res.status === 503) {
        // Cloudflare blocking — not a user error
        setSunbizState('error')
        return
      }
      if (res.status === 404) {
        setSunbizState('not-found')
        return
      }
      if (!res.ok) {
        setSunbizState('error')
        return
      }

      const json = await res.json()
      const entity: SunbizResult = json.data

      // Pre-fill form from SunBiz data
      setForm((prev) => ({
        ...prev,
        llcName:          entity.name             || prev.llcName,
        status:           entity.status           || '',
        filingDate:       entity.filingDate       || '',
        principalAddress: entity.principalAddress || '',
        registeredAgent:  entity.registeredAgent  || '',
      }))

      setSunbizState('found')
    } catch {
      setSunbizState('error')
    }
  }

  function handleProceedToCheckout() {
    const payload = {
      serviceType: 'ANNUAL_REPORT',
      tier: 'STANDARD',
      businessName: form.llcName,
      customerName: form.contactName,
      customerEmail: form.contactEmail,
      customerPhone: form.contactPhone || undefined,
      serviceFee: SERVICE_FEE,
      stateFee: STATE_FEE,
      docNumber: form.docNumber,
      summary: `Annual Report — ${form.llcName}`,
      lineItems: [
        { label: 'Service fee', amount: SERVICE_FEE },
        { label: 'Florida state fee', amount: STATE_FEE },
      ],
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutPayload', JSON.stringify(payload))
    }
    router.push('/checkout')
  }

  const step1Valid =
    form.llcName.trim() && form.docNumber.trim() &&
    form.contactName.trim() && form.contactEmail.trim()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 72px' }}>

      {/* Page header */}
      <div style={{ padding: '28px 0 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'oklch(0.50 0.10 250)', fontFamily: 'var(--font-jakarta)', marginBottom: 6 }}>
          Annual Report · Florida
        </div>
        <h1 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: 'clamp(22px, 3vw, 30px)', color: 'oklch(0.22 0.08 245)', marginBottom: 6, letterSpacing: '-0.02em' }}>
          File Florida Annual Report
        </h1>
        <p style={{ fontSize: 14, color: 'oklch(0.55 0.04 245)', lineHeight: 1.6 }}>
          Keep your LLC active on Sunbiz. $125 service + $138.75 state fee = $263.75 total. Due May 1.
        </p>
      </div>

      <ProgressBar step={step} total={2} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <>
          <SectionCard title="LLC Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <Field
                label="FL Document Number"
                required
                hint="Found on your Florida Division of Corporations filing. Format: L or P followed by 8 digits (e.g. L25000307072)."
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <StyledInput
                    type="text"
                    value={form.docNumber}
                    onChange={(e) => {
                      set('docNumber', e.target.value)
                      setSunbizState('idle')
                    }}
                    placeholder="L25000307072"
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handlePullFromSunbiz}
                    disabled={!form.docNumber.trim() || sunbizState === 'loading'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'var(--font-jakarta)',
                      padding: '9px 16px',
                      borderRadius: 9,
                      border: '1.5px solid oklch(0.78 0.12 250)',
                      background: 'linear-gradient(135deg, oklch(0.97 0.03 250) 0%, oklch(0.93 0.07 250) 100%)',
                      color: 'oklch(0.40 0.14 250)',
                      cursor: (!form.docNumber.trim() || sunbizState === 'loading') ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px oklch(0.56 0.18 250 / 0.16)',
                      opacity: (!form.docNumber.trim() || sunbizState === 'loading') ? 0.55 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {sunbizState === 'loading'
                      ? <Loader2 size={14} className="animate-spin" />
                      : <FileText size={14} />
                    }
                    {sunbizState === 'loading' ? 'Fetching…' : 'Pull from Sunbiz'}
                  </button>
                </div>

                {/* SunBiz result feedback */}
                {sunbizState === 'found' && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: 'oklch(0.955 0.065 145)', border: '1px solid oklch(0.80 0.10 145)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 size={14} style={{ color: 'oklch(0.40 0.15 145)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: 'oklch(0.30 0.12 145)', fontFamily: 'var(--font-jakarta)' }}>
                        Found on Sunbiz — details pre-filled below
                      </p>
                      {form.status && (
                        <p style={{ fontSize: 11.5, color: 'oklch(0.42 0.10 145)', marginTop: 1 }}>
                          Status: {form.status}
                          {form.filingDate ? ` · Filed: ${form.filingDate}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {sunbizState === 'not-found' && (
                  <div style={{ marginTop: 8, padding: '7px 12px', background: 'oklch(0.96 0.04 25)', border: '1px solid oklch(0.82 0.10 25)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <AlertCircle size={14} style={{ color: 'oklch(0.50 0.18 25)', flexShrink: 0 }} />
                    <p style={{ fontSize: 12.5, color: 'oklch(0.42 0.16 25)' }}>
                      Not found on Sunbiz — check the document number and try again, or fill in manually.
                    </p>
                  </div>
                )}
                {sunbizState === 'error' && (
                  <div style={{ marginTop: 8, padding: '7px 12px', background: 'oklch(0.96 0.04 60)', border: '1px solid oklch(0.82 0.10 60)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <AlertCircle size={14} style={{ color: 'oklch(0.50 0.14 60)', flexShrink: 0 }} />
                    <p style={{ fontSize: 12.5, color: 'oklch(0.42 0.12 60)' }}>
                      Sunbiz is temporarily unavailable — please fill in your LLC details manually.
                    </p>
                  </div>
                )}
              </Field>

              <Field label="LLC Name" required>
                <StyledInput
                  type="text"
                  value={form.llcName}
                  onChange={(e) => set('llcName', e.target.value)}
                  placeholder="Sunshine Ventures LLC"
                  required
                />
              </Field>

              {/* Show pre-filled Sunbiz data as readonly fields */}
              {sunbizState === 'found' && form.principalAddress && (
                <Field label="Principal Address (from Sunbiz)">
                  <StyledInput
                    value={form.principalAddress}
                    readOnly
                    style={{ background: 'oklch(0.96 0.005 245)', color: 'oklch(0.55 0.04 245)', cursor: 'default' }}
                  />
                </Field>
              )}
              {sunbizState === 'found' && form.registeredAgent && (
                <Field label="Registered Agent (from Sunbiz)">
                  <StyledInput
                    value={form.registeredAgent}
                    readOnly
                    style={{ background: 'oklch(0.96 0.005 245)', color: 'oklch(0.55 0.04 245)', cursor: 'default' }}
                  />
                </Field>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Your Contact Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <StyledInput
                  type="text"
                  value={form.contactName}
                  onChange={(e) => set('contactName', e.target.value)}
                  placeholder="Jane Smith"
                  required
                />
              </Field>
              <Field label="Email" required>
                <StyledInput
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => set('contactEmail', e.target.value)}
                  placeholder="jane@example.com"
                  required
                />
              </Field>
              <Field label="Phone">
                <StyledInput
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => set('contactPhone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </Field>
            </div>
          </SectionCard>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              style={{
                background: 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.20 0.07 245) 100%)',
                color: 'white', border: 'none',
                borderRadius: 11, padding: '12px 28px', fontSize: 14, fontWeight: 600,
                fontFamily: 'var(--font-jakarta)', cursor: 'pointer',
                boxShadow: '0 4px 16px oklch(0.22 0.06 245 / 0.35), 0 1px 3px oklch(0.22 0.06 245 / 0.18)',
                opacity: !step1Valid ? 0.45 : 1, transition: 'all 0.15s', letterSpacing: '-0.01em',
              }}
            >
              Review order →
            </button>
          </div>
        </>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <>
          <SectionCard title="Order Summary">
            <dl style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <SummaryRow label="LLC Name" value={form.llcName} />
              <SummaryRow label="FL Document Number" value={form.docNumber} />
              {form.status && <SummaryRow label="Status on Sunbiz" value={form.status} />}
              <SummaryRow label="Contact Name" value={form.contactName} />
              <SummaryRow label="Contact Email" value={form.contactEmail} />
              {form.contactPhone && <SummaryRow label="Phone" value={form.contactPhone} />}
            </dl>
          </SectionCard>

          <SectionCard title="Price Breakdown">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'oklch(0.36 0.06 245)' }}>
                <span>Annual Report — service fee</span>
                <span>${SERVICE_FEE.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'oklch(0.36 0.06 245)' }}>
                <span>Florida state fee</span>
                <span>${STATE_FEE.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: 10, borderTop: '1px solid oklch(0.91 0.01 245)' }}>
                <span style={{ color: 'oklch(0.26 0.08 245)' }}>Total</span>
                <span style={{ color: 'oklch(0.45 0.15 250)' }}>${TOTAL.toFixed(2)}</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'oklch(0.58 0.04 245)', marginTop: 10 }}>
              No auto-renewals. No surprise charges. One flat fee, filed by a real person.
            </p>
          </SectionCard>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <button
              onClick={() => setStep(1)}
              style={{
                fontSize: 13, fontFamily: 'var(--font-jakarta)', fontWeight: 500,
                color: 'oklch(0.45 0.06 245)', cursor: 'pointer',
                background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(8px)',
                border: '1px solid oklch(0.88 0.015 245)',
                borderRadius: 9, padding: '10px 16px',
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleProceedToCheckout}
              style={{
                background: 'linear-gradient(135deg, oklch(0.60 0.22 250) 0%, oklch(0.50 0.20 250) 100%)',
                color: 'white', border: 'none',
                borderRadius: 11, padding: '13px 32px', fontSize: 14.5, fontWeight: 700,
                fontFamily: 'var(--font-jakarta)', cursor: 'pointer',
                boxShadow: '0 6px 22px oklch(0.56 0.18 250 / 0.45), 0 1px 4px oklch(0.56 0.18 250 / 0.22)',
                letterSpacing: '-0.01em',
              }}
            >
              Proceed to Payment →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <dt style={{ color: 'oklch(0.55 0.04 245)' }}>{label}</dt>
      <dd style={{ fontWeight: 600, color: 'oklch(0.26 0.08 245)', textAlign: 'right', margin: 0 }}>{value}</dd>
    </div>
  )
}
