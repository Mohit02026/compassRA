'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import IntakeLayout from '@/components/public/IntakeLayout'
import OptionCard from '@/components/public/OptionCard'
import PanelUSMap from '@/components/public/intake-panels/PanelUSMap'
import PanelIndustryGauge from '@/components/public/intake-panels/PanelIndustryGauge'
import PanelCalendar from '@/components/public/intake-panels/PanelCalendar'
import PanelContactCard from '@/components/public/intake-panels/PanelContactCard'

// ─── Shared design primitives (match LLC wizard exactly) ──────────────────────

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 40 }}>
      <h1 style={{ fontSize: 48, fontWeight: 600, color: 'rgb(23, 23, 23)', lineHeight: 1, letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-dm-sans)' }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 16, fontWeight: 400, color: 'rgb(76, 76, 76)', lineHeight: 1.13, fontFamily: 'var(--font-dm-sans)', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {children}
    </div>
  )
}

function ContinueBtn({ onClick, disabled, label = 'Continue' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="intake-continue-btn"
      style={{
        width: '100%', padding: '14px 24px', borderRadius: 8,
        border: disabled ? '1px solid rgba(59,96,243,0.2)' : '1px solid rgb(59,96,243)',
        background: disabled ? 'rgb(248,249,252)' : 'rgb(59,96,243)',
        color: disabled ? 'rgba(59,96,243,0.45)' : 'rgb(255,255,255)',
        fontSize: 16, fontWeight: 600, lineHeight: 1, fontFamily: 'var(--font-dm-sans)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
      }}
    >
      {label}
    </button>
  )
}

function StyledTextInput({ value, onChange, placeholder, type = 'text', label, required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; label: string; required?: boolean
}) {
  return (
    <div style={{ marginBottom: 0 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
        {label}{required && ' *'}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        style={{ width: '100%', padding: '15px 16px', borderRadius: 8, border: '1px solid rgb(224, 224, 224)', fontSize: 16, fontFamily: 'var(--font-dm-sans)', color: 'rgb(23,23,23)', outline: 'none', background: '#ffffff', boxSizing: 'border-box', transition: 'border-color 0.5s ease' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#3b60f3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgb(224, 224, 224)'; e.currentTarget.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function StyledSelectInput({ value, onChange, label, required, children }: {
  value: string; onChange: (v: string) => void; label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 0 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
        {label}{required && ' *'}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={value} onChange={(e) => onChange(e.target.value)} required={required}
          style={{ width: '100%', padding: '15px 44px 15px 16px', borderRadius: 8, border: '1px solid rgb(224,224,224)', fontSize: 16, fontFamily: 'var(--font-dm-sans)', color: value ? 'rgb(23,23,23)' : 'rgb(130,130,130)', background: '#ffffff', appearance: 'none', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3b60f3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgb(224,224,224)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          {children}
        </select>
        <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(100,100,100)" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRICE_US = 75
const PRICE_NON_US = 175

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

// ─── Form state ───────────────────────────────────────────────────────────────

interface SunbizResult {
  name: string
  documentNumber: string
  status: string
  filingDate: string    // YYYY-MM-DD from SunBiz Daily API
  county: string
  mailingStreet: string
  mailingCity: string
  mailingState: string
  mailingZip: string
  mailingAddress: string // composed single-line for display
}

interface FormState {
  llcName: string
  tradeName: string
  memberCount: string
  mailingStreet: string
  mailingCity: string
  mailingState: string
  mailingZip: string
  county: string
  responsiblePartyFirstName: string
  responsiblePartyMiddleName: string
  responsiblePartyLastName: string
  responsiblePartySuffix: string
  taxIdType: TaxIdType
  taxId: string
  businessActivity: string
  businessActivityOther: string
  businessStartDate: string
  applyReason: ApplyReason
  closingMonth: string
  employeesAgricultural: string
  employeesHousehold: string
  employeesOther: string
  wants944: boolean
  firstWagesDate: string
  productService: string
  previousEin: boolean
  isUsCitizen: boolean
  contactEmail: string
  docNumber: string
  mailingHint: string
}

const DEFAULT_FORM: FormState = {
  llcName: '',
  docNumber: '',
  mailingHint: '',
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

// ─── Step components ──────────────────────────────────────────────────────────

function Step1FindLLC({ llcName, tradeName, docNumber, sunbizState, onDocNumber, onLlcName, onTradeName, onLookup, onNext }: {
  llcName: string; tradeName: string; docNumber: string
  sunbizState: 'idle' | 'loading' | 'found' | 'not-found' | 'error'
  onDocNumber: (v: string) => void; onLlcName: (v: string) => void; onTradeName: (v: string) => void
  onLookup: () => void; onNext: () => void
}) {
  const [focused, setFocused] = useState(false)
  const floated = focused || llcName.length > 0
  return (
    <>
      <StepHeading title="Let's find your Florida LLC" subtitle="Enter your FL document number and we'll pull your details from Sunbiz." />
      <FormCard>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
            FL Document Number
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" value={docNumber} onChange={(e) => onDocNumber(e.target.value)} placeholder="L25000307072"
              style={{ flex: 1, padding: '15px 16px', borderRadius: 8, border: '1px solid rgb(224, 224, 224)', fontSize: 16, fontFamily: 'var(--font-dm-sans)', color: 'rgb(23,23,23)', outline: 'none', background: '#ffffff', boxSizing: 'border-box', transition: 'border-color 0.5s ease' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#3b60f3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgb(224, 224, 224)'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <button
              type="button" onClick={onLookup}
              disabled={!docNumber.trim() || sunbizState === 'loading'}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '15px 18px', borderRadius: 8, border: '1px solid rgb(59,96,243)', background: 'rgb(248,249,252)', color: 'rgb(59,96,243)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-dm-sans)', cursor: 'pointer', whiteSpace: 'nowrap', opacity: (!docNumber.trim() || sunbizState === 'loading') ? 0.4 : 1 }}
            >
              {sunbizState === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              {sunbizState === 'loading' ? 'Fetching…' : 'Look up on Sunbiz'}
            </button>
          </div>
          {sunbizState === 'found' && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgb(240,253,244)', border: '1px solid rgb(187,247,208)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={15} style={{ color: 'rgb(22,163,74)', flexShrink: 0 }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgb(22,101,52)', fontFamily: 'var(--font-dm-sans)', margin: 0 }}>Found — details pre-filled below</p>
            </div>
          )}
          {sunbizState === 'not-found' && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgb(254,242,242)', border: '1px solid rgb(254,202,202)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={15} style={{ color: 'rgb(220,38,38)', flexShrink: 0 }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgb(185,28,28)', fontFamily: 'var(--font-dm-sans)', margin: 0 }}>Not found — check the number or fill in manually</p>
            </div>
          )}
          {sunbizState === 'error' && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgb(255,251,235)', border: '1px solid rgb(252,211,77)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={15} style={{ color: 'rgb(146,64,14)', flexShrink: 0 }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgb(120,53,15)', fontFamily: 'var(--font-dm-sans)', margin: 0 }}>Sunbiz unavailable — fill in manually</p>
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <label style={{ position: 'absolute', left: 16, top: floated ? 8 : 17, fontSize: floated ? 11 : 16, fontWeight: 400, color: focused ? 'rgb(59,96,243)' : floated ? 'rgb(120,120,120)' : 'rgb(178,178,178)', fontFamily: 'var(--font-dm-sans)', lineHeight: 1, pointerEvents: 'none', zIndex: 1, backgroundColor: 'rgb(255,255,255)', paddingLeft: 2, paddingRight: 4, transition: 'top 0.3s ease, font-size 0.3s ease, color 0.3s ease' }}>
            LLC name *
          </label>
          <input
            type="text" value={llcName} onChange={(e) => onLlcName(e.target.value)}
            style={{ width: '100%', padding: '24px 16px 10px 16px', borderRadius: 8, border: focused ? '1px solid #3b60f3' : '1px solid rgb(224,224,224)', fontSize: 16, fontFamily: 'var(--font-dm-sans)', color: 'rgb(23,23,23)', outline: 'none', background: 'rgb(255,255,255)', boxSizing: 'border-box', boxShadow: focused ? '0 0 0 3px rgba(59,96,243,0.12)' : 'none', transition: 'border-color 0.5s ease, box-shadow 0.3s ease' }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
        <StyledTextInput label="Trade name / DBA" value={tradeName} onChange={onTradeName} placeholder="Optional — leave blank if same as LLC name" />
        <ContinueBtn onClick={onNext} disabled={!llcName.trim()} />
      </FormCard>
    </>
  )
}

function Step2Address({ mailingStreet, mailingCity, mailingState, mailingZip, county, memberCount, mailingHint, onChange, onNext }: {
  mailingStreet: string; mailingCity: string; mailingState: string; mailingZip: string; county: string; memberCount: string; mailingHint: string;
  onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void; onNext: () => void
}) {
  const valid = mailingStreet.trim() && mailingCity.trim() && mailingZip.trim() && county.trim()
  return (
    <>
      <StepHeading title="What's the LLC's mailing address?" subtitle="This will appear on the IRS SS-4 form." />
      <FormCard>
        {mailingHint && (
          <div style={{ padding: '10px 14px', background: 'rgb(239,246,255)', border: '1px solid rgb(147,197,253)', borderRadius: 8, fontSize: 13, color: 'rgb(29,78,216)', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.5 }}>
            Found on Sunbiz: <strong>{mailingHint}</strong> — confirm or edit below
          </div>
        )}
        <StyledTextInput label="Street Address" value={mailingStreet} onChange={(v) => onChange('mailingStreet', v)} placeholder="123 Main St" required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: 12 }}>
          <StyledTextInput label="City" value={mailingCity} onChange={(v) => onChange('mailingCity', v)} placeholder="Miami" required />
          <StyledTextInput label="State" value={mailingState} onChange={(v) => onChange('mailingState', v.toUpperCase().slice(0, 2))} placeholder="FL" />
          <StyledTextInput label="ZIP" value={mailingZip} onChange={(v) => onChange('mailingZip', v.slice(0, 10))} placeholder="33101" required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StyledTextInput label="County" value={county} onChange={(v) => onChange('county', v)} placeholder="e.g. Miami-Dade" required />
          <StyledTextInput label="Number of Members" type="number" value={memberCount} onChange={(v) => onChange('memberCount', v)} />
        </div>
        <ContinueBtn onClick={onNext} disabled={!valid} />
      </FormCard>
    </>
  )
}

function Step3BusinessDetails({ businessStartDate, closingMonth, applyReason, businessActivity, businessActivityOther, productService, onField, step3Valid, onNext }: {
  businessStartDate: string; closingMonth: string; applyReason: string; businessActivity: string; businessActivityOther: string; productService: string;
  onField: <K extends keyof FormState>(field: K, value: FormState[K]) => void; step3Valid: boolean; onNext: () => void
}) {
  return (
    <>
      <StepHeading title="Tell us about the business" subtitle="These answers go directly onto your SS-4 form." />
      <FormCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StyledTextInput label="Date business started" type="date" value={businessStartDate} onChange={(v) => onField('businessStartDate', v)} required />
          <StyledSelectInput label="Fiscal year end" value={closingMonth} onChange={(v) => onField('closingMonth', v)}>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </StyledSelectInput>
        </div>
        <StyledSelectInput label="Reason for applying" value={applyReason} onChange={(v) => onField('applyReason', v as ApplyReason)} required>
          <option value="new-business">Started new business</option>
          <option value="hired-employees">Hired employees</option>
          <option value="banking">Banking purposes</option>
          <option value="changed-organization">Changed type of organization</option>
          <option value="purchased-business">Purchased going business</option>
          <option value="irs-withholding">IRS withholding regulations</option>
          <option value="other">Other</option>
        </StyledSelectInput>
        <StyledSelectInput label="Principal business activity" value={businessActivity} onChange={(v) => onField('businessActivity', v)} required>
          <option value="">— Select category —</option>
          {BUSINESS_ACTIVITIES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </StyledSelectInput>
        {businessActivity === 'other' && (
          <StyledTextInput label="Describe your business activity" value={businessActivityOther} onChange={(v) => onField('businessActivityOther', v.slice(0, 50))} placeholder="e.g. Online consulting services" required />
        )}
        <StyledTextInput label="What does your business make, sell, or do?" value={productService} onChange={(v) => onField('productService', v.slice(0, 50))} placeholder="e.g. Consulting services" required />
        <ContinueBtn onClick={onNext} disabled={!step3Valid} />
      </FormCard>
    </>
  )
}

function Step4Employees({ hasEmployees, toggleEmployees, employeesAgricultural, employeesHousehold, employeesOther, firstWagesDate, wants944, previousEin, onField, step4Valid, onNext }: {
  hasEmployees: boolean | null; toggleEmployees: (yes: boolean) => void;
  employeesAgricultural: string; employeesHousehold: string; employeesOther: string;
  firstWagesDate: string; wants944: boolean; previousEin: boolean;
  onField: <K extends keyof FormState>(field: K, value: FormState[K]) => void; step4Valid: boolean; onNext: () => void
}) {
  const hasAnyEmployees = Number(employeesAgricultural) > 0 || Number(employeesHousehold) > 0 || Number(employeesOther) > 0
  return (
    <>
      <StepHeading title="Do you plan to hire employees?" subtitle="This helps the IRS know whether payroll taxes apply." />
      <FormCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <OptionCard selected={hasEmployees === true} onClick={() => toggleEmployees(true)}>Yes</OptionCard>
          <OptionCard selected={hasEmployees === false} onClick={() => toggleEmployees(false)}>No</OptionCard>
        </div>
        {hasEmployees && (
          <>
            <p style={{ fontSize: 13, color: 'rgb(80,80,80)', fontFamily: 'var(--font-dm-sans)', margin: 0 }}>
              Enter expected employees in each category (0 if none apply).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <StyledTextInput label="Agricultural" type="number" value={employeesAgricultural} onChange={(v) => onField('employeesAgricultural', v)} placeholder="0" />
              <StyledTextInput label="Household" type="number" value={employeesHousehold} onChange={(v) => onField('employeesHousehold', v)} placeholder="0" />
              <StyledTextInput label="Other" type="number" value={employeesOther} onChange={(v) => onField('employeesOther', v)} placeholder="0" />
            </div>
            {hasAnyEmployees && (
              <StyledTextInput label="First date wages will be paid" type="date" value={firstWagesDate} onChange={(v) => onField('firstWagesDate', v)} required />
            )}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={wants944} onChange={(e) => onField('wants944', e.target.checked)} style={{ marginTop: 3 }} />
              <span style={{ fontSize: 14, color: 'rgb(60,60,60)', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.5 }}>
                File employment taxes annually (Form 944) — for annual payroll tax liability ≤ $1,000
              </span>
            </label>
          </>
        )}
        <div style={{ borderTop: '1px solid rgb(230,230,230)', paddingTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={previousEin} onChange={(e) => onField('previousEin', e.target.checked)} style={{ marginTop: 3 }} />
            <span style={{ fontSize: 14, color: 'rgb(60,60,60)', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.5 }}>
              This entity previously had an EIN (cancelled or abandoned)
            </span>
          </label>
        </div>
        <ContinueBtn onClick={onNext} disabled={!step4Valid} />
      </FormCard>
    </>
  )
}

function Step5Identity({ responsiblePartyFirstName, responsiblePartyMiddleName, responsiblePartyLastName, responsiblePartySuffix, contactEmail, isUsCitizen, taxIdType, taxId, onField, step5Valid, onNext }: {
  responsiblePartyFirstName: string; responsiblePartyMiddleName: string; responsiblePartyLastName: string; responsiblePartySuffix: string;
  contactEmail: string; isUsCitizen: boolean; taxIdType: TaxIdType; taxId: string;
  onField: <K extends keyof FormState>(field: K, value: FormState[K]) => void; step5Valid: boolean; onNext: () => void
}) {
  return (
    <>
      <StepHeading title="Who is the responsible party?" subtitle="The person who controls or manages the LLC. Required by the IRS." />
      <FormCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StyledTextInput label="First Name" value={responsiblePartyFirstName} onChange={(v) => onField('responsiblePartyFirstName', v)} placeholder="Jane" required />
          <StyledTextInput label="Last Name" value={responsiblePartyLastName} onChange={(v) => onField('responsiblePartyLastName', v)} placeholder="Smith" required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StyledTextInput label="Middle Name / Initial" value={responsiblePartyMiddleName} onChange={(v) => onField('responsiblePartyMiddleName', v)} placeholder="Optional" />
          <StyledSelectInput label="Suffix" value={responsiblePartySuffix} onChange={(v) => onField('responsiblePartySuffix', v)}>
            <option value="">None</option>
            <option value="Jr.">Jr.</option>
            <option value="Sr.">Sr.</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </StyledSelectInput>
        </div>
        <StyledTextInput label="Email" type="email" value={contactEmail} onChange={(v) => onField('contactEmail', v)} placeholder="jane@example.com" required />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={isUsCitizen} onChange={(e) => onField('isUsCitizen', e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: 'rgb(60,60,60)', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.5 }}>
              I am a U.S. citizen or permanent resident
            </span>
          </label>
          {!isUsCitizen && (
            <div style={{ background: 'rgb(255,251,235)', border: '1px solid rgb(252,211,77)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'rgb(146,64,14)', lineHeight: 1.55 }}>
              Non-U.S. package: SS-4 faxed directly to the IRS. EIN can be issued without an ITIN. Flat fee $175.
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StyledSelectInput label="Tax ID type" value={taxIdType} onChange={(v) => onField('taxIdType', v as TaxIdType)}>
            <option value="ssn">SSN — Social Security Number</option>
            <option value="itin">ITIN — Individual Taxpayer ID</option>
          </StyledSelectInput>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(60,60,60)', marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
              {taxIdType === 'ssn' ? 'SSN' : 'ITIN'}{isUsCitizen ? ' *' : ' (optional)'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password" value={taxId} onChange={(e) => onField('taxId', e.target.value)}
                placeholder={isUsCitizen ? 'XXX-XX-XXXX' : 'Optional'}
                autoComplete="off"
                style={{ width: '100%', padding: '15px 40px 15px 16px', borderRadius: 8, border: '1px solid rgb(224,224,224)', fontSize: 16, fontFamily: 'var(--font-dm-sans)', color: 'rgb(23,23,23)', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#3b60f3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,96,243,0.12)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgb(224,224,224)'; e.currentTarget.style.boxShadow = 'none' }}
              />
              <Lock size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgb(180,180,180)', pointerEvents: 'none' }} />
            </div>
            <p style={{ fontSize: 11, color: 'rgb(150,150,150)', marginTop: 4, fontFamily: 'var(--font-dm-sans)' }}>Encrypted, never stored in plain text</p>
          </div>
        </div>
        <ContinueBtn onClick={onNext} disabled={!step5Valid} label="Review order →" />
      </FormCard>
    </>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingBottom: 12, borderBottom: '1px solid rgb(245,245,245)' }}>
      <span style={{ fontSize: 13, color: 'rgb(130,130,130)', fontFamily: 'var(--font-dm-sans)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'rgb(30,30,30)', fontFamily: 'var(--font-dm-sans)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function Step6Review({ form, hasAnyEmployees, price, onProceed }: {
  form: FormState; hasAnyEmployees: boolean; price: number; onProceed: () => void
}) {
  const responsiblePartyFullName = [form.responsiblePartyFirstName, form.responsiblePartyMiddleName, form.responsiblePartyLastName, form.responsiblePartySuffix].filter(Boolean).join(' ')
  const mailingAddress = `${form.mailingStreet}, ${form.mailingCity}, ${form.mailingState} ${form.mailingZip}`

  return (
    <>
      <StepHeading title="Review your EIN order" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#ffffff', borderRadius: 24, padding: 32 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'rgb(60,60,60)', marginBottom: 20, fontFamily: 'var(--font-dm-sans)', marginTop: 0 }}>Order Details</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ReviewRow label="LLC Name" value={form.llcName} />
            {form.tradeName && <ReviewRow label="Trade Name / DBA" value={form.tradeName} />}
            <ReviewRow label="Mailing Address" value={mailingAddress} />
            <ReviewRow label="County" value={form.county} />
            <ReviewRow label="Members" value={form.memberCount} />
            <ReviewRow label="Business Start" value={form.businessStartDate} />
            <ReviewRow label="Fiscal Year End" value={form.closingMonth} />
            <ReviewRow label="Business Activity" value={form.businessActivity === 'other' ? `Other: ${form.businessActivityOther}` : (BUSINESS_ACTIVITIES.find((a) => a.value === form.businessActivity)?.label ?? '')} />
            <ReviewRow label="Product / Service" value={form.productService} />
            <ReviewRow label="Reason" value={form.applyReason.replace(/-/g, ' ')} />
            <ReviewRow label="Employees" value={hasAnyEmployees ? `${form.employeesAgricultural} ag / ${form.employeesHousehold} household / ${form.employeesOther} other` : 'None'} />
            {form.previousEin && <ReviewRow label="Previously had EIN" value="Yes" />}
            <ReviewRow label="Responsible Party" value={responsiblePartyFullName} />
            <ReviewRow label="Email" value={form.contactEmail} />
            <ReviewRow label="Tax ID" value={form.taxId ? form.taxIdType.toUpperCase() + ' provided' : 'Not provided'} />
            <ReviewRow label="U.S. Citizen / Resident" value={form.isUsCitizen ? 'Yes' : 'No — SS-4 fax package'} />
          </div>
        </div>
        <div style={{ background: '#ffffff', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'rgb(60,60,60)', marginBottom: 4, fontFamily: 'var(--font-dm-sans)', marginTop: 0 }}>Price</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: 'rgb(80,80,80)', fontFamily: 'var(--font-dm-sans)' }}>
            <span>{form.isUsCitizen ? 'EIN filing' : 'EIN filing — non-U.S. package'}</span>
            <span>${price.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, paddingTop: 16, borderTop: '1px solid rgb(230,230,230)', fontFamily: 'var(--font-dm-sans)' }}>
            <span style={{ color: 'rgb(23,23,23)' }}>Total</span>
            <span style={{ color: 'rgb(59,96,243)' }}>${price.toFixed(2)}</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgb(150,150,150)', fontFamily: 'var(--font-dm-sans)', margin: 0 }}>No auto-renewals. SSN/ITIN encrypted in transit and at rest.</p>
          <ContinueBtn onClick={onProceed} label="Proceed to Payment →" />
        </div>
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────


export default function EINPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [hasEmployees, setHasEmployees] = useState<boolean | null>(null)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [sunbizState, setSunbizState] = useState<'idle' | 'loading' | 'found' | 'not-found' | 'error'>('idle')

  async function handleLookupOnSunbiz() {
    if (!form.docNumber.trim()) return
    setSunbizState('loading')
    try {
      const res = await fetch(`/api/sunbiz/lookup?docNumber=${encodeURIComponent(form.docNumber.trim())}`)
      if (res.status === 503) { setSunbizState('error'); return }
      if (res.status === 404) { setSunbizState('not-found'); return }
      if (!res.ok) { setSunbizState('error'); return }
      const json = await res.json()
      const entity: SunbizResult = json.data
      setForm((prev) => ({
        ...prev,
        llcName:           entity.name          || prev.llcName,
        businessStartDate: entity.filingDate     || prev.businessStartDate,
        mailingStreet:     entity.mailingStreet  || prev.mailingStreet,
        mailingCity:       entity.mailingCity    || prev.mailingCity,
        mailingState:      entity.mailingState   || prev.mailingState,
        mailingZip:        entity.mailingZip     || prev.mailingZip,
        county:            entity.county         || prev.county,
        mailingHint:       entity.mailingAddress || '',
      }))
      setSunbizState('found')
    } catch {
      setSunbizState('error')
    }
  }

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
  const step1Valid = form.llcName.trim().length > 0
  const step2Valid = !!(form.mailingStreet.trim() && form.mailingCity.trim() && form.mailingZip.trim() && form.county.trim())
  const step3Valid = !!(
    form.businessActivity &&
    (form.businessActivity !== 'other' || form.businessActivityOther.trim()) &&
    form.businessStartDate &&
    form.productService.trim()
  )
  const step4Valid = hasEmployees !== null && (!hasAnyEmployees || !!form.firstWagesDate)
  const step5Valid = !!(
    form.responsiblePartyFirstName.trim() &&
    form.responsiblePartyLastName.trim() &&
    form.contactEmail.trim() &&
    (!form.isUsCitizen || form.taxId.trim())
  )

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
      sourceHref: '/ein',
      businessName: form.llcName,
      docNumber: form.docNumber || undefined,
      customerName: responsiblePartyFullName,
      customerEmail: form.contactEmail,
      serviceFee: price,
      stateFee: 0,
      // Structured address — checkout biz section reads these to pre-fill and auto-skip
      ownerStreet:  form.mailingStreet,
      ownerCity:    form.mailingCity,
      ownerState:   form.mailingState,
      ownerZip:     form.mailingZip,
      ownerMailing: mailingAddress,
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

  const rightPanels: Partial<Record<number, React.ReactNode>> = {
    1: <PanelUSMap selectedState="FL" />,
    2: <PanelUSMap selectedState="FL" />,
    3: <PanelIndustryGauge industry={form.businessActivity} />,
    4: <PanelCalendar timeline="active" />,
    5: <PanelContactCard firstName={form.responsiblePartyFirstName} lastName={form.responsiblePartyLastName} email={form.contactEmail} phone="" />,
  }
  const rightPanel = rightPanels[step]

  return (
    <IntakeLayout
      onBack={step > 1 ? () => setStep((s) => s - 1) : undefined}
      backHref={step === 1 ? '/' : undefined}
      rightPanel={rightPanel}
      onClose="/"
      wide={step === 6}
    >
      {step === 1 && (
        <Step1FindLLC
          llcName={form.llcName}
          tradeName={form.tradeName}
          docNumber={form.docNumber}
          sunbizState={sunbizState}
          onDocNumber={(v) => { set('docNumber', v); setSunbizState('idle') }}
          onLlcName={(v) => set('llcName', v)}
          onTradeName={(v) => set('tradeName', v)}
          onLookup={handleLookupOnSunbiz}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2Address
          mailingStreet={form.mailingStreet}
          mailingCity={form.mailingCity}
          mailingState={form.mailingState}
          mailingZip={form.mailingZip}
          county={form.county}
          memberCount={form.memberCount}
          mailingHint={form.mailingHint}
          onChange={set}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3BusinessDetails
          businessStartDate={form.businessStartDate}
          closingMonth={form.closingMonth}
          applyReason={form.applyReason}
          businessActivity={form.businessActivity}
          businessActivityOther={form.businessActivityOther}
          productService={form.productService}
          onField={set}
          step3Valid={step3Valid}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <Step4Employees
          hasEmployees={hasEmployees}
          toggleEmployees={toggleEmployees}
          employeesAgricultural={form.employeesAgricultural}
          employeesHousehold={form.employeesHousehold}
          employeesOther={form.employeesOther}
          firstWagesDate={form.firstWagesDate}
          wants944={form.wants944}
          previousEin={form.previousEin}
          onField={set}
          step4Valid={step4Valid}
          onNext={() => setStep(5)}
        />
      )}
      {step === 5 && (
        <Step5Identity
          responsiblePartyFirstName={form.responsiblePartyFirstName}
          responsiblePartyMiddleName={form.responsiblePartyMiddleName}
          responsiblePartyLastName={form.responsiblePartyLastName}
          responsiblePartySuffix={form.responsiblePartySuffix}
          contactEmail={form.contactEmail}
          isUsCitizen={form.isUsCitizen}
          taxIdType={form.taxIdType}
          taxId={form.taxId}
          onField={set}
          step5Valid={step5Valid}
          onNext={() => setStep(6)}
        />
      )}
      {step === 6 && (
        <Step6Review
          form={form}
          hasAnyEmployees={hasAnyEmployees}
          price={price}
          onProceed={handleProceedToCheckout}
        />
      )}
    </IntakeLayout>
  )
}
