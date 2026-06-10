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
  einTradeName: string
  einMemberCount: string
  einResponsiblePartyFirstName: string
  einResponsiblePartyMiddleName: string
  einResponsiblePartyLastName: string
  einResponsiblePartySuffix: string
  einTaxIdType: 'ssn' | 'itin'
  einTaxId: string
  einBusinessActivity: string
  einBusinessActivityOther: string
  einDateStarted: string
  einReasonApplying: string
  einIsUSCitizen: boolean
  einCounty: string
  einClosingMonth: string
  einEmployeesAgricultural: string
  einEmployeesHousehold: string
  einEmployeesOther: string
  einWants944: boolean
  einFirstWagesDate: string
  einProductService: string
  einPreviousEin: boolean
}

interface Props {
  values: EinFields
  onChange: (field: keyof EinFields, value: string | boolean) => void
}

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

const REASONS = [
  { value: 'new-business',        label: 'Started new business' },
  { value: 'hired-employees',     label: 'Hired employees' },
  { value: 'banking',             label: 'Banking purposes' },
  { value: 'changed-organization',label: 'Changed type of organization' },
  { value: 'purchased-business',  label: 'Purchased going business' },
  { value: 'irs-withholding',     label: 'Compliance with IRS withholding regulations' },
  { value: 'other',               label: 'Other' },
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
          U.S. citizen / U.S. person (uncheck for non-U.S. nationals — SS-4 fax path)
        </label>
        {!values.einIsUSCitizen && (
          <p className="text-xs mt-1.5 px-3 py-2 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            Non-U.S. path: prepare SS-4, fax to IRS. ITIN is optional — IRS will issue EIN without one.
          </p>
        )}
      </div>

      {/* Trade name */}
      <div className="col-span-2">
        <Field label="Trade Name / DBA" hint="Line 2 — leave blank if LLC name is the trade name">
          <Input
            value={values.einTradeName}
            onChange={(e) => onChange('einTradeName', e.target.value)}
            placeholder="Optional"
          />
        </Field>
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

      {/* Responsible party — split per IRS wizard */}
      <Field label="First Name">
        <Input
          value={values.einResponsiblePartyFirstName}
          onChange={(e) => onChange('einResponsiblePartyFirstName', e.target.value)}
          placeholder="Jane"
        />
      </Field>

      <Field label="Last Name">
        <Input
          value={values.einResponsiblePartyLastName}
          onChange={(e) => onChange('einResponsiblePartyLastName', e.target.value)}
          placeholder="Smith"
        />
      </Field>

      <Field label="Middle Name / Initial">
        <Input
          value={values.einResponsiblePartyMiddleName}
          onChange={(e) => onChange('einResponsiblePartyMiddleName', e.target.value)}
          placeholder="Optional"
        />
      </Field>

      <Field label="Suffix">
        <Select
          value={values.einResponsiblePartySuffix}
          onChange={(e) => onChange('einResponsiblePartySuffix', e.target.value)}
        >
          <option value="">None</option>
          <option value="Jr.">Jr.</option>
          <option value="Sr.">Sr.</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
        </Select>
      </Field>

      {/* Tax ID type */}
      <Field label="Tax ID Type">
        <Select
          value={values.einTaxIdType}
          onChange={(e) => onChange('einTaxIdType', e.target.value as 'ssn' | 'itin')}
        >
          <option value="ssn">SSN (U.S. Social Security Number)</option>
          <option value="itin">ITIN (Individual Taxpayer Identification Number)</option>
        </Select>
      </Field>

      {/* Tax ID value — optional for non-US without ITIN */}
      <Field
        label={values.einTaxIdType === 'ssn' ? 'SSN' : 'ITIN'}
        hint={values.einIsUSCitizen ? 'Encrypted and stored securely' : 'Optional for non-U.S. nationals — leave blank if client has no ITIN'}
      >
        <div className="relative">
          <Input
            type="password"
            value={values.einTaxId}
            onChange={(e) => onChange('einTaxId', e.target.value)}
            placeholder={values.einTaxIdType === 'ssn' ? 'XXX-XX-XXXX' : values.einIsUSCitizen ? '9XX-XX-XXXX' : 'Optional'}
            autoComplete="off"
          />
          <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </Field>

      {/* Business activity — IRS Line 16 */}
      <div className="col-span-2">
        <Field label="Principal Business Activity" hint="IRS SS-4 Line 16 — select the closest category">
          <Select
            value={values.einBusinessActivity}
            onChange={(e) => onChange('einBusinessActivity', e.target.value)}
          >
            <option value="">— Select —</option>
            {BUSINESS_ACTIVITIES.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      {values.einBusinessActivity === 'other' && (
        <div className="col-span-2">
          <Field label="Describe business activity" hint="Max 50 characters">
            <Input
              value={values.einBusinessActivityOther}
              onChange={(e) => onChange('einBusinessActivityOther', e.target.value)}
              maxLength={50}
              placeholder="e.g. Online consulting services"
            />
          </Field>
        </div>
      )}

      {/* Date started */}
      <Field label="Date Business Started">
        <Input
          type="date"
          value={values.einDateStarted}
          onChange={(e) => onChange('einDateStarted', e.target.value)}
        />
      </Field>

      {/* Closing month — IRS Line 12 */}
      <Field label="Fiscal Year End (Closing Month)">
        <Select
          value={values.einClosingMonth}
          onChange={(e) => onChange('einClosingMonth', e.target.value)}
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </Select>
      </Field>

      {/* Reason for applying */}
      <Field label="Reason for Applying">
        <Select
          value={values.einReasonApplying}
          onChange={(e) => onChange('einReasonApplying', e.target.value)}
        >
          <option value="">— Select —</option>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </Select>
      </Field>

      {/* County — IRS SS-4 Line 6 */}
      <Field label="County" hint="Line 6 — county where business is located (e.g. Miami-Dade)">
        <Input
          value={values.einCounty}
          onChange={(e) => onChange('einCounty', e.target.value)}
          placeholder="Pinellas"
        />
      </Field>

      {/* Employees — IRS Line 13 (three separate counts) */}
      <div className="col-span-2">
        <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
          Line 13 — Employees expected in next 12 months (enter 0 if none)
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Agricultural">
            <Input
              type="number" min="0"
              value={values.einEmployeesAgricultural}
              onChange={(e) => onChange('einEmployeesAgricultural', e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Household">
            <Input
              type="number" min="0"
              value={values.einEmployeesHousehold}
              onChange={(e) => onChange('einEmployeesHousehold', e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Other">
            <Input
              type="number" min="0"
              value={values.einEmployeesOther}
              onChange={(e) => onChange('einEmployeesOther', e.target.value)}
              placeholder="0"
            />
          </Field>
        </div>
      </div>

      {/* Line 14 — Form 944 annual filing */}
      <div className="col-span-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={values.einWants944}
            onChange={(e) => onChange('einWants944', e.target.checked)}
            className="rounded"
          />
          Line 14 — Request to file Form 944 annually (instead of quarterly 941s)
        </label>
      </div>

      {/* Line 15 — First wages date (show only when Other employees > 0) */}
      {Number(values.einEmployeesOther) > 0 || Number(values.einEmployeesAgricultural) > 0 || Number(values.einEmployeesHousehold) > 0 ? (
        <Field label="First date wages paid" hint="Line 15">
          <Input
            type="date"
            value={values.einFirstWagesDate}
            onChange={(e) => onChange('einFirstWagesDate', e.target.value)}
          />
        </Field>
      ) : null}

      {/* Line 17 — Product/service description */}
      <div className="col-span-2">
        <Field label="Principal product or service" hint="Line 17 — what does the business make, sell, or do?">
          <Input
            value={values.einProductService}
            onChange={(e) => onChange('einProductService', e.target.value)}
            placeholder="e.g. Consulting services for small businesses"
            maxLength={50}
          />
        </Field>
      </div>

      {/* Line 18 — Previously issued EIN */}
      <div className="col-span-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={values.einPreviousEin}
            onChange={(e) => onChange('einPreviousEin', e.target.checked)}
            className="rounded"
          />
          Line 18 — Applicant previously had an EIN
        </label>
      </div>
    </div>
  )
}
