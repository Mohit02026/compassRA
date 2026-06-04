// E2E — Ops workflow
// Tests: ops dashboard, create order, order detail, status advancement, document upload.
// All external calls (GHL, email, R2) are intercepted by MSW / mock modes.

import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { loginOps } from './support/helpers'
import { E2E_TENANT_ID, E2E_OPS_EMAIL, E2E_OPS_PASSWORD } from './support/global-setup'

const DB_URL =
  process.env.DATABASE_URL ??
  'postgresql://compass:compass@localhost:5433/compass_test'

// Run ops workflow tests as an authenticated ops user
test.describe('Ops workflow', () => {
  // Log in once, reuse the auth cookie across tests in this block
  test.use({ storageState: undefined }) // start fresh, login below

  let orderId: string

  // Seed: create a test order directly in the DB so tests can operate on it
  test.beforeAll(async () => {
    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    try {
      // Reset ops user to known state — previous test files may have mutated the DB
      const opsHash = await bcrypt.hash(E2E_OPS_PASSWORD, 10)
      await prisma.user.upsert({
        where: { email: E2E_OPS_EMAIL },
        create: {
          tenantId: E2E_TENANT_ID,
          email: E2E_OPS_EMAIL,
          passwordHash: opsHash,
          role: 'OPS',
          mustChangePwd: false,
        },
        update: { passwordHash: opsHash, mustChangePwd: false },
      })

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
    } finally {
      await prisma.$disconnect()
    }
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
    // KPI cards: grid-cols-4 div — use specific class to avoid strict mode (dashboard has 2 grids)
    await expect(page.locator('[class*="grid-cols-4"]').first()).toBeVisible()
  })

  test('ops orders list shows the seeded order', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto('/ops/orders')
    // Orders list BUSINESS column shows customer.name ("E2E Customer"), not OrderData businessName
    // businessName is stored in OrderData and only shown on the order detail page
    await expect(page.locator('text=E2E Customer').first()).toBeVisible({ timeout: 10000 })
  })

  // ── Order detail ───────────────────────────────────────────────────────────

  test('ops order detail page shows business name and current status', async ({
    page,
    baseURL,
  }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)
    await expect(page.locator('text=Ops Workflow LLC')).toBeVisible()
    // StatusPill renders "Intake" not the raw enum "INTAKE"
    await expect(page.locator('text=Intake').first()).toBeVisible()
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

    const advanceBtn = page.locator('button', { hasText: /data.?qc|review/i }).first()
    await advanceBtn.click()

    // "text=Data QC" is always visible in the StageTracker — instead wait for the
    // button that only renders in DATA_QC state ("Mark Ready to File")
    // This confirms the PATCH completed and the page re-fetched the order
    await expect(
      page.locator('button', { hasText: /ready.?to.?file/i }).first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('advance DATA_QC → READY_TO_FILE', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)

    const advanceBtn = page.locator('button', { hasText: /ready.?to.?file/i }).first()
    await advanceBtn.click()

    // Wait for "Mark Filed" — only appears in READY_TO_FILE state
    await expect(
      page.locator('button', { hasText: /mark.?filed/i }).first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('advance READY_TO_FILE → FILED', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)

    const advanceBtn = page.locator('button', { hasText: /mark.?filed/i }).first()
    await advanceBtn.click()

    // Wait for "Upload Certificate" label — only appears in FILED state
    await expect(
      page.locator('text=Upload Certificate').first()
    ).toBeVisible({ timeout: 15000 })
  })

  // ── Exception handling ─────────────────────────────────────────────────────

  test('EXCEPTION button is present on FILED order', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)
    // Wait for "Upload Certificate" to confirm we're in FILED state before checking exception button
    await expect(page.locator('text=Upload Certificate').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('button', { hasText: /exception/i }).first()).toBeVisible()
  })

  // ── Document upload (cert) → auto-completes order ─────────────────────────

  test('upload CERTIFICATE completes the order', async ({ page, baseURL }) => {
    await loginOps(page, baseURL!)
    await page.goto(`/ops/orders/${orderId}`)

    // Upload a fake certificate PDF — use page.request so session cookie is included
    const certBuffer = Buffer.from('%PDF-1.4 fake-cert-content')

    const uploadRes = await page.request.post(`${baseURL!}/api/documents`, {
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

    expect([200, 201]).toContain(uploadRes.status())

    // Reload and verify order is COMPLETED — StatusPill renders "Completed"
    await page.reload()
    await expect(page.locator('text=Completed').first()).toBeVisible({ timeout: 15000 })
  })
})

// ── New order form ─────────────────────────────────────────────────────────────

test.describe('Ops new order form (/ops/orders/new)', () => {
  test.beforeAll(async () => {
    // Re-seed ops user so full-suite ordering can't contaminate login
    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    try {
      const hash = await bcrypt.hash(E2E_OPS_PASSWORD, 10)
      await prisma.user.update({
        where: { email: E2E_OPS_EMAIL },
        data: { passwordHash: hash, mustChangePwd: false },
      })
    } finally {
      await prisma.$disconnect()
    }
  })

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
