'use client'

import { Suspense, useEffect, useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import { useSearchParams, useRouter } from 'next/navigation'
import { Building2, CheckCircle2, Mail, ArrowRight, Loader2, Clock } from 'lucide-react'
import Link from 'next/link'

const BLUE = '#3B60F3'
const BG = 'rgb(241,242,243)'

interface LineItem { label: string; amount: number }
interface OrderSummary {
  businessName: string
  customerEmail: string
  serviceType: string
  lineItems: LineItem[]
  total: number
}

function fmt(cents: number) {
  return '$' + cents.toFixed(2)
}

function serviceLabel(type: string) {
  if (type === 'LLC_FORMATION') return 'LLC Formation · Florida'
  if (type === 'ANNUAL_REPORT') return 'Annual Report · Florida'
  if (type === 'EIN') return 'EIN Registration'
  return type
}

// useSearchParams() requires Suspense in Next.js 14 App Router
function SuccessContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'success' | 'pending' | 'failed'>('checking')
  const [order, setOrder] = useState<OrderSummary | null>(null)

  useEffect(() => {
    // Read order context from sessionStorage (set by checkout page)
    try {
      const raw = sessionStorage.getItem('checkoutPayload')
      if (raw) {
        const p = JSON.parse(raw) as { businessName?: string; customerEmail?: string; serviceType?: string; lineItems?: LineItem[] }
        const items: LineItem[] = p.lineItems ?? []
        setOrder({
          businessName: p.businessName ?? '',
          customerEmail: p.customerEmail ?? '',
          serviceType: p.serviceType ?? '',
          lineItems: items,
          total: items.reduce((s, i) => s + i.amount, 0),
        })
      }
    } catch { /* graceful — just won't show order summary */ }
  }, [])

  useEffect(() => {
    if (!params) return
    const redirectStatus = params.get('redirect_status')
    if (!redirectStatus) return
    if (redirectStatus === 'succeeded') {
      setStatus('success')
      const paymentIntentId = params.get('payment_intent')
      if (paymentIntentId) {
        fetch('/api/public/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId }),
        }).catch((err) => {
          console.error('[confirm-payment]', err)
          Sentry.captureException(err, { tags: { severity: 'critical', flow: 'checkout' } })
        })
      }
    } else if (redirectStatus === 'processing') {
      setStatus('pending')
    } else if (redirectStatus === 'requires_payment_method') {
      router.replace('/checkout')
    } else {
      router.replace('/')
    }
  }, [params, router])

  if (status === 'checking') return null

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'var(--font-dm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>

      {/* Nav logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 color="white" size={14} />
        </div>
        <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 15, color: 'var(--color-navy)' }}>
          Compass
        </span>
      </div>

      {/* Card */}
      <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid var(--color-border)', padding: '40px 36px', maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {status === 'success' && (
          <>
            {/* Status icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'oklch(0.94 0.06 145)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={32} style={{ color: 'oklch(0.40 0.14 145)' }} />
              </div>
            </div>

            <h1 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 22, color: 'var(--color-navy-mid)', marginBottom: 10 }}>
              Payment received. Filing started.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: 28 }}>
              Sign in to track your filing.
            </p>

            {/* Order summary — only shown if sessionStorage had data */}
            {order && order.businessName && (
              <div style={{ background: 'rgb(247,248,250)', borderRadius: 12, border: '1px solid var(--color-border)', padding: '16px 20px', marginBottom: 16, textAlign: 'left' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Order summary
                </p>
                <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 15, color: 'var(--color-navy-mid)', marginBottom: 4 }}>
                  {order.businessName}
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 12 }}>
                  {serviceLabel(order.serviceType)}
                </p>
                {order.lineItems.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
                    {order.lineItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-muted)', marginBottom: 4 }}>
                        <span>{item.label}</span>
                        <span>{fmt(item.amount)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: 'var(--color-navy-mid)', marginTop: 8, borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                      <span>Total paid</span>
                      <span>{fmt(order.total)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Email notice */}
            <div style={{ background: 'oklch(0.94 0.04 250)', borderRadius: 12, border: '1px solid oklch(0.80 0.08 250)', padding: '14px 18px', marginBottom: 28, textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={15} style={{ color: BLUE }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 13, color: 'var(--color-navy-mid)', marginBottom: 3 }}>
                  Check your email
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5 }}>
                  {order?.customerEmail
                    ? <>Confirmation sent to <strong style={{ color: 'var(--color-navy-mid)' }}>{order.customerEmail}</strong></>
                    : 'Confirmation sent to your email.'}
                </p>
              </div>
            </div>

            <Link
              href="/login"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE, color: 'white', fontSize: 14, fontWeight: 600, borderRadius: 8, padding: '12px 28px', textDecoration: 'none' }}
            >
              Sign in to your portal
              <ArrowRight size={15} />
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'oklch(0.96 0.05 60)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={32} style={{ color: 'oklch(0.50 0.14 60)' }} />
              </div>
            </div>
            <h1 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 22, color: 'var(--color-navy-mid)', marginBottom: 10 }}>
              Payment processing
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: 28 }}>
              Your payment is being processed — usually takes a few minutes.
              You'll get an email confirmation once it clears.
            </p>
            <Link
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE, color: 'white', fontSize: 14, fontWeight: 600, borderRadius: 8, padding: '12px 28px', textDecoration: 'none' }}
            >
              Return to home
              <ArrowRight size={15} />
            </Link>
          </>
        )}
      </div>

      {/* Footer */}
      <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 24 }}>
        Questions? Email us at{' '}
        <a href="mailto:hello@compassregisteredagent.com" style={{ color: BLUE, textDecoration: 'underline' }}>
          hello@compassregisteredagent.com
        </a>
      </p>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: '#9CA3AF' }} />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
