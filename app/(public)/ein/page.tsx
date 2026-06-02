'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

const PRICE_US = 75
const PRICE_NON_US = 175

function inputCls(extra = '') {
  return `w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ${extra}`
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg p-5 mb-4" style={{ border: '1px solid var(--color-border)' }}>
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

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
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
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
          Step {step} of {total}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {step === 1 ? 'Filing details' : 'Review & pay'}
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ backgroundColor: 'var(--color-navy)', width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

type TaxIdType = 'ssn' | 'itin'
type ApplyReason = 'new-business' | 'hired-employees' | 'banking' | 'other'

interface FormState {
  llcName: string
  memberCount: string
  responsiblePartyName: string
  contactEmail: string
  taxIdType: TaxIdType
  taxId: string
  businessPurpose: string
  businessStartDate: string
  applyReason: ApplyReason
  isUsCitizen: boolean
}

export default function EINPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    llcName: '',
    memberCount: '1',
    responsiblePartyName: '',
    contactEmail: '',
    taxIdType: 'ssn',
    taxId: '',
    businessPurpose: '',
    businessStartDate: '',
    applyReason: 'new-business',
    isUsCitizen: true,
  })

  const borderStyle = { borderColor: 'var(--color-border)' }
  const price = form.isUsCitizen ? PRICE_US : PRICE_NON_US

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const step1Valid =
    form.llcName.trim() &&
    form.responsiblePartyName.trim() &&
    form.contactEmail.trim() &&
    form.taxId.trim() &&
    form.businessPurpose.trim() &&
    form.businessStartDate

  function handleProceedToCheckout() {
    const payload = {
      serviceType: 'LLC_FORMATION',
      tier: 'STANDARD',
      businessName: form.llcName,
      customerName: form.responsiblePartyName,
      customerEmail: form.contactEmail,
      serviceFee: price,
      stateFee: 0,
      addOnEin: true,
      einData: {
        memberCount: form.memberCount,
        taxIdType: form.taxIdType,
        businessPurpose: form.businessPurpose,
        businessStartDate: form.businessStartDate,
        applyReason: form.applyReason,
        isUsCitizen: form.isUsCitizen,
      },
      summary: `EIN Filing — ${form.llcName}`,
      lineItems: [
        { label: form.isUsCitizen ? 'EIN filing' : 'EIN filing (non-U.S. package)', amount: price },
      ],
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutPayload', JSON.stringify(payload))
    }
    router.push('/checkout')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
      >
        EIN (Employer Identification Number)
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
        Get your LLC&apos;s EIN from the IRS. Required for banking, hiring, and taxes. Flat fee — no surprises.
      </p>

      <ProgressBar step={step} total={2} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <>
          <SectionCard title="LLC Details">
            <div className="space-y-4">
              <Field label="LLC Name" required>
                <input
                  type="text"
                  value={form.llcName}
                  onChange={(e) => set('llcName', e.target.value)}
                  placeholder="Sunshine Ventures LLC"
                  className={inputCls()}
                  style={borderStyle}
                  required
                />
              </Field>

              <Field label="Entity Type">
                <input
                  value="LLC"
                  readOnly
                  className={inputCls('bg-gray-50 text-gray-500')}
                  style={borderStyle}
                />
              </Field>

              <Field label="Number of Members" required>
                <input
                  type="number"
                  value={form.memberCount}
                  onChange={(e) => set('memberCount', e.target.value)}
                  min="1"
                  className={inputCls('w-32')}
                  style={borderStyle}
                  required
                />
              </Field>

              <Field label="Date Business Started" required>
                <input
                  type="date"
                  value={form.businessStartDate}
                  onChange={(e) => set('businessStartDate', e.target.value)}
                  className={inputCls('w-48')}
                  style={borderStyle}
                  required
                />
              </Field>

              <Field label="Business Purpose" required>
                <textarea
                  value={form.businessPurpose}
                  onChange={(e) => set('businessPurpose', e.target.value.slice(0, 50))}
                  placeholder="e.g. Retail sale of clothing"
                  rows={2}
                  maxLength={50}
                  className={inputCls()}
                  style={borderStyle}
                  required
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  {form.businessPurpose.length}/50 characters
                </p>
              </Field>

              <Field label="Reason for Applying" required>
                <select
                  value={form.applyReason}
                  onChange={(e) => set('applyReason', e.target.value as ApplyReason)}
                  className={inputCls()}
                  style={borderStyle}
                >
                  <option value="new-business">Started new business</option>
                  <option value="hired-employees">Hired employees</option>
                  <option value="banking">Banking purposes</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Responsible Party">
            <div className="space-y-4">
              <Field label="Full Name" required>
                <input
                  type="text"
                  value={form.responsiblePartyName}
                  onChange={(e) => set('responsiblePartyName', e.target.value)}
                  placeholder="Jane Smith"
                  className={inputCls()}
                  style={borderStyle}
                  required
                />
              </Field>

              <Field label="Email" required>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => set('contactEmail', e.target.value)}
                  placeholder="jane@example.com"
                  className={inputCls()}
                  style={borderStyle}
                  required
                />
              </Field>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Tax Identification Type <span className="text-red-500 ml-0.5">*</span>
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
                      {t === 'ssn' ? 'SSN (Social Security Number)' : 'ITIN (Individual Taxpayer Identification Number)'}
                    </label>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={form.taxId}
                    onChange={(e) => set('taxId', e.target.value)}
                    placeholder={form.taxIdType === 'ssn' ? 'XXX-XX-XXXX' : 'XXX-XX-XXXX'}
                    className={inputCls('pr-10')}
                    style={borderStyle}
                    required
                    autoComplete="off"
                  />
                  <Lock size={14} className="absolute right-3 top-3 text-gray-400" />
                </div>
                <p className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  <Lock size={11} /> Encrypted and stored securely — never stored in plain text
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="U.S. Citizenship">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isUsCitizen}
                onChange={(e) => set('isUsCitizen', e.target.checked)}
                className="mt-0.5 rounded"
              />
              <div>
                <p className="text-sm font-medium" style={{ color: '#374151' }}>I am a U.S. citizen or permanent resident</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  Uncheck if you are a non-U.S. national — our non-U.S. package includes SS-4 preparation.
                </p>
              </div>
            </label>

            {!form.isUsCitizen && (
              <div className="mt-3 p-3 rounded-md border text-sm"
                style={{ backgroundColor: 'var(--color-review-bg)', borderColor: 'var(--color-review-border)', color: 'var(--color-review-text)' }}
              >
                Our non-U.S. package includes SS-4 preparation — $175 flat fee. A real person will handle
                the IRS correspondence on your behalf.
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

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <>
          <SectionCard title="Order Summary">
            <dl className="space-y-3 text-sm">
              <SummaryRow label="LLC Name" value={form.llcName} />
              <SummaryRow label="Members" value={form.memberCount} />
              <SummaryRow label="Responsible Party" value={form.responsiblePartyName} />
              <SummaryRow label="Email" value={form.contactEmail} />
              <SummaryRow label="Tax ID Type" value={form.taxIdType.toUpperCase()} />
              <SummaryRow label="Business Start Date" value={form.businessStartDate} />
              <SummaryRow
                label="U.S. Citizen / Resident"
                value={form.isUsCitizen ? 'Yes' : 'No — SS-4 package'}
              />
            </dl>
          </SectionCard>

          <SectionCard title="Price Breakdown">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between" style={{ color: '#374151' }}>
                <span>
                  {form.isUsCitizen ? 'EIN filing' : 'EIN filing (non-U.S. package — includes SS-4 prep)'}
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
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt style={{ color: 'var(--color-muted)' }}>{label}</dt>
      <dd className="font-medium text-right" style={{ color: '#374151' }}>{value}</dd>
    </div>
  )
}
