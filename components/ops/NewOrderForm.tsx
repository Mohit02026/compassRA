'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { EinFieldset, type EinFields } from '@/components/ops/EinFieldset'

const RA_NAME = 'Compass Registered Agent LLC'
const RA_ADDRESS = '123 Business Ave, Tallahassee, FL 32301'

const SERVICE_TYPES = [
  { value: 'ANNUAL_REPORT', label: 'Annual Report' },
  { value: 'LLC_FORMATION', label: 'LLC Formation' },
  { value: 'RA_TAKEOVER', label: 'RA Takeover' },
]

const TIERS = [
  { value: 'SELF_SERVE', label: 'Self-Serve' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'WHITE_GLOVE', label: 'White Glove' },
]

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-lg p-5 mb-4"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <h2
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--color-navy-mid)' }}
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

const inputClass =
  'w-full border rounded-md px-3 py-2 text-sm outline-none transition-all focus:ring-2'
const inputStyle = { borderColor: 'var(--color-border)' }

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { readOnly?: boolean }) {
  return (
    <input
      {...props}
      className={`${inputClass} ${props.readOnly ? 'bg-gray-50 text-gray-500' : ''}`}
      style={inputStyle}
    />
  )
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={inputClass} style={inputStyle} />
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} rows={3} className={inputClass} style={inputStyle} />
  )
}

export default function NewOrderForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    // Customer
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    // Business
    businessName: '',
    serviceType: 'ANNUAL_REPORT',
    tier: 'STANDARD',
    state: 'FL',
    principalAddress: '',
    mailingAddress: '',
    // RA (explicit upsell — only send if selected)
    useCompassRA: false,
    // Organizer
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    // Filing
    dueDate: '',
    serviceFee: '',
    stateFee: '',
    paymentRef: '',
    internalNotes: '',
    // Add-ons
    addOnEin: false,
    addOnOperatingAgreement: false,
    addOnCertificateOfStatus: false,
    // LLC Formation fields
    managementType: 'member-managed',
    effectiveDateType: 'immediate',
    effectiveDate: '',
  })

  // LLC members list
  const [members, setMembers] = useState([{ name: '', ownershipPct: '' }])

  // EIN fields
  const [einFields, setEinFields] = useState<EinFields>({
    einMemberCount: '',
    einResponsibleParty: '',
    einTaxIdType: 'ssn',
    einTaxId: '',
    einBusinessPurpose: '',
    einDateStarted: '',
    einReasonApplying: '',
    einIsUSCitizen: true,
  })

  function addMember() {
    setMembers((prev) => [...prev, { name: '', ownershipPct: '' }])
  }

  function removeMember(i: number) {
    setMembers((prev) => prev.filter((_, idx) => idx !== i))
  }

  function setMember(i: number, field: 'name' | 'ownershipPct', value: string) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)))
  }

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const serviceFeeNum = parseFloat(form.serviceFee) || 0
  const stateFeeNum = parseFloat(form.stateFee) || 0
  const total = serviceFeeNum + stateFeeNum

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          serviceFee: serviceFeeNum,
          stateFee: stateFeeNum,
          dueDate: form.dueDate || undefined,
          customerPhone: form.customerPhone || undefined,
          principalAddress: form.principalAddress || undefined,
          mailingAddress: form.mailingAddress || undefined,
          organizerName: form.organizerName || undefined,
          organizerEmail: form.organizerEmail || undefined,
          organizerPhone: form.organizerPhone || undefined,
          paymentRef: form.paymentRef || undefined,
          internalNotes: form.internalNotes || undefined,
          // LLC Formation extras
          members: form.serviceType === 'LLC_FORMATION' ? members : undefined,
          effectiveDate:
            form.serviceType === 'LLC_FORMATION' && form.effectiveDateType === 'future'
              ? form.effectiveDate
              : undefined,
          // EIN extras (only when add-on selected)
          ...(form.addOnEin ? einFields : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error?.message ?? 'Failed to create order.')
        return
      }

      router.push(`/ops/orders/${data.data.orderId}`)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
        <Link href="/ops/orders" className="hover:underline">Orders</Link>
        <ChevronLeft size={14} className="rotate-180" />
        <span>New Order</span>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-navy-mid)' }}>
        Create New Order
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
        Fill in the details below. A welcome email with portal access will be sent automatically.
      </p>

      <form onSubmit={handleSubmit}>
        {/* 1. Customer Information */}
        <SectionCard title="Customer Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <Input
                value={form.customerName}
                onChange={(e) => set('customerName', e.target.value)}
                required
                placeholder="Jane Smith"
              />
            </Field>
            <Field label="Email" required>
              <Input
                type="email"
                value={form.customerEmail}
                onChange={(e) => set('customerEmail', e.target.value)}
                required
                placeholder="jane@example.com"
              />
            </Field>
            <Field label="Phone">
              <Input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => set('customerPhone', e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </Field>
          </div>
        </SectionCard>

        {/* 2. Business Information */}
        <SectionCard title="Business Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Business Name" required>
              <Input
                value={form.businessName}
                onChange={(e) => set('businessName', e.target.value)}
                required
                placeholder="Acme LLC"
              />
            </Field>
            <Field label="Service Type" required>
              <Select
                value={form.serviceType}
                onChange={(e) => set('serviceType', e.target.value)}
                required
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="State">
              <Input value={form.state} readOnly />
            </Field>
            <Field label="Tier" required>
              <Select
                value={form.tier}
                onChange={(e) => set('tier', e.target.value)}
                required
              >
                {TIERS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Principal Address">
              <Input
                value={form.principalAddress}
                onChange={(e) => set('principalAddress', e.target.value)}
                placeholder="123 Main St, Miami, FL 33101"
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Mailing Address">
              <Input
                value={form.mailingAddress}
                onChange={(e) => set('mailingAddress', e.target.value)}
                placeholder="Leave blank if same as principal"
              />
            </Field>
          </div>
        </SectionCard>

        {/* LLC Formation extras — only shown for LLC_FORMATION */}
        {form.serviceType === 'LLC_FORMATION' && (
          <SectionCard title="LLC Formation Details">
            <div className="grid grid-cols-2 gap-4">
              {/* Management type */}
              <Field label="Management Structure" required>
                <Select
                  value={form.managementType}
                  onChange={(e) => set('managementType', e.target.value)}
                >
                  <option value="member-managed">Member-Managed</option>
                  <option value="manager-managed">Manager-Managed</option>
                </Select>
              </Field>

              {/* Effective date */}
              <Field label="Effective Date">
                <Select
                  value={form.effectiveDateType}
                  onChange={(e) => set('effectiveDateType', e.target.value)}
                >
                  <option value="immediate">Immediate (upon filing)</option>
                  <option value="future">Future date</option>
                </Select>
              </Field>

              {form.effectiveDateType === 'future' && (
                <Field label="Effective Date (future)">
                  <Input
                    type="date"
                    value={form.effectiveDate}
                    onChange={(e) => set('effectiveDate', e.target.value)}
                  />
                </Field>
              )}
            </div>

            {/* Members */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: 'var(--color-navy-mid)' }}>
                  Members / Owners
                </p>
                <button
                  type="button"
                  onClick={addMember}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-md border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                >
                  <Plus size={12} /> Add member
                </button>
              </div>
              {members.map((m, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <Input
                    value={m.name}
                    onChange={(e) => setMember(i, 'name', e.target.value)}
                    placeholder="Full name"
                    className="flex-1"
                  />
                  <div className="w-24">
                    <Input
                      value={m.ownershipPct}
                      onChange={(e) => setMember(i, 'ownershipPct', e.target.value)}
                      placeholder="% owned"
                      type="number"
                      min="0"
                      max="100"
                    />
                  </div>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* 3. Registered Agent */}
        <SectionCard title="Registered Agent">
          <label className="flex items-center gap-2 mb-4 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.useCompassRA}
              onChange={(e) => set('useCompassRA', e.target.checked)}
              className="rounded"
            />
            Use Compass as Registered Agent (upsell)
          </label>
          {form.useCompassRA && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="RA Name">
                <Input value={RA_NAME} readOnly />
              </Field>
              <Field label="RA Address">
                <Input value={RA_ADDRESS} readOnly />
              </Field>
            </div>
          )}
        </SectionCard>

        {/* 4. Organizer */}
        <SectionCard title="Organizer / Authorized Signer">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <Input
                value={form.organizerName}
                onChange={(e) => set('organizerName', e.target.value)}
                placeholder="John Doe"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.organizerEmail}
                onChange={(e) => set('organizerEmail', e.target.value)}
                placeholder="john@example.com"
              />
            </Field>
            <Field label="Phone">
              <Input
                type="tel"
                value={form.organizerPhone}
                onChange={(e) => set('organizerPhone', e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </Field>
          </div>
        </SectionCard>

        {/* 5. Filing Details */}
        <SectionCard title="Filing Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Due Date">
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
              />
            </Field>
            <Field label="Payment Reference">
              <Input
                value={form.paymentRef}
                onChange={(e) => set('paymentRef', e.target.value)}
                placeholder="Invoice #, Venmo, etc."
              />
            </Field>
            <Field label="Service Fee ($)" required>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.serviceFee}
                onChange={(e) => set('serviceFee', e.target.value)}
                required
                placeholder="125.00"
              />
            </Field>
            <Field label="State Fee ($)" required>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.stateFee}
                onChange={(e) => set('stateFee', e.target.value)}
                required
                placeholder="138.75"
              />
            </Field>
          </div>

          {/* Total */}
          {(serviceFeeNum > 0 || stateFeeNum > 0) && (
            <div
              className="mt-4 pt-4 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                ${serviceFeeNum.toFixed(2)} + ${stateFeeNum.toFixed(2)} =
              </span>
              <span className="text-lg font-bold" style={{ color: 'var(--color-blue)' }}>
                ${total.toFixed(2)} total
              </span>
            </div>
          )}

          {/* Add-ons */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-navy-mid)' }}>
              Add-ons
            </p>
            {[
              { key: 'addOnEin', label: 'EIN (Employer Identification Number)' },
              { key: 'addOnOperatingAgreement', label: 'Operating Agreement' },
              { key: 'addOnCertificateOfStatus', label: 'Certificate of Status' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 mb-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => set(key, e.target.checked)}
                  className="rounded"
                />
                {label}
              </label>
            ))}

            {/* EIN detail fields — expanded when EIN add-on is checked */}
            {form.addOnEin && (
              <EinFieldset
                values={einFields}
                onChange={(field, value) =>
                  setEinFields((prev) => ({ ...prev, [field]: value }))
                }
              />
            )}
          </div>

          {/* Internal Notes */}
          <div className="mt-4">
            <Field label="Internal Notes">
              <Textarea
                value={form.internalNotes}
                onChange={(e) => set('internalNotes', e.target.value)}
                placeholder="Ops-only notes — not visible to customer"
              />
            </Field>
          </div>
        </SectionCard>

        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-6">
          <Link
            href="/ops/orders"
            className="text-sm"
            style={{ color: 'var(--color-muted)' }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="text-white text-sm font-medium rounded-md px-5 py-2.5 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-navy)' }}
          >
            {submitting ? 'Creating…' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  )
}
