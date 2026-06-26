// E2E — Authentication flows
// Tests: ops login, customer login, role-based redirect, force password change.
// Uses the seeded ops + customer accounts from global-setup.ts.

import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { E2E_TENANT_ID } from './support/global-setup'

const DB_URL =
  process.env.DATABASE_URL ??
  'postgresql://compass:compass@localhost:5433/compass_test'

const OPS_EMAIL = process.env.E2E_OPS_EMAIL!
const OPS_PASS = process.env.E2E_OPS_PASSWORD!
const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL!
const CUSTOMER_PASS = process.env.E2E_CUSTOMER_PASSWORD!

// ── Ops login ────────────────────────────────────────────────────────────────

test.describe('Ops login (/ops/login)', () => {
  test('shows the ops login page', async ({ page }) => {
    await page.goto('/ops/login')
    await expect(page.locator('h1, h2').first()).toContainText(/sign in/i)
    await expect(page.locator('[name="email"]')).toBeVisible()
    await expect(page.locator('[name="password"]')).toBeVisible()
  })

  test('logs in ops user and redirects to ops dashboard', async ({ page }) => {
    await page.goto('/ops/login')
    await page.fill('[name="email"]', OPS_EMAIL)
    await page.fill('[name="password"]', OPS_PASS)
    await page.click('[type="submit"]')
    await page.waitForURL('**/ops/dashboard', { timeout: 15000 })
    expect(page.url()).toContain('/ops/dashboard')
  })

  test('shows error on wrong password', async ({ page }) => {
    await page.goto('/ops/login')
    await page.fill('[name="email"]', OPS_EMAIL)
    await page.fill('[name="password"]', 'wrongpassword123')
    await page.click('[type="submit"]')
    // Should stay on login page and show an error message
    await expect(page).not.toHaveURL('**/ops/dashboard')
    // NextAuth returns to login with error param
    await expect(page.url()).toContain('/ops/login')
  })

  test('customer email is rejected on ops login (wrong role)', async ({ page }) => {
    await page.goto('/ops/login')
    await page.fill('[name="email"]', CUSTOMER_EMAIL)
    await page.fill('[name="password"]', CUSTOMER_PASS)
    await page.click('[type="submit"]')
    // Must not land on ops dashboard
    await expect(page).not.toHaveURL('**/ops/dashboard')
  })
})

// ── Customer login ────────────────────────────────────────────────────────────

test.describe('Customer login (/login)', () => {
  test('shows the customer login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('[name="email"]')).toBeVisible()
    await expect(page.locator('[name="password"]')).toBeVisible()
  })

  test('logs in customer and redirects to portal dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', CUSTOMER_EMAIL)
    await page.fill('[name="password"]', CUSTOMER_PASS)
    await page.click('[type="submit"]')
    await page.waitForURL(/portal\/(dashboard|account\/change-password)/, { timeout: 15000 })
    expect(page.url()).toMatch(/portal/)
  })

  test('ops email is rejected on customer login (wrong role)', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', OPS_EMAIL)
    await page.fill('[name="password"]', OPS_PASS)
    await page.click('[type="submit"]')
    await expect(page).not.toHaveURL('**/portal/dashboard')
  })
})

// ── Role-based middleware redirects ──────────────────────────────────────────

test.describe('Middleware — unauthenticated redirects', () => {
  test('/portal/dashboard redirects unauthenticated to /login', async ({ page }) => {
    await page.goto('/portal/dashboard')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('/ops/dashboard redirects unauthenticated to /ops/login', async ({ page }) => {
    await page.goto('/ops/dashboard')
    await page.waitForURL('**/ops/login**', { timeout: 10000 })
    expect(page.url()).toContain('/ops/login')
  })

  test('/ops/orders redirects unauthenticated to /ops/login', async ({ page }) => {
    await page.goto('/ops/orders')
    await page.waitForURL('**/ops/login**', { timeout: 10000 })
    expect(page.url()).toContain('/ops/login')
  })
})

// ── Force password change ─────────────────────────────────────────────────────

test.describe('Force password change flow', () => {
  let tempUserEmail: string

  test.beforeAll(async () => {
    // Create a fresh customer with mustChangePwd=true to test the force-change flow
    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const ts = Date.now()
    tempUserEmail = `forcepwd-${ts}@e2e.test`

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId: E2E_TENANT_ID,
          email: tempUserEmail,
          passwordHash: await bcrypt.hash('TempPass!123', 10),
          role: 'CUSTOMER',
          mustChangePwd: true,
        },
      })
      await tx.customer.create({
        data: {
          tenantId: E2E_TENANT_ID,
          userId: user.id,
          name: 'Force PWD Test',
          email: tempUserEmail,
        },
      })
    })

    await prisma.$disconnect()
  })

  test.afterAll(async () => {
    // Clean up temp user
    const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })
    const user = await prisma.user.findFirst({ where: { email: tempUserEmail } })
    if (user) {
      await prisma.customer.deleteMany({ where: { userId: user.id } })
      await prisma.user.delete({ where: { id: user.id } })
    }
    await prisma.$disconnect()
  })

  // mustChangePwd redirect is intentionally not enforced in middleware.
  // The forced redirect was removed — customers land on /portal/dashboard and can
  // optionally change their password from /portal/account.
  test.skip('user with mustChangePwd=true is redirected to change-password on login', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', tempUserEmail)
    await page.fill('[name="password"]', 'TempPass!123')
    await page.click('[type="submit"]')
    await page.waitForURL('**/change-password**', { timeout: 15000 })
    expect(page.url()).toContain('change-password')
  })

  test.skip('change-password form renders with new and confirm password fields', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', tempUserEmail)
    await page.fill('[name="password"]', 'TempPass!123')
    await page.click('[type="submit"]')
    await page.waitForURL('**/change-password**', { timeout: 15000 })
    await expect(page.locator('[name="newPassword"]')).toBeVisible()
    await expect(page.locator('[name="confirmPassword"]')).toBeVisible()
  })
})

// ── Public pages are accessible without auth ──────────────────────────────────

test.describe('Public pages (no auth required)', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Compass/i)
  })

  test('/name-search is accessible', async ({ page }) => {
    await page.goto('/name-search')
    await expect(page.locator('input').first()).toBeVisible()
  })

  test('/llc is accessible', async ({ page }) => {
    await page.goto('/llc')
    // Step 1 of LLC intake should render
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('/annual-report is accessible', async ({ page }) => {
    await page.goto('/annual-report')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
