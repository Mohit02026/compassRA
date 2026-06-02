'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Plus, Trash2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { NameAvailability } from '@/services/nameSearch'

const COMPASS_RA_ADDRESS = '8 The Green Suite 300, Dover, DE 19901'
const COMPASS_RA_NAME = 'Compass Registered Agent LLC'

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
}

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
          {step === 1 ? 'Business details' : step === 2 ? 'Contact & RA' : 'Add-ons & Review'}
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
    businessName: searchParams.get('name') ?? '',
  })
  const [nameCheck, setNameCheck] = useState<{ available: NameAvailability; checking: boolean } | null>(null)

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Reset name check when name changes
  useEffect(() => {
    setNameCheck(null)
  }, [form.businessName])

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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
      >
        Form a Florida LLC
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
        Flat fee — $125 service + $138.75 state fee. Filed by a real person.
      </p>

      <ProgressBar step={step} total={3} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <>
          <SectionCard title="Business Details">
            <div className="space-y-4">
              <Field label="LLC Name" required>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => set('businessName', e.target.value)}
                    placeholder="Sunshine Ventures LLC"
                    className={inputCls('flex-1')}
                    style={borderStyle}
                    required
                  />
                  <button
                    type="button"
                    onClick={checkName}
                    disabled={!form.businessName.trim() || nameCheck?.checking}
                    className="text-sm font-medium rounded-md px-4 py-2 transition-opacity disabled:opacity-50 whitespace-nowrap"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-navy-mid)' }}
                  >
                    {nameCheck?.checking ? <Loader2 size={14} className="animate-spin" /> : 'Check availability'}
                  </button>
                </div>
                {nameCheck && !nameCheck.checking && (
                  <NameBadge available={nameCheck.available} />
                )}
              </Field>

              <Field label="State">
                <input
                  value="Florida (FL)"
                  readOnly
                  className={inputCls('bg-gray-50 text-gray-500')}
                  style={borderStyle}
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
                  <input
                    type="date"
                    value={form.effectiveDate}
                    onChange={(e) => set('effectiveDate', e.target.value)}
                    className={inputCls()}
                    style={borderStyle}
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
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(i, 'name', e.target.value)}
                    placeholder="Full name"
                    className={inputCls('flex-1')}
                    style={borderStyle}
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={member.ownership}
                      onChange={(e) => updateMember(i, 'ownership', e.target.value)}
                      placeholder="100"
                      min="1"
                      max="100"
                      className={inputCls('w-20')}
                      style={borderStyle}
                    />
                    <span className="text-sm" style={{ color: 'var(--color-muted)' }}>%</span>
                  </div>
                  {form.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
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

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!form.businessName.trim() || !form.members[0]?.name.trim()}
              className="text-white text-sm font-medium rounded-md px-6 py-2.5 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-navy)' }}
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
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => set('contactName', e.target.value)}
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
              <Field label="Phone">
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => set('contactPhone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={inputCls()}
                  style={borderStyle}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Principal Address">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Street" required>
                  <input
                    type="text"
                    value={form.principalStreet}
                    onChange={(e) => set('principalStreet', e.target.value)}
                    placeholder="123 Main St"
                    className={inputCls()}
                    style={borderStyle}
                    required
                  />
                </Field>
              </div>
              <Field label="City" required>
                <input
                  type="text"
                  value={form.principalCity}
                  onChange={(e) => set('principalCity', e.target.value)}
                  placeholder="Miami"
                  className={inputCls()}
                  style={borderStyle}
                  required
                />
              </Field>
              <Field label="State">
                <input
                  value="FL"
                  readOnly
                  className={inputCls('bg-gray-50 text-gray-500')}
                  style={borderStyle}
                />
              </Field>
              <Field label="ZIP" required>
                <input
                  type="text"
                  value={form.principalZip}
                  onChange={(e) => set('principalZip', e.target.value)}
                  placeholder="33101"
                  className={inputCls()}
                  style={borderStyle}
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
                    <input
                      type="text"
                      value={form.mailingStreet}
                      onChange={(e) => set('mailingStreet', e.target.value)}
                      placeholder="456 Other St"
                      className={inputCls()}
                      style={borderStyle}
                    />
                  </Field>
                </div>
                <Field label="City">
                  <input
                    type="text"
                    value={form.mailingCity}
                    onChange={(e) => set('mailingCity', e.target.value)}
                    className={inputCls()}
                    style={borderStyle}
                  />
                </Field>
                <Field label="State">
                  <input
                    type="text"
                    value={form.mailingState}
                    onChange={(e) => set('mailingState', e.target.value)}
                    className={inputCls()}
                    style={borderStyle}
                  />
                </Field>
                <Field label="ZIP">
                  <input
                    type="text"
                    value={form.mailingZip}
                    onChange={(e) => set('mailingZip', e.target.value)}
                    className={inputCls()}
                    style={borderStyle}
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
                  <input value={COMPASS_RA_NAME} readOnly className={inputCls('bg-gray-50 text-gray-500')} style={borderStyle} />
                </Field>
                <Field label="RA Address">
                  <input value={COMPASS_RA_ADDRESS} readOnly className={inputCls('bg-gray-50 text-gray-500')} style={borderStyle} />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Field label="RA Name">
                  <input
                    type="text"
                    value={form.raName}
                    onChange={(e) => set('raName', e.target.value)}
                    placeholder="Agent name"
                    className={inputCls()}
                    style={borderStyle}
                  />
                </Field>
                <Field label="RA Address">
                  <input
                    type="text"
                    value={form.raAddress}
                    onChange={(e) => set('raAddress', e.target.value)}
                    placeholder="123 Agent St, City, FL 00000"
                    className={inputCls()}
                    style={borderStyle}
                  />
                </Field>
              </div>
            )}
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
              onClick={() => setStep(3)}
              disabled={!form.contactName.trim() || !form.contactEmail.trim() || !form.principalStreet.trim()}
              className="text-white text-sm font-medium rounded-md px-6 py-2.5 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-navy)' }}
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

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setStep(2)}
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
    <label className="flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors"
      style={{ borderColor: checked ? 'var(--color-navy)' : 'var(--color-border)', backgroundColor: checked ? 'var(--color-bg)' : 'white' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded"
      />
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: '#374151' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{description}</p>
      </div>
      <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--color-navy-mid)' }}>
        +${price}
      </span>
    </label>
  )
}

function LineItem({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between" style={{ color: '#374151' }}>
      <span>{label}</span>
      <span>${amount.toFixed(2)}</span>
    </div>
  )
}
