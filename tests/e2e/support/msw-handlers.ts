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

// ── SunBiz ────────────────────────────────────────────────────────────────────

// Name search results
const sunbizNameSearch = http.get(
  'https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults',
  ({ request }) => {
    const url = new URL(request.url)
    const term = (url.searchParams.get('searchTerm') ?? '').toUpperCase()

    // UNIQUE / AVAILABLE prefix → no matches → available
    if (term.startsWith('UNIQUE') || term.startsWith('AVAILABLE')) {
      return new HttpResponse('<html><body><p>No records found.</p></body></html>', {
        headers: { 'content-type': 'text/html' },
      })
    }

    // Any other query → return one similar result → likely
    return new HttpResponse(
      `<html><body>
        <a href="/Inquiry/CorporationSearch/SearchResultDetail?inquiryType=EntityName">TAKEN TEST LLC OF FLORIDA</a>
      </body></html>`,
      { headers: { 'content-type': 'text/html' } }
    )
  }
)

// Entity lookup by document number (annual report pre-pop SunBiz pull)
const sunbizEntityLookup = http.get(
  'https://search.sunbiz.org/Inquiry/CorporationSearch/GetFilingInformation',
  ({ request }) => {
    const url = new URL(request.url)
    const docNumber = url.searchParams.get('masterDataToListOn') ?? ''

    if (!docNumber.match(/^[LP]\d{7,9}$/)) {
      return new HttpResponse('<html><body><p>No records found.</p></body></html>', {
        headers: { 'content-type': 'text/html' },
      })
    }

    return new HttpResponse(
      `<html><body>
        <span id="lblEntityName">SUNBIZ LOOKUP LLC</span>
        <span>Document Number</span><span>${docNumber}</span>
        <span>Status</span><span>ACTIVE</span>
        <span>Filing Date</span><span>03/15/2022</span>
        <span>Principal Address</span><span>100 Main St Tampa FL 33601</span>
        <span>Mailing Address</span><span>100 Main St Tampa FL 33601</span>
        <span>Registered Agent Name</span><span>COMPASS REGISTERED AGENT LLC</span>
        <span>Registered Agent Address</span><span>8 The Green Suite 300 Dover DE 19901</span>
      </body></html>`,
      { headers: { 'content-type': 'text/html' } }
    )
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
