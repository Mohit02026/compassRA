import { testPrisma } from '../setup'
import bcrypt from 'bcryptjs'

// Use the dedicated test DB client — same instance the mocked lib/prisma returns
export const db = testPrisma

export async function seedTestTenant(slug = 'test-tenant') {
  const ts = Date.now()
  const opsHash = await bcrypt.hash('password123', 4)
  const customerHash = await bcrypt.hash('password123', 4)

  // Single transaction — all rows visible atomically, same connection, no FK races.
  // Timeout bumped to 30s to accommodate slow CI and test suites with many beforeEach calls.
  return db.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name: 'Test Tenant', slug: `${slug}-${ts}` },
    })

    const opsUser = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: `ops-${ts}@test.com`,
        passwordHash: opsHash,
        role: 'OPS',
        mustChangePwd: false,
      },
    })

    const customerUser = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: `customer-${ts}@test.com`,
        passwordHash: customerHash,
        role: 'CUSTOMER',
        mustChangePwd: false,
      },
    })

    const customer = await tx.customer.create({
      data: {
        tenantId: tenant.id,
        userId: customerUser.id,
        name: 'Test Customer',
        email: customerUser.email,
      },
    })

    return { tenant, opsUser, customerUser, customer }
  }, { timeout: 30000 })
}

export async function cleanDb() {
  await db.$executeRawUnsafe(
    `TRUNCATE "Reminder","AuditLog","Document","OrderData","Order","Customer","User","WebhookEvent","Tenant" RESTART IDENTITY CASCADE`
  )
}
