'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Plus, Trash2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { NameAvailability } from '@/services/nameSearch'
import { LLCDocumentPreview } from '@/components/public/LLCDocumentPreview'
import { EINAddOnFields, BUSINESS_ACTIVITIES as EIN_BUSINESS_ACTIVITIES, type EINAddOnValues } from '@/components/public/EINAddOnFields'
import { StyledInput, StyledSelect, Field } from '@/components/public/FormPrimitives'

// Address confirmed via SunBiz (Document # L25000307072)
const COMPASS_RA_ADDRESS = '625 Court St Ste 100, Clearwater, FL 33756'
const COMPASS_RA_NAME = 'Compass Registered Agent, LLC'

const SERVICE_FEE = 125
const STATE_FEE = 138.75
const ADDON_EIN = 75
const ADDON_OA = 50
const ADDON_COS = 9

interface Member {
  name: string
  ownership: string
}

interface FormState {
  // Step 1
  businessName: string
  effectiveType: 'immediate' | 'future'
  effectiveDate: string
  management: 'member-managed' | 'manager-managed'
  members: Member[]
  // Step 2
  contactName: string
  contactEmail: string
  contactPhone: string
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
  // Step 3 add-ons
  addOnEin: boolean
  addOnOperatingAgreement: boolean
  addOnCertificateOfStatus: boolean
  // EIN add-on fields (only sent when addOnEin is true)
  einResponsiblePartyFirstName: string
  einResponsiblePartyMiddleName: string
  einResponsiblePartyLastName: string
  einResponsiblePartySuffix: string
  einTradeName: string
  einCounty: string
  einIsUSCitizen: boolean
  einTaxIdType: 'ssn' | 'itin'
  einTaxId: string
  einBusinessActivity: string
  einBusinessActivityOther: string
  einDateStarted: string
  einReasonApplying: string
  einClosingMonth: string
  einEmployeesAgricultural: string
  einEmployeesHousehold: string
  einEmployeesOther: string
  einWants944: boolean
  einFirstWagesDate: string
  einProductService: string
  einPreviousEin: boolean
}

const defaultForm: FormState = {
  businessName: '',
  effectiveType: 'immediate',
  effectiveDate: '',
  management: 'member-managed',
  members: [{ name: '', ownership: '100' }],
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  principalStreet: '',
  principalCity: '',
  principalState: 'FL',
  principalZip: '',
  mailingSame: true,
  mailingStreet: '',
  mailingCity: '',
  mailingState: '',
  mailingZip: '',
  useCompassRA: true,
  raName: COMPASS_RA_NAME,
  raAddress: COMPASS_RA_ADDRESS,
  addOnEin: false,
  addOnOperatingAgreement: false,
  addOnCertificateOfStatus: false,
  einResponsiblePartyFirstName: '',
  einResponsiblePartyMiddleName: '',
  einResponsiblePartyLastName: '',
  einResponsiblePartySuffix: '',
  einTradeName: '',
  einCounty: '',
  einIsUSCitizen: true,
  einTaxIdType: 'ssn',
  einTaxId: '',
  einBusinessActivity: '',
  einBusinessActivityOther: '',
  einDateStarted: '',
  einReasonApplying: 'new-business',
  einClosingMonth: 'December',
  einEmployeesAgricultural: '0',
  einEmployeesHousehold: '0',
  einEmployeesOther: '0',
  einWants944: false,
  einFirstWagesDate: '',
  einProductService: '',
  einPreviousEin: false,
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
        <h2
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontWeight: 700,
            fontSize: 14.5,
            color: 'oklch(0.22 0.08 245)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

const STEP_LABELS = ['Business details', 'Contact & RA', 'Add-ons & Review']

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
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'var(--font-jakarta)',
                    background: done
                      ? 'linear-gradient(135deg, oklch(0.60 0.20 250), oklch(0.50 0.18 250))'
                      : active
                        ? 'linear-gradient(135deg, oklch(0.26 0.08 245), oklch(0.20 0.07 245))'
                        : 'rgba(255,255,255,0.8)',
                    color: done || active ? 'white' : 'oklch(0.65 0.04 245)',
                    border: done || active ? 'none' : '1.5px solid oklch(0.86 0.015 245)',
                    boxShadow: done
                      ? '0 3px 10px oklch(0.56 0.18 250 / 0.35)'
                      : active
                        ? '0 3px 10px oklch(0.22 0.06 245 / 0.30)'
                        : 'none',
                    transition: 'all 0.3s',
                    flexShrink: 0,
                  }}
                >
                  {done ? '✓' : num}
                </div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: 'var(--font-jakarta)',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'oklch(0.22 0.08 245)' : 'oklch(0.60 0.04 245)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {STEP_LABELS[i]}
                </span>
              </div>
              {i < total - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    marginBottom: 24,
                    marginLeft: 6,
                    marginRight: 6,
                    borderRadius: 1,
                    background: num < step
                      ? 'linear-gradient(90deg, oklch(0.56 0.18 250), oklch(0.52 0.16 250))'
                      : 'oklch(0.90 0.01 245)',
                    transition: 'background 0.3s',
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

export default function LLCFormationPage() {
  return (
    <Suspense>
      <LLCFormationForm />
    </Suspense>
  )
}

function LLCFormationForm() {
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

  // Reset name check when name changes
  useEffect(() => {
    setNameCheck(null)
  }, [form.businessName])

  // Pre-populate responsible party name from contactName when EIN add-on is checked
  useEffect(() => {
    if (!form.addOnEin) return
    if (form.einResponsiblePartyFirstName || form.einResponsiblePartyLastName) return
    const parts = form.contactName.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return
    setForm((prev) => ({
      ...prev,
      einResponsiblePartyFirstName: parts[0],
      einResponsiblePartyMiddleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
      einResponsiblePartyLastName: parts.length > 1 ? parts[parts.length - 1] : '',
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.addOnEin])

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

  function updateMember(i: number, field: keyof Member, value: string) {
    setForm((prev) => {
      const members = [...prev.members]
      members[i] = { ...members[i], [field]: value }
      return { ...prev, members }
    })
  }

  function addMember() {
    setForm((prev) => ({ ...prev, members: [...prev.members, { name: '', ownership: '' }] }))
  }

  function removeMember(i: number) {
    setForm((prev) => ({ ...prev, members: prev.members.filter((_, idx) => idx !== i) }))
  }

  const addOnTotal =
    (form.addOnEin ? ADDON_EIN : 0) +
    (form.addOnOperatingAgreement ? ADDON_OA : 0) +
    (form.addOnCertificateOfStatus ? ADDON_COS : 0)
  const total = SERVICE_FEE + STATE_FEE + addOnTotal

  function handleProceedToCheckout() {
    const principalAddress = `${form.principalStreet}, ${form.principalCity}, ${form.principalState} ${form.principalZip}`
    const mailingAddress = form.mailingSame
      ? principalAddress
      : `${form.mailingStreet}, ${form.mailingCity}, ${form.mailingState} ${form.mailingZip}`

    const payload = {
      serviceType: 'LLC_FORMATION',
      tier: 'STANDARD',
      businessName: form.businessName,
      customerName: form.contactName,
      customerEmail: form.contactEmail,
      customerPhone: form.contactPhone || undefined,
      principalAddress,
      mailingAddress,
      serviceFee: SERVICE_FEE,
      stateFee: STATE_FEE,
      addOnEin: form.addOnEin,
      addOnOperatingAgreement: form.addOnOperatingAgreement,
      addOnCertificateOfStatus: form.addOnCertificateOfStatus,
      ...(form.addOnEin && {
        einMemberCount: String(form.members.length),
        einResponsibleParty: [
          form.einResponsiblePartyFirstName,
          form.einResponsiblePartyMiddleName,
          form.einResponsiblePartyLastName,
          form.einResponsiblePartySuffix,
        ].filter(Boolean).join(' '),
        einResponsiblePartyFirstName: form.einResponsiblePartyFirstName,
        einResponsiblePartyMiddleName: form.einResponsiblePartyMiddleName,
        einResponsiblePartyLastName: form.einResponsiblePartyLastName,
        einResponsiblePartySuffix: form.einResponsiblePartySuffix,
        einTradeName: form.einTradeName,
        einTaxIdType: form.einTaxIdType,
        einTaxId: form.einTaxId,
        einBusinessPurpose: form.einBusinessActivity === 'other'
          ? (form.einBusinessActivityOther || 'Other')
          : (EIN_BUSINESS_ACTIVITIES.find((a) => a.value === form.einBusinessActivity)?.label ?? form.einBusinessActivity),
        einDateStarted: form.einDateStarted,
        einReasonApplying: form.einReasonApplying,
        einIsUSCitizen: form.einIsUSCitizen,
        einCounty: form.einCounty,
        einClosingMonth: form.einClosingMonth,
        einEmployeesAgricultural: form.einEmployeesAgricultural,
        einEmployeesHousehold: form.einEmployeesHousehold,
        einEmployeesOther: form.einEmployeesOther,
        einWants944: form.einWants944,
        einFirstWagesDate: form.einFirstWagesDate,
        einProductService: form.einProductService,
        einPreviousEin: form.einPreviousEin,
      }),
      management: form.management,
      effectiveType: form.effectiveType,
      effectiveDate: form.effectiveDate || undefined,
      members: form.members,
      useCompassRA: form.useCompassRA,
      raName: form.useCompassRA ? COMPASS_RA_NAME : form.raName,
      raAddress: form.useCompassRA ? COMPASS_RA_ADDRESS : form.raAddress,
      addOnTotal,
      total,
      summary: `LLC Formation — ${form.businessName}`,
      lineItems: [
        { label: 'Service fee', amount: SERVICE_FEE },
        { label: 'Florida state fee', amount: STATE_FEE },
        ...(form.addOnEin ? [{ label: 'EIN filing', amount: ADDON_EIN }] : []),
        ...(form.addOnOperatingAgreement ? [{ label: 'Operating Agreement', amount: ADDON_OA }] : []),
        ...(form.addOnCertificateOfStatus ? [{ label: 'Certificate of Status', amount: ADDON_COS }] : []),
      ],
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutPayload', JSON.stringify(payload))
    }
    router.push('/checkout')
  }

  const borderStyle = { borderColor: 'var(--color-border)' }

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 28px 72px' }}>

      {/* Page header */}
      <div style={{ padding: '28px 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'oklch(0.50 0.10 250)',
              fontFamily: 'var(--font-jakarta)',
            }}
          >
            LLC Formation · Florida
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontWeight: 800,
            fontSize: 'clamp(24px, 3vw, 32px)',
            color: 'oklch(0.22 0.08 245)',
            marginBottom: 6,
            letterSpacing: '-0.02em',
          }}
        >
          Form a Florida LLC
        </h1>
        <p style={{ fontSize: 14, color: 'oklch(0.55 0.04 245)', lineHeight: 1.6 }}>
          Flat fee — $125 service + $138.75 state fee. Filed by a real person.
        </p>
      </div>

      <div className="lg:grid lg:gap-12 lg:items-start" style={{ gridTemplateColumns: '1fr 520px' }}>

      {/* ── LEFT: form ── */}
      <div>
      <ProgressBar step={step} total={3} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <>
          <SectionCard title="Business Details">
            <div className="space-y-4">
              <Field label="LLC Name" required>
                <div className="flex gap-2">
                  <StyledInput
                    type="text"
                    name="businessName"
                    value={form.businessName}
                    onChange={(e) => set('businessName', e.target.value)}
                    placeholder="Sunshine Ventures LLC"
                    required
                    extraStyle={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={checkName}
                    disabled={!form.businessName.trim() || nameCheck?.checking}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'var(--font-jakarta)',
                      padding: '9px 16px',
                      borderRadius: 9,
                      border: '1.5px solid oklch(0.84 0.04 250)',
                      background: 'linear-gradient(135deg, oklch(0.97 0.02 250) 0%, oklch(0.94 0.04 250) 100%)',
                      color: 'oklch(0.40 0.12 250)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 1px 4px oklch(0.56 0.18 250 / 0.12)',
                      opacity: (!form.businessName.trim() || nameCheck?.checking) ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {nameCheck?.checking ? <Loader2 size={14} className="animate-spin" /> : 'Check availability'}
                  </button>
                </div>
                {nameCheck && !nameCheck.checking && (
                  <NameBadge available={nameCheck.available} />
                )}
              </Field>

              <Field label="State">
                <StyledInput
                  value="Florida (FL)"
                  readOnly
                  extraStyle={{ background: 'oklch(0.96 0.005 245)', color: 'oklch(0.55 0.04 245)', cursor: 'default' }}
                />
              </Field>

              <Field label="Effective Date">
                <div className="flex gap-4 mb-2">
                  {(['immediate', 'future'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="effectiveType"
                        checked={form.effectiveType === opt}
                        onChange={() => set('effectiveType', opt)}
                      />
                      {opt === 'immediate' ? 'Immediate' : 'Future date'}
                    </label>
                  ))}
                </div>
                {form.effectiveType === 'future' && (
                  <StyledInput
                    type="date"
                    value={form.effectiveDate}
                    onChange={(e) => set('effectiveDate', e.target.value)}
                  />
                )}
              </Field>

              <Field label="Management Structure">
                <div className="flex gap-4">
                  {(['member-managed', 'manager-managed'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="management"
                        checked={form.management === opt}
                        onChange={() => set('management', opt)}
                      />
                      {opt === 'member-managed' ? 'Member-managed' : 'Manager-managed'}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Members">
            <div className="space-y-3">
              {form.members.map((member, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StyledInput
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(i, 'name', e.target.value)}
                    placeholder="Full name"
                    extraStyle={{ flex: 1 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <StyledInput
                      type="number"
                      value={member.ownership}
                      onChange={(e) => updateMember(i, 'ownership', e.target.value)}
                      placeholder="100"
                      min="1"
                      max="100"
                      extraStyle={{ width: 72 }}
                    />
                    <span style={{ fontSize: 14, color: 'oklch(0.55 0.04 245)' }}>%</span>
                  </div>
                  {form.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'oklch(0.65 0.04 245)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMember}
              className="mt-3 flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--color-blue)' }}
            >
              <Plus size={15} /> Add member
            </button>
          </SectionCard>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              onClick={() => setStep(2)}
              disabled={!form.businessName.trim() || !form.members[0]?.name.trim()}
              style={{
                background: 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.20 0.07 245) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 11,
                padding: '12px 28px',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'var(--font-jakarta)',
                cursor: 'pointer',
                boxShadow: '0 4px 16px oklch(0.22 0.06 245 / 0.35), 0 1px 3px oklch(0.22 0.06 245 / 0.18)',
                opacity: (!form.businessName.trim() || !form.members[0]?.name.trim()) ? 0.45 : 1,
                transition: 'all 0.15s',
                letterSpacing: '-0.01em',
              }}
            >
              Continue →
            </button>
          </div>
        </>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <>
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

          <SectionCard title="Principal Address">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Street" required>
                  <StyledInput
                    type="text"
                    value={form.principalStreet}
                    onChange={(e) => set('principalStreet', e.target.value)}
                    placeholder="123 Main St"
                    required
                  />
                </Field>
              </div>
              <Field label="City" required>
                <StyledInput
                  type="text"
                  value={form.principalCity}
                  onChange={(e) => set('principalCity', e.target.value)}
                  placeholder="Miami"
                  required
                />
              </Field>
              <Field label="State">
                <StyledInput
                  value="FL"
                  readOnly
                  extraStyle={{ background: 'oklch(0.96 0.005 245)', color: 'oklch(0.55 0.04 245)', cursor: 'default' }}
                />
              </Field>
              <Field label="ZIP" required>
                <StyledInput
                  type="text"
                  value={form.principalZip}
                  onChange={(e) => set('principalZip', e.target.value)}
                  placeholder="33101"
                  required
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 mt-4 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.mailingSame}
                onChange={(e) => set('mailingSame', e.target.checked)}
                className="rounded"
              />
              Mailing address same as principal
            </label>

            {!form.mailingSame && (
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p className="col-span-2 text-sm font-medium" style={{ color: 'var(--color-navy-mid)' }}>
                  Mailing Address
                </p>
                <div className="col-span-2">
                  <Field label="Street">
                    <StyledInput
                      type="text"
                      value={form.mailingStreet}
                      onChange={(e) => set('mailingStreet', e.target.value)}
                      placeholder="456 Other St"
                    />
                  </Field>
                </div>
                <Field label="City">
                  <StyledInput
                    type="text"
                    value={form.mailingCity}
                    onChange={(e) => set('mailingCity', e.target.value)}
                  />
                </Field>
                <Field label="State">
                  <StyledInput
                    type="text"
                    value={form.mailingState}
                    onChange={(e) => set('mailingState', e.target.value)}
                  />
                </Field>
                <Field label="ZIP">
                  <StyledInput
                    type="text"
                    value={form.mailingZip}
                    onChange={(e) => set('mailingZip', e.target.value)}
                  />
                </Field>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Registered Agent">
            <label className="flex items-start gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.useCompassRA}
                onChange={(e) => {
                  set('useCompassRA', e.target.checked)
                  if (e.target.checked) {
                    set('raName', COMPASS_RA_NAME)
                    set('raAddress', COMPASS_RA_ADDRESS)
                  }
                }}
                className="mt-0.5 rounded"
              />
              <div>
                <span className="text-sm font-medium" style={{ color: '#374151' }}>
                  Use Compass Registered Agent
                </span>
                <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-navy)', color: 'white' }}>
                  $125/yr
                </span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  We&apos;ll serve as your registered agent and forward any legal notices.
                </p>
              </div>
            </label>

            {form.useCompassRA ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="RA Name">
                  <StyledInput value={COMPASS_RA_NAME} readOnly extraStyle={{ background: 'oklch(0.96 0.005 245)', color: 'oklch(0.55 0.04 245)', cursor: 'default' }} />
                </Field>
                <Field label="RA Address">
                  <StyledInput value={COMPASS_RA_ADDRESS} readOnly extraStyle={{ background: 'oklch(0.96 0.005 245)', color: 'oklch(0.55 0.04 245)', cursor: 'default' }} />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Field label="RA Name">
                  <StyledInput
                    type="text"
                    value={form.raName}
                    onChange={(e) => set('raName', e.target.value)}
                    placeholder="Agent name"
                  />
                </Field>
                <Field label="RA Address">
                  <StyledInput
                    type="text"
                    value={form.raAddress}
                    onChange={(e) => set('raAddress', e.target.value)}
                    placeholder="123 Agent St, City, FL 00000"
                  />
                </Field>
              </div>
            )}
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
              onClick={() => setStep(3)}
              disabled={!form.contactName.trim() || !form.contactEmail.trim() || !form.principalStreet.trim()}
              style={{
                background: 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.20 0.07 245) 100%)',
                color: 'white', border: 'none',
                borderRadius: 11, padding: '12px 28px', fontSize: 14, fontWeight: 600,
                fontFamily: 'var(--font-jakarta)', cursor: 'pointer',
                boxShadow: '0 4px 16px oklch(0.22 0.06 245 / 0.35), 0 1px 3px oklch(0.22 0.06 245 / 0.18)',
                opacity: (!form.contactName.trim() || !form.contactEmail.trim() || !form.principalStreet.trim()) ? 0.45 : 1,
                transition: 'all 0.15s', letterSpacing: '-0.01em',
              }}
            >
              Continue →
            </button>
          </div>
        </>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <>
          <SectionCard title="Add-ons">
            <div className="space-y-3">
              <AddOnRow
                label="EIN (Employer Identification Number)"
                description="Required to open a business bank account or hire employees."
                price={ADDON_EIN}
                checked={form.addOnEin}
                onChange={(v) => set('addOnEin', v)}
              />
              {form.addOnEin && (
                <EINAddOnFields
                  values={{
                    einResponsiblePartyFirstName: form.einResponsiblePartyFirstName,
                    einResponsiblePartyMiddleName: form.einResponsiblePartyMiddleName,
                    einResponsiblePartyLastName: form.einResponsiblePartyLastName,
                    einResponsiblePartySuffix: form.einResponsiblePartySuffix,
                    einTradeName: form.einTradeName,
                    einCounty: form.einCounty,
                    einIsUSCitizen: form.einIsUSCitizen,
                    einTaxIdType: form.einTaxIdType,
                    einTaxId: form.einTaxId,
                    einBusinessActivity: form.einBusinessActivity,
                    einBusinessActivityOther: form.einBusinessActivityOther,
                    einDateStarted: form.einDateStarted,
                    einReasonApplying: form.einReasonApplying,
                    einClosingMonth: form.einClosingMonth,
                    einEmployeesAgricultural: form.einEmployeesAgricultural,
                    einEmployeesHousehold: form.einEmployeesHousehold,
                    einEmployeesOther: form.einEmployeesOther,
                    einWants944: form.einWants944,
                    einFirstWagesDate: form.einFirstWagesDate,
                    einProductService: form.einProductService,
                    einPreviousEin: form.einPreviousEin,
                  }}
                  onChange={(field, value) => set(field as keyof FormState, value as FormState[keyof FormState])}
                />
              )}
              <AddOnRow
                label="Operating Agreement"
                description="Documents your LLC's ownership structure and operating rules."
                price={ADDON_OA}
                checked={form.addOnOperatingAgreement}
                onChange={(v) => set('addOnOperatingAgreement', v)}
              />
              <AddOnRow
                label="Certificate of Status"
                description="Official Florida certificate confirming your LLC is active."
                price={ADDON_COS}
                checked={form.addOnCertificateOfStatus}
                onChange={(v) => set('addOnCertificateOfStatus', v)}
              />
            </div>
          </SectionCard>

          <SectionCard title="Order Summary">
            <div className="space-y-2 text-sm">
              <LineItem label="LLC Formation — service fee" amount={SERVICE_FEE} />
              <LineItem label="Florida state fee" amount={STATE_FEE} />
              {form.addOnEin && <LineItem label="EIN filing" amount={ADDON_EIN} />}
              {form.addOnOperatingAgreement && <LineItem label="Operating Agreement" amount={ADDON_OA} />}
              {form.addOnCertificateOfStatus && <LineItem label="Certificate of Status" amount={ADDON_COS} />}
              <div className="pt-3 mt-3 flex justify-between font-semibold" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-blue)' }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </SectionCard>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <button
              onClick={() => setStep(2)}
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
      </div>{/* end left column */}

      {/* ── RIGHT: live document preview (desktop only) ── */}
      <div className="hidden lg:block">
        <LLCDocumentPreview form={form} step={step} />
      </div>

    </div>
    </div>
  )
}

function NameBadge({ available }: { available: NameAvailability }) {
  if (available === 'available') {
    return (
      <p className="flex items-center gap-1 text-xs text-green-700 mt-1">
        <CheckCircle2 size={12} /> Name looks available
      </p>
    )
  }
  if (available === 'taken') {
    return (
      <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
        <XCircle size={12} /> Name already taken — try a different name
      </p>
    )
  }
  if (available === 'likely') {
    return (
      <p className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--color-review-text)' }}>
        <AlertCircle size={12} /> Similar names exist — we&apos;ll verify on Sunbiz when filing
      </p>
    )
  }
  return (
    <p className="text-xs text-gray-500 mt-1">Could not reach Sunbiz — we&apos;ll verify when filing</p>
  )
}

function AddOnRow({
  label,
  description,
  price,
  checked,
  onChange,
}: {
  label: string
  description: string
  price: number
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '16px 18px',
        borderRadius: 12,
        cursor: 'pointer',
        border: checked ? '1.5px solid oklch(0.70 0.14 250)' : '1.5px solid oklch(0.90 0.01 245)',
        background: checked
          ? 'linear-gradient(135deg, oklch(0.97 0.04 250) 0%, oklch(0.95 0.06 250) 100%)'
          : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: checked
          ? '0 3px 14px oklch(0.56 0.18 250 / 0.14), inset 0 1px 0 rgba(255,255,255,0.9)'
          : '0 1px 4px oklch(0.22 0.06 245 / 0.05)',
        transition: 'all 0.18s',
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          border: checked ? 'none' : '1.5px solid oklch(0.82 0.02 245)',
          background: checked
            ? 'linear-gradient(135deg, oklch(0.60 0.20 250), oklch(0.50 0.18 250))'
            : 'rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 1,
          boxShadow: checked ? '0 2px 8px oklch(0.56 0.18 250 / 0.35)' : 'none',
          transition: 'all 0.18s',
        }}
        onClick={() => onChange(!checked)}
      >
        {checked && <span style={{ color: 'white', fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: checked ? 'oklch(0.28 0.10 250)' : 'oklch(0.26 0.08 245)', fontFamily: 'var(--font-jakarta)', marginBottom: 3 }}>{label}</p>
        <p style={{ fontSize: 12.5, color: 'oklch(0.55 0.04 245)', lineHeight: 1.5 }}>{description}</p>
      </div>
      <span style={{
        fontSize: 13, fontWeight: 700,
        color: checked ? 'oklch(0.42 0.16 250)' : 'oklch(0.48 0.06 245)',
        flexShrink: 0,
        fontFamily: 'var(--font-jakarta)',
        background: checked ? 'oklch(0.92 0.08 250)' : 'oklch(0.95 0.01 245)',
        padding: '3px 9px', borderRadius: 6,
      }}>
        +${price}
      </span>
    </label>
  )
}

function LineItem({ label, amount }: { label: string; amount: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'oklch(0.36 0.06 245)' }}>
      <span>{label}</span>
      <span>${amount.toFixed(2)}</span>
    </div>
  )
}
