'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { EINDocumentPreview, type EINFormData } from '@/components/public/EINDocumentPreview'

// US citizen/resident: $75 flat.
// Non-US national: $175 — includes SS-4 preparation and fax submission to IRS.
const PRICE_US = 75
const PRICE_NON_US = 175

function inputCls(extra = '') {
  return `w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ${extra}`
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-lg p-5 mb-4"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <h2
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const labels = ['Filing details', 'Review & pay']
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
          Step {step} of {total}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {labels[step - 1]}
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
        <div
          className="h-1.5 rounded-full transition-all"
          style={{
            backgroundColor: 'var(--color-navy)',
            width: `${(step / total) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}

type TaxIdType = 'ssn' | 'itin'
type ApplyReason = 'new-business' | 'hired-employees' | 'banking' | 'other'

interface FormState extends EINFormData {
  contactEmail: string
  applyReason: ApplyReason
}

const BORDER = { borderColor: 'var(--color-border)' }

export default function EINPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    llcName: '',
    memberCount: '1',
    mailingStreet: '',
    mailingCity: '',
    mailingState: 'FL',
    mailingZip: '',
    county: '',
    responsiblePartyName: '',
    contactEmail: '',
    taxIdType: 'ssn',
    taxId: '',
    businessPurpose: '',
    businessStartDate: '',
    applyReason: 'new-business',
    isUsCitizen: true,
  })

  const price = form.isUsCitizen ? PRICE_US : PRICE_NON_US

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const step1Valid =
    form.llcName.trim() &&
    form.mailingStreet.trim() &&
    form.mailingCity.trim() &&
    form.mailingZip.trim() &&
    form.county.trim() &&
    form.responsiblePartyName.trim() &&
    form.contactEmail.trim() &&
    form.taxId.trim() &&
    form.businessPurpose.trim() &&
    form.businessStartDate

  function handleProceedToCheckout() {
    const mailingAddress = `${form.mailingStreet}, ${form.mailingCity}, ${form.mailingState} ${form.mailingZip}`

    // einOnly: true tells the checkout route not to add the $75 add-on fee on top —
    // the serviceFee already covers the full EIN price for standalone orders.
    const payload = {
      serviceType: 'LLC_FORMATION',
      tier: 'STANDARD',
      businessName: form.llcName,
      customerName: form.responsiblePartyName,
      customerEmail: form.contactEmail,
      serviceFee: price,
      stateFee: 0,
      principalAddress: mailingAddress,
      mailingAddress,
      einOnly: true,       // standalone EIN — skip add-on $75 charge in route
      addOnEin: false,     // don't double-count the fee; route reads einOnly for SS-4 gen

      // EIN-specific fields — flat, not nested
      einMemberCount: form.memberCount,
      einResponsibleParty: form.responsiblePartyName,
      einTaxIdType: form.taxIdType,
      einTaxId: form.taxId,         // encrypted server-side under 'ssn' or 'itin' key
      einBusinessPurpose: form.businessPurpose,
      einDateStarted: form.businessStartDate,
      einReasonApplying: form.applyReason,
      einIsUSCitizen: form.isUsCitizen,
      einCounty: form.county,

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

  // The preview component takes a subset of FormState (EINFormData)
  const previewForm: EINFormData = {
    llcName: form.llcName,
    memberCount: form.memberCount,
    mailingStreet: form.mailingStreet,
    mailingCity: form.mailingCity,
    mailingState: form.mailingState,
    mailingZip: form.mailingZip,
    county: form.county,
    responsiblePartyName: form.responsiblePartyName,
    taxIdType: form.taxIdType,
    taxId: form.taxId,
    businessPurpose: form.businessPurpose,
    businessStartDate: form.businessStartDate,
    applyReason: form.applyReason,
    isUsCitizen: form.isUsCitizen,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
      >
        EIN (Employer Identification Number)
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
        Get your LLC&apos;s federal tax ID. Required for banking, hiring, and taxes. Flat fee — no
        surprises.
      </p>

      <ProgressBar step={step} total={2} />

      {/* Two-column layout on desktop: form left, SS-4 preview right */}
      <div
        className="lg:grid lg:gap-8 lg:items-start"
        style={{ gridTemplateColumns: '1fr 380px' }}
      >
        {/* ── LEFT: form ── */}
        <div>
          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              {/* LLC Details */}
              <SectionCard title="Your LLC">
                <div className="space-y-4">
                  <Field label="LLC Name" required>
                    <input
                      type="text"
                      value={form.llcName}
                      onChange={(e) => set('llcName', e.target.value)}
                      placeholder="Sunshine Ventures LLC"
                      className={inputCls()}
                      style={BORDER}
                    />
                  </Field>

                  <Field label="Mailing Address" required>
                    <input
                      type="text"
                      value={form.mailingStreet}
                      onChange={(e) => set('mailingStreet', e.target.value)}
                      placeholder="123 Main St, Suite 200"
                      className={inputCls()}
                      style={BORDER}
                    />
                  </Field>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <Field label="City" required>
                        <input
                          type="text"
                          value={form.mailingCity}
                          onChange={(e) => set('mailingCity', e.target.value)}
                          placeholder="Miami"
                          className={inputCls()}
                          style={BORDER}
                        />
                      </Field>
                    </div>
                    <div>
                      <Field label="State">
                        <input
                          type="text"
                          value={form.mailingState}
                          onChange={(e) =>
                            set('mailingState', e.target.value.toUpperCase().slice(0, 2))
                          }
                          placeholder="FL"
                          maxLength={2}
                          className={inputCls('uppercase')}
                          style={BORDER}
                        />
                      </Field>
                    </div>
                    <div>
                      <Field label="ZIP" required>
                        <input
                          type="text"
                          value={form.mailingZip}
                          onChange={(e) => set('mailingZip', e.target.value.slice(0, 10))}
                          placeholder="33101"
                          className={inputCls()}
                          style={BORDER}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* County is a separate required field on IRS Form SS-4 Line 6 */}
                  <Field label="County" required>
                    <input
                      type="text"
                      value={form.county}
                      onChange={(e) => set('county', e.target.value)}
                      placeholder="Miami-Dade"
                      className={inputCls()}
                      style={BORDER}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                      The county where your business operates — required by the IRS on Form SS-4
                    </p>
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Number of Members" required>
                      <input
                        type="number"
                        value={form.memberCount}
                        onChange={(e) => set('memberCount', e.target.value)}
                        min="1"
                        className={inputCls()}
                        style={BORDER}
                      />
                    </Field>

                    <Field label="Date Business Started" required>
                      <input
                        type="date"
                        value={form.businessStartDate}
                        onChange={(e) => set('businessStartDate', e.target.value)}
                        className={inputCls()}
                        style={BORDER}
                      />
                    </Field>
                  </div>

                  <Field label="Business Purpose" required>
                    <textarea
                      value={form.businessPurpose}
                      onChange={(e) => set('businessPurpose', e.target.value.slice(0, 50))}
                      placeholder="e.g. Retail sale of clothing"
                      rows={2}
                      maxLength={50}
                      className={inputCls()}
                      style={BORDER}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                      {form.businessPurpose.length}/50 characters — keep it brief and specific
                    </p>
                  </Field>

                  <Field label="Reason for Applying" required>
                    <select
                      value={form.applyReason}
                      onChange={(e) => set('applyReason', e.target.value as ApplyReason)}
                      className={inputCls()}
                      style={BORDER}
                    >
                      <option value="new-business">Started new business</option>
                      <option value="hired-employees">Hired employees</option>
                      <option value="banking">Banking purposes</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                </div>
              </SectionCard>

              {/* Responsible Party */}
              <SectionCard title="Responsible Party">
                <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>
                  The person who controls, manages, or directs the LLC. Their SSN or ITIN is
                  required by the IRS to issue the EIN.
                </p>
                <div className="space-y-4">
                  <Field label="Full Name" required>
                    <input
                      type="text"
                      value={form.responsiblePartyName}
                      onChange={(e) => set('responsiblePartyName', e.target.value)}
                      placeholder="Jane Smith"
                      className={inputCls()}
                      style={BORDER}
                    />
                  </Field>

                  <Field label="Email" required>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => set('contactEmail', e.target.value)}
                      placeholder="jane@example.com"
                      className={inputCls()}
                      style={BORDER}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                      Used to create your portal account — we&apos;ll send login details here.
                    </p>
                  </Field>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: '#374151' }}
                    >
                      Tax Identification Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 mb-3">
                      {(['ssn', 'itin'] as const).map((t) => (
                        <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="taxIdType"
                            checked={form.taxIdType === t}
                            onChange={() => set('taxIdType', t)}
                          />
                          {t === 'ssn'
                            ? 'SSN (Social Security Number)'
                            : 'ITIN (Individual Taxpayer ID)'}
                        </label>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        value={form.taxId}
                        onChange={(e) => set('taxId', e.target.value)}
                        placeholder="XXX-XX-XXXX"
                        className={inputCls('pr-10')}
                        style={BORDER}
                        autoComplete="off"
                      />
                      <Lock size={14} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    <p
                      className="flex items-center gap-1 text-xs mt-1"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      <Lock size={11} /> Encrypted at rest using AES-256 — never stored in plain
                      text
                    </p>
                  </div>
                </div>
              </SectionCard>

              {/* U.S. Citizenship */}
              <SectionCard title="U.S. Citizenship / Residency">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isUsCitizen}
                    onChange={(e) => set('isUsCitizen', e.target.checked)}
                    className="mt-0.5 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#374151' }}>
                      I am a U.S. citizen or permanent resident
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      Uncheck if you are a non-U.S. national — our $175 package handles IRS
                      correspondence on your behalf via fax.
                    </p>
                  </div>
                </label>

                {!form.isUsCitizen && (
                  <div
                    className="mt-3 p-3 rounded-md border text-sm"
                    style={{
                      backgroundColor: 'var(--color-review-bg)',
                      borderColor: 'var(--color-review-border)',
                      color: 'var(--color-review-text)',
                    }}
                  >
                    Non-U.S. nationals cannot use the IRS online EIN application. A real person
                    will prepare your SS-4 form and fax it to the IRS on your behalf. Flat fee —
                    $175.
                  </div>
                )}
              </SectionCard>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!step1Valid}
                  className="text-white text-sm font-medium rounded-md px-6 py-2.5 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-navy)' }}
                >
                  Review order →
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Review ── */}
          {step === 2 && (
            <>
              <SectionCard title="Order Summary">
                <dl className="space-y-3 text-sm">
                  <SummaryRow label="LLC Name" value={form.llcName} />
                  <SummaryRow
                    label="Mailing Address"
                    value={`${form.mailingStreet}, ${form.mailingCity}, ${form.mailingState} ${form.mailingZip}`}
                  />
                  <SummaryRow label="County" value={form.county} />
                  <SummaryRow label="Members" value={form.memberCount} />
                  <SummaryRow label="Responsible Party" value={form.responsiblePartyName} />
                  <SummaryRow label="Email" value={form.contactEmail} />
                  <SummaryRow label="Tax ID Type" value={form.taxIdType.toUpperCase()} />
                  <SummaryRow label="Business Start Date" value={form.businessStartDate} />
                  <SummaryRow label="Reason" value={form.applyReason.replace(/-/g, ' ')} />
                  <SummaryRow
                    label="U.S. Citizen / Resident"
                    value={form.isUsCitizen ? 'Yes — $75' : 'No — SS-4 package ($175)'}
                  />
                </dl>
              </SectionCard>

              <SectionCard title="Price Breakdown">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between" style={{ color: '#374151' }}>
                    <span>
                      {form.isUsCitizen
                        ? 'EIN filing'
                        : 'EIN filing — non-U.S. package (includes SS-4 prep)'}
                    </span>
                    <span>${price.toFixed(2)}</span>
                  </div>
                  <div
                    className="flex justify-between font-semibold pt-3 mt-1"
                    style={{ borderTop: '1px solid var(--color-border)' }}
                  >
                    <span>Total</span>
                    <span style={{ color: 'var(--color-blue)' }}>${price.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs mt-3" style={{ color: 'var(--color-muted)' }}>
                  No auto-renewals. Your SSN/ITIN is encrypted in transit and at rest.
                </p>
              </SectionCard>

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm"
                  style={{ color: 'var(--color-muted)' }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  className="text-white text-sm font-medium rounded-md px-6 py-2.5 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-navy)' }}
                >
                  Proceed to Payment →
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT: SS-4 live preview (hidden on mobile) ── */}
        <div className="hidden lg:block">
          <EINDocumentPreview form={previewForm} step={step} />
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt style={{ color: 'var(--color-muted)' }}>{label}</dt>
      <dd className="font-medium text-right ml-4" style={{ color: '#374151' }}>
        {value}
      </dd>
    </div>
  )
}
