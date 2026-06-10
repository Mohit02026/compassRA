'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { StyledInput, StyledSelect, Field } from '@/components/public/FormPrimitives'
import { EINDocumentPreview, type EINFormData } from '@/components/public/EINDocumentPreview'

const PRICE_US = 75
const PRICE_NON_US = 175

// ─── Design primitives ────────────────────────────────────────────────────────

function SectionCard({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid oklch(0.90 0.01 245)',
        borderRadius: 14,
        padding: '28px 28px 24px',
        marginBottom: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: hint ? 6 : 20 }}>
        <div
          style={{
            width: 3,
            height: 15,
            borderRadius: 2,
            background: 'linear-gradient(180deg, oklch(0.60 0.20 250) 0%, oklch(0.48 0.18 250) 100%)',
            flexShrink: 0,
            boxShadow: '0 1px 5px oklch(0.56 0.18 250 / 0.22)',
          }}
        />
        <h2
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontWeight: 700,
            fontSize: 15,
            color: 'oklch(0.26 0.07 245)',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {hint && (
        <p style={{ fontSize: 13, color: 'oklch(0.56 0.05 245)', lineHeight: 1.55, marginBottom: 20 }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}

function NavButton({
  onClick,
  disabled,
  variant = 'primary',
  children,
}: {
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'ghost'
  children: React.ReactNode
}) {
  if (variant === 'ghost') {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13.5,
          fontFamily: 'var(--font-jakarta)',
          fontWeight: 500,
          color: 'oklch(0.55 0.05 245)',
          padding: '10px 4px',
        }}
      >
        {children}
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled
          ? 'oklch(0.78 0.03 245)'
          : 'linear-gradient(135deg, oklch(0.26 0.08 245), oklch(0.20 0.07 245))',
        color: 'white',
        border: 'none',
        borderRadius: 10,
        padding: '11px 28px',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'var(--font-jakarta)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 2px 12px oklch(0.22 0.06 245 / 0.30)',
        transition: 'opacity 0.15s',
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </button>
  )
}

function ProgressBar({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Step dots */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        {labels.map((label, i) => {
          const n = i + 1
          const done = n < step
          const active = n === step
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < labels.length - 1 ? 1 : undefined }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11.5,
                    fontWeight: 700,
                    fontFamily: 'var(--font-jakarta)',
                    background: done
                      ? 'oklch(0.40 0.15 145)'
                      : active
                        ? 'oklch(0.26 0.08 245)'
                        : 'oklch(0.93 0.01 245)',
                    color: done || active ? 'white' : 'oklch(0.65 0.04 245)',
                    transition: 'all 0.25s',
                    flexShrink: 0,
                  }}
                >
                  {done ? '✓' : n}
                </div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: active ? 600 : 400,
                    fontFamily: 'var(--font-jakarta)',
                    color: active ? 'oklch(0.30 0.07 245)' : 'oklch(0.62 0.04 245)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              </div>
              {i < labels.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    marginBottom: 18,
                    marginLeft: 6,
                    marginRight: 6,
                    borderRadius: 99,
                    background: done
                      ? 'oklch(0.40 0.15 145)'
                      : 'oklch(0.91 0.01 245)',
                    transition: 'background 0.25s',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

type TaxIdType = 'ssn' | 'itin'
type ApplyReason =
  | 'new-business'
  | 'hired-employees'
  | 'banking'
  | 'changed-organization'
  | 'purchased-business'
  | 'irs-withholding'
  | 'other'

const BUSINESS_ACTIVITIES = [
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

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const STEP_LABELS = ['Your LLC', 'Business', 'Employees', 'Identity', 'Review']

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState extends EINFormData {
  contactEmail: string
  applyReason: ApplyReason
}

const DEFAULT_FORM: FormState = {
  llcName: '',
  tradeName: '',
  memberCount: '1',
  mailingStreet: '',
  mailingCity: '',
  mailingState: 'FL',
  mailingZip: '',
  county: '',
  responsiblePartyFirstName: '',
  responsiblePartyMiddleName: '',
  responsiblePartyLastName: '',
  responsiblePartySuffix: '',
  contactEmail: '',
  taxIdType: 'ssn',
  taxId: '',
  businessActivity: '',
  businessActivityOther: '',
  businessStartDate: '',
  applyReason: 'new-business',
  closingMonth: 'December',
  employeesAgricultural: '0',
  employeesHousehold: '0',
  employeesOther: '0',
  wants944: false,
  firstWagesDate: '',
  productService: '',
  previousEin: false,
  isUsCitizen: true,
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EINPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [hasEmployees, setHasEmployees] = useState(false)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)

  const price = form.isUsCitizen ? PRICE_US : PRICE_NON_US

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleEmployees(yes: boolean) {
    setHasEmployees(yes)
    if (!yes) {
      set('employeesAgricultural', '0')
      set('employeesHousehold', '0')
      set('employeesOther', '0')
      set('firstWagesDate', '')
      set('wants944', false)
    }
  }

  const hasAnyEmployees =
    Number(form.employeesAgricultural) > 0 ||
    Number(form.employeesHousehold) > 0 ||
    Number(form.employeesOther) > 0

  // Per-step validation
  const step1Valid =
    form.llcName.trim() &&
    form.mailingStreet.trim() &&
    form.mailingCity.trim() &&
    form.mailingZip.trim() &&
    form.county.trim()

  const step2Valid =
    form.businessActivity &&
    (form.businessActivity !== 'other' || form.businessActivityOther.trim()) &&
    form.businessStartDate &&
    form.productService.trim()

  const step3Valid = !hasAnyEmployees || form.firstWagesDate

  const step4Valid =
    form.responsiblePartyFirstName.trim() &&
    form.responsiblePartyLastName.trim() &&
    form.contactEmail.trim() &&
    (!form.isUsCitizen || form.taxId.trim())

  function handleProceedToCheckout() {
    const mailingAddress = `${form.mailingStreet}, ${form.mailingCity}, ${form.mailingState} ${form.mailingZip}`
    const responsiblePartyFullName = [
      form.responsiblePartyFirstName,
      form.responsiblePartyMiddleName,
      form.responsiblePartyLastName,
      form.responsiblePartySuffix,
    ].filter(Boolean).join(' ')
    const einBusinessPurpose =
      form.businessActivity === 'other'
        ? (form.businessActivityOther ? `Other: ${form.businessActivityOther}` : 'Other')
        : BUSINESS_ACTIVITIES.find((a) => a.value === form.businessActivity)?.label ?? form.businessActivity

    const payload = {
      serviceType: 'EIN_FILING',
      tier: 'STANDARD',
      businessName: form.llcName,
      customerName: responsiblePartyFullName,
      customerEmail: form.contactEmail,
      serviceFee: price,
      stateFee: 0,
      principalAddress: mailingAddress,
      mailingAddress,
      einOnly: true,
      einTradeName: form.tradeName,
      einMemberCount: form.memberCount,
      einResponsibleParty: responsiblePartyFullName,
      einResponsiblePartyFirstName: form.responsiblePartyFirstName,
      einResponsiblePartyMiddleName: form.responsiblePartyMiddleName,
      einResponsiblePartyLastName: form.responsiblePartyLastName,
      einResponsiblePartySuffix: form.responsiblePartySuffix,
      einTaxIdType: form.taxIdType,
      einTaxId: form.taxId,
      einBusinessPurpose,
      einDateStarted: form.businessStartDate,
      einReasonApplying: form.applyReason,
      einIsUSCitizen: form.isUsCitizen,
      einCounty: form.county,
      einClosingMonth: form.closingMonth,
      einEmployeesAgricultural: form.employeesAgricultural,
      einEmployeesHousehold: form.employeesHousehold,
      einEmployeesOther: form.employeesOther,
      einWants944: form.wants944,
      einFirstWagesDate: hasAnyEmployees ? form.firstWagesDate : '',
      einProductService: form.productService,
      einPreviousEin: form.previousEin,
      summary: `EIN Filing — ${form.llcName}`,
      lineItems: [
        {
          label: form.isUsCitizen
            ? 'EIN filing'
            : 'EIN filing — non-U.S. package (includes SS-4 prep)',
          amount: price,
        },
      ],
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutPayload', JSON.stringify(payload))
    }
    router.push('/checkout')
  }

  const previewForm: EINFormData = {
    llcName: form.llcName,
    tradeName: form.tradeName,
    memberCount: form.memberCount,
    mailingStreet: form.mailingStreet,
    mailingCity: form.mailingCity,
    mailingState: form.mailingState,
    mailingZip: form.mailingZip,
    county: form.county,
    responsiblePartyFirstName: form.responsiblePartyFirstName,
    responsiblePartyMiddleName: form.responsiblePartyMiddleName,
    responsiblePartyLastName: form.responsiblePartyLastName,
    responsiblePartySuffix: form.responsiblePartySuffix,
    taxIdType: form.taxIdType,
    taxId: form.taxId,
    businessActivity: form.businessActivity,
    businessActivityOther: form.businessActivityOther,
    businessStartDate: form.businessStartDate,
    applyReason: form.applyReason,
    closingMonth: form.closingMonth,
    employeesAgricultural: form.employeesAgricultural,
    employeesHousehold: form.employeesHousehold,
    employeesOther: form.employeesOther,
    wants944: form.wants944,
    firstWagesDate: form.firstWagesDate,
    productService: form.productService,
    previousEin: form.previousEin,
    isUsCitizen: form.isUsCitizen,
  }

  // Shared TOGGLE_BASE style (for employees Yes/No)
  const TOGGLE_BASE: React.CSSProperties = {
    padding: '8px 22px',
    borderRadius: 9,
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: 'var(--font-jakarta)',
    cursor: 'pointer',
    border: '1.5px solid',
    transition: 'all 0.15s',
  }

  function activeToggle(active: boolean): React.CSSProperties {
    return {
      ...TOGGLE_BASE,
      background: active
        ? 'linear-gradient(135deg, oklch(0.26 0.08 245), oklch(0.20 0.07 245))'
        : 'rgba(255,255,255,0.85)',
      color: active ? 'white' : 'oklch(0.44 0.06 245)',
      borderColor: active ? 'transparent' : 'oklch(0.86 0.015 245)',
      boxShadow: active
        ? '0 2px 10px oklch(0.22 0.06 245 / 0.28)'
        : '0 1px 3px oklch(0.22 0.06 245 / 0.06)',
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'oklch(0.97 0.005 240)',
        fontFamily: 'var(--font-dm)',
        paddingBottom: 80,
      }}
    >
      {/* Page header */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid oklch(0.91 0.01 245)',
          padding: '28px 0 24px',
          marginBottom: 36,
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-jakarta)',
              fontWeight: 700,
              fontSize: 22,
              color: 'oklch(0.26 0.07 245)',
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}
          >
            EIN (Employer Identification Number)
          </h1>
          <p style={{ fontSize: 14, color: 'oklch(0.56 0.05 245)', lineHeight: 1.55 }}>
            Get your LLC&apos;s federal tax ID — required for banking, hiring, and taxes. Flat fee,
            no surprises.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <ProgressBar step={step} total={5} labels={STEP_LABELS} />

        {/* Two-column layout: form left, SS-4 preview right */}
        <div
          className="lg:grid lg:gap-10 lg:items-start"
          style={{ gridTemplateColumns: '1fr 1fr' }}
        >
          {/* ── LEFT: steps ── */}
          <div>

            {/* ────────────────── STEP 1: Your LLC ────────────────── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <SectionCard
                  title="Your LLC"
                  hint="Basic details about the business — this goes on the IRS SS-4 form."
                >
                  <div className="space-y-5">
                    <Field label="LLC Name" required>
                      <StyledInput
                        value={form.llcName}
                        onChange={(e) => set('llcName', e.target.value)}
                        placeholder="Sunshine Ventures LLC"
                      />
                    </Field>

                    <Field label="Trade Name / DBA" hint="Leave blank if the same as your LLC name">
                      <StyledInput
                        value={form.tradeName}
                        onChange={(e) => set('tradeName', e.target.value)}
                        placeholder="Optional"
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Number of Members" required>
                        <StyledInput
                          type="number"
                          min="1"
                          value={form.memberCount}
                          onChange={(e) => set('memberCount', e.target.value)}
                        />
                      </Field>
                      <Field label="County" hint="Where the business operates" required>
                        <StyledInput
                          value={form.county}
                          onChange={(e) => set('county', e.target.value)}
                          placeholder="e.g. Miami-Dade"
                        />
                      </Field>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Mailing Address">
                  <div className="space-y-5">
                    <Field label="Street Address" required>
                      <StyledInput
                        value={form.mailingStreet}
                        onChange={(e) => set('mailingStreet', e.target.value)}
                        placeholder="123 Main St, Suite 200"
                      />
                    </Field>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <Field label="City" required>
                          <StyledInput
                            value={form.mailingCity}
                            onChange={(e) => set('mailingCity', e.target.value)}
                            placeholder="Miami"
                          />
                        </Field>
                      </div>
                      <Field label="State">
                        <StyledInput
                          value={form.mailingState}
                          onChange={(e) =>
                            set('mailingState', e.target.value.toUpperCase().slice(0, 2))
                          }
                          placeholder="FL"
                          maxLength={2}
                          style={{ textTransform: 'uppercase' }}
                        />
                      </Field>
                      <Field label="ZIP" required>
                        <StyledInput
                          value={form.mailingZip}
                          onChange={(e) => set('mailingZip', e.target.value.slice(0, 10))}
                          placeholder="33101"
                        />
                      </Field>
                    </div>
                  </div>
                </SectionCard>

                <NavRow
                  onNext={() => setStep(2)}
                  nextDisabled={!step1Valid}
                  nextLabel="Continue →"
                />
              </div>
            )}

            {/* ────────────────── STEP 2: Business ────────────────── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <SectionCard
                  title="About the Business"
                  hint="Tell the IRS what your LLC does — these answers populate Lines 9, 16, and 17 of the SS-4."
                >
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Date Business Started" required>
                        <StyledInput
                          type="date"
                          value={form.businessStartDate}
                          onChange={(e) => set('businessStartDate', e.target.value)}
                        />
                      </Field>
                      <Field label="Fiscal Year End" hint="Most LLCs use December">
                        <StyledSelect
                          value={form.closingMonth}
                          onChange={(e) => set('closingMonth', e.target.value)}
                        >
                          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </StyledSelect>
                      </Field>
                    </div>

                    <Field label="Reason for Applying" required>
                      <StyledSelect
                        value={form.applyReason}
                        onChange={(e) => set('applyReason', e.target.value as ApplyReason)}
                      >
                        <option value="new-business">Started new business</option>
                        <option value="hired-employees">Hired employees</option>
                        <option value="banking">Banking purposes</option>
                        <option value="changed-organization">Changed type of organization</option>
                        <option value="purchased-business">Purchased going business</option>
                        <option value="irs-withholding">Compliance with IRS withholding regulations</option>
                        <option value="other">Other</option>
                      </StyledSelect>
                    </Field>

                    <Field label="Principal Business Activity" required>
                      <StyledSelect
                        value={form.businessActivity}
                        onChange={(e) => set('businessActivity', e.target.value)}
                      >
                        <option value="">— Select category —</option>
                        {BUSINESS_ACTIVITIES.map((a) => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </StyledSelect>
                    </Field>

                    {form.businessActivity === 'other' && (
                      <Field label="Describe your business activity" hint={`${form.businessActivityOther.length}/50 characters`} required>
                        <StyledInput
                          value={form.businessActivityOther}
                          onChange={(e) =>
                            set('businessActivityOther', e.target.value.slice(0, 50))
                          }
                          placeholder="e.g. Online consulting services"
                          maxLength={50}
                        />
                      </Field>
                    )}

                    <Field
                      label="What does your business make, sell, or do?"
                      hint="Plain description — e.g. 'Consulting services for small businesses'"
                      required
                    >
                      <StyledInput
                        value={form.productService}
                        onChange={(e) =>
                          set('productService', e.target.value.slice(0, 50))
                        }
                        placeholder="e.g. Consulting services"
                        maxLength={50}
                      />
                    </Field>
                  </div>
                </SectionCard>

                <NavRow
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                  nextDisabled={!step2Valid}
                  nextLabel="Continue →"
                />
              </div>
            )}

            {/* ────────────────── STEP 3: Employees ────────────────── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <SectionCard
                  title="Employees"
                  hint="Tell the IRS whether you plan to hire employees in the next 12 months."
                >
                  <div className="space-y-5">
                    <div>
                      <p style={{ fontSize: 14, color: 'oklch(0.40 0.05 245)', marginBottom: 12, fontFamily: 'var(--font-jakarta)', fontWeight: 500 }}>
                        Do you plan to hire employees in the next 12 months?
                      </p>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => toggleEmployees(true)} style={activeToggle(hasEmployees)}>Yes</button>
                        <button type="button" onClick={() => toggleEmployees(false)} style={activeToggle(!hasEmployees)}>No</button>
                      </div>
                    </div>

                    {hasEmployees && (
                      <>
                        <p style={{ fontSize: 13, color: 'oklch(0.56 0.05 245)', lineHeight: 1.55 }}>
                          Enter the number expected in each category — put 0 for any that don&apos;t apply.
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          <Field label="Agricultural" hint="Farm / ranch">
                            <StyledInput
                              type="number"
                              min="0"
                              value={form.employeesAgricultural}
                              onChange={(e) => set('employeesAgricultural', e.target.value)}
                              placeholder="0"
                            />
                          </Field>
                          <Field label="Household" hint="Domestic workers">
                            <StyledInput
                              type="number"
                              min="0"
                              value={form.employeesHousehold}
                              onChange={(e) => set('employeesHousehold', e.target.value)}
                              placeholder="0"
                            />
                          </Field>
                          <Field label="Other" hint="All other">
                            <StyledInput
                              type="number"
                              min="0"
                              value={form.employeesOther}
                              onChange={(e) => set('employeesOther', e.target.value)}
                              placeholder="0"
                            />
                          </Field>
                        </div>

                        <Field label="First date wages will be paid" required>
                          <StyledInput
                            type="date"
                            value={form.firstWagesDate}
                            onChange={(e) => set('firstWagesDate', e.target.value)}
                          />
                        </Field>

                        <CheckboxRow
                          checked={form.wants944}
                          onChange={(v) => set('wants944', v)}
                          label="File employment taxes annually (Form 944)"
                          hint="Instead of quarterly Form 941. Only if annual payroll tax liability is $1,000 or less."
                        />
                      </>
                    )}
                  </div>
                </SectionCard>

                <SectionCard title="Previous EIN">
                  <CheckboxRow
                    checked={form.previousEin}
                    onChange={(v) => set('previousEin', v)}
                    label="This entity previously had an EIN"
                    hint="Check this if the LLC had a federal tax ID in the past that was cancelled or abandoned."
                  />
                </SectionCard>

                <NavRow
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                  nextDisabled={!step3Valid}
                  nextLabel="Continue →"
                />
              </div>
            )}

            {/* ────────────────── STEP 4: Identity ────────────────── */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <SectionCard
                  title="Responsible Party"
                  hint="The person who controls, manages, or directs the LLC. The IRS requires the name exactly as filed."
                >
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="First Name" required>
                        <StyledInput
                          value={form.responsiblePartyFirstName}
                          onChange={(e) => set('responsiblePartyFirstName', e.target.value)}
                          placeholder="Jane"
                        />
                      </Field>
                      <Field label="Last Name" required>
                        <StyledInput
                          value={form.responsiblePartyLastName}
                          onChange={(e) => set('responsiblePartyLastName', e.target.value)}
                          placeholder="Smith"
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Field label="Middle Name / Initial">
                          <StyledInput
                            value={form.responsiblePartyMiddleName}
                            onChange={(e) => set('responsiblePartyMiddleName', e.target.value)}
                            placeholder="Optional"
                          />
                        </Field>
                      </div>
                      <Field label="Suffix">
                        <StyledSelect
                          value={form.responsiblePartySuffix}
                          onChange={(e) => set('responsiblePartySuffix', e.target.value)}
                        >
                          <option value="">None</option>
                          <option value="Jr.">Jr.</option>
                          <option value="Sr.">Sr.</option>
                          <option value="II">II</option>
                          <option value="III">III</option>
                          <option value="IV">IV</option>
                        </StyledSelect>
                      </Field>
                    </div>

                    <Field label="Email" hint="We'll send your portal login here" required>
                      <StyledInput
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => set('contactEmail', e.target.value)}
                        placeholder="jane@example.com"
                      />
                    </Field>
                  </div>
                </SectionCard>

                <SectionCard title="Citizenship & Tax ID">
                  <div className="space-y-5">
                    <CheckboxRow
                      checked={form.isUsCitizen}
                      onChange={(v) => set('isUsCitizen', v)}
                      label="I am a U.S. citizen or permanent resident"
                      hint={
                        form.isUsCitizen
                          ? undefined
                          : 'Non-U.S. nationals cannot use the IRS online application. We prepare your SS-4 and fax it to the IRS on your behalf — flat fee $175.'
                      }
                    />

                    {!form.isUsCitizen && (
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: 10,
                          background: 'oklch(0.96 0.05 60)',
                          border: '1px solid oklch(0.82 0.10 60)',
                          fontSize: 13,
                          color: 'oklch(0.50 0.14 60)',
                          lineHeight: 1.55,
                        }}
                      >
                        Non-U.S. package: SS-4 faxed directly to the IRS. EIN can be issued without
                        an ITIN — enter one below if you have it, otherwise leave blank.
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Tax ID Type">
                        <StyledSelect
                          value={form.taxIdType}
                          onChange={(e) => set('taxIdType', e.target.value as TaxIdType)}
                        >
                          <option value="ssn">SSN — Social Security Number</option>
                          <option value="itin">ITIN — Individual Taxpayer ID</option>
                        </StyledSelect>
                      </Field>
                      <Field
                        label={form.taxIdType === 'ssn' ? 'SSN' : 'ITIN'}
                        hint={form.isUsCitizen ? 'Encrypted, never stored in plain text' : 'Optional'}
                      >
                        <div style={{ position: 'relative' }}>
                          <StyledInput
                            type="password"
                            value={form.taxId}
                            onChange={(e) => set('taxId', e.target.value)}
                            placeholder={form.isUsCitizen ? 'XXX-XX-XXXX' : 'Optional'}
                            autoComplete="off"
                            extraStyle={{ paddingRight: 34 }}
                          />
                          <Lock
                            size={13}
                            style={{
                              position: 'absolute',
                              right: 10,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: 'oklch(0.65 0.02 245)',
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                      </Field>
                    </div>
                  </div>
                </SectionCard>

                <NavRow
                  onBack={() => setStep(3)}
                  onNext={() => setStep(5)}
                  nextDisabled={!step4Valid}
                  nextLabel="Review order →"
                />
              </div>
            )}

            {/* ────────────────── STEP 5: Review ────────────────── */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <SectionCard title="Order Summary">
                  <dl style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SummaryRow label="LLC Name" value={form.llcName} />
                    {form.tradeName && <SummaryRow label="Trade Name / DBA" value={form.tradeName} />}
                    <SummaryRow label="Address" value={`${form.mailingStreet}, ${form.mailingCity}, ${form.mailingState} ${form.mailingZip}`} />
                    <SummaryRow label="County" value={form.county} />
                    <SummaryRow label="Members" value={form.memberCount} />
                    <SummaryRow label="Business Start" value={form.businessStartDate} />
                    <SummaryRow label="Fiscal Year End" value={form.closingMonth} />
                    <SummaryRow
                      label="Business Activity"
                      value={
                        form.businessActivity === 'other'
                          ? `Other: ${form.businessActivityOther}`
                          : BUSINESS_ACTIVITIES.find((a) => a.value === form.businessActivity)?.label ?? ''
                      }
                    />
                    <SummaryRow label="Product / Service" value={form.productService} />
                    <SummaryRow label="Reason" value={form.applyReason.replace(/-/g, ' ')} />
                    <SummaryRow
                      label="Employees"
                      value={
                        hasAnyEmployees
                          ? `${form.employeesAgricultural} ag / ${form.employeesHousehold} household / ${form.employeesOther} other`
                          : 'None planned'
                      }
                    />
                    {form.wants944 && <SummaryRow label="Form 944 Election" value="Yes — annual filing" />}
                    {form.previousEin && <SummaryRow label="Previously had EIN" value="Yes" />}
                    <SummaryRow
                      label="Responsible Party"
                      value={[
                        form.responsiblePartyFirstName,
                        form.responsiblePartyMiddleName,
                        form.responsiblePartyLastName,
                        form.responsiblePartySuffix,
                      ].filter(Boolean).join(' ')}
                    />
                    <SummaryRow label="Email" value={form.contactEmail} />
                    <SummaryRow
                      label="Tax ID"
                      value={form.taxId ? form.taxIdType.toUpperCase() + ' provided' : 'Not provided'}
                    />
                    <SummaryRow
                      label="U.S. Citizen / Resident"
                      value={form.isUsCitizen ? 'Yes' : 'No — SS-4 fax package'}
                    />
                  </dl>
                </SectionCard>

                <SectionCard title="Price">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'oklch(0.40 0.05 245)' }}>
                      <span>
                        {form.isUsCitizen
                          ? 'EIN filing'
                          : 'EIN filing — non-U.S. package'}
                      </span>
                      <span>${price.toFixed(2)}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 15,
                        fontWeight: 700,
                        fontFamily: 'var(--font-jakarta)',
                        color: 'oklch(0.28 0.07 245)',
                        paddingTop: 12,
                        borderTop: '1px solid oklch(0.91 0.01 245)',
                      }}
                    >
                      <span>Total</span>
                      <span style={{ color: 'oklch(0.44 0.17 250)' }}>${price.toFixed(2)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'oklch(0.58 0.04 245)', marginTop: 4 }}>
                      No auto-renewals. Your SSN/ITIN is encrypted in transit and at rest.
                    </p>
                  </div>
                </SectionCard>

                <NavRow
                  onBack={() => setStep(4)}
                  onNext={handleProceedToCheckout}
                  nextLabel="Proceed to Payment →"
                />
              </div>
            )}
          </div>

          {/* ── RIGHT: SS-4 live preview ── */}
          <div className="hidden lg:block sticky top-8">
            <EINDocumentPreview form={previewForm} step={step} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function NavRow({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = 'Continue →',
}: {
  onBack?: () => void
  onNext?: () => void
  nextDisabled?: boolean
  nextLabel?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: onBack ? 'space-between' : 'flex-end',
        paddingTop: 4,
      }}
    >
      {onBack && (
        <NavButton variant="ghost" onClick={onBack}>
          ← Back
        </NavButton>
      )}
      {onNext && (
        <NavButton onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </NavButton>
      )}
    </div>
  )
}

function CheckboxRow({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 2, flexShrink: 0 }}
      />
      <span>
        <span
          style={{
            display: 'block',
            fontSize: 13.5,
            fontWeight: 500,
            fontFamily: 'var(--font-jakarta)',
            color: 'oklch(0.34 0.06 245)',
          }}
        >
          {label}
        </span>
        {hint && (
          <span
            style={{
              display: 'block',
              marginTop: 3,
              fontSize: 12.5,
              color: 'oklch(0.56 0.04 245)',
              lineHeight: 1.5,
            }}
          >
            {hint}
          </span>
        )}
      </span>
    </label>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        paddingBottom: 12,
        borderBottom: '1px solid oklch(0.94 0.005 245)',
      }}
    >
      <dt style={{ fontSize: 13, color: 'oklch(0.58 0.04 245)', flexShrink: 0 }}>{label}</dt>
      <dd
        style={{
          fontSize: 13.5,
          fontWeight: 500,
          fontFamily: 'var(--font-jakarta)',
          color: 'oklch(0.30 0.06 245)',
          textAlign: 'right',
        }}
      >
        {value}
      </dd>
    </div>
  )
}
