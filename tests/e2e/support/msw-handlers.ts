// MSW request handlers — intercept all outgoing HTTP from the Next.js server during E2E.
// These replace Stripe, GHL, Resend, and SunBiz with deterministic test fixtures.
// R2, Google Drive, and Resend use the services' built-in isMock path (env vars not set).

import { http, HttpResponse } from 'msw'

// ── Fake IDs (stable across tests for simple assertions) ─────────────────────

export const FAKE_PI_ID = 'pi_e2e_test_001'
export const FAKE_PI_CLIENT_SECRET = `${FAKE_PI_ID}_secret_e2e`
export const FAKE_GHL_CONTACT_ID = 'ghl_contact_e2e_001'
export const FAKE_GHL_OPP_ID = 'ghl_opportunity_e2e_001'

// ── Stripe ───────────────────────────────────────────────────────────────────

// POST /v1/payment_intents — called by public/checkout route
const stripeCreatePaymentIntent = http.post(
  'https://api.stripe.com/v1/payment_intents',
  () =>
    HttpResponse.json({
      id: FAKE_PI_ID,
      object: 'payment_intent',
      client_secret: FAKE_PI_CLIENT_SECRET,
      amount: 26375,
      currency: 'usd',
      status: 'requires_payment_method',
    })
)

// GET /v1/payment_intents/:id — fetched if route inspects it
const stripeGetPaymentIntent = http.get(
  'https://api.stripe.com/v1/payment_intents/:id',
  ({ params }) =>
    HttpResponse.json({
      id: params.id,
      object: 'payment_intent',
      amount: 26375,
      currency: 'usd',
      status: 'succeeded',
      client_secret: `${params.id}_secret_e2e`,
    })
)

// ── GoHighLevel ───────────────────────────────────────────────────────────────

// POST /contacts/ — createOrUpdateContact
const ghlCreateContact = http.post(
  'https://services.leadconnectorhq.com/contacts/',
  () =>
    HttpResponse.json({
      contact: {
        id: FAKE_GHL_CONTACT_ID,
        email: 'e2e@compasstest.com',
        firstName: 'E2E',
        lastName: 'Test',
      },
    })
)

// POST /opportunities/ — createOpportunity
const ghlCreateOpportunity = http.post(
  'https://services.leadconnectorhq.com/opportunities/',
  () =>
    HttpResponse.json({
      opportunity: {
        id: FAKE_GHL_OPP_ID,
        name: 'E2E Test Opportunity',
        pipelineStageId: 'stage_intake',
      },
    })
)

// PUT /opportunities/:id — updateOpportunityStage
const ghlUpdateOpportunity = http.put(
  'https://services.leadconnectorhq.com/opportunities/:id',
  () => HttpResponse.json({ success: true })
)

// POST /contacts/:contactId/workflow/:workflowId — enrollContactInWorkflow
const ghlEnrollWorkflow = http.post(
  'https://services.leadconnectorhq.com/contacts/:contactId/workflow/:workflowId',
  () => HttpResponse.json({ success: true })
)

// ── Resend ────────────────────────────────────────────────────────────────────
// Safety net — Resend is mock-mode when RESEND_API_KEY is empty (preferred approach).

const resendSendEmail = http.post(
  'https://api.resend.com/emails',
  () => HttpResponse.json({ id: 'email_e2e_001' })
)

// ── SunBiz Daily API ──────────────────────────────────────────────────────────
// Services now call www.sunbizdaily.com/api/v2/ (JSON) not search.sunbiz.org (HTML).

// Name search: GET /api/v2/filings/?corporation_name=...
const sunbizNameSearch = http.get(
  'https://www.sunbizdaily.com/api/v2/filings/',
  ({ request }) => {
    const url = new URL(request.url)
    const term = (url.searchParams.get('corporation_name') ?? '').toUpperCase()

    // UNIQUE / AVAILABLE prefix → no matches → available
    if (term.startsWith('UNIQUE') || term.startsWith('AVAILABLE')) {
      return HttpResponse.json({ filings: [] })
    }

    // Any other query → one similar result → "likely"
    return HttpResponse.json({
      filings: [{ corporation_name: 'TAKEN TEST LLC OF FLORIDA', status: 'A' }],
    })
  }
)

// Entity lookup by document number: GET /api/v2/filings/:docNumber/
const sunbizEntityLookup = http.get(
  'https://www.sunbizdaily.com/api/v2/filings/:docNumber/',
  ({ params }) => {
    const docNumber = params.docNumber as string
    if (!docNumber.match(/^[LP]\d{7,9}$/)) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json({
      corporation_number: docNumber,
      corporation_name: 'SUNBIZ LOOKUP LLC',
      status: 'A',
      file_date: '2022-03-15',
      county: 'Hillsborough',
      principal_address: { address_1: '100 Main St', city: 'Tampa', state: 'FL', zip: '33601' },
      mailing_address: { address_1: '100 Main St', city: 'Tampa', state: 'FL', zip: '33601' },
      registered_agent: { name: 'COMPASS REGISTERED AGENT LLC' },
    })
  }
)

// ── Export ────────────────────────────────────────────────────────────────────
// Google Fonts are NOT handled here — NEXT_FONT_GOOGLE_MOCKED_RESPONSES env var
// bypasses next/font/google network requests entirely, so MSW never sees them.

export const handlers = [
  stripeCreatePaymentIntent,
  stripeGetPaymentIntent,
  ghlCreateContact,
  ghlCreateOpportunity,
  ghlUpdateOpportunity,
  ghlEnrollWorkflow,
  resendSendEmail,
  sunbizNameSearch,
  sunbizEntityLookup,
]
