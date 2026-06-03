// E2E — Golden path
//
// Covers the full end-to-end flow without real external services:
//   1. Public LLC intake form (3 steps)
//   2. POST to /api/public/checkout → MSW returns fake Stripe PaymentIntent
//   3. Simulate payment confirmation (POST to /api/webhooks/stripe with self-signed event)
//   4. GHL receives order push (MSW intercepts api.leadconnectorhq.com)
//   5. GHL stage change webhook drives order through lifecycle
//   6. Customer logs in → portal shows correct status at each stage
//   7. Ops uploads certificate → order auto-completes
//   8. Customer portal shows COMPLETED + document in vault
//
// Real browser interaction covers steps 1, 6, 8.
// API-level calls (no browser) cover steps 2, 3, 4, 5, 7.

import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { simulateStripePayment, simulateGhlStageChange, loginCustomer } from './support/helpers'
import { E2E_TENANT_ID } from './support/global-setup'
import { FAKE_PI_ID, FAKE_GHL_OPP_ID } from './support/msw-handlers'

const DB_URL =
  process.env.DATABASE_URL ??
  'postgresql://compass:compass@localhost:5433/compass_test'

const GHL_STAGE_MAP = JSON.parse(process.env.GHL_STAGE_MAP ?? '{}') as Record<string, string>

// State shared across tests in this describe block
let createdOrderId: string
let customerEmail: string
let customerTempPassword: string

test.describe('Golden path: public intake → payment → lifecycle → portal', () => {
  // ── Step 1: Public LLC intake form ──────────────────────────────────────────

  test('LLC intake form — step 1: business details', async ({ page }) => {
    await page.goto('/llc')
    // Verify step 1 renders
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()

    // Business name — name search fires on input (MSW returns "available")
    const businessNameInput = page.locator('[name="businessName"], [placeholder*="LLC"]').first()
    await businessNameInput.fill('UNIQUE GOLDEN PATH LLC')
    // Wait a moment for the name availability badge to appear
    await page.waitForTimeout(1000)

    // Management type
    const mgmtSelect = page.locator('select[name="managementType"]')
    if (await mgmtSelect.isVisible()) {
      await mgmtSelect.selectOption('MEMBER_MANAGED')
    }

    // Add a member row (if repeating member form exists)
    const addMemberBtn = page.locator('button', { hasText: /add member/i })
    if (await addMemberBtn.isVisible()) {
      // Fill existing member field
      const memberName = page.locator('[name*="member"][name*="name"], [placeholder*="member"]').first()
      if (await memberName.isVisible()) await memberName.fill('Jane Golden')
    }

    // Proceed to step 2
    const nextBtn = page.locator('button', { hasText: /next|continue/i }).last()
    await nextBtn.click()

    // Step 2 should be visible
    await expect(page.locator('text=/contact|address/i').first()).toBeVisible({ timeout: 10000 })
  })

  test('LLC intake form — step 2: contact and RA', async ({ page }) => {
    // Navigate back from step 1 data entered in previous test isn't preserved
    // For this test, assume we resume from a fresh start and go directly
    await page.goto('/llc')
    await page.waitForTimeout(500)

    // Fast-fill step 1 fields
    const businessInput = page.locator('[name="businessName"], input[placeholder*="LLC"]').first()
    await businessInput.fill('UNIQUE GOLDEN PATH LLC')

    const nextBtn1 = page.locator('button', { hasText: /next|continue/i }).last()
    await nextBtn1.click()
    await page.waitForTimeout(1000)

    // Step 2 — contact info
    const contactName = page.locator('[name="contactName"], [name="ownerName"]').first()
    if (await contactName.isVisible()) await contactName.fill('Jane Golden')

    const emailInput = page.locator('[name="contactEmail"], [name="email"]').first()
    if (await emailInput.isVisible()) {
      customerEmail = `golden-path-${Date.now()}@e2e.test`
      await emailInput.fill(customerEmail)
    }

    // RA checkbox (Compass RA pre-checked in form)
    const raCheckbox = page.locator('[name="useCompassRA"]')
    if (await raCheckbox.isVisible() && !await raCheckbox.isChecked()) {
      await raCheckbox.check()
    }

    const nextBtn2 = page.locator('button', { hasText: /next|continue/i }).last()
    await nextBtn2.click()
    await page.waitForTimeout(1000)

    // Step 3 should be visible (add-ons / summary)
    await expect(page.locator('text=/add-on|summary|total/i').first()).toBeVisible({ timeout: 10000 })
  })

  // ── Step 2: Checkout API — create order + Stripe PI ─────────────────────────

  test('POST /api/public/checkout creates order and returns clientSecret', async ({
    request,
    baseURL,
  }) => {
    customerEmail = customerEmail ?? `gp-fallback-${Date.now()}@e2e.test`

    const res = await request.post(`${baseURL!}/api/public/checkout`, {
      data: {
        customerName: 'Jane Golden',
        customerEmail,
        serviceType: 'LLC_FORMATION',
        tier: 'STANDARD',
        businessName: 'UNIQUE GOLDEN PATH LLC',
        serviceFee: 125,
        stateFee: 125,
      },
    })

    expect(res.status()).toBe(201)
    const json = await res.json()
    expect(json.data.clientSecret).toContain('_secret_')
    expect(json.data.orderId).toBeTruthy()

    createdOrderId = json.data.orderId

    // Verify order is in DB as INTAKE with paymentRef
    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const order = await prisma.order.findUnique({ where: { id: createdOrderId } })
    expect(order?.status).toBe('INTAKE')
    expect(order?.paymentRef).toBe(FAKE_PI_ID) // MSW returns FAKE_PI_ID for all PI creates
    await prisma.$disconnect()
  })

  // ── Step 3: Simulate Stripe payment confirmation ──────────────────────────

  test('POST /api/webhooks/stripe with valid signature confirms payment', async ({
    request,
    baseURL,
  }) => {
    // Use the paymentRef stored on the order (= FAKE_PI_ID from MSW)
    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const order = await prisma.order.findUnique({ where: { id: createdOrderId } })
    await prisma.$disconnect()

    const paymentIntentId = order?.paymentRef ?? FAKE_PI_ID

    const res = await simulateStripePayment(request, baseURL!, paymentIntentId)
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)

    // Verify payment confirmed in DB
    const prisma2 = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const updated = await prisma2.order.findUnique({ where: { id: createdOrderId } })
    expect(updated?.paymentStatus).toBe('CONFIRMED')

    // GHL push should have set ghlOpportunityId (MSW intercepted GHL API)
    expect(updated?.ghlOpportunityId).toBe(FAKE_GHL_OPP_ID)
    await prisma2.$disconnect()
  })

  // ── Step 4–5: GHL webhook drives lifecycle ────────────────────────────────

  test('GHL webhook INTAKE → DATA_QC updates order', async ({ request, baseURL }) => {
    const res = await simulateGhlStageChange(
      request,
      baseURL!,
      FAKE_GHL_OPP_ID,
      GHL_STAGE_MAP['DATA_QC'] ?? 'stage_e2e_2'
    )
    expect(res.status()).toBe(200)

    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const order = await prisma.order.findUnique({ where: { id: createdOrderId } })
    expect(order?.status).toBe('DATA_QC')
    await prisma.$disconnect()
  })

  test('GHL webhook DATA_QC → READY_TO_FILE', async ({ request, baseURL }) => {
    const res = await simulateGhlStageChange(
      request,
      baseURL!,
      FAKE_GHL_OPP_ID,
      GHL_STAGE_MAP['READY_TO_FILE'] ?? 'stage_e2e_3'
    )
    expect(res.status()).toBe(200)

    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const order = await prisma.order.findUnique({ where: { id: createdOrderId } })
    expect(order?.status).toBe('READY_TO_FILE')
    await prisma.$disconnect()
  })

  test('GHL webhook READY_TO_FILE → FILED', async ({ request, baseURL }) => {
    const res = await simulateGhlStageChange(
      request,
      baseURL!,
      FAKE_GHL_OPP_ID,
      GHL_STAGE_MAP['FILED'] ?? 'stage_e2e_4'
    )
    expect(res.status()).toBe(200)

    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const order = await prisma.order.findUnique({ where: { id: createdOrderId } })
    expect(order?.status).toBe('FILED')
    await prisma.$disconnect()
  })

  // ── Step 6: Customer portal reflects status ───────────────────────────────

  test('customer portal order detail shows FILED status', async ({ page, baseURL }) => {
    // The customer account was created by createOrder. We need their temp password.
    // Since Resend is in mock mode, the email wasn't sent. Fetch password from DB audit.
    // In practice, ops sees it or it's in the welcome email.
    // For the test: reset the password directly in DB to a known value.
    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const user = await prisma.user.findFirst({ where: { email: customerEmail } })
    if (user) {
      const { default: bcrypt } = await import('bcryptjs')
      const hash = await bcrypt.hash('GoldenE2E!99', 10)
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hash, mustChangePwd: false },
      })
    }
    await prisma.$disconnect()

    await loginCustomer(page, baseURL!, customerEmail, 'GoldenE2E!99')
    await page.goto(`/portal/orders/${createdOrderId}`)

    await expect(page.locator('text=FILED')).toBeVisible({ timeout: 10000 })
    // Stage tracker should highlight FILED as active
    await expect(page.locator('text=Filed').first()).toBeVisible()
  })

  // ── Step 7: Upload certificate → auto-completes ───────────────────────────

  test('uploading CERTIFICATE auto-completes order to COMPLETED', async ({
    request,
    baseURL,
  }) => {
    const certBuffer = Buffer.from('%PDF-1.4 1 0 obj golden-cert-content endobj')

    const res = await request.post(`${baseURL!}/api/documents`, {
      multipart: {
        orderId: createdOrderId,
        type: 'CERTIFICATE',
        filename: 'annual-report-cert.pdf',
        file: {
          name: 'annual-report-cert.pdf',
          mimeType: 'application/pdf',
          buffer: certBuffer,
        },
      },
    })
    // Accept 200/201 (auth may not be set on direct API call)
    expect([200, 201]).toContain(res.status())

    // Give the auto-complete async update a moment
    await new Promise((r) => setTimeout(r, 1000))

    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const order = await prisma.order.findUnique({ where: { id: createdOrderId } })
    expect(order?.status).toBe('COMPLETED')
    await prisma.$disconnect()
  })

  // ── Step 8: Portal shows COMPLETED + document ─────────────────────────────

  test('customer portal shows COMPLETED status and document in vault', async ({
    page,
    baseURL,
  }) => {
    await loginCustomer(page, baseURL!, customerEmail, 'GoldenE2E!99')

    // Portal dashboard
    await page.goto('/portal/dashboard')
    await expect(page.locator('text=COMPLETED').first()).toBeVisible({ timeout: 10000 })

    // Documents vault
    await page.goto('/portal/documents')
    // Certificate should be visible (FILING_SHEET and SS4_DRAFT are filtered out)
    await expect(page.locator('text=/certificate|cert/i').first()).toBeVisible({ timeout: 10000 })
  })
})

// ── Name search UI (public page) ─────────────────────────────────────────────

test.describe('Name search page', () => {
  test('shows "available" badge for a unique name (MSW returns no results)', async ({
    page,
  }) => {
    await page.goto('/name-search')
    const input = page.locator('input').first()
    await input.fill('UNIQUE XYZZY HOLDINGS LLC')
    // Trigger the search (button click or input event)
    const searchBtn = page.locator('button', { hasText: /search|check/i }).first()
    if (await searchBtn.isVisible()) await searchBtn.click()

    await expect(page.locator('text=/available/i').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows "taken" or "likely" badge for an existing-sounding name', async ({ page }) => {
    await page.goto('/name-search')
    const input = page.locator('input').first()
    await input.fill('TAKEN TEST LLC')
    const searchBtn = page.locator('button', { hasText: /search|check/i }).first()
    if (await searchBtn.isVisible()) await searchBtn.click()

    // MSW returns one result for non-UNIQUE searches → "likely"
    await expect(page.locator('text=/taken|likely/i').first()).toBeVisible({ timeout: 10000 })
  })
})
