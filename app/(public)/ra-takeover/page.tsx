'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import IntakeLayout from '@/components/public/IntakeLayout'
import PanelUSMap from '@/components/public/intake-panels/PanelUSMap'
import PanelContactCard from '@/components/public/intake-panels/PanelContactCard'

const SERVICE_FEE = 149

// ─── shared components ────────────────────────────────────────────────────────

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 40 }}>
      <h1 style={{ fontSize: 48, fontWeight: 600, color: 'rgb(23, 23, 23)', lineHeight: 1, letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-dm-sans)' }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 16, fontWeight: 400, color: 'rgb(76, 76, 76)', lineHeight: 1.13, fontFamily: 'var(--font-dm-sans)', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {children}
    </div>
  )
}

function ContinueBtn({ onClick, disabled, label = 'Continue' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled} className="intake-continue-btn"
      style={{
        width: '100%', padding: '14px 24px', borderRadius: 8,
        border: disabled ? '1px solid rgba(59,96,243,0.2)' : '1px solid rgb(59,96,243)',
        background: disabled ? 'rgb(248,249,252)' : 'rgb(59,96,243)',
        color: disabled ? 'rgba(59,96,243,0.45)' : 'rgb(255,255,255)',
        fontSize: 16, fontWeight: 600, lineHeight: 1, fontFamily: 'var(--font-dm-sans)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
      }}
    >{label}</button>
  )
}

function StyledTextInput({ value, onChange, placeholder, type = 'text', label, required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; label: string; required?: boolean
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
        {label}{required && ' *'}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        style={{ width: '100%', padding: '15px 16px', borderRadius: 8, border: '1px solid rgb(224, 224, 224)', fontSize: 16, fontFamily: 'var(--font-dm-sans)', color: 'rgb(23,23,23)', outline: 'none', background: '#ffffff', boxSizing: 'border-box', transition: 'border-color 0.5s ease' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#3b60f3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgb(224, 224, 224)'; e.currentTarget.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingBottom: 12, borderBottom: '1px solid rgb(245,245,245)' }}>
      <span style={{ fontSize: 13, color: 'rgb(130,130,130)', fontFamily: 'var(--font-dm-sans)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'rgb(30,30,30)', fontFamily: 'var(--font-dm-sans)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

// ─── form types ────────────────────────────────────────────────────────────────

interface FormState {
  llcName: string
  docNumber: string
  contactName: string
  contactEmail: string
  contactPhone: string
  sunbizStatus: string
}

interface SunbizResult {
  name: string
  documentNumber: string
  status: string
  filingDate: string
  principalAddress: string
  registeredAgent: string
}

// ─── step sub-components ──────────────────────────────────────────────────────

function Step1FindLLC({
  form,
  sunbizState,
  onDocNumberChange,
  onLlcNameChange,
  onLookupOnSunbiz,
  onContinue,
}: {
  form: FormState
  sunbizState: 'idle' | 'loading' | 'found' | 'not-found' | 'error'
  onDocNumberChange: (v: string) => void
  onLlcNameChange: (v: string) => void
  onLookupOnSunbiz: () => void
  onContinue: () => void
}) {
  const step1Valid = !!(form.llcName.trim() && form.docNumber.trim())
  return (
    <div>
      <StepHeading
        title="Let's find your Florida LLC"
        subtitle="Enter your FL document number and we'll pull your details from Sunbiz."
      />
      <FormCard>
        {/* Doc number row */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
            FL Document Number *
          </label>
          <div className="flex-col sm:flex-row" style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={form.docNumber}
              onChange={(e) => onDocNumberChange(e.target.value)}
              placeholder="L25000307072"
              style={{ flex: 1, padding: '15px 16px', borderRadius: 8, border: '1px solid rgb(224, 224, 224)', fontSize: 16, fontFamily: 'var(--font-dm-sans)', color: 'rgb(23,23,23)', outline: 'none', background: '#ffffff', boxSizing: 'border-box', transition: 'border-color 0.5s ease' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#3b60f3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgb(224, 224, 224)'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <button
              type="button"
              onClick={onLookupOnSunbiz}
              disabled={!form.docNumber.trim() || sunbizState === 'loading'}
              className="justify-center sm:justify-start"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '15px 18px',
                borderRadius: 8, border: '1px solid rgb(59,96,243)',
                background: 'rgb(248,249,252)', color: 'rgb(59,96,243)',
                fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-dm-sans)',
                cursor: 'pointer', whiteSpace: 'nowrap',
                opacity: (!form.docNumber.trim() || sunbizState === 'loading') ? 0.4 : 1,
              }}
            >
              {sunbizState === 'loading'
                ? <Loader2 size={14} className="animate-spin" />
                : <FileText size={14} />
              }
              {sunbizState === 'loading' ? 'Fetching…' : 'Look up on Sunbiz'}
            </button>
          </div>

          {/* Feedback banners */}
          {sunbizState === 'found' && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgb(240,253,244)', border: '1px solid rgb(187,247,208)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={15} style={{ color: 'rgb(22,163,74)', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'rgb(22,101,52)', fontFamily: 'var(--font-dm-sans)', margin: 0 }}>
                  Found — details pre-filled below
                </p>
                {form.sunbizStatus && (
                  <p style={{ fontSize: 11.5, color: 'rgb(21,128,61)', fontFamily: 'var(--font-dm-sans)', margin: '2px 0 0' }}>
                    Status: {form.sunbizStatus}
                  </p>
                )}
              </div>
            </div>
          )}
          {sunbizState === 'not-found' && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgb(254,242,242)', border: '1px solid rgb(254,202,202)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={15} style={{ color: 'rgb(220,38,38)', flexShrink: 0 }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgb(185,28,28)', fontFamily: 'var(--font-dm-sans)', margin: 0 }}>
                Not found — check the number or fill in manually
              </p>
            </div>
          )}
          {sunbizState === 'error' && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgb(255,251,235)', border: '1px solid rgb(252,211,77)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={15} style={{ color: 'rgb(146,64,14)', flexShrink: 0 }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgb(120,53,15)', fontFamily: 'var(--font-dm-sans)', margin: 0 }}>
                Sunbiz unavailable — fill in manually
              </p>
            </div>
          )}
        </div>

        <StyledTextInput
          label="LLC Name"
          required
          value={form.llcName}
          onChange={onLlcNameChange}
          placeholder="Sunshine Ventures LLC"
        />

        <ContinueBtn onClick={onContinue} disabled={!step1Valid} />
      </FormCard>
    </div>
  )
}

function Step2Contact({
  form,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onContinue,
}: {
  form: FormState
  onNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onContinue: () => void
}) {
  const step2Valid = !!(form.contactName.trim() && form.contactEmail.trim())
  return (
    <div>
      <StepHeading
        title="Who should we contact?"
        subtitle="We'll set up your customer portal account with this email."
      />
      <FormCard>
        <StyledTextInput label="Full Name" required value={form.contactName} onChange={onNameChange} placeholder="Jane Smith" />
        <StyledTextInput label="Email" required type="email" value={form.contactEmail} onChange={onEmailChange} placeholder="jane@example.com" />
        <StyledTextInput label="Phone (optional)" type="tel" value={form.contactPhone} onChange={onPhoneChange} placeholder="+1 (555) 000-0000" />

        {/* Security info card */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'rgb(240,253,244)', border: '1px solid rgb(187,247,208)', borderRadius: 12, padding: '16px 18px', marginTop: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgb(220,252,231)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={18} style={{ color: 'rgb(22,163,74)' }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'rgb(22,101,52)', fontFamily: 'var(--font-dm-sans)', margin: '0 0 4px' }}>
              Your information is safe
            </p>
            <p style={{ fontSize: 12.5, color: 'rgb(20,83,45)', fontFamily: 'var(--font-dm-sans)', margin: 0, lineHeight: 1.5 }}>
              We use bank-level encryption and never sell your data. Your details are only used to process your registered agent transfer.
            </p>
          </div>
        </div>

        <ContinueBtn onClick={onContinue} disabled={!step2Valid} />
      </FormCard>
    </div>
  )
}

function Step3Review({
  form,
  onProceed,
}: {
  form: FormState
  onProceed: () => void
}) {
  return (
    <div>
      <StepHeading title="Review your RA Takeover order" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left — order details */}
        <div style={{ background: '#ffffff', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(130,130,130)', fontFamily: 'var(--font-dm-sans)', margin: '0 0 4px' }}>
            Order Details
          </p>
          <ReviewRow label="LLC Name" value={form.llcName} />
          <ReviewRow label="FL Document Number" value={form.docNumber} />
          {form.sunbizStatus && <ReviewRow label="Status on Sunbiz" value={form.sunbizStatus} />}
          <ReviewRow label="Contact Name" value={form.contactName} />
          <ReviewRow label="Email" value={form.contactEmail} />
          {form.contactPhone && <ReviewRow label="Phone" value={form.contactPhone} />}
        </div>

        {/* Right — price */}
        <div style={{ background: '#ffffff', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(130,130,130)', fontFamily: 'var(--font-dm-sans)', margin: '0 0 4px' }}>
            Price
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingBottom: 12, borderBottom: '1px solid rgb(245,245,245)' }}>
            <span style={{ fontSize: 13, color: 'rgb(130,130,130)', fontFamily: 'var(--font-dm-sans)' }}>Registered Agent Service (annual)</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgb(30,30,30)', fontFamily: 'var(--font-dm-sans)' }}>${SERVICE_FEE.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingBottom: 12, borderBottom: '1px solid rgb(245,245,245)' }}>
            <span style={{ fontSize: 13, color: 'rgb(130,130,130)', fontFamily: 'var(--font-dm-sans)' }}>Annual report filing</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgb(22,163,74)', fontFamily: 'var(--font-dm-sans)' }}>Included</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingTop: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'rgb(23,23,23)', fontFamily: 'var(--font-dm-sans)' }}>Total today</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'rgb(59,96,243)', fontFamily: 'var(--font-dm-sans)' }}>${SERVICE_FEE.toFixed(2)}</span>
          </div>

          <p style={{ fontSize: 12, color: 'rgb(130,130,130)', fontFamily: 'var(--font-dm-sans)', margin: '8px 0 0', lineHeight: 1.5 }}>
            Annual report filing is included — you pay only the $138.75 FL state fee when it&apos;s due each May 1. No auto-renewals. Effective upon acceptance by Compass.
          </p>

          <div style={{ marginTop: 8 }}>
            <ContinueBtn onClick={onProceed} label="Proceed to Payment →" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function RaTakeoverPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    llcName: '',
    docNumber: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    sunbizStatus: '',
  })

  const [sunbizState, setSunbizState] = useState<'idle' | 'loading' | 'found' | 'not-found' | 'error'>('idle')

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleLookupOnSunbiz() {
    if (!form.docNumber.trim()) return
    setSunbizState('loading')
    try {
      const res = await fetch(`/api/sunbiz/lookup?docNumber=${encodeURIComponent(form.docNumber.trim())}`)
      if (res.status === 503) { setSunbizState('error'); return }
      if (res.status === 404) { setSunbizState('not-found'); return }
      if (!res.ok) { setSunbizState('error'); return }
      const json = await res.json()
      const entity: SunbizResult = json.data
      setForm((prev) => ({
        ...prev,
        llcName: entity.name || prev.llcName,
        sunbizStatus: entity.status || '',
      }))
      setSunbizState('found')
    } catch {
      setSunbizState('error')
    }
  }

  function handleProceedToCheckout() {
    const payload = {
      serviceType: 'RA_TAKEOVER',
      tier: 'STANDARD',
      businessName: form.llcName,
      customerName: form.contactName,
      customerEmail: form.contactEmail,
      customerPhone: form.contactPhone || undefined,
      serviceFee: SERVICE_FEE,
      stateFee: 0,
      docNumber: form.docNumber,
      sourceHref: '/ra-takeover',
      summary: `RA Takeover — ${form.llcName}`,
      lineItems: [{ label: 'Registered Agent Service (annual)', amount: SERVICE_FEE }],
    }
    if (typeof window !== 'undefined') sessionStorage.setItem('checkoutPayload', JSON.stringify(payload))
    router.push('/checkout')
  }

  const step1Valid = !!(form.llcName.trim() && form.docNumber.trim())
  const step2Valid = !!(form.contactName.trim() && form.contactEmail.trim())

  const rightPanel = step === 1
    ? <PanelUSMap selectedState="FL" />
    : step === 2
    ? <PanelContactCard firstName={form.contactName} lastName="" email={form.contactEmail} phone={form.contactPhone} />
    : undefined

  return (
    <IntakeLayout
      onBack={step > 1 ? () => setStep(s => s - 1) : undefined}
      backHref={step === 1 ? '/' : undefined}
      rightPanel={rightPanel}
      onClose="/"
      wide={step === 3}
    >
      {step === 1 && (
        <Step1FindLLC
          form={form}
          sunbizState={sunbizState}
          onDocNumberChange={(v) => { set('docNumber', v); setSunbizState('idle') }}
          onLlcNameChange={(v) => set('llcName', v)}
          onLookupOnSunbiz={handleLookupOnSunbiz}
          onContinue={() => step1Valid && setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2Contact
          form={form}
          onNameChange={(v) => set('contactName', v)}
          onEmailChange={(v) => set('contactEmail', v)}
          onPhoneChange={(v) => set('contactPhone', v)}
          onContinue={() => step2Valid && setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3Review
          form={form}
          onProceed={handleProceedToCheckout}
        />
      )}
    </IntakeLayout>
  )
}
