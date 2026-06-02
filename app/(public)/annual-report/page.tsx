'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'

const SERVICE_FEE = 125
const STATE_FEE = 138.75
const TOTAL = SERVICE_FEE + STATE_FEE

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

interface FormState {
  llcName: string
  docNumber: string
  contactName: string
  contactEmail: string
  contactPhone: string
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
  })

  const borderStyle = { borderColor: 'var(--color-border)' }

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
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

  const step1Valid = form.llcName.trim() && form.docNumber.trim() && form.contactName.trim() && form.contactEmail.trim()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
      >
        File Florida Annual Report
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
        Keep your LLC active on Sunbiz. $125 service + $138.75 state fee = $263.75 total. Due May 1.
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

              <Field label="FL Document Number" required>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.docNumber}
                    onChange={(e) => set('docNumber', e.target.value)}
                    placeholder="L12345678 or P12345678"
                    className={inputCls('flex-1')}
                    style={borderStyle}
                    required
                  />
                  {/* TODO: wire to /api/sunbiz/lookup when route exists */}
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-1 text-sm font-medium rounded-md px-4 py-2 opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-navy-mid)' }}
                    title="Coming soon"
                  >
                    <FileText size={14} />
                    Pull from Sunbiz
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Found on your Florida Division of Corporations filing. Format: L or P followed by 8 digits.
                </p>
              </Field>
            </div>
          </SectionCard>

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
              <SummaryRow label="FL Document Number" value={form.docNumber} />
              <SummaryRow label="Contact Name" value={form.contactName} />
              <SummaryRow label="Contact Email" value={form.contactEmail} />
              {form.contactPhone && <SummaryRow label="Phone" value={form.contactPhone} />}
            </dl>
          </SectionCard>

          <SectionCard title="Price Breakdown">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between" style={{ color: '#374151' }}>
                <span>Annual Report — service fee</span>
                <span>${SERVICE_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ color: '#374151' }}>
                <span>Florida state fee</span>
                <span>${STATE_FEE.toFixed(2)}</span>
              </div>
              <div
                className="flex justify-between font-semibold pt-3 mt-1"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <span>Total</span>
                <span style={{ color: 'var(--color-blue)' }}>${TOTAL.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--color-muted)' }}>
              No auto-renewals. No surprise charges. One flat fee, filed by a real person.
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
