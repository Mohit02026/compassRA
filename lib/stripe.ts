// Stripe client — server-side only.
// Lazy-initialised so module load doesn't throw with empty key in tests.

import Stripe from 'stripe'

let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key, { apiVersion: '2026-05-27.dahlia' })
  }
  return _stripe
}

export function stripe(): Stripe {
  return getStripe()
}

// Verify and parse a Stripe webhook payload. Throws on signature mismatch.
export function constructStripeEvent(
  payload: string | Buffer,
  sig: string,
  secret: string
): Stripe.Event {
  return getStripe().webhooks.constructEvent(payload, sig, secret)
}
