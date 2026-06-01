import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create the single tenant for Phase 1
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'compass' },
    update: {},
    create: {
      name: 'Compass Registered Agent',
      slug: 'compass',
    },
  })

  console.log(`Tenant: ${tenant.name} (${tenant.id})`)

  // Ops account
  const opsPassword = process.env.OPS_SEED_PASSWORD ?? 'ChangeMe123!'
  const opsHash = await hash(opsPassword, 12)

  const opsUser = await prisma.user.upsert({
    where: { email: 'ops@compassregisteredagent.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'ops@compassregisteredagent.com',
      passwordHash: opsHash,
      role: Role.OPS,
      mustChangePwd: false,
    },
  })

  console.log(`Ops user: ${opsUser.email}`)

  // Admin account
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'ChangeMe123!'
  const adminHash = await hash(adminPassword, 12)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@compassregisteredagent.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@compassregisteredagent.com',
      passwordHash: adminHash,
      role: Role.ADMIN,
      mustChangePwd: false,
    },
  })

  console.log(`Admin user: ${adminUser.email}`)
  console.log('\nSeed complete. Default password: ChangeMe123!')
  console.log('Set OPS_SEED_PASSWORD / ADMIN_SEED_PASSWORD env vars to override.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
