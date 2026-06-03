// Shared E2E helpers: signing, API shortcuts, page utilities.

import crypto from 'crypto'
import type { APIRequestContext, Page } from '@playwright/test'

// ── Stripe webhook signing ────────────────────────────────────────────────────
// Produces a valid stripe-signature header from a known STRIPE_WEBHOOK_SECRET.
// Allows E2E to simulate payment confirmation without a real Stripe account.

export function signStripePayload(body: string): string {
  const sk = process.env.STRIPE_WEBHOOK_SECRET!
  const ts = Math.floor(Date.now() / 1000)
  const signed = `${ts}.${body}`
  const hmac = crypto.createHmac('sha256', sk).update(signed).digest('hex')
  return `t=${ts},v1=${hmac}`
}

// ── GHL webhook signing ───────────────────────────────────────────────────────
// HMAC-SHA256 of the raw body with GHL_WEBHOOK_SECRET.

export function signGhlPayload(body: string): string {
  const sk = process.env.GHL_WEBHOOK_SECRET!
  return crypto.createHmac('sha256', sk).update(body).digest('hex')
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

// Log in as ops via the ops login form.
export async function loginOps(page: Page, baseURL: string) {
  await page.goto(`${baseURL}/ops/login`)
  await page.fill('[name="email"]', process.env.E2E_OPS_EMAIL!)
  await page.fill('[name="password"]', process.env.E2E_OPS_PASSWORD!)
  await page.click('[type="submit"]')
  await page.waitForURL(`${baseURL}/ops/dashboard`, { timeout: 10000 })
}

// Log in as a customer via the customer login form.
export async function loginCustomer(
  page: Page,
  baseURL: string,
  email = process.env.E2E_CUSTOMER_EMAIL!,
  password = process.env.E2E_CUSTOMER_PASSWORD!
) {
  await page.goto(`${baseURL}/login`)
  await page.fill('[name="email"]', email)
  await page.fill('[name="password"]', password)
  await page.click('[type="submit"]')
  // Wait for either portal/dashboard or the force-change-password page
  await page.waitForURL(/\/(portal\/dashboard|portal\/account\/change-password)/, {
    timeout: 10000,
  })
}

// ── API shortcuts (server-to-server without browser) ─────────────────────────

// Simulate Stripe payment confirmation for an order.
// Posts to /api/webhooks/stripe with a properly-signed fake payment_intent.succeeded event.
export async function simulateStripePayment(
  request: APIRequestContext,
  baseURL: string,
  paymentIntentId: string,
  amount = 26375
) {
  const event = {
    id: `evt_e2e_${Date.now()}`,
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: paymentIntentId,
        object: 'payment_intent',
        amount,
        currency: 'usd',
        status: 'succeeded',
      },
    },
  }
  const body = JSON.stringify(event)
  const sig = signStripePayload(body)

  return request.post(`${baseURL}/api/webhooks/stripe`, {
    data: body,
    headers: {
      'content-type': 'application/json',
      'stripe-signature': sig,
    },
  })
}

// Simulate a GHL opportunity stage change for an order.
export async function simulateGhlStageChange(
  request: APIRequestContext,
  baseURL: string,
  opportunityId: string,
  stageId: string
) {
  const payload = {
    type: 'OpportunityStageUpdate',
    opportunityId,
    stageId,
  }
  const body = JSON.stringify(payload)
  const sig = signGhlPayload(body)

  return request.post(`${baseURL}/api/webhooks/ghl`, {
    data: body,
    headers: {
      'content-type': 'application/json',
      'x-ghl-signature': sig,
    },
  })
}

// Create an order via the ops API (authenticated as ops).
// Returns the response JSON: { data: { orderId, customerId } }
export async function createOpsOrder(
  request: APIRequestContext,
  baseURL: string,
  overrides: Record<string, unknown> = {}
) {
  return request.post(`${baseURL}/api/orders`, {
    data: {
      customerName: 'E2E Test Customer',
      customerEmail: `e2e-${Date.now()}@example.com`,
      businessName: 'E2E Holdings LLC',
      serviceType: 'ANNUAL_REPORT',
      tier: 'STANDARD',
      state: 'FL',
      serviceFee: 125,
      stateFee: 138.75,
      ...overrides,
    },
  })
}
