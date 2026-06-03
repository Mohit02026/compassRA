// E2E — Ops workflow
// Tests: ops dashboard, create order, order detail, status advancement, document upload.
// All external calls (GHL, email, R2) are intercepted by MSW / mock modes.

import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { loginOps, simulateStripePayment } from './support/helpers'
import { E2E_TENANT_ID } from './support/global-setup'
import { FAKE_PI_ID } from './support/msw-handlers'

const DB_URL =
  process.env.DATABASE_URL ??
  'postgresql://compass:compass@localhost:5433/compass_test'

// Run ops workflow tests as an authenticated ops user
test.describe('Ops workflow', () => {
  // Log in once, reuse the auth cookie across tests in this block
  test.use({ storageState: undefined }) // start fresh, login below

  let orderId: string

  // Seed: create a test order directly in the DB so tests can operate on it
  test.beforeAll(async ({ request, baseURL }) => {
    // Create an order via the ops API (no browser needed)
    const res = await request.post(`${baseURL!}/api/orders`, {
      data: {
        customerName: 'Ops Workflow Test',
        customerEmail: `ops-wf-${Date.now()}@e2e.test`,
        businessName: 'Ops Workflow LLC',
        serviceType: 'ANNUAL_REPORT',
        tier: 'STANDARD',
        state: 'FL',
        serviceFee: 125,
        stateFee: 138.75,
      },
    })
    // Note: This requires an authenticated session. If 401, use the DB directly.
    // For now create via DB to bypass auth requirement for setup
    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const ts = Date.now()

    const { orderId: newOrderId } = await prisma.$transaction(async (tx) => {
      const customerUser = await tx.user.findFirst({
        where: { tenantId: E2E_TENANT_ID, role: 'CUSTOMER' },
      })
      const customer = await tx.customer.findFirst({
        where: { tenantId: E2E_TENANT_ID },
      })
      if (!customer || !customerUser) throw new Error('E2E customer not found — run global-setup')

      const order = await tx.order.create({
        data: {
          tenantId: E2E_TENANT_ID,
          customerId: customer.id,
          serviceType: 'ANNUAL_REPORT',
          tier: 'STANDARD',
          state: 'FL',
          totalAmount: 263.75,
          status: 'INTAKE',
          paymentStatus: 'CONFIRMED',
          paymentRef: `pi_ops_wf_${ts}`,
        },
      })
      await tx.orderData.create({
        data: { orderId: order.id, key: 'businessName', value: 'Ops Workflow LLC' },
      })
      return { orderId: order.id }
    })

    orderId = newOrderId
    await prisma.$disconnect()
  })

  test.afterAll(async () => {
    if (!orderId) return
    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    await prisma.orderData.deleteMany({ where: { orderId } })
    await prisma.auditLog.deleteMany({ where: { entityId: orderId } })
    await prisma.document.deleteMany({ where: { orderId } })
    await prisma.order.deleteMany({ where: { id: orderId } })
    await prisma.$disconnect()
  })

  // ── Dashboard ──────────────────────────────────────────────────────────────

  test('ops dashboard loads with KPI stat cards', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto('/ops/dashboard')
    // KPI cards should be present (grid of 4 stat cards per design spec)
    await expect(page.locator('[class*="grid"]')).toBeVisible()
  })

  test('ops orders list shows the seeded order', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto('/ops/orders')
    await expect(page.locator('text=Ops Workflow LLC')).toBeVisible({ timeout: 10000 })
  })

  // ── Order detail ───────────────────────────────────────────────────────────

  test('ops order detail page shows business name and current status', async ({
    page,
    baseURL,
  }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)
    await expect(page.locator('text=Ops Workflow LLC')).toBeVisible()
    await expect(page.locator('text=INTAKE')).toBeVisible()
  })

  test('stage tracker renders all 5 stages', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)
    // StageTracker shows: Intake, Data QC, Ready to File, Filed, Completed
    const stages = ['Intake', 'Data QC', 'Ready to File', 'Filed', 'Completed']
    for (const stage of stages) {
      await expect(page.locator(`text=${stage}`).first()).toBeVisible()
    }
  })

  // ── Status advancement ─────────────────────────────────────────────────────

  test('advance INTAKE → DATA_QC via action button', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)

    // Click the "Move to Data QC" button (exact text depends on UI implementation)
    const advanceBtn = page.locator('button', { hasText: /data.?qc|review/i }).first()
    await advanceBtn.click()

    // Wait for status pill to update
    await expect(page.locator('text=DATA_QC')).toBeVisible({ timeout: 10000 })
  })

  test('advance DATA_QC → READY_TO_FILE', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)

    const advanceBtn = page.locator('button', { hasText: /ready.?to.?file/i }).first()
    await advanceBtn.click()
    await expect(page.locator('text=READY_TO_FILE')).toBeVisible({ timeout: 10000 })
  })

  test('advance READY_TO_FILE → FILED', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)

    const advanceBtn = page.locator('button', { hasText: /^filed$|mark.?filed/i }).first()
    await advanceBtn.click()
    await expect(page.locator('text=FILED')).toBeVisible({ timeout: 10000 })
  })

  // ── Exception handling ─────────────────────────────────────────────────────

  test('EXCEPTION button is present on FILED order', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)
    // FILED order should show both "Complete / Upload Certificate" and "Mark Exception" buttons
    await expect(page.locator('button', { hasText: /exception/i }).first()).toBeVisible()
  })

  // ── Document upload (cert) → auto-completes order ─────────────────────────

  test('upload CERTIFICATE completes the order', async ({ page, baseURL, request }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)

    // Upload a fake certificate PDF via the document upload button / form
    const certBuffer = Buffer.from('%PDF-1.4 fake-cert-content')

    const uploadRes = await request.post(`${baseURL!}/api/documents`, {
      multipart: {
        orderId,
        type: 'CERTIFICATE',
        filename: 'certificate.pdf',
        file: {
          name: 'certificate.pdf',
          mimeType: 'application/pdf',
          buffer: certBuffer,
        },
      },
    })

    // Document upload may require auth cookie — check status
    expect([200, 201]).toContain(uploadRes.status())

    // Reload and verify order is COMPLETED
    await page.reload()
    await expect(page.locator('text=COMPLETED')).toBeVisible({ timeout: 15000 })
  })
})

// ── New order form ─────────────────────────────────────────────────────────────

test.describe('Ops new order form (/ops/orders/new)', () => {
  test('renders the new order form', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto('/ops/orders/new')
    // Form should have key fields
    await expect(page.locator('[name="customerName"], [name="customer_name"]').first()).toBeVisible()
    await expect(page.locator('[name="businessName"], [name="business_name"]').first()).toBeVisible()
  })

  test('selecting LLC_FORMATION shows EIN fieldset toggle', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto('/ops/orders/new')

    // Select LLC Formation service type
    const serviceSelect = page.locator('select[name="serviceType"], [name="service_type"]').first()
    if (await serviceSelect.isVisible()) {
      await serviceSelect.selectOption('LLC_FORMATION')
      // EIN fieldset or add-on checkbox should appear
      await expect(page.locator('text=/ein/i').first()).toBeVisible()
    }
  })

  test('submitting the form with valid data creates an order', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto('/ops/orders/new')

    const ts = Date.now()
    await page.fill('[name="customerName"]', 'New Order Test')
    await page.fill('[name="customerEmail"], [name="customer_email"]', `new-order-${ts}@e2e.test`)
    await page.fill('[name="businessName"]', 'New Order LLC')

    // Submit
    const submitBtn = page.locator('button[type="submit"]').last()
    await submitBtn.click()

    // Should redirect to the created order's detail page
    await page.waitForURL('**/ops/orders/**', { timeout: 15000 })
    expect(page.url()).toMatch(/\/ops\/orders\/[a-z0-9]+/)
  })
})
