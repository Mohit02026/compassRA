'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { ChevronDown, Loader2, Check, ShieldCheck, Star, DollarSign } from 'lucide-react'
import IntakeLayout from '@/components/public/IntakeLayout'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')

interface LineItem { label: string; amount: number }
interface CheckoutPayload {
  serviceType: string
  businessName: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  tier?: string
  serviceFee: number
  stateFee: number
  summary: string
  lineItems: LineItem[]
  [key: string]: unknown
}
interface BizData {
  ownerFirst: string; ownerLast: string
  street: string; city: string; state: string; zip: string
  mailingAddress: string
}
interface AccountData { email: string; password: string; confirm: string }

const BLUE = '#3B60F3'
const CARD: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 24,
  padding: '0 24px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
}

// ─── FloatingInput ────────────────────────────────────────────────────────────
function FloatingInput({
  id, label, type = 'text', value, onChange, readOnly = false, blueText = false, suffix, showToggle = false, required = false,
}: {
  id: string; label: string; type?: string; value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  readOnly?: boolean; blueText?: boolean; suffix?: React.ReactNode; showToggle?: boolean; required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const floating = focused || value.length > 0
  const inputType = showToggle ? (visible ? 'text' : 'password') : type

  return (
    <div className="relative">
      <input
        id={id}
        type={inputType}
        value={value}
        onChange={onChange ?? (() => {})}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=" "
        readOnly={readOnly}
        required={required}
        autoComplete={type === 'password' ? 'new-password' : undefined}
        className="w-full rounded-[8px] border border-[#E0E0E0] bg-white outline-none transition-colors focus:border-[#3B60F3]"
        style={{
          height: 53,
          padding: '22px 16px 6px',
          paddingRight: suffix ? '116px' : showToggle ? '44px' : '16px',
          fontSize: 16,
          fontFamily: 'DM Sans, sans-serif',
          color: blueText ? BLUE : '#171717',
        }}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 select-none text-[#B2B2B2]"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          top: floating ? 8 : '50%',
          transform: floating ? 'none' : 'translateY(-50%)',
          fontSize: floating ? 12 : 16,
          transition: 'top 150ms, font-size 150ms, transform 150ms',
        }}
      >
        {label}
      </label>
      {suffix && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {suffix}
        </div>
      )}
      {showToggle && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible(v => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center text-[#9CA3AF] hover:text-[#4C4C4C]"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      )}
    </div>
  )
}

// ─── Section card header row ───────────────────────────────────────────────────
function SectionHeader({
  n, title, done, editLabel, onEdit, open, canToggle, onToggle,
}: {
  n: number; title: string; done: boolean
  editLabel?: string; onEdit?: () => void
  open?: boolean; canToggle?: boolean; onToggle?: () => void
}) {
  return (
    <button
      type="button"
      onClick={canToggle ? onToggle : undefined}
      className="flex w-full items-center justify-between"
      style={{ cursor: canToggle ? 'pointer' : 'default', padding: '20px 0' }}
    >
      <div className="flex items-center gap-4">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
          style={{ background: done ? '#16a34a' : BLUE }}
        >
          {done ? <Check size={14} /> : n}
        </span>
        <span style={{ fontSize: 24, fontWeight: 600, lineHeight: '24px', color: '#171717', fontFamily: 'DM Sans, sans-serif' }}>
          {title}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {editLabel && done && onEdit && (
          <span
            className="cursor-pointer text-base font-semibold"
            style={{ color: BLUE, fontFamily: 'DM Sans, sans-serif' }}
            onClick={(e) => { e.stopPropagation(); onEdit() }}
          >
            {editLabel}
          </span>
        )}
        {!done && canToggle && open !== undefined && (
          <ChevronDown
            size={20}
            className="text-[#6B7280] transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        )}
      </div>
    </button>
  )
}

// ─── Section 1 cart content ───────────────────────────────────────────────────
const LLC_FEATURES = [
  'Name availability search',
  'Company registration in the selected state',
  '24 hour processing time*',
  '100% accuracy guaranteed',
  'Access to Customer Portal to track your business filings',
  'File necessary annual reports',
  'Ongoing compliance (state-required)',
  'Operating Agreement template',
]

const STATE_FEE_DESC = 'This filing fee goes straight to the state and includes the mandatory state filing fee along with additional fees like a processing fee or expediting filing fee when applicable.'
const RA_FEE_DESC = "You won't be charged until your business is formed."

function CartContent({ payload, total, onContinue }: { payload: CheckoutPayload; total: number; onContinue: () => void }) {
  const planItem = payload.lineItems?.[0]
  const stateFeeItem = payload.lineItems?.find(i =>
    i.label.toLowerCase().includes('state') || i.label.toLowerCase().includes('fee')
  )
  const raItem = payload.lineItems?.find(i =>
    i.label.toLowerCase().includes('agent') || i.label.toLowerCase().includes('registered')
  )

  return (
    <div style={{ paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Plan card */}
      <div style={{ border: '1px solid #E0E0E0', borderRadius: 12, padding: '16px 20px', marginBottom: 4 }}>
        {planItem && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif' }}>
                {planItem.label}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif' }}>
                ${planItem.amount % 1 === 0 ? planItem.amount.toFixed(0) : planItem.amount.toFixed(2)}/year
              </span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {LLC_FEATURES.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Check size={13} style={{ color: '#27c250', marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#4C4C4C', fontFamily: 'DM Sans, sans-serif' }}>{f}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {stateFeeItem && stateFeeItem !== planItem && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E0E0E0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif' }}>
                {stateFeeItem.label}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif' }}>
                ${stateFeeItem.amount % 1 === 0 ? stateFeeItem.amount.toFixed(0) : stateFeeItem.amount.toFixed(2)}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#6B7280', margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
              {STATE_FEE_DESC}
            </p>
          </div>
        )}
      </div>

      {/* Order summary */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif', marginBottom: 12 }}>
          Order summary
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {planItem && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: '#4C4C4C', fontFamily: 'DM Sans, sans-serif' }}>Subtotal due today</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif' }}>
                ${planItem.amount % 1 === 0 ? planItem.amount.toFixed(0) : planItem.amount.toFixed(2)}
              </span>
            </div>
          )}
          {stateFeeItem && stateFeeItem !== planItem && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: '#4C4C4C', fontFamily: 'DM Sans, sans-serif' }}>{stateFeeItem.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif' }}>
                  ${stateFeeItem.amount % 1 === 0 ? stateFeeItem.amount.toFixed(0) : stateFeeItem.amount.toFixed(2)}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
                {STATE_FEE_DESC}
              </p>
            </div>
          )}
          {raItem && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: '#4C4C4C', fontFamily: 'DM Sans, sans-serif' }}>{raItem.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif' }}>
                  ${raItem.amount.toFixed(2)}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                {RA_FEE_DESC}
              </p>
            </div>
          )}
          <div style={{ background: '#f2f4fb', borderRadius: 16, padding: 24, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: raItem ? 6 : 0 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif' }}>Total due today</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#171717', fontFamily: 'DM Sans, sans-serif' }}>
                ${total % 1 === 0 ? total.toFixed(0) : total.toFixed(2)}
              </span>
            </div>
            {raItem && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>Registered agent fees</span>
                <span style={{ fontSize: 13, color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>$0</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Continue */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full font-semibold text-white"
        style={{ height: 46, marginTop: 20, borderRadius: 8, fontSize: 16, background: BLUE, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', border: 'none' }}
      >
        Continue
      </button>
    </div>
  )
}

// ─── Trust panel (right side) ─────────────────────────────────────────────────
function TrustPanel() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    { q: 'What payment methods are available?', a: 'We accept all major credit cards.' },
    { q: 'Do you support international credit cards?', a: 'Yes, international credit cards are supported.' },
    { q: 'When will I be billed for all charges?', a: 'All charges are billed upfront at the time of purchase.' },
    { q: 'Will my payment information be stored?', a: 'Your payment information is stored only for payment processing purposes. We do not sell or share your data.' },
    { q: 'Can I modify my plan or add services later?', a: 'Yes. You can modify your plan or add additional services at any time.' },
    { q: 'How does the 30 day money back guarantee work?', a: 'If you are not satisfied with our service, you may request a refund within 30 days of purchase. You will receive a full refund minus any state or government filing fees.' },
    { q: 'What is the process for canceling my subscription?', a: 'To cancel your subscription, please email support@compassregisteredagent.com. A support representative will contact you to complete the cancellation.' },
    { q: 'Why should you hire us?', a: "Our founder is a serial entrepreneur who expects a very high level of service, accuracy, and reliability. That same standard is built into how we operate. When you hire us, you get the level of care usually reserved for large, high-value clients—clear communication, fast responses, and zero shortcuts—no matter the size of your business." },
    { q: 'What is a registered agent?', a: "A registered agent is a person or company that receives official legal and government documents for your business. This includes things like state notices, compliance letters, and legal paperwork. The registered agent's address must be on file with the state." },
    { q: 'Why do I need a registered agent?', a: "Most states require every business to have a registered agent. A registered agent makes sure you don't miss important legal or state documents. It also keeps your personal address off public records and ensures someone is always available during business hours to receive official mail." },
    { q: 'Can I be my own registered agent?', a: "Yes, but it usually isn't a good idea. You must list a public address, be available during business hours, and personally receive legal documents. Most business owners choose a registered agent to protect their privacy and avoid missing important notices." },
    { q: 'Is this only for large businesses?', a: 'No. We work with startups, small businesses, and established companies. Every client receives the same high level of service and attention.' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div style={{ background: '#ffffff', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif' }}>
          Purchase with confidence
        </div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0, margin: 0 }}>
          {[
            { icon: <DollarSign size={16} className="text-[#3B60F3]" />, text: '30-day money back guarantee' },
            { icon: <ShieldCheck size={16} className="text-[#3B60F3]" />, text: '100% accurate filing guarantee' },
            { icon: <Star size={16} className="text-[#3B60F3]" />, text: 'Top-rated customer support' },
          ].map(({ icon, text }) => (
            <li key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
              </span>
              <span style={{ fontSize: 15, color: '#4C4C4C', fontFamily: 'DM Sans, sans-serif' }}>{text}</span>
            </li>
          ))}
        </ul>
        <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>Save on taxes</div>
          <p style={{ fontSize: 14, color: '#4C4C4C', margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
            You may be able to deduct up to $5,000 in business formation costs. Ask a tax professional for more info.
          </p>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#171717', fontFamily: 'DM Sans, sans-serif', marginBottom: 16 }}>
          Frequently asked questions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span style={{ fontSize: 14, fontWeight: 500, color: '#171717', fontFamily: 'DM Sans, sans-serif', flex: 1, paddingRight: 12 }}>
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className="shrink-0 text-[#6B7280] transition-transform"
                  style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 16px', fontSize: 14, color: '#4C4C4C', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter()
  const [payload, setPayload] = useState<CheckoutPayload | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [apiLoading, setApiLoading] = useState(false)

  const [cartDone, setCartDone] = useState(false)
  const [bizOpen, setBizOpen] = useState(false)
  const [acctOpen, setAcctOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [bizSaved, setBizSaved] = useState(false)
  const [acctSaved, setAcctSaved] = useState(false)

  const [biz, setBiz] = useState<BizData>({
    ownerFirst: '', ownerLast: '',
    street: '', city: '', state: 'FL', zip: '',
    mailingAddress: '',
  })
  const [acct, setAcct] = useState<AccountData>({ email: '', password: '', confirm: '' })
  const [acctError, setAcctError] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('checkoutPayload')
    if (!raw) { router.replace('/llc'); return }
    let parsed: CheckoutPayload
    try { parsed = JSON.parse(raw) as CheckoutPayload } catch { router.replace('/llc'); return }
    setPayload(parsed)

    const parts = (parsed.customerName ?? '').trim().split(' ')
    setBiz({
      ownerFirst:     parts[0] ?? '',
      ownerLast:      parts.slice(1).join(' '),
      street:         (parsed.ownerStreet as string) ?? '',
      city:           (parsed.ownerCity as string) ?? '',
      state:          (parsed.ownerState as string) ?? 'FL',
      zip:            (parsed.ownerZip as string) ?? '',
      mailingAddress: (parsed.ownerMailing as string) ?? '',
    })
    setAcct((a) => ({ ...a, email: parsed.customerEmail ?? '' }))

    // If the upstream flow already collected address data, mark biz done so checkout skips that section
    if (parsed.ownerStreet && parsed.ownerCity && parsed.ownerZip) {
      setBizSaved(true)
    }
  }, [router])

  if (!payload) {
    return (
      <div style={{ minHeight: '100vh', background: 'rgb(241,242,243)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#9CA3AF' }} />
      </div>
    )
  }

  const total = (payload.lineItems ?? []).reduce((s, i) => s + i.amount, 0)

  function continueFromCart() {
    setCartDone(true)
    if (bizSaved) {
      setAcctOpen(true)
    } else {
      setBizOpen(true)
    }
  }

  function saveBiz(e: React.FormEvent) {
    e.preventDefault()
    setBizSaved(true)
    setBizOpen(false)
    setAcctOpen(true)
  }

  function sameAsAbove() {
    setBiz((b) => ({ ...b, mailingAddress: [b.street, b.city, b.state, b.zip].filter(Boolean).join(', ') }))
  }

  async function saveAcct(e: React.FormEvent) {
    e.preventDefault()
    if (acct.password.length < 8) { setAcctError('Password must be at least 8 characters.'); return }
    if (!/[A-Z]/.test(acct.password)) { setAcctError('Password must contain at least one uppercase letter.'); return }
    if (!/[0-9]/.test(acct.password)) { setAcctError('Password must contain at least one number.'); return }
    if (acct.password !== acct.confirm) { setAcctError('Passwords do not match.'); return }
    setAcctError('')
    setApiLoading(true)
    try {
      const r = await fetch('/api/public/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, password: acct.password }),
      })
      const json = await r.json() as { data?: { clientSecret: string }; error?: { message?: string } }
      if (json.error) {
        setAcctError(json.error.message ?? 'Failed to create order. Please try again.')
        return
      }
      setClientSecret(json.data!.clientSecret)
      setAcctSaved(true)
      setAcctOpen(false)
      setPayOpen(true)
    } catch {
      setAcctError('Network error. Please try again.')
    } finally {
      setApiLoading(false)
    }
  }

  const btnStyle: React.CSSProperties = {
    height: 46, marginTop: 8, borderRadius: 8, fontSize: 16,
    background: BLUE, fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer', border: 'none',
  }

  return (
    <IntakeLayout backHref={(payload.sourceHref as string) ?? '/'} rightPanel={<TrustPanel />} wide>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Section 1: Your cart ──────────────────────────────────────── */}
        <div style={CARD}>
          <SectionHeader
            n={1}
            title="Your cart"
            done={cartDone}
            editLabel="Edit"
            onEdit={() => { setCartDone(false); setBizOpen(false) }}
          />
          {!cartDone && (
            <CartContent payload={payload} total={total} onContinue={continueFromCart} />
          )}
        </div>

        {/* ── Section 2: Business info ──────────────────────────────────── */}
        <div style={CARD}>
          <SectionHeader
            n={2}
            title="Business info"
            done={bizSaved}
            editLabel="Edit"
            onEdit={() => { setBizSaved(false); setBizOpen(true) }}
            open={bizOpen}
            canToggle={cartDone && !bizSaved}
            onToggle={() => setBizOpen((v) => !v)}
          />
          {bizOpen && !bizSaved && (
            <form onSubmit={saveBiz} style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
              <FloatingInput id="b-ofn" label="Business owner first name *" value={biz.ownerFirst} required
                onChange={(e) => setBiz((b) => ({ ...b, ownerFirst: e.target.value }))} />
              <FloatingInput id="b-oln" label="Business owner last name *" value={biz.ownerLast} required
                onChange={(e) => setBiz((b) => ({ ...b, ownerLast: e.target.value }))} />
              <div style={{ borderTop: '1px solid #E0E0E0', marginTop: 4 }} />
              <FloatingInput id="b-street" label="Principal street address *" value={biz.street} required
                onChange={(e) => setBiz((b) => ({ ...b, street: e.target.value }))} />
              <FloatingInput id="b-city" label="City *" value={biz.city} required
                onChange={(e) => setBiz((b) => ({ ...b, city: e.target.value }))} />
              <FloatingInput id="b-zip" label="ZIP *" value={biz.zip} required
                onChange={(e) => setBiz((b) => ({ ...b, zip: e.target.value }))} />
              <FloatingInput id="b-mailing" label="Mailing address *" value={biz.mailingAddress} required
                onChange={(e) => setBiz((b) => ({ ...b, mailingAddress: e.target.value }))}
                suffix={
                  <button type="button" onClick={sameAsAbove}
                    style={{ color: BLUE, fontSize: 14, fontFamily: 'DM Sans, sans-serif', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Same as above
                  </button>
                }
              />
              <button type="submit" className="w-full font-semibold text-white" style={btnStyle}>
                Save and Continue
              </button>
            </form>
          )}
        </div>

        {/* ── Section 3: Create an account ─────────────────────────────── */}
        <div style={CARD}>
          <SectionHeader
            n={3}
            title="Create an account"
            done={acctSaved}
            editLabel="Edit"
            onEdit={() => { setAcctSaved(false); setAcctOpen(true) }}
            open={acctOpen}
            canToggle={bizSaved && !acctSaved}
            onToggle={() => setAcctOpen((v) => !v)}
          />
          {acctOpen && !acctSaved && (
            <form onSubmit={saveAcct} style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
              <FloatingInput id="a-email" label="Email *" type="email" value={acct.email} required
                onChange={(e) => setAcct((a) => ({ ...a, email: e.target.value }))} />
              <FloatingInput id="a-pw" label="Password *" type="password" value={acct.password}
                onChange={(e) => { setAcct((a) => ({ ...a, password: e.target.value })); setAcctError('') }}
                showToggle />
              <FloatingInput id="a-cpw" label="Confirm password *" type="password" value={acct.confirm}
                onChange={(e) => { setAcct((a) => ({ ...a, confirm: e.target.value })); setAcctError('') }}
                showToggle />

              {acct.password.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'At least 8 characters', met: acct.password.length >= 8 },
                    { label: 'At least one uppercase letter', met: /[A-Z]/.test(acct.password) },
                    { label: 'At least one number', met: /[0-9]/.test(acct.password) },
                  ].map(({ label, met }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: met ? '#eaf9ee' : '#e0e0e0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 200ms',
                      }}>
                        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                          <path d="M1 4L4 7L10 1" stroke={met ? '#34cb00' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span style={{ fontSize: 13, color: met ? '#34cb00' : '#9CA3AF', fontFamily: 'DM Sans, sans-serif', transition: 'color 200ms' }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {acctError && (
                <p style={{ fontSize: 14, color: '#DC2626', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                  {acctError}
                </p>
              )}

              <button type="submit" disabled={apiLoading} className="flex w-full items-center justify-center gap-2 font-semibold text-white disabled:opacity-70" style={btnStyle}>
                {apiLoading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : 'Save and Continue'}
              </button>
            </form>
          )}
        </div>

        {/* ── Section 4: Payment ───────────────────────────────────────── */}
        <div style={CARD}>
          <SectionHeader
            n={4}
            title="Payment"
            done={false}
            open={payOpen}
            canToggle={acctSaved && !payOpen}
            onToggle={() => setPayOpen(true)}
          />
          {payOpen && clientSecret && (
            <div style={{ paddingBottom: 24 }}>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: { colorPrimary: BLUE, borderRadius: '8px', fontFamily: 'DM Sans, sans-serif' },
                  },
                }}
              >
                <PaymentForm total={total} clientName={payload.customerName} />
              </Elements>
            </div>
          )}
        </div>

      </div>
    </IntakeLayout>
  )
}

// ─── Stripe payment form ──────────────────────────────────────────────────────
function PaymentForm({ total, clientName }: { total: number; clientName: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setError('')
    setSubmitting(true)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        payment_method_data: { billing_details: { name: clientName } },
      },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed. Please try again.')
      setSubmitting(false)
    } else {
      router.push('/login?welcome=1')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PaymentElement />
      {error && <p style={{ fontSize: 14, color: '#DC2626', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className="flex w-full items-center justify-center gap-2 font-semibold text-white disabled:opacity-60"
        style={{ height: 46, borderRadius: 8, fontSize: 16, background: BLUE, fontFamily: 'DM Sans, sans-serif', cursor: submitting ? 'not-allowed' : 'pointer', border: 'none' }}
      >
        {submitting ? (
          <><Loader2 size={16} className="animate-spin" /> Processing…</>
        ) : (
          `Pay $${total % 1 === 0 ? total.toFixed(0) : total.toFixed(2)} — File with Compass`
        )}
      </button>
      <p style={{ fontSize: 12, textAlign: 'center', color: '#9CA3AF', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
        Secured by <strong>Stripe</strong>. Your information is encrypted.
      </p>
    </form>
  )
}
