'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Building2, CheckCircle2, Mail, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

// useSearchParams() requires Suspense in Next.js 14 App Router —
// without it the params are empty on first render and the page redirects away
function SuccessContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'success' | 'pending' | 'failed'>('checking')

  useEffect(() => {
    if (!params) return // null during SSR — wait for client hydration
    const redirectStatus = params.get('redirect_status')
    if (!redirectStatus) return // params not yet hydrated — wait for next render
    if (redirectStatus === 'succeeded') {
      setStatus('success')
      // Confirm payment server-side so GHL push happens regardless of webhook delivery
      const paymentIntentId = params.get('payment_intent')
      if (paymentIntentId) {
        fetch('/api/public/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId }),
        }).catch((err) => console.error('[confirm-payment]', err))
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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)', fontFamily: 'var(--font-dm)' }}
    >
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          {status === 'success' ? (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'oklch(0.94 0.06 145)' }}
            >
              <CheckCircle2
                size={32}
                style={{ color: 'oklch(0.40 0.14 145)' }}
              />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'oklch(0.96 0.05 60)' }}
            >
              <Building2
                size={32}
                style={{ color: 'oklch(0.50 0.14 60)' }}
              />
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ backgroundColor: 'var(--color-navy)' }}
          >
            <Building2 className="text-white" size={14} />
          </div>
          <span
            className="font-bold text-base"
            style={{ color: 'var(--color-navy)', fontFamily: 'var(--font-jakarta)' }}
          >
            Compass
          </span>
        </div>

        {status === 'success' && (
          <>
            <h1
              className="text-2xl font-bold mb-3"
              style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
            >
              Payment received. You're all set.
            </h1>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              We've got your order and a real person will file it with Sunbiz.
              Check your email for your portal login — you can track progress there.
            </p>

            <div
              className="rounded-xl p-5 mb-8 text-left"
              style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: 'oklch(0.94 0.04 250)' }}
                >
                  <Mail size={15} style={{ color: 'var(--color-blue)' }} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
                  >
                    Check your email
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    We sent your portal login details. Sign in to track your filing status,
                    download documents, and get compliance reminders.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-white text-sm font-medium rounded-md px-6 py-3 transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-navy)' }}
            >
              Sign in to your portal
              <ArrowRight size={15} />
            </Link>

            <p className="text-xs mt-6" style={{ color: 'var(--color-muted)' }}>
              Questions? Email us at{' '}
              <a
                href="mailto:hello@compassregisteredagent.com"
                className="underline"
                style={{ color: 'var(--color-blue)' }}
              >
                hello@compassregisteredagent.com
              </a>
            </p>
          </>
        )}

        {status === 'pending' && (
          <>
            <h1
              className="text-2xl font-bold mb-3"
              style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
            >
              Payment processing
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
              Your payment is being processed. This usually takes a few minutes.
              You'll receive an email confirmation once it clears.
            </p>
            <Link
              href="/"
              className="text-sm underline"
              style={{ color: 'var(--color-blue)' }}
            >
              Return to home
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-muted)' }} />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
