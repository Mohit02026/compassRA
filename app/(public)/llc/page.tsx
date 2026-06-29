'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, XCircle, AlertCircle, Lock } from 'lucide-react'
import type { NameAvailability } from '@/services/nameSearch'
import IntakeLayout from '@/components/public/IntakeLayout'
import OptionCard from '@/components/public/OptionCard'
import SearchableCombobox from '@/components/public/SearchableCombobox'
import PanelUSMap from '@/components/public/intake-panels/PanelUSMap'
import PanelCertificate from '@/components/public/intake-panels/PanelCertificate'
import PanelBusinessNamePreview from '@/components/public/intake-panels/PanelBusinessNamePreview'
import PanelContactCard from '@/components/public/intake-panels/PanelContactCard'
import PanelBubbleChart from '@/components/public/intake-panels/PanelBubbleChart'
import PanelCalendar from '@/components/public/intake-panels/PanelCalendar'
import PanelIndustryGauge from '@/components/public/intake-panels/PanelIndustryGauge'
import PanelRAInfo from '@/components/public/intake-panels/PanelRAInfo'

const COMPASS_RA_ADDRESS = '625 Court St Ste 100, Clearwater, FL 33756'
const COMPASS_RA_NAME = 'Compass Registered Agent, LLC'
const STATE_FEE = 138.75
const RA_FEE = 199

// EIN constants (IRS SS-4 categories — distinct from LLC industry list)
const EIN_BUSINESS_ACTIVITIES = [
  { value: 'construction',       label: 'Construction' },
  { value: 'real-estate',        label: 'Real estate' },
  { value: 'rental-leasing',     label: 'Rental & leasing' },
  { value: 'manufacturing',      label: 'Manufacturing' },
  { value: 'transportation',     label: 'Transportation & warehousing' },
  { value: 'finance-insurance',  label: 'Finance & insurance' },
  { value: 'healthcare',         label: 'Health care & social assistance' },
  { value: 'food-accommodation', label: 'Accommodation & food services' },
  { value: 'wholesale-agent',    label: 'Wholesale — agent/broker' },
  { value: 'wholesale-other',    label: 'Wholesale — other' },
  { value: 'retail',             label: 'Retail' },
  { value: 'other',              label: 'Other (describe below)' },
]

const EIN_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

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

const US_STATES_LIST = [
  { abbr: 'AL', name: 'Alabama' }, { abbr: 'AK', name: 'Alaska' }, { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' }, { abbr: 'CA', name: 'California' }, { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' }, { abbr: 'DE', name: 'Delaware' }, { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' }, { abbr: 'HI', name: 'Hawaii' }, { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' }, { abbr: 'IN', name: 'Indiana' }, { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' }, { abbr: 'KY', name: 'Kentucky' }, { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' }, { abbr: 'MD', name: 'Maryland' }, { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' }, { abbr: 'MN', name: 'Minnesota' }, { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' }, { abbr: 'MT', name: 'Montana' }, { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' }, { abbr: 'NH', name: 'New Hampshire' }, { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' }, { abbr: 'NY', name: 'New York' }, { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' }, { abbr: 'OH', name: 'Ohio' }, { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' }, { abbr: 'PA', name: 'Pennsylvania' }, { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' }, { abbr: 'SD', name: 'South Dakota' }, { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' }, { abbr: 'UT', name: 'Utah' }, { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' }, { abbr: 'WA', name: 'Washington' }, { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' }, { abbr: 'WY', name: 'Wyoming' },
]

interface FormState {
  state: string
  businessName: string
  firstName: string
  lastName: string
  email: string
  phone: string
  experience: string
  effectiveType: 'immediate' | 'future' | 'soon'
  effectiveDate: string
  industry: string
  useCompassRA: boolean
  raName: string
  raAddress: string
  tier: string
  // EIN fields — only collected when Enterprise plan is selected
  einTradeName: string
  einMailingStreet: string
  einMailingCity: string
  einMailingZip: string
  einCounty: string
  einMailingHint: string          // read-only hint from Sunbiz, not submitted
  einBusinessActivity: string
  einBusinessActivityOther: string
  einApplyReason: string
  einClosingMonth: string
  einProductService: string
  einHasEmployees: boolean | null
  einEmployeesAgricultural: string
  einEmployeesHousehold: string
  einEmployeesOther: string
  einWants944: boolean
  einFirstWagesDate: string
  einPreviousEin: boolean
  einIsUsCitizen: boolean
  einTaxIdType: 'ssn' | 'itin'
  einTaxId: string
}

const defaultForm: FormState = {
  state: '',
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
  einTradeName: '',
  einMailingStreet: '',
  einMailingCity: '',
  einMailingZip: '',
  einCounty: '',
  einMailingHint: '',
  einBusinessActivity: '',
  einBusinessActivityOther: '',
  einApplyReason: 'new-business',
  einClosingMonth: 'December',
  einProductService: '',
  einHasEmployees: null,
  einEmployeesAgricultural: '0',
  einEmployeesHousehold: '0',
  einEmployeesOther: '0',
  einWants944: false,
  einFirstWagesDate: '',
  einPreviousEin: false,
  einIsUsCitizen: true,
  einTaxIdType: 'ssn',
  einTaxId: '',
}

export default function LLCFormationPage() {
  const [initialName, setInitialName] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setInitialName(params.get('name') ?? '')
  }, [])

  return <LLCWizard initialName={initialName} />
}

function LLCWizard({ initialName }: { initialName: string }) {
  const [step, setStep] = useState(1)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [form, setForm] = useState<FormState>({
    ...defaultForm,
    businessName: initialName,
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

    const hasAnyEinEmployees =
      Number(form.einEmployeesAgricultural) > 0 ||
      Number(form.einEmployeesHousehold) > 0 ||
      Number(form.einEmployeesOther) > 0

    const einActivityLabel =
      form.einBusinessActivity === 'other'
        ? (form.einBusinessActivityOther ? `Other: ${form.einBusinessActivityOther}` : 'Other')
        : EIN_BUSINESS_ACTIVITIES.find((a) => a.value === form.einBusinessActivity)?.label ?? form.einBusinessActivity

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
      sourceHref: '/llc',
      summary: `LLC Formation — ${form.businessName}`,
      lineItems: [
        { label: `${plan.name}`, amount: plan.price },
        { label: 'Florida state fee', amount: STATE_FEE },
        ...(form.useCompassRA ? [{ label: 'Registered Agent (billed after formation)', amount: 0 }] : []),
      ],
      // EIN fields — only present when Enterprise plan is selected
      ...(plan.includesEin ? {
        einLlcName: form.businessName,
        einTradeName: form.einTradeName,
        einMailingStreet: form.einMailingStreet,
        einMailingCity: form.einMailingCity,
        einMailingState: form.state,
        einMailingZip: form.einMailingZip,
        einCounty: form.einCounty,
        einResponsiblePartyFirstName: form.firstName,
        einResponsiblePartyLastName: form.lastName,
        einContactEmail: form.email,
        einDateStarted: form.effectiveDate || form.effectiveType,
        einMemberCount: '1',
        einBusinessActivity: form.einBusinessActivity,
        einBusinessActivityOther: form.einBusinessActivityOther,
        einBusinessPurpose: einActivityLabel,
        einApplyReason: form.einApplyReason,
        einClosingMonth: form.einClosingMonth,
        einProductService: form.einProductService,
        einEmployeesAgricultural: form.einEmployeesAgricultural,
        einEmployeesHousehold: form.einEmployeesHousehold,
        einEmployeesOther: form.einEmployeesOther,
        einWants944: form.einWants944,
        einFirstWagesDate: hasAnyEinEmployees ? form.einFirstWagesDate : '',
        einPreviousEin: form.einPreviousEin,
        einIsUsCitizen: form.einIsUsCitizen,
        einTaxIdType: form.einTaxIdType,
        einTaxId: form.einTaxId,
      } : {}),
    }

    sessionStorage.setItem('checkoutPayload', JSON.stringify(payload))
    window.location.href = '/checkout'
  }

  // Right panel per step
  const panels: Record<number, React.ReactNode> = {
    1: <PanelUSMap selectedState={form.state} />,
    2: <PanelBusinessNamePreview businessName={form.businessName} />,
    3: <PanelContactCard firstName={form.firstName} lastName={form.lastName} email={form.email} phone={form.phone} />,
    4: <PanelBubbleChart experience={form.experience} />,
    5: <PanelCalendar timeline={form.effectiveType === 'future' ? 'future' : form.effectiveType === 'immediate' ? 'active' : 'soon'} />,
    6: <PanelIndustryGauge industry={form.industry} />,
    7: <PanelRAInfo />,
    // EIN steps — reuse panels with EIN-specific data
    9:  <PanelUSMap selectedState={form.state} />,
    10: <PanelIndustryGauge industry={form.einBusinessActivity} />,
    11: <PanelCalendar timeline="active" />,
    12: <PanelContactCard firstName={form.firstName} lastName={form.lastName} email={form.email} phone="" />,
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
      wide={step === 8 || step === 13}
    >
      {step === 1 && <Step1State state={form.state} onStateChange={(v) => set('state', v)} onNext={() => setStep(2)} />}
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
        <Step8Plans onSelect={(planId) => {
          const plan = PLANS.find((p) => p.id === planId)
          if (plan?.includesEin) {
            setSelectedPlanId(planId)
            setStep(9)
          } else {
            handleProceedToCheckout(planId)
          }
        }} />
      )}
      {step === 9 && (
        <Step9EINAddress
          tradeName={form.einTradeName}
          mailingStreet={form.einMailingStreet}
          mailingCity={form.einMailingCity}
          mailingZip={form.einMailingZip}
          county={form.einCounty}
          mailingHint={form.einMailingHint}
          onChange={set}
          onNext={() => setStep(10)}
        />
      )}
      {step === 10 && (
        <Step10EINBusiness
          businessActivity={form.einBusinessActivity}
          businessActivityOther={form.einBusinessActivityOther}
          applyReason={form.einApplyReason}
          closingMonth={form.einClosingMonth}
          productService={form.einProductService}
          onChange={set}
          onNext={() => setStep(11)}
        />
      )}
      {step === 11 && (
        <Step11EINEmployees
          hasEmployees={form.einHasEmployees}
          employeesAgricultural={form.einEmployeesAgricultural}
          employeesHousehold={form.einEmployeesHousehold}
          employeesOther={form.einEmployeesOther}
          firstWagesDate={form.einFirstWagesDate}
          wants944={form.einWants944}
          previousEin={form.einPreviousEin}
          onChange={set}
          onNext={() => setStep(12)}
        />
      )}
      {step === 12 && (
        <Step12EINIdentity
          isUsCitizen={form.einIsUsCitizen}
          taxIdType={form.einTaxIdType}
          taxId={form.einTaxId}
          onChange={set}
          onNext={() => setStep(13)}
        />
      )}
      {step === 13 && (
        <Step13EINReview
          form={form}
          selectedPlanId={selectedPlanId}
          onProceed={() => handleProceedToCheckout(selectedPlanId)}
        />
      )}
    </IntakeLayout>
  )
}

// ─── Step components ────────────────────────────────────────────────────────

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 40 }}>
      <h1
        style={{
          fontSize: 48,
          fontWeight: 600,
          color: 'rgb(23, 23, 23)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          margin: 0,
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
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
    <div
      style={{
        background: '#ffffff',
        borderRadius: 24,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
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
      className="intake-continue-btn"
      style={{
        width: '100%',
        padding: '14px 24px',
        borderRadius: 8,
        border: disabled ? '1px solid rgba(59,96,243,0.2)' : '1px solid rgb(59,96,243)',
        background: disabled ? 'rgb(248,249,252)' : 'rgb(59,96,243)',
        color: disabled ? 'rgba(59,96,243,0.45)' : 'rgb(255,255,255)',
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1,
        fontFamily: 'var(--font-dm-sans)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
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
          padding: '15px 16px',
          borderRadius: 8,
          border: '1px solid rgb(224, 224, 224)',
          fontSize: 16,
          fontFamily: 'var(--font-dm-sans)',
          color: 'rgb(23,23,23)',
          outline: 'none',
          background: '#ffffff',
          boxSizing: 'border-box',
          transition: 'border-color 0.5s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#3b60f3'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgb(224, 224, 224)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

// Step 1 — State selection
function Step1State({ state, onStateChange, onNext }: { state: string; onStateChange: (v: string) => void; onNext: () => void }) {
  return (
    <>
      <StepHeading title="First, what state are you starting your business in?" subtitle="This is where your business will be located." />
      <FormCard>
        <div style={{ position: 'relative' }}>
          <select
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 44px 14px 16px',
              borderRadius: 8,
              border: '1px solid rgb(220, 222, 226)',
              fontSize: 16,
              fontFamily: 'var(--font-dm-sans)',
              color: state ? 'rgb(30,30,30)' : 'rgb(130,130,130)',
              background: '#ffffff',
              appearance: 'none',
              cursor: 'pointer',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b60f3'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgb(220, 222, 226)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <option value="" disabled>Select your state *</option>
            {US_STATES_LIST.map((s) => (
              <option key={s.abbr} value={s.abbr}>{s.name}</option>
            ))}
          </select>
          <svg
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(100,100,100)" strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        <ContinueBtn onClick={onNext} disabled={!state} />
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
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0

  return (
    <>
      <StepHeading title="And what is the name of your business?" subtitle="We'll check to make sure your business name is available before we file your documentation." />
      <FormCard>
        {/* Floating label input */}
        <div style={{ position: 'relative', marginBottom: 4 }}>
          <label
            style={{
              position: 'absolute',
              left: 16,
              top: floated ? 8 : 17,
              fontSize: floated ? 11 : 16,
              fontWeight: 400,
              color: focused ? 'rgb(59,96,243)' : floated ? 'rgb(120,120,120)' : 'rgb(178,178,178)',
              fontFamily: 'var(--font-dm-sans)',
              lineHeight: 1,
              pointerEvents: 'none',
              zIndex: 1,
              backgroundColor: 'rgb(255,255,255)',
              paddingLeft: 2,
              paddingRight: 4,
              transition: 'top 0.3s ease, font-size 0.3s ease, color 0.3s ease',
            }}
          >
            Company name
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              padding: '24px 16px 10px 16px',
              borderRadius: 8,
              border: focused ? '1px solid #3b60f3' : '1px solid rgb(224,224,224)',
              fontSize: 16,
              fontFamily: 'var(--font-dm-sans)',
              color: 'rgb(23,23,23)',
              outline: 'none',
              background: 'rgb(255,255,255)',
              boxSizing: 'border-box',
              boxShadow: focused ? '0 0 0 3px rgba(59,96,243,0.12)' : 'none',
              transition: 'border-color 0.5s ease, box-shadow 0.3s ease',
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>

        {/* Check availability — secondary text link below input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 20, marginBottom: 4 }}>
          <button
            type="button"
            onClick={onCheckName}
            disabled={!value.trim() || nameCheck?.checking}
            style={{
              padding: 0,
              border: 'none',
              background: 'none',
              color: value.trim() ? '#3b60f3' : 'rgb(178,178,178)',
              fontSize: 13,
              fontWeight: 500,
              cursor: !value.trim() || nameCheck?.checking ? 'default' : 'pointer',
              fontFamily: 'var(--font-dm-sans)',
              textDecoration: value.trim() ? 'underline' : 'none',
              opacity: !value.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {nameCheck?.checking ? <><Loader2 size={12} className="animate-spin" /> Checking…</> : 'Check name availability'}
          </button>
          {nameCheck && !nameCheck.checking && <NameBadge available={nameCheck.available} />}
        </div>

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
        <ContinueBtn onClick={onNext} disabled={!valid} />
        <p style={{ fontSize: 12, color: 'rgb(130,130,130)', lineHeight: 1.5, fontFamily: 'var(--font-dm-sans)', margin: 0 }}>
          By providing my phone number, I consent to receive calls and texts from Compass.
        </p>
        {/* Security card — matches reference step-card-info_style_green */}
        <div style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          background: 'rgb(240,253,244)',
          border: '1px solid rgb(187,247,208)',
          borderRadius: 16,
          padding: '16px 20px',
        }}>
          <div style={{
            flexShrink: 0,
            width: 64,
            height: 64,
            borderRadius: 12,
            background: 'rgb(220,252,231)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L8 10v12c0 10.5 7 20.3 16 22.7C33 42.3 40 32.5 40 22V10L24 4Z" fill="rgb(187,247,208)" stroke="rgb(34,197,94)" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="24" cy="20" r="5" stroke="rgb(22,163,74)" strokeWidth="2" />
              <path d="M14 35c0-5.523 4.477-8 10-8s10 2.477 10 8" stroke="rgb(22,163,74)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgb(21,128,61)', fontFamily: 'var(--font-dm-sans)', marginBottom: 4 }}>
              Your information is secure
            </p>
            <p style={{ fontSize: 13, color: 'rgb(22,101,52)', lineHeight: 1.55, fontFamily: 'var(--font-dm-sans)' }}>
              We never give these details to other organizations<br />except for filing purposes.
            </p>
          </div>
        </div>
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
  function handleSelect(id: string) {
    onChange(id)
  }

  return (
    <>
      <StepHeading title="How long have you had your business?" />
      <FormCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map((opt) => (
            <OptionCard key={opt.id} selected={value === opt.id} onClick={() => handleSelect(opt.id)}>
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
              className="intake-continue-btn"
              style={{ width: '100%', padding: '14px 24px', borderRadius: 8, border: !customName.trim() || !customAddress.trim() ? '1px solid rgba(59,96,243,0.2)' : '1px solid rgb(59,96,243)', background: !customName.trim() || !customAddress.trim() ? 'rgb(248,249,252)' : 'rgb(59,96,243)', color: !customName.trim() || !customAddress.trim() ? 'rgba(59,96,243,0.45)' : 'rgb(255,255,255)', fontSize: 16, fontWeight: 600, lineHeight: 1, cursor: !customName.trim() || !customAddress.trim() ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-dm-sans)', marginTop: 8, transition: 'background-color 0.3s, color 0.3s, border-color 0.3s' }}
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

// ─── EIN Steps (9–13) — only reached when Enterprise plan is selected ─────────

function StyledSelectInput({ value, onChange, label, required, children }: {
  value: string; onChange: (v: string) => void; label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
        {label}{required && ' *'}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={value} onChange={(e) => onChange(e.target.value)} required={required}
          style={{ width: '100%', padding: '15px 44px 15px 16px', borderRadius: 8, border: '1px solid rgb(224,224,224)', fontSize: 16, fontFamily: 'var(--font-dm-sans)', color: value ? 'rgb(23,23,23)' : 'rgb(130,130,130)', background: '#ffffff', appearance: 'none', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3b60f3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgb(224,224,224)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          {children}
        </select>
        <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(100,100,100)" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  )
}

// Step 9 — EIN mailing address
function Step9EINAddress({
  tradeName, mailingStreet, mailingCity, mailingZip, county, mailingHint, onChange, onNext,
}: {
  tradeName: string; mailingStreet: string; mailingCity: string; mailingZip: string
  county: string; mailingHint: string
  onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void
  onNext: () => void
}) {
  const valid = mailingStreet.trim() && mailingCity.trim() && mailingZip.trim() && county.trim()
  return (
    <>
      <StepHeading
        title="Where does the LLC receive mail?"
        subtitle="The IRS will send your EIN confirmation to this address."
      />
      <FormCard>
        <StyledTextInput
          label="Trade name / DBA (optional)"
          value={tradeName}
          onChange={(v) => onChange('einTradeName', v)}
          placeholder="Leave blank if same as LLC name"
        />
        {mailingHint && (
          <div style={{ background: 'rgb(240,249,255)', border: '1px solid rgb(186,230,253)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'rgb(12,74,110)', fontFamily: 'var(--font-dm-sans)' }}>
            Found on Sunbiz: <span style={{ fontWeight: 500 }}>{mailingHint}</span> — confirm or edit below.
          </div>
        )}
        <StyledTextInput
          label="Street address *"
          value={mailingStreet}
          onChange={(v) => onChange('einMailingStreet', v)}
          placeholder="123 Main St"
          required
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12 }}>
          <StyledTextInput label="City *" value={mailingCity} onChange={(v) => onChange('einMailingCity', v)} placeholder="Miami" required />
          <StyledTextInput label="ZIP *" value={mailingZip} onChange={(v) => onChange('einMailingZip', v.slice(0, 10))} placeholder="33101" required />
        </div>
        <StyledTextInput label="County *" value={county} onChange={(v) => onChange('einCounty', v)} placeholder="e.g. Miami-Dade" required />
        <ContinueBtn onClick={onNext} disabled={!valid} />
      </FormCard>
    </>
  )
}

// Step 10 — EIN business details
function Step10EINBusiness({
  businessActivity, businessActivityOther, applyReason, closingMonth, productService, onChange, onNext,
}: {
  businessActivity: string; businessActivityOther: string; applyReason: string
  closingMonth: string; productService: string
  onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void
  onNext: () => void
}) {
  const valid = businessActivity && (businessActivity !== 'other' || businessActivityOther.trim()) && productService.trim()
  return (
    <>
      <StepHeading
        title="Tell us about the business"
        subtitle="These details go onto your IRS SS-4 form."
      />
      <FormCard>
        <StyledSelectInput label="Principal business activity *" value={businessActivity} onChange={(v) => onChange('einBusinessActivity', v)} required>
          <option value="">— Select category —</option>
          {EIN_BUSINESS_ACTIVITIES.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </StyledSelectInput>
        {businessActivity === 'other' && (
          <StyledTextInput
            label="Describe your activity *"
            value={businessActivityOther}
            onChange={(v) => onChange('einBusinessActivityOther', v.slice(0, 50))}
            placeholder="e.g. Online consulting services"
            required
          />
        )}
        <StyledTextInput
          label="What does the business make, sell, or do? *"
          value={productService}
          onChange={(v) => onChange('einProductService', v.slice(0, 50))}
          placeholder="e.g. Consulting services to small businesses"
          required
        />
        <StyledSelectInput label="Reason for applying" value={applyReason} onChange={(v) => onChange('einApplyReason', v)}>
          <option value="new-business">Started new business</option>
          <option value="hired-employees">Hired employees</option>
          <option value="banking">Banking purposes</option>
          <option value="changed-organization">Changed type of organization</option>
          <option value="purchased-business">Purchased going business</option>
          <option value="irs-withholding">IRS withholding regulations</option>
          <option value="other">Other</option>
        </StyledSelectInput>
        <StyledSelectInput label="Fiscal year end month" value={closingMonth} onChange={(v) => onChange('einClosingMonth', v)}>
          {EIN_MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </StyledSelectInput>
        <ContinueBtn onClick={onNext} disabled={!valid} />
      </FormCard>
    </>
  )
}

// Step 11 — EIN employees
function Step11EINEmployees({
  hasEmployees, employeesAgricultural, employeesHousehold, employeesOther,
  firstWagesDate, wants944, previousEin, onChange, onNext,
}: {
  hasEmployees: boolean | null
  employeesAgricultural: string; employeesHousehold: string; employeesOther: string
  firstWagesDate: string; wants944: boolean; previousEin: boolean
  onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void
  onNext: () => void
}) {
  const hasAny = Number(employeesAgricultural) > 0 || Number(employeesHousehold) > 0 || Number(employeesOther) > 0
  const valid = hasEmployees !== null && (!hasAny || !!firstWagesDate)
  return (
    <>
      <StepHeading
        title="Do you plan to hire employees?"
        subtitle="This helps the IRS know whether payroll taxes apply to your LLC."
      />
      <FormCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <OptionCard selected={hasEmployees === true} onClick={() => {
            onChange('einHasEmployees', true)
          }}>Yes</OptionCard>
          <OptionCard selected={hasEmployees === false} onClick={() => {
            onChange('einHasEmployees', false)
            onChange('einEmployeesAgricultural', '0')
            onChange('einEmployeesHousehold', '0')
            onChange('einEmployeesOther', '0')
            onChange('einFirstWagesDate', '')
            onChange('einWants944', false)
          }}>No</OptionCard>
        </div>
        {hasEmployees && (
          <>
            <p style={{ fontSize: 13, color: 'rgb(80,80,80)', fontFamily: 'var(--font-dm-sans)', marginTop: 8 }}>
              Enter expected headcount per category (0 if none).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <StyledTextInput label="Agricultural" type="number" value={employeesAgricultural} onChange={(v) => onChange('einEmployeesAgricultural', v)} placeholder="0" />
              <StyledTextInput label="Household" type="number" value={employeesHousehold} onChange={(v) => onChange('einEmployeesHousehold', v)} placeholder="0" />
              <StyledTextInput label="Other" type="number" value={employeesOther} onChange={(v) => onChange('einEmployeesOther', v)} placeholder="0" />
            </div>
            {hasAny && (
              <StyledTextInput label="First date wages will be paid *" type="date" value={firstWagesDate} onChange={(v) => onChange('einFirstWagesDate', v)} required />
            )}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={wants944} onChange={(e) => onChange('einWants944', e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'rgb(60,60,60)', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.5 }}>
                File employment taxes annually (Form 944) — for annual payroll tax liability ≤ $1,000
              </span>
            </label>
          </>
        )}
        <div style={{ borderTop: '1px solid rgb(230,230,230)', paddingTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={previousEin} onChange={(e) => onChange('einPreviousEin', e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgb(60,60,60)', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.5 }}>
              This LLC previously had an EIN (cancelled or abandoned)
            </span>
          </label>
        </div>
        <ContinueBtn onClick={onNext} disabled={!valid} />
      </FormCard>
    </>
  )
}

// Step 12 — EIN identity / tax ID
function Step12EINIdentity({
  isUsCitizen, taxIdType, taxId, onChange, onNext,
}: {
  isUsCitizen: boolean; taxIdType: 'ssn' | 'itin'; taxId: string
  onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void
  onNext: () => void
}) {
  const valid = !isUsCitizen || taxId.trim().length > 0
  return (
    <>
      <StepHeading
        title="One last thing — your tax ID"
        subtitle="The IRS requires the responsible party's SSN or ITIN to issue an EIN."
      />
      <FormCard>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={isUsCitizen} onChange={(e) => onChange('einIsUsCitizen', e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'rgb(60,60,60)', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.5 }}>
            I am a U.S. citizen or permanent resident
          </span>
        </label>
        {!isUsCitizen && (
          <div style={{ background: 'rgb(255,251,235)', border: '1px solid rgb(252,211,77)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'rgb(146,64,14)', lineHeight: 1.55, fontFamily: 'var(--font-dm-sans)' }}>
            Non-U.S. package: we fax your SS-4 directly to the IRS. An EIN can be issued without an ITIN. No extra charge — included in your Enterprise plan.
          </div>
        )}
        <StyledSelectInput label="Tax ID type" value={taxIdType} onChange={(v) => onChange('einTaxIdType', v as 'ssn' | 'itin')}>
          <option value="ssn">SSN — Social Security Number</option>
          <option value="itin">ITIN — Individual Taxpayer ID</option>
        </StyledSelectInput>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
            {taxIdType === 'ssn' ? 'SSN' : 'ITIN'}{isUsCitizen ? ' *' : ' (optional)'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="password" value={taxId} onChange={(e) => onChange('einTaxId', e.target.value)}
              placeholder={isUsCitizen ? 'XXX-XX-XXXX' : 'Optional'} autoComplete="off"
              style={{ width: '100%', padding: '15px 40px 15px 16px', borderRadius: 8, border: '1px solid rgb(224,224,224)', fontSize: 16, fontFamily: 'var(--font-dm-sans)', color: 'rgb(23,23,23)', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#3b60f3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgb(224,224,224)'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <Lock size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgb(180,180,180)', pointerEvents: 'none' }} />
          </div>
          <p style={{ fontSize: 11, color: 'rgb(150,150,150)', marginTop: 4, fontFamily: 'var(--font-dm-sans)' }}>
            Encrypted at rest — never stored in plain text
          </p>
        </div>
        <ContinueBtn onClick={onNext} disabled={!valid} label="Review order →" />
      </FormCard>
    </>
  )
}

// Step 13 — EIN + LLC review (wide)
function Step13EINReview({ form, selectedPlanId, onProceed }: {
  form: FormState; selectedPlanId: string; onProceed: () => void
}) {
  const plan = PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[2]
  const total = plan.price + STATE_FEE

  function Row({ label, value }: { label: string; value: string }) {
    if (!value) return null
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingBottom: 10, borderBottom: '1px solid rgb(245,245,245)' }}>
        <span style={{ fontSize: 13, color: 'rgb(130,130,130)', fontFamily: 'var(--font-dm-sans)', flexShrink: 0 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'rgb(30,30,30)', fontFamily: 'var(--font-dm-sans)', textAlign: 'right' }}>{value}</span>
      </div>
    )
  }

  const einActivity = EIN_BUSINESS_ACTIVITIES.find((a) => a.value === form.einBusinessActivity)?.label ?? form.einBusinessActivity

  return (
    <>
      <StepHeading title="Review your order" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* LLC details */}
        <div style={{ background: '#ffffff', borderRadius: 24, padding: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgb(23,23,23)', marginBottom: 16, fontFamily: 'var(--font-dm-sans)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>LLC Formation</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Business name" value={form.businessName} />
            <Row label="State" value={form.state} />
            <Row label="Contact" value={`${form.firstName} ${form.lastName}`} />
            <Row label="Email" value={form.email} />
            {form.phone && <Row label="Phone" value={form.phone} />}
            <Row label="Effective" value={form.effectiveType === 'immediate' ? 'Immediately' : form.effectiveType === 'soon' ? 'Coming soon' : form.effectiveDate} />
            <Row label="Industry" value={form.industry} />
            <Row label="Registered Agent" value={form.useCompassRA ? COMPASS_RA_NAME : form.raName} />
          </div>
        </div>
        {/* EIN details */}
        <div style={{ background: '#ffffff', borderRadius: 24, padding: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgb(23,23,23)', marginBottom: 16, fontFamily: 'var(--font-dm-sans)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>EIN (Taxpayer ID)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {form.einTradeName && <Row label="Trade name / DBA" value={form.einTradeName} />}
            <Row label="Mailing address" value={`${form.einMailingStreet}, ${form.einMailingCity} ${form.einMailingZip}`} />
            <Row label="County" value={form.einCounty} />
            <Row label="Business activity" value={einActivity} />
            <Row label="Product / service" value={form.einProductService} />
            <Row label="Fiscal year end" value={form.einClosingMonth} />
            <Row label="Employees" value={form.einHasEmployees ? 'Yes' : 'No'} />
            <Row label="Tax ID" value={form.einTaxId ? `${form.einTaxIdType.toUpperCase()} provided` : 'Not provided'} />
            <Row label="U.S. citizen" value={form.einIsUsCitizen ? 'Yes' : 'No — SS-4 fax package'} />
          </div>
        </div>
      </div>
      {/* Price card */}
      <div style={{ background: '#ffffff', borderRadius: 24, padding: 32, marginTop: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'rgb(23,23,23)', marginBottom: 16, fontFamily: 'var(--font-dm-sans)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'rgb(80,80,80)', fontFamily: 'var(--font-dm-sans)' }}>
            <span>{plan.name}</span><span>${plan.price.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'rgb(80,80,80)', fontFamily: 'var(--font-dm-sans)' }}>
            <span>Florida state fee</span><span>${STATE_FEE.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'rgb(80,80,80)', fontFamily: 'var(--font-dm-sans)' }}>
            <span>EIN filing</span><span>Included</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 700, paddingTop: 16, borderTop: '1px solid rgb(230,230,230)', fontFamily: 'var(--font-dm-sans)' }}>
          <span style={{ color: 'rgb(23,23,23)' }}>Total</span>
          <span style={{ color: '#3b60f3' }}>${total.toFixed(2)}</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgb(150,150,150)', marginTop: 12, fontFamily: 'var(--font-dm-sans)' }}>
          No surprise charges. EIN included in your Enterprise plan. SSN/ITIN encrypted at rest.
        </p>
        <div style={{ marginTop: 20 }}>
          <ContinueBtn onClick={onProceed} label="Proceed to Payment →" />
        </div>
      </div>
    </>
  )
}
