'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { StyledInput, StyledSelect, Field } from './FormPrimitives'

// Mini section header — sits inside an existing SectionCard, no card wrapper needed
function SubSection({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div
        style={{
          width: 3,
          height: 14,
          borderRadius: 2,
          background: 'linear-gradient(180deg, oklch(0.60 0.20 250) 0%, oklch(0.48 0.18 250) 100%)',
          flexShrink: 0,
          boxShadow: '0 1px 5px oklch(0.56 0.18 250 / 0.22)',
        }}
      />
      <p
        style={{
          fontFamily: 'var(--font-jakarta)',
          fontWeight: 600,
          fontSize: 12.5,
          color: 'oklch(0.36 0.08 245)',
          letterSpacing: '-0.005em',
        }}
      >
        {title}
      </p>
    </div>
  )
}

function Divider() {
  return (
    <div style={{ height: 1, background: 'oklch(0.92 0.01 245)', margin: '20px 0' }} />
  )
}

export const BUSINESS_ACTIVITIES = [
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
  { value: 'new-business',          label: 'Started new business' },
  { value: 'hired-employees',       label: 'Hired employees' },
  { value: 'banking',               label: 'Banking purposes' },
  { value: 'changed-organization',  label: 'Changed type of organization' },
  { value: 'purchased-business',    label: 'Purchased going business' },
  { value: 'irs-withholding',       label: 'IRS withholding regulations' },
  { value: 'other',                 label: 'Other' },
]

export interface EINAddOnValues {
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

interface Props {
  values: EINAddOnValues
  onChange: <K extends keyof EINAddOnValues>(field: K, value: EINAddOnValues[K]) => void
}

export function EINAddOnFields({ values, onChange }: Props) {
  // Local UI state — not stored, derived from whether any count is > 0
  const [hasEmployees, setHasEmployees] = useState(
    Number(values.einEmployeesAgricultural) > 0 ||
    Number(values.einEmployeesHousehold) > 0 ||
    Number(values.einEmployeesOther) > 0
  )

  function toggleEmployees(yes: boolean) {
    setHasEmployees(yes)
    if (!yes) {
      onChange('einEmployeesAgricultural', '0')
      onChange('einEmployeesHousehold', '0')
      onChange('einEmployeesOther', '0')
      onChange('einFirstWagesDate', '')
      onChange('einWants944', false)
    }
  }

  const TOGGLE_BASE: React.CSSProperties = {
    padding: '7px 18px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'var(--font-jakarta)',
    cursor: 'pointer',
    border: '1.5px solid',
    transition: 'all 0.15s',
  }

  return (
    <div style={{ marginTop: 22, paddingTop: 22, borderTop: '1px solid oklch(0.90 0.01 245)' }}>

      {/* Header */}
      <p
        style={{
          fontFamily: 'var(--font-jakarta)',
          fontWeight: 700,
          fontSize: 13.5,
          color: 'oklch(0.38 0.10 250)',
          letterSpacing: '-0.01em',
          marginBottom: 4,
        }}
      >
        EIN Application Details
      </p>
      <p style={{ fontSize: 12.5, color: 'oklch(0.58 0.05 245)', lineHeight: 1.55, marginBottom: 20 }}>
        We&apos;ll prepare and file your SS-4 on your behalf. Fields are pre-filled where possible — review and correct anything that&apos;s off.
      </p>

      {/* ── Section 1: Responsible party ─────────────────────────────────── */}
      <SubSection title="Responsible party" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name">
          <StyledInput
            value={values.einResponsiblePartyFirstName}
            onChange={(e) => onChange('einResponsiblePartyFirstName', e.target.value)}
            placeholder="Jane"
          />
        </Field>
        <Field label="Last Name">
          <StyledInput
            value={values.einResponsiblePartyLastName}
            onChange={(e) => onChange('einResponsiblePartyLastName', e.target.value)}
            placeholder="Smith"
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="col-span-2">
          <Field label="Middle Name / Initial">
            <StyledInput
              value={values.einResponsiblePartyMiddleName}
              onChange={(e) => onChange('einResponsiblePartyMiddleName', e.target.value)}
              placeholder="Optional"
            />
          </Field>
        </div>
        <Field label="Suffix">
          <StyledSelect
            value={values.einResponsiblePartySuffix}
            onChange={(e) => onChange('einResponsiblePartySuffix', e.target.value)}
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

      {/* Citizenship */}
      <div className="mt-4">
        <label
          style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
        >
          <input
            type="checkbox"
            checked={values.einIsUSCitizen}
            onChange={(e) => onChange('einIsUSCitizen', e.target.checked)}
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 13,
              color: 'oklch(0.34 0.06 245)',
              fontFamily: 'var(--font-jakarta)',
            }}
          >
            <span style={{ fontWeight: 500 }}>U.S. citizen or permanent resident</span>
            <span
              style={{
                display: 'block',
                marginTop: 2,
                fontSize: 12,
                color: 'oklch(0.56 0.04 245)',
                lineHeight: 1.5,
              }}
            >
              Uncheck if you&apos;re a non-U.S. national — we handle IRS correspondence on your behalf.
            </span>
          </span>
        </label>
        {!values.einIsUSCitizen && (
          <div
            style={{
              marginTop: 10,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'oklch(0.96 0.05 60)',
              border: '1px solid oklch(0.82 0.10 60)',
              fontSize: 12.5,
              color: 'oklch(0.50 0.14 60)',
              lineHeight: 1.55,
            }}
          >
            Non-U.S. path: SS-4 prepared and faxed to the IRS. An ITIN is optional — the EIN can be issued without one.
          </div>
        )}
      </div>

      {/* Tax ID */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Field label="Tax ID Type">
          <StyledSelect
            value={values.einTaxIdType}
            onChange={(e) => onChange('einTaxIdType', e.target.value as 'ssn' | 'itin')}
          >
            <option value="ssn">SSN — Social Security Number</option>
            <option value="itin">ITIN — Individual Taxpayer ID</option>
          </StyledSelect>
        </Field>
        <Field
          label={values.einTaxIdType === 'ssn' ? 'SSN' : 'ITIN'}
          hint={
            values.einIsUSCitizen
              ? 'Encrypted and never stored in plain text'
              : 'Optional — leave blank if you don\'t have one'
          }
        >
          <div style={{ position: 'relative' }}>
            <StyledInput
              type="password"
              value={values.einTaxId}
              onChange={(e) => onChange('einTaxId', e.target.value)}
              placeholder={
                values.einTaxIdType === 'ssn'
                  ? 'XXX-XX-XXXX'
                  : values.einIsUSCitizen
                    ? '9XX-XX-XXXX'
                    : 'Optional'
              }
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

      <Divider />

      {/* ── Section 2: About the business ────────────────────────────────── */}
      <SubSection title="About the business" />

      <div className="space-y-4">
        <Field label="Trade Name / DBA" hint="Leave blank if the same as your LLC name">
          <StyledInput
            value={values.einTradeName}
            onChange={(e) => onChange('einTradeName', e.target.value)}
            placeholder="Optional"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="County" hint="County where the business operates">
            <StyledInput
              value={values.einCounty}
              onChange={(e) => onChange('einCounty', e.target.value)}
              placeholder="e.g. Pinellas"
            />
          </Field>
          <Field label="Business Activity" hint="Choose the closest category">
            <StyledSelect
              value={values.einBusinessActivity}
              onChange={(e) => onChange('einBusinessActivity', e.target.value)}
            >
              <option value="">— Select —</option>
              {BUSINESS_ACTIVITIES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </StyledSelect>
          </Field>
        </div>

        {values.einBusinessActivity === 'other' && (
          <Field label="Describe your business activity" hint="Max 50 characters">
            <StyledInput
              value={values.einBusinessActivityOther}
              onChange={(e) =>
                onChange('einBusinessActivityOther', e.target.value.slice(0, 50))
              }
              placeholder="e.g. Online consulting services"
              maxLength={50}
            />
          </Field>
        )}

        <Field
          label="What does your business make, sell, or do?"
          hint="A plain description — e.g. 'Consulting services for small businesses'"
        >
          <StyledInput
            value={values.einProductService}
            onChange={(e) => onChange('einProductService', e.target.value.slice(0, 50))}
            placeholder="e.g. Consulting services"
            maxLength={50}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date Business Started">
            <StyledInput
              type="date"
              value={values.einDateStarted}
              onChange={(e) => onChange('einDateStarted', e.target.value)}
            />
          </Field>
          <Field label="Fiscal Year End" hint="Most LLCs use December">
            <StyledSelect
              value={values.einClosingMonth}
              onChange={(e) => onChange('einClosingMonth', e.target.value)}
            >
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </StyledSelect>
          </Field>
        </div>

        <Field label="Reason for Applying">
          <StyledSelect
            value={values.einReasonApplying}
            onChange={(e) => onChange('einReasonApplying', e.target.value)}
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </StyledSelect>
        </Field>
      </div>

      <Divider />

      {/* ── Section 3: Employees ──────────────────────────────────────────── */}
      <SubSection title="Employees" />

      <p style={{ fontSize: 13, color: 'oklch(0.46 0.05 245)', marginBottom: 12 }}>
        Do you plan to hire employees in the next 12 months?
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: hasEmployees ? 20 : 0 }}>
        {[true, false].map((v) => {
          const active = hasEmployees === v
          return (
            <button
              key={String(v)}
              type="button"
              onClick={() => toggleEmployees(v)}
              style={{
                ...TOGGLE_BASE,
                background: active
                  ? 'linear-gradient(135deg, oklch(0.26 0.08 245), oklch(0.20 0.07 245))'
                  : 'rgba(255,255,255,0.85)',
                color: active ? 'white' : 'oklch(0.44 0.06 245)',
                borderColor: active ? 'transparent' : 'oklch(0.86 0.015 245)',
                boxShadow: active
                  ? '0 2px 10px oklch(0.22 0.06 245 / 0.28)'
                  : '0 1px 3px oklch(0.22 0.06 245 / 0.06)',
              }}
            >
              {v ? 'Yes' : 'No'}
            </button>
          )
        })}
      </div>

      {hasEmployees && (
        <div className="space-y-4">
          <p style={{ fontSize: 12.5, color: 'oklch(0.56 0.05 245)', lineHeight: 1.5 }}>
            Enter the number expected in each category — put 0 for any that don&apos;t apply.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Agricultural" hint="Farm / ranch workers">
              <StyledInput
                type="number"
                min="0"
                value={values.einEmployeesAgricultural}
                onChange={(e) => onChange('einEmployeesAgricultural', e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Household" hint="Domestic workers">
              <StyledInput
                type="number"
                min="0"
                value={values.einEmployeesHousehold}
                onChange={(e) => onChange('einEmployeesHousehold', e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Other" hint="All other employees">
              <StyledInput
                type="number"
                min="0"
                value={values.einEmployeesOther}
                onChange={(e) => onChange('einEmployeesOther', e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>

          <Field label="First date wages will be paid">
            <StyledInput
              type="date"
              value={values.einFirstWagesDate}
              onChange={(e) => onChange('einFirstWagesDate', e.target.value)}
            />
          </Field>

          <label
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={values.einWants944}
              onChange={(e) => onChange('einWants944', e.target.checked)}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, color: 'oklch(0.34 0.06 245)', fontFamily: 'var(--font-jakarta)' }}>
              <span style={{ fontWeight: 500 }}>File employment taxes annually (Form 944)</span>
              <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: 'oklch(0.56 0.04 245)' }}>
                Instead of quarterly. Only applicable if your annual payroll tax liability is $1,000 or less.
              </span>
            </span>
          </label>
        </div>
      )}

      <Divider />

      {/* ── Section 4: Previous EIN ───────────────────────────────────────── */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={values.einPreviousEin}
          onChange={(e) => onChange('einPreviousEin', e.target.checked)}
          style={{ marginTop: 2, flexShrink: 0 }}
        />
        <span style={{ fontSize: 13, color: 'oklch(0.34 0.06 245)', fontFamily: 'var(--font-jakarta)' }}>
          <span style={{ fontWeight: 500 }}>This entity previously had an EIN</span>
          <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: 'oklch(0.56 0.04 245)' }}>
            Check this if the LLC had a federal tax ID in the past that was cancelled or abandoned.
          </span>
        </span>
      </label>
    </div>
  )
}
