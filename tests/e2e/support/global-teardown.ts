// Playwright global teardown — runs once after all E2E test files complete.
// Cleans only E2E-specific rows (keyed by the fixed tenant ID) so the test DB
// stays usable for unit/integration test runs.

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { E2E_TENANT_ID } from './global-setup'

const DB_URL =
  process.env.DATABASE_URL ??
  'postgresql://compass:compass@localhost:5433/compass_test'

export default async function globalTeardown() {
  // Remove the .env.development.local written by global-setup
  const devLocalPath = path.join(path.resolve(__dirname, '../../../'), '.env.development.local')
  if (fs.existsSync(devLocalPath)) {
    fs.unlinkSync(devLocalPath)
    console.log('[E2E Teardown] Removed .env.development.local')
  }

  const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } })

  try {
    // Delete in FK dependency order
    await prisma.reminder.deleteMany({
      where: { order: { tenantId: E2E_TENANT_ID } },
    })
    await prisma.auditLog.deleteMany({ where: { tenantId: E2E_TENANT_ID } })
    await prisma.document.deleteMany({ where: { tenantId: E2E_TENANT_ID } })
    await prisma.orderData.deleteMany({
      where: { order: { tenantId: E2E_TENANT_ID } },
    })
    await prisma.order.deleteMany({ where: { tenantId: E2E_TENANT_ID } })
    await prisma.customer.deleteMany({ where: { tenantId: E2E_TENANT_ID } })
    await prisma.user.deleteMany({ where: { tenantId: E2E_TENANT_ID } })
    await prisma.tenant.deleteMany({ where: { id: E2E_TENANT_ID } })

    console.log('[E2E Teardown] E2E tenant data cleaned')
  } finally {
    await prisma.$disconnect()
  }
}
