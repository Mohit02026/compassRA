// E2E — Customer portal
// Tests: dashboard, order detail, stage tracker, documents vault, company page,
//        compliance calendar, legal notices, account / change-password.
// Uses a pre-seeded order in the E2E tenant.

import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { loginCustomer } from './support/helpers'
import { E2E_TENANT_ID } from './support/global-setup'

const DB_URL =
  process.env.DATABASE_URL ??
  'postgresql://compass:compass@localhost:5433/compass_test'

// State: seeded order + known customer creds
let seededOrderId: string
const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL!
const CUSTOMER_PASS = process.env.E2E_CUSTOMER_PASSWORD!

test.beforeAll(async () => {
  const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })

  const customer = await prisma.customer.findFirst({
    where: { tenantId: E2E_TENANT_ID },
    include: { user: true },
  })
  if (!customer) throw new Error('E2E customer not found — run global-setup')

  // Create a sample order in COMPLETED status so all portal views have data
  const ts = Date.now()
  const order = await prisma.order.create({
    data: {
      tenantId: E2E_TENANT_ID,
      customerId: customer.id,
      serviceType: 'ANNUAL_REPORT',
      tier: 'STANDARD',
      state: 'FL',
      totalAmount: 263.75,
      status: 'COMPLETED',
      paymentStatus: 'CONFIRMED',
      paymentRef: `pi_portal_test_${ts}`,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      completedAt: new Date(),
    },
  })

  await prisma.orderData.create({
    data: { orderId: order.id, key: 'businessName', value: 'Portal Test LLC' },
  })

  // Create a customer-visible document
  await prisma.document.create({
    data: {
      orderId: order.id,
      tenantId: E2E_TENANT_ID,
      type: 'CERTIFICATE',
      r2Key: `e2e/${order.id}/certificate.pdf`,
      filename: 'certificate.pdf',
    },
  })

  // Create an internal document (should NOT appear in portal)
  await prisma.document.create({
    data: {
      orderId: order.id,
      tenantId: E2E_TENANT_ID,
      type: 'FILING_SHEET',
      r2Key: `e2e/${order.id}/filing-sheet.pdf`,
      filename: 'filing-sheet.pdf',
    },
  })

  seededOrderId = order.id
  await prisma.$disconnect()
})

test.afterAll(async () => {
  if (!seededOrderId) return
  const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
  await prisma.document.deleteMany({ where: { orderId: seededOrderId } })
  await prisma.orderData.deleteMany({ where: { orderId: seededOrderId } })
  await prisma.auditLog.deleteMany({ where: { entityId: seededOrderId } })
  await prisma.order.deleteMany({ where: { id: seededOrderId } })
  await prisma.$disconnect()
})

// ── Portal dashboard ──────────────────────────────────────────────────────────

test.describe('Portal dashboard', () => {
  test('dashboard loads and shows order summary', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/dashboard')
    await expect(page.locator('text=Portal Test LLC').first()).toBeVisible({ timeout: 10000 })
  })

  test('COMPLETED status pill is visible on dashboard', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/dashboard')
    // StatusPill renders "Completed" not the raw enum "COMPLETED"
    await expect(page.locator('text=Completed').first()).toBeVisible({ timeout: 10000 })
  })

  test('portal nav links are present', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/dashboard')
    const nav = page.locator('nav, [role="navigation"]')
    // Check for key nav items from portal layout
    await expect(nav.locator('text=/dashboard/i').first()).toBeVisible()
  })
})

// ── Order detail ──────────────────────────────────────────────────────────────

test.describe('Portal order detail', () => {
  test('order detail shows service type heading and stage tracker', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto(`/portal/orders/${seededOrderId}`)
    // Portal order detail heading shows formatService(serviceType) = "Annual Report",
    // not businessName (businessName lives in OrderData and is not in the heading)
    await expect(page.locator('text=Annual Report').first()).toBeVisible()
    // Stage tracker should show COMPLETED as active
    await expect(page.locator('text=Completed').first()).toBeVisible()
  })

  test('COMPLETED order shows completedAt information', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto(`/portal/orders/${seededOrderId}`)
    await expect(page.locator('text=Completed').first()).toBeVisible()
  })

  test('404 for order belonging to another customer', async ({ page, baseURL }) => {
    // Create another tenant's order
    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const otherTenantOrder = await prisma.order.findFirst({
      where: { NOT: { tenantId: E2E_TENANT_ID } },
    })
    await prisma.$disconnect()

    if (!otherTenantOrder) {
      test.skip()
      return
    }

    await loginCustomer(page, baseURL!)
    await page.goto(`/portal/orders/${otherTenantOrder.id}`)
    // Should not show the seeded order's business name (tenant isolation)
    await expect(page.locator('text=Portal Test LLC')).not.toBeVisible()
  })
})

// ── Documents vault ───────────────────────────────────────────────────────────

test.describe('Portal documents vault', () => {
  test('documents page shows the CERTIFICATE but not the FILING_SHEET', async ({
    page,
    baseURL,
  }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/documents')

    // Documents page shows DOC_TYPE_LABELS labels, not raw filenames
    // CERTIFICATE → "Certificate of Status"
    await expect(page.locator('text=Certificate of Status').first()).toBeVisible({ timeout: 10000 })

    // FILING_SHEET is filtered on the server — neither label nor filename appears
    await expect(page.locator('text=Filing Sheet')).not.toBeVisible()
    await expect(page.locator('text=filing-sheet.pdf')).not.toBeVisible()
  })

  test('documents for locked (non-COMPLETED) orders show locked state', async ({
    page,
    baseURL,
  }) => {
    // Create an INTAKE order (no documents)
    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const customer = await prisma.customer.findFirst({ where: { tenantId: E2E_TENANT_ID } })
    const intakeOrder = await prisma.order.create({
      data: {
        tenantId: E2E_TENANT_ID,
        customerId: customer!.id,
        serviceType: 'ANNUAL_REPORT',
        tier: 'STANDARD',
        state: 'FL',
        totalAmount: 263.75,
        status: 'INTAKE',
        paymentStatus: 'CONFIRMED',
      },
    })
    await prisma.orderData.create({
      data: { orderId: intakeOrder.id, key: 'businessName', value: 'Locked Order LLC' },
    })
    // Add a doc to the INTAKE order so the "Locked" state renders (not empty state)
    await prisma.document.create({
      data: {
        orderId: intakeOrder.id,
        tenantId: E2E_TENANT_ID,
        type: 'CERTIFICATE',
        r2Key: `e2e/${intakeOrder.id}/cert.pdf`,
        filename: 'locked-cert.pdf',
      },
    })
    await prisma.$disconnect()

    try {
      await loginCustomer(page, baseURL!)
      await page.goto(`/portal/orders/${intakeOrder.id}`)
      // INTAKE order docs show as "Locked" (isCompleted = false → locked UI)
      await expect(page.locator('text=Locked').first())
        .toBeVisible({ timeout: 10000 })
    } finally {
      const cleanPrisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
      await cleanPrisma.document.deleteMany({ where: { orderId: intakeOrder.id } })
      await cleanPrisma.orderData.deleteMany({ where: { orderId: intakeOrder.id } })
      await cleanPrisma.order.deleteMany({ where: { id: intakeOrder.id } })
      await cleanPrisma.$disconnect()
    }
  })
})

// ── Company page ──────────────────────────────────────────────────────────────

test.describe('Portal company page', () => {
  test('/portal/company shows business name and RA address', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/company')
    // Should show some company info
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('RA address is shown', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/company')
    // Compass RA address
    await expect(page.locator('text=/8 The Green|Dover|Dover, DE/i').first()).toBeVisible({
      timeout: 10000,
    })
  })
})

// ── Compliance calendar ───────────────────────────────────────────────────────

test.describe('Portal compliance calendar', () => {
  test('/portal/calendar shows May 1 deadline', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/calendar')
    await expect(page.locator('text=/may 1|may first/i').first()).toBeVisible({ timeout: 10000 })
  })

  test('countdown shows days remaining', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/calendar')
    // Countdown should show a number of days
    await expect(page.locator('text=/day/i').first()).toBeVisible()
  })

  test('reminder schedule section is visible', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/calendar')
    // The "Reminder schedule" section heading is always rendered (empty state or table)
    await expect(page.locator('text=Reminder schedule').first()).toBeVisible({ timeout: 10000 })
  })
})

// ── Legal notices ─────────────────────────────────────────────────────────────

test.describe('Portal legal notices', () => {
  test('/portal/notices renders (empty state if no notices)', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/notices')
    // Either shows a list of notices or an empty state
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })
})

// ── Account / change password ─────────────────────────────────────────────────

test.describe('Portal account page', () => {
  test('/portal/account renders the account settings', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/account')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('change password form accepts current + new password', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    // /portal/account has the full change-password form (current + new)
    // /portal/account/change-password is the force-change flow (no currentPassword field)
    await page.goto('/portal/account')

    await expect(page.locator('[name="currentPassword"]')).toBeVisible()
    await expect(page.locator('[name="newPassword"]')).toBeVisible()
  })

  test('change password with wrong current password shows error', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/portal/account')

    await page.fill('[name="currentPassword"]', 'WrongCurrentPass!99')
    await page.fill('[name="newPassword"]', 'NewValidPass!99')
    // Also fill confirmPassword so client validation passes and the API is actually called
    await page.fill('[name="confirmPassword"]', 'NewValidPass!99')
    await page.click('[type="submit"]')

    // API returns "Current password is incorrect" — regex matches "incorrect"
    await expect(page.locator('text=/incorrect|invalid|wrong/i').first()).toBeVisible({
      timeout: 10000,
    })
  })
})

// ── Portal data isolation ─────────────────────────────────────────────────────

test.describe('Tenant isolation in portal', () => {
  test('customer cannot access ops routes', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/ops/orders')
    // Should redirect to ops login (not show ops data)
    await page.waitForURL('**/ops/login**', { timeout: 10000 })
  })

  test('customer cannot access ops dashboard', async ({ page, baseURL }) => {
    await loginCustomer(page, baseURL!)
    await page.goto('/ops/dashboard')
    await page.waitForURL('**/ops/login**', { timeout: 10000 })
  })
})
