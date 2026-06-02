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
import { Building2, Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')

interface LineItem {
  label: string
  amount: number
}

interface CheckoutPayload {
  serviceType: string
  businessName: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  serviceFee: number
  stateFee: number
  summary: string
  lineItems: LineItem[]
  [key: string]: unknown
}

export default function CheckoutPage() {
  const router = useRouter()
  const [payload, setPayload] = useState<CheckoutPayload | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('checkoutPayload')
    if (!raw) {
      router.replace('/')
      return
    }

    let parsed: CheckoutPayload
    try {
      parsed = JSON.parse(raw) as CheckoutPayload
    } catch {
      router.replace('/')
      return
    }

    setPayload(parsed)

    // Create PaymentIntent server-side
    fetch('/api/public/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setError(json.error.message ?? 'Failed to initialize payment.')
          return
        }
        setClientSecret(json.data.clientSecret as string)
      })
      .catch(() => {
        setError('Network error. Please refresh and try again.')
      })
  }, [router])

  if (!payload) return null

  const total = (payload.lineItems ?? []).reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
      >
        Complete your order
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
        Secure payment — your card details are processed by Stripe and never stored by Compass.
      </p>

      {/* Order summary */}
      <div className="bg-white rounded-lg p-5 mb-4" style={{ border: '1px solid var(--color-border)' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}>
          Order Summary
        </h2>
        <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>{payload.summary}</p>
        <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>For: {payload.customerName} — {payload.customerEmail}</p>

        <div className="space-y-2 text-sm">
          {(payload.lineItems ?? []).map((item, i) => (
            <div key={i} className="flex justify-between" style={{ color: '#374151' }}>
              <span>{item.label}</span>
              <span>${item.amount.toFixed(2)}</span>
            </div>
          ))}
          <div
            className="flex justify-between font-semibold pt-3 mt-1"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <span>Total</span>
            <span style={{ color: 'var(--color-blue)' }}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment form */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {!clientSecret && !error && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-muted)' }} />
        </div>
      )}

      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: 'oklch(0.22 0.06 245)',
                borderRadius: '6px',
                fontFamily: 'DM Sans, sans-serif',
              },
            },
          }}
        >
          <PaymentForm total={total} clientName={payload.customerName} />
        </Elements>
      )}

      <p className="text-xs text-center mt-6" style={{ color: 'var(--color-muted)' }}>
        Secured by{' '}
        <span className="font-medium">Stripe</span>. Your information is encrypted.
        After payment, a portal account will be created and a confirmation email sent.
      </p>
    </div>
  )
}

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
        // Stripe will redirect here on success
        return_url: `${window.location.origin}/login?welcome=1`,
        payment_method_data: {
          billing_details: { name: clientName },
        },
      },
    })

    // If we reach here, payment failed (redirect didn't happen)
    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed. Please try again.')
      setSubmitting(false)
      return
    }

    // Fallback redirect (normally Stripe handles this via return_url)
    router.push('/login?welcome=1')
  }

  return (
    <div className="bg-white rounded-lg p-5 mb-4" style={{ border: '1px solid var(--color-border)' }}>
      <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}>
        Payment Details
      </h2>

      <form onSubmit={handleSubmit}>
        <PaymentElement />

        {error && (
          <p className="text-sm text-red-600 mt-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !stripe || !elements}
          className="w-full mt-5 flex items-center justify-center gap-2 text-white text-sm font-medium rounded-md px-6 py-3 transition-opacity disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-navy)' }}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Building2 size={15} />
              Pay ${total.toFixed(2)} — File with Compass
            </>
          )}
        </button>
      </form>
    </div>
  )
}
