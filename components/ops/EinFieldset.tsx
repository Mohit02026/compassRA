'use client'

// EIN sub-form — rendered inside NewOrderForm when addOnEin is checked.
// All sensitive fields (ssn, itin) encrypted at rest via SENSITIVE_KEYS in services/orders.ts.

import { Lock } from 'lucide-react'

const inputClass =
  'w-full border rounded-md px-3 py-2 text-sm outline-none transition-all focus:ring-2'
const inputStyle = { borderColor: 'var(--color-border)' }

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
        {label}
      </label>
      {hint && (
        <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} style={inputStyle} />
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={inputClass} style={inputStyle} />
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={2} className={inputClass} style={inputStyle} />
}

export interface EinFields {
  einMemberCount: string
  einResponsibleParty: string
  einTaxIdType: 'ssn' | 'itin'
  einTaxId: string
  einBusinessPurpose: string
  einDateStarted: string
  einReasonApplying: string
  einIsUSCitizen: boolean
}

interface Props {
  values: EinFields
  onChange: (field: keyof EinFields, value: string | boolean) => void
}

const REASONS = [
  { value: 'started_business', label: 'Started new business' },
  { value: 'hired_employees', label: 'Hired employees' },
  { value: 'banking', label: 'Banking purposes' },
  { value: 'other', label: 'Other' },
]

export function EinFieldset({ values, onChange }: Props) {
  return (
    <div
      className="mt-4 pt-4 grid grid-cols-2 gap-4"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <div className="col-span-2">
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-navy-mid)' }}>
          EIN Application Details
        </p>
      </div>

      {/* Citizenship toggle */}
      <div className="col-span-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={values.einIsUSCitizen}
            onChange={(e) => onChange('einIsUSCitizen', e.target.checked)}
            className="rounded"
          />
          U.S. citizen / U.S. person (uncheck for non-U.S. nationals — includes SS-4 preparation)
        </label>
        {!values.einIsUSCitizen && (
          <p className="text-xs mt-1.5 px-3 py-2 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            Non-U.S. package: we prepare IRS Form SS-4 on your behalf (+$100).
          </p>
        )}
      </div>

      {/* Member count */}
      <Field label="Number of Members">
        <Input
          type="number"
          min="1"
          value={values.einMemberCount}
          onChange={(e) => onChange('einMemberCount', e.target.value)}
          placeholder="1"
        />
      </Field>

      {/* Responsible party */}
      <Field label="Responsible Party Name">
        <Input
          value={values.einResponsibleParty}
          onChange={(e) => onChange('einResponsibleParty', e.target.value)}
          placeholder="Jane Smith"
        />
      </Field>

      {/* Tax ID type toggle */}
      <Field label="Tax ID Type">
        <Select
          value={values.einTaxIdType}
          onChange={(e) => onChange('einTaxIdType', e.target.value as 'ssn' | 'itin')}
        >
          <option value="ssn">SSN (U.S. Social Security Number)</option>
          <option value="itin">ITIN (Individual Taxpayer Identification Number)</option>
        </Select>
      </Field>

      {/* Tax ID value */}
      <Field
        label={values.einTaxIdType === 'ssn' ? 'SSN' : 'ITIN'}
        hint="Encrypted and stored securely — never shared"
      >
        <div className="relative">
          <Input
            type="password"
            value={values.einTaxId}
            onChange={(e) => onChange('einTaxId', e.target.value)}
            placeholder={values.einTaxIdType === 'ssn' ? 'XXX-XX-XXXX' : '9XX-XX-XXXX'}
            autoComplete="off"
          />
          <Lock
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </Field>

      {/* Business purpose */}
      <div className="col-span-2">
        <Field label="Business Purpose" hint="Max 50 characters — used verbatim on EIN application">
          <Textarea
            value={values.einBusinessPurpose}
            onChange={(e) => onChange('einBusinessPurpose', e.target.value)}
            maxLength={50}
            placeholder="Real estate investment and management"
          />
          <p className="text-xs text-right mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {values.einBusinessPurpose.length}/50
          </p>
        </Field>
      </div>

      {/* Date started */}
      <Field label="Date Business Started">
        <Input
          type="date"
          value={values.einDateStarted}
          onChange={(e) => onChange('einDateStarted', e.target.value)}
        />
      </Field>

      {/* Reason for applying */}
      <Field label="Reason for Applying">
        <Select
          value={values.einReasonApplying}
          onChange={(e) => onChange('einReasonApplying', e.target.value)}
        >
          <option value="">— Select —</option>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  )
}
