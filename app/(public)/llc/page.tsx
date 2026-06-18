'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { NameAvailability } from '@/services/nameSearch'
import IntakeLayout from '@/components/public/IntakeLayout'
import OptionCard from '@/components/public/OptionCard'
import SearchableCombobox from '@/components/public/SearchableCombobox'
import PanelUSMap from '@/components/public/intake-panels/PanelUSMap'
import PanelCertificate from '@/components/public/intake-panels/PanelCertificate'
import PanelContactCard from '@/components/public/intake-panels/PanelContactCard'
import PanelBubbleChart from '@/components/public/intake-panels/PanelBubbleChart'
import PanelCalendar from '@/components/public/intake-panels/PanelCalendar'
import PanelIndustryGauge from '@/components/public/intake-panels/PanelIndustryGauge'
import PanelRAInfo from '@/components/public/intake-panels/PanelRAInfo'

const COMPASS_RA_ADDRESS = '625 Court St Ste 100, Clearwater, FL 33756'
const COMPASS_RA_NAME = 'Compass Registered Agent, LLC'
const STATE_FEE = 138.75
const RA_FEE = 199

const PLANS = [
  {
    id: 'SELF_SERVE',
    name: 'Basic Plan',
    price: 249,
    popular: false,
    features: [
      'Name availability search',
      'Company registration in Florida',
      '7-10 day processing time*',
      '100% accuracy guaranteed',
      'Customer Portal access',
      'File necessary annual reports',
    ],
    includesEin: false,
    includesOA: false,
  },
  {
    id: 'STANDARD',
    name: 'Professional Plan',
    price: 349,
    popular: true,
    features: [
      'Name availability search',
      'Company registration in Florida',
      '24 hour processing time*',
      '100% accuracy guaranteed',
      'Customer Portal access',
      'File necessary annual reports',
      'Ongoing compliance (state-required)',
      'Operating Agreement template',
    ],
    includesEin: false,
    includesOA: true,
  },
  {
    id: 'WHITE_GLOVE',
    name: 'Enterprise Plan',
    price: 449,
    popular: false,
    features: [
      'Name availability search',
      'Company registration in Florida',
      '24 hour processing time*',
      '100% accuracy guaranteed',
      'Customer Portal access',
      'File necessary annual reports',
      'Ongoing compliance (state-required)',
      'Operating Agreement template',
      'Obtaining an EIN (Taxpayer ID)',
    ],
    includesEin: true,
    includesOA: true,
  },
]

const INDUSTRY_OPTIONS = [
  { value: 'accounting', label: 'Accounting' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'automotive', label: 'Automotive Services' },
  { value: 'beauty', label: 'Beauty and Personal Care' },
  { value: 'construction', label: 'Construction' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'education', label: 'Education and Training' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'events', label: 'Event Planning' },
  { value: 'fashion', label: 'Fashion and Apparel' },
  { value: 'food-beverage', label: 'Food and Beverage' },
  { value: 'health-wellness', label: 'Health and Wellness' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'home-services', label: 'Home Services' },
  { value: 'it', label: 'Information Technology' },
  { value: 'software', label: 'Software Development' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'marketing', label: 'Marketing Services' },
  { value: 'media', label: 'Media and Publishing' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'property', label: 'Property Management' },
  { value: 'retail', label: 'Retail' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'catering', label: 'Catering' },
  { value: 'food-truck', label: 'Food Truck' },
  { value: 'sales', label: 'Sales Services' },
  { value: 'security', label: 'Security Services' },
  { value: 'sports', label: 'Sports and Recreation' },
  { value: 'telecom', label: 'Telecommunications' },
  { value: 'travel', label: 'Travel and Tourism' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'warehousing', label: 'Warehousing' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'import-export', label: 'Import and Export' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'other', label: 'Other' },
]

interface FormState {
  businessName: string
  firstName: string
  lastName: string
  email: string
  phone: string
  experience: string
  effectiveType: 'immediate' | 'future'
  effectiveDate: string
  industry: string
  useCompassRA: boolean
  raName: string
  raAddress: string
  tier: string
}

const defaultForm: FormState = {
  businessName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  experience: '',
  effectiveType: 'immediate',
  effectiveDate: '',
  industry: '',
  useCompassRA: true,
  raName: COMPASS_RA_NAME,
  raAddress: COMPASS_RA_ADDRESS,
  tier: 'STANDARD',
}

export default function LLCFormationPage() {
  return (
    <Suspense>
      <LLCWizard />
    </Suspense>
  )
}

function LLCWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    ...defaultForm,
    businessName: searchParams?.get('name') ?? '',
  })
  const [nameCheck, setNameCheck] = useState<{ available: NameAvailability; checking: boolean } | null>(null)

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => { setNameCheck(null) }, [form.businessName])

  async function checkName() {
    if (!form.businessName.trim()) return
    setNameCheck({ available: 'unknown', checking: true })
    try {
      const res = await fetch(`/api/name-search?name=${encodeURIComponent(form.businessName)}`)
      const json = await res.json()
      setNameCheck({ available: json.data.available as NameAvailability, checking: false })
    } catch {
      setNameCheck({ available: 'unknown', checking: false })
    }
  }

  function handleProceedToCheckout(planId: string) {
    const plan = PLANS.find((p) => p.id === planId) ?? PLANS[1]
    const contactName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim()

    const payload = {
      serviceType: 'LLC_FORMATION',
      tier: plan.id,
      businessName: form.businessName,
      customerName: contactName,
      customerEmail: form.email,
      customerPhone: form.phone || undefined,
      principalAddress: '',
      mailingAddress: '',
      serviceFee: plan.price,
      stateFee: STATE_FEE,
      addOnEin: plan.includesEin,
      addOnOperatingAgreement: plan.includesOA,
      addOnCertificateOfStatus: false,
      management: 'member-managed',
      effectiveType: form.effectiveType,
      effectiveDate: form.effectiveDate || undefined,
      members: [{ name: contactName, ownership: '100' }],
      useCompassRA: form.useCompassRA,
      raName: form.useCompassRA ? COMPASS_RA_NAME : form.raName,
      raAddress: form.useCompassRA ? COMPASS_RA_ADDRESS : form.raAddress,
      industry: form.industry,
      experience: form.experience,
      addOnTotal: 0,
      total: plan.price + STATE_FEE,
      summary: `LLC Formation — ${form.businessName}`,
      lineItems: [
        { label: `${plan.name}`, amount: plan.price },
        { label: 'Florida state fee', amount: STATE_FEE },
        ...(form.useCompassRA ? [{ label: 'Registered Agent (billed after formation)', amount: 0 }] : []),
      ],
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutPayload', JSON.stringify(payload))
    }
    router.push('/checkout')
  }

  // Right panel per step
  const panels: Record<number, React.ReactNode> = {
    1: <PanelUSMap />,
    2: <PanelCertificate businessName={form.businessName} />,
    3: <PanelContactCard firstName={form.firstName} lastName={form.lastName} email={form.email} phone={form.phone} />,
    4: <PanelBubbleChart experience={form.experience} />,
    5: <PanelCalendar timeline={form.effectiveType === 'future' ? 'future' : form.effectiveType === 'immediate' ? 'active' : 'soon'} />,
    6: <PanelIndustryGauge industry={form.industry} />,
    7: <PanelRAInfo />,
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1)
  }

  return (
    <IntakeLayout
      onBack={step > 1 ? goBack : undefined}
      backHref={step === 1 ? '/' : undefined}
      rightPanel={panels[step]}
      onClose="/"
      wide={step === 8}
    >
      {step === 1 && <Step1State onNext={() => setStep(2)} />}
      {step === 2 && (
        <Step2BusinessName
          value={form.businessName}
          onChange={(v) => set('businessName', v)}
          nameCheck={nameCheck}
          onCheckName={checkName}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3Contact
          firstName={form.firstName}
          lastName={form.lastName}
          email={form.email}
          phone={form.phone}
          onChange={set}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <Step4Experience
          value={form.experience}
          onChange={(v) => set('experience', v)}
          onNext={() => setStep(5)}
        />
      )}
      {step === 5 && (
        <Step5Timeline
          value={form.effectiveType}
          effectiveDate={form.effectiveDate}
          onChange={(v) => set('effectiveType', v as 'immediate' | 'future')}
          onDateChange={(v) => set('effectiveDate', v)}
          onNext={() => setStep(6)}
        />
      )}
      {step === 6 && (
        <Step6Industry
          value={form.industry}
          onChange={(v) => set('industry', v)}
          onNext={() => setStep(7)}
        />
      )}
      {step === 7 && (
        <Step7RegisteredAgent
          useCompassRA={form.useCompassRA}
          raName={form.raName}
          raAddress={form.raAddress}
          onSelect={(useCompass) => {
            set('useCompassRA', useCompass)
            if (useCompass) {
              set('raName', COMPASS_RA_NAME)
              set('raAddress', COMPASS_RA_ADDRESS)
            }
            setStep(8)
          }}
          onCustomRA={(name, address) => {
            set('useCompassRA', false)
            set('raName', name)
            set('raAddress', address)
          }}
        />
      )}
      {step === 8 && (
        <Step8Plans onSelect={handleProceedToCheckout} />
      )}
    </IntakeLayout>
  )
}

// ─── Step components ────────────────────────────────────────────────────────

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1
        style={{
          fontSize: 'clamp(30px, 4vw, 44px)',
          fontWeight: 700,
          color: 'rgb(15, 15, 15)',
          lineHeight: 1.15,
          marginBottom: subtitle ? 12 : 0,
          fontFamily: 'var(--font-dm-sans)',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 15, color: 'rgb(100, 100, 100)', lineHeight: 1.6, fontFamily: 'var(--font-dm-sans)' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid rgb(220, 222, 226)',
        padding: 24,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {children}
    </div>
  )
}

function ContinueBtn({ onClick, disabled, label = 'Continue' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '16px',
        borderRadius: 8,
        border: 'none',
        background: disabled ? 'rgb(200, 204, 215)' : '#3b60f3',
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 600,
        fontFamily: 'var(--font-dm-sans)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginTop: 16,
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function StyledTextInput({ value, onChange, placeholder, type = 'text', label, required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; label: string; required?: boolean
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 8,
          border: '1px solid rgb(220, 222, 226)',
          fontSize: 15,
          fontFamily: 'var(--font-dm-sans)',
          color: 'rgb(30,30,30)',
          outline: 'none',
          background: '#ffffff',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#3b60f3'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgb(220, 222, 226)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

// Step 1 — State (locked to FL)
function Step1State({ onNext }: { onNext: () => void }) {
  return (
    <>
      <StepHeading title="First, what state are you starting your business in?" />
      <FormCard>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
          State
        </label>
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 8,
            border: '1px solid rgb(220, 222, 226)',
            background: 'rgb(247,248,250)',
            fontSize: 15,
            color: 'rgb(60,60,60)',
            fontFamily: 'var(--font-dm-sans)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Florida</span>
          <span
            style={{
              fontSize: 11,
              background: '#3b60f3',
              color: '#fff',
              borderRadius: 4,
              padding: '2px 7px',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            FL
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'rgb(130,130,130)', marginTop: 8, fontFamily: 'var(--font-dm-sans)' }}>
          We currently serve Florida LLCs. More states coming soon.
        </p>
        <ContinueBtn onClick={onNext} />
      </FormCard>
    </>
  )
}

// Step 2 — Business name
function Step2BusinessName({
  value, onChange, nameCheck, onCheckName, onNext,
}: {
  value: string
  onChange: (v: string) => void
  nameCheck: { available: NameAvailability; checking: boolean } | null
  onCheckName: () => void
  onNext: () => void
}) {
  return (
    <>
      <StepHeading title="And what is the name of your business?" />
      <FormCard>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
          Company name *
        </label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Sunshine Ventures LLC"
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid rgb(220, 222, 226)',
              fontSize: 15,
              fontFamily: 'var(--font-dm-sans)',
              color: 'rgb(30,30,30)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b60f3'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgb(220, 222, 226)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <button
            type="button"
            onClick={onCheckName}
            disabled={!value.trim() || nameCheck?.checking}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid rgb(220,222,226)',
              background: '#ffffff',
              color: '#3b60f3',
              fontSize: 13,
              fontWeight: 600,
              cursor: !value.trim() || nameCheck?.checking ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-dm-sans)',
              opacity: !value.trim() ? 0.5 : 1,
              flexShrink: 0,
            }}
          >
            {nameCheck?.checking ? <Loader2 size={14} className="animate-spin" /> : 'Check availability'}
          </button>
        </div>
        {nameCheck && !nameCheck.checking && <NameBadge available={nameCheck.available} />}
        <ContinueBtn onClick={onNext} disabled={!value.trim()} />
      </FormCard>
    </>
  )
}

// Step 3 — Contact info
function Step3Contact({
  firstName, lastName, email, phone, onChange, onNext,
}: {
  firstName: string; lastName: string; email: string; phone: string
  onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void
  onNext: () => void
}) {
  const valid = firstName.trim() && lastName.trim() && email.includes('@')
  return (
    <>
      <StepHeading
        title="Who is the main contact for this new business?"
        subtitle="This is who we'll contact if more info is needed during the filing process."
      />
      <FormCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <StyledTextInput label="First name" value={firstName} onChange={(v) => onChange('firstName', v)} placeholder="Jane" required />
          <StyledTextInput label="Last name" value={lastName} onChange={(v) => onChange('lastName', v)} placeholder="Smith" required />
        </div>
        <StyledTextInput label="Email" type="email" value={email} onChange={(v) => onChange('email', v)} placeholder="jane@example.com" required />
        <StyledTextInput label="Phone" type="tel" value={phone} onChange={(v) => onChange('phone', v)} placeholder="+1 (555) 000-0000" />
        <p style={{ fontSize: 12, color: 'rgb(130,130,130)', lineHeight: 1.5, fontFamily: 'var(--font-dm-sans)', marginTop: -4 }}>
          By providing my phone number, I consent to receive calls and texts regarding my filing.
        </p>
        <ContinueBtn onClick={onNext} disabled={!valid} />
      </FormCard>
    </>
  )
}

// Step 4 — Experience
function Step4Experience({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  const options = [
    { id: 'none', label: 'None' },
    { id: 'some', label: 'From 0 to 5 years' },
    { id: 'experienced', label: 'More than 5 years' },
  ]
  return (
    <>
      <StepHeading title="How much business experience do you have?" />
      <FormCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map((opt) => (
            <OptionCard key={opt.id} selected={value === opt.id} onClick={() => onChange(opt.id)}>
              {opt.label}
            </OptionCard>
          ))}
        </div>
        <ContinueBtn onClick={onNext} disabled={!value} label="Next" />
      </FormCard>
    </>
  )
}

// Step 5 — Timeline / effective date
function Step5Timeline({ value, effectiveDate, onChange, onDateChange, onNext }: {
  value: string; effectiveDate: string
  onChange: (v: string) => void; onDateChange: (v: string) => void; onNext: () => void
}) {
  const options = [
    { id: 'future', label: 'We plan to launch in the future' },
    { id: 'soon', label: 'Business launch is coming soon (1-2 months)' },
    { id: 'immediate', label: "We're already making money" },
  ]
  // map to effectiveType: future=future, soon=immediate (near-term), immediate=immediate
  const effectiveMap: Record<string, 'immediate' | 'future'> = {
    future: 'future',
    soon: 'immediate',
    immediate: 'immediate',
  }

  function handleSelect(id: string) {
    onChange(effectiveMap[id] ?? 'immediate')
  }

  const displayValue = value === 'future' ? 'future' : value === 'immediate' && effectiveDate ? 'immediate' : 'soon'

  return (
    <>
      <StepHeading title="How long have you had your business?" />
      <FormCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map((opt) => (
            <OptionCard key={opt.id} selected={displayValue === opt.id} onClick={() => handleSelect(opt.id)}>
              {opt.label}
            </OptionCard>
          ))}
        </div>
        {value === 'future' && (
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
              Effective date (optional)
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => onDateChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid rgb(220,222,226)',
                fontSize: 15,
                fontFamily: 'var(--font-dm-sans)',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}
        <ContinueBtn onClick={onNext} disabled={!value} label="Next" />
      </FormCard>
    </>
  )
}

// Step 6 — Industry
function Step6Industry({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <>
      <StepHeading
        title="What type of business are you planning to start?"
        subtitle="Pick a category for your business. If you don't see your industry, try another keyword or select 'Other'."
      />
      <FormCard>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
          Enter your industry *
        </label>
        <SearchableCombobox
          options={INDUSTRY_OPTIONS}
          value={value}
          onChange={onChange}
          placeholder="Select your industry"
        />
        <ContinueBtn onClick={onNext} disabled={!value} label="Next" />
      </FormCard>
    </>
  )
}

// Step 7 — Registered Agent
function Step7RegisteredAgent({
  useCompassRA, raName, raAddress, onSelect, onCustomRA,
}: {
  useCompassRA: boolean; raName: string; raAddress: string
  onSelect: (useCompass: boolean) => void
  onCustomRA: (name: string, address: string) => void
}) {
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState(raName === COMPASS_RA_NAME ? '' : raName)
  const [customAddress, setCustomAddress] = useState(raAddress === COMPASS_RA_ADDRESS ? '' : raAddress)

  const bullets = [
    'This is an official address where someone is appointed to receive documents from the Secretary of State.',
    'All important documents will be delivered to you digitally.',
    "You won't be charged until your business is formed.",
  ]

  return (
    <>
      <StepHeading
        title="Appoint your state-required Registered Agent"
        subtitle="It's a state requirement in Florida to appoint a Registered Agent when you make your business official."
      />
      <FormCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(30,30,30)', fontFamily: 'var(--font-dm-sans)' }}>Registered Agent</span>
          <span style={{ fontSize: 11, background: '#fff3cd', color: '#856404', borderRadius: 4, padding: '2px 8px', fontWeight: 600, fontFamily: 'var(--font-dm-sans)' }}>
            State requirement
          </span>
        </div>

        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgb(80,80,80)', marginBottom: 10, fontFamily: 'var(--font-dm-sans)' }}>What to know</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgb(240,244,255)', border: '1px solid rgb(210,220,248)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>
                {['🏛️', '📬', '🛡️'][i]}
              </div>
              <p style={{ fontSize: 13, color: 'rgb(60,60,60)', lineHeight: 1.55, fontFamily: 'var(--font-dm-sans)' }}>{b}</p>
            </div>
          ))}
        </div>

        {!showCustom ? (
          <>
            <button
              type="button"
              onClick={() => onSelect(true)}
              style={{ width: '100%', padding: '16px', borderRadius: 8, border: 'none', background: '#3b60f3', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', marginBottom: 12 }}
            >
              Appoint Compass
            </button>
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: 'rgb(100,100,100)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', textDecoration: 'underline' }}
            >
              I&apos;ll appoint someone else
            </button>
            <p style={{ fontSize: 12, color: 'rgb(130,130,130)', textAlign: 'center', marginTop: 8, fontFamily: 'var(--font-dm-sans)' }}>
              You&apos;ll be charged ${RA_FEE}/yr as a registered agent fee, billed yearly after formation.
            </p>
          </>
        ) : (
          <>
            <StyledTextInput label="Registered Agent Name" value={customName} onChange={setCustomName} placeholder="Full legal name or company" />
            <StyledTextInput label="Registered Agent Address (FL street address)" value={customAddress} onChange={setCustomAddress} placeholder="123 Main St, City, FL 00000" />
            <button
              type="button"
              onClick={() => {
                onCustomRA(customName, customAddress)
                onSelect(false)
              }}
              disabled={!customName.trim() || !customAddress.trim()}
              style={{ width: '100%', padding: '16px', borderRadius: 8, border: 'none', background: !customName.trim() || !customAddress.trim() ? 'rgb(200,204,215)' : '#3b60f3', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', marginTop: 8 }}
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: 'rgb(100,100,100)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', textDecoration: 'underline', marginTop: 4 }}
            >
              ← Back to Appoint Compass
            </button>
          </>
        )}
      </FormCard>
    </>
  )
}

// Step 8 — Plan selection (full width)
function Step8Plans({ onSelect }: { onSelect: (planId: string) => void }) {
  return (
    <>
      <StepHeading title="Compare and select a package" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: plan.popular ? '#3b60f3' : '#ffffff',
              borderRadius: 14,
              border: plan.popular ? '2px solid #3b60f3' : '1px solid rgb(220,222,226)',
              padding: 32,
              position: 'relative',
              boxShadow: plan.popular ? '0 12px 32px rgba(59,96,243,0.22)' : '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: -14, right: 20, background: '#ffffff', color: '#3b60f3', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, border: '1px solid #3b60f3', fontFamily: 'var(--font-dm-sans)' }}>
                Most popular
              </div>
            )}
            <p style={{ fontSize: 18, fontWeight: 700, color: plan.popular ? '#ffffff' : 'rgb(20,20,20)', marginBottom: 8, fontFamily: 'var(--font-dm-sans)' }}>
              {plan.name}
            </p>
            <p style={{ fontSize: 38, fontWeight: 700, color: plan.popular ? '#ffffff' : 'rgb(20,20,20)', marginBottom: 2, fontFamily: 'var(--font-dm-sans)', lineHeight: 1 }}>
              ${plan.price}<span style={{ fontSize: 16, fontWeight: 400, opacity: 0.8 }}>/year</span>
            </p>
            <p style={{ fontSize: 13, color: plan.popular ? 'rgba(255,255,255,0.75)' : 'rgb(130,130,130)', marginBottom: 24, marginTop: 4, fontFamily: 'var(--font-dm-sans)' }}>
              + state filing fee
            </p>
            <button
              type="button"
              onClick={() => onSelect(plan.id)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 9,
                border: plan.popular ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid #3b60f3',
                background: plan.popular ? 'rgba(255,255,255,0.18)' : '#3b60f3',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-dm-sans)',
                marginBottom: 24,
              }}
            >
              Get Started
            </button>
            <p style={{ fontSize: 13, fontWeight: 600, color: plan.popular ? 'rgba(255,255,255,0.85)' : 'rgb(60,60,60)', marginBottom: 12, fontFamily: 'var(--font-dm-sans)' }}>
              What is included:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {plan.features.map((f) => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <rect width="16" height="16" rx="4" fill={plan.popular ? 'rgba(255,255,255,0.25)' : 'rgb(235,240,255)'} />
                    <path d="M4 8l3 3 5-5" stroke={plan.popular ? '#ffffff' : '#3b60f3'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 14, color: plan.popular ? 'rgba(255,255,255,0.9)' : 'rgb(60,60,60)', lineHeight: 1.55, fontFamily: 'var(--font-dm-sans)' }}>
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 16, fontSize: 11, color: 'rgb(140,140,140)', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.5 }}>
        *Processing times are based on receiving complete information. Compass processing times do not include Secretary of State processing times, which can vary.
      </p>
    </>
  )
}

// Name availability badge
function NameBadge({ available }: { available: NameAvailability }) {
  if (available === 'available') {
    return (
      <p className="flex items-center gap-1 text-xs text-green-700 mt-1.5">
        <CheckCircle2 size={12} /> Name looks available
      </p>
    )
  }
  if (available === 'taken') {
    return (
      <p className="flex items-center gap-1 text-xs text-red-600 mt-1.5">
        <XCircle size={12} /> Name already taken — try a different name
      </p>
    )
  }
  if (available === 'likely') {
    return (
      <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: 'rgb(133,100,4)' }}>
        <AlertCircle size={12} /> Similar names exist — we&apos;ll verify on Sunbiz when filing
      </p>
    )
  }
  return <p className="text-xs text-gray-500 mt-1.5">Could not reach Sunbiz — we&apos;ll verify when filing</p>
}
