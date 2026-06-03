// Playwright global setup — runs once before all E2E test files.
// Seeds the E2E test database with a deterministic tenant + ops user + customer.
// Uses a fixed tenant ID so COMPASS_TENANT_ID can be hardcoded in .env.e2e.

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Fixed IDs — must match .env.e2e COMPASS_TENANT_ID
export const E2E_TENANT_ID = 'tenant_e2e_compass_01'
export const E2E_OPS_EMAIL = 'ops@compass-e2e.test'
export const E2E_OPS_PASSWORD = 'E2eOpsPass!99'
export const E2E_CUSTOMER_EMAIL = 'customer@compass-e2e.test'
export const E2E_CUSTOMER_PASSWORD = 'E2eCustPass!99'

const DB_URL =
  process.env.DATABASE_URL ??
  'postgresql://compass:compass@localhost:5433/compass_test'

export default async function globalSetup() {
  const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })

  try {
    const opsHash = await bcrypt.hash(E2E_OPS_PASSWORD, 10)
    const customerHash = await bcrypt.hash(E2E_CUSTOMER_PASSWORD, 10)

    // Upsert tenant with fixed ID so COMPASS_TENANT_ID is deterministic
    await prisma.tenant.upsert({
      where: { id: E2E_TENANT_ID },
      create: { id: E2E_TENANT_ID, name: 'Compass E2E', slug: 'compass-e2e' },
      update: { name: 'Compass E2E' },
    })

    // Ops user
    const opsUser = await prisma.user.upsert({
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

    // Customer user
    const customerUser = await prisma.user.upsert({
      where: { email: E2E_CUSTOMER_EMAIL },
      create: {
        tenantId: E2E_TENANT_ID,
        email: E2E_CUSTOMER_EMAIL,
        passwordHash: customerHash,
        role: 'CUSTOMER',
        mustChangePwd: false,
      },
      update: { passwordHash: customerHash, mustChangePwd: false },
    })

    // Customer profile
    await prisma.customer.upsert({
      where: { userId: customerUser.id },
      create: {
        tenantId: E2E_TENANT_ID,
        userId: customerUser.id,
        name: 'E2E Customer',
        email: E2E_CUSTOMER_EMAIL,
      },
      update: { name: 'E2E Customer' },
    })

    console.log(`[E2E Setup] Tenant: ${E2E_TENANT_ID}`)
    console.log(`[E2E Setup] Ops:      ${E2E_OPS_EMAIL}`)
    console.log(`[E2E Setup] Customer: ${E2E_CUSTOMER_EMAIL}`)
    console.log(`[E2E Setup] Ops user ID: ${opsUser.id}`)
  } finally {
    await prisma.$disconnect()
  }
}
