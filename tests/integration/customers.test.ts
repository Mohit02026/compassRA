import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { createCustomerWithUser } from '@/services/customers'
import { db, seedTestTenant, cleanDb } from './helpers'
import bcrypt from 'bcryptjs'

let ctx: Awaited<ReturnType<typeof seedTestTenant>>

beforeEach(async () => {
  await cleanDb()
  ctx = await seedTestTenant()
})

afterAll(async () => {
  await cleanDb()
})

describe('createCustomerWithUser', () => {
  it('creates user + customer and returns customerId + tempPassword', async () => {
    const result = await createCustomerWithUser({
      tenantId: ctx.tenant.id,
      name: 'Alice Smith',
      email: 'alice@example.com',
    })
    expect(result.customerId).toBeTruthy()
    expect(result.tempPassword).toHaveLength(12)
  })

  it('tempPassword is bcrypt-hashed in DB', async () => {
    const { tempPassword } = await createCustomerWithUser({
      tenantId: ctx.tenant.id,
      name: 'Bob',
      email: 'bob@example.com',
    })
    const user = await db.user.findFirst({ where: { email: 'bob@example.com' } })
    const valid = await bcrypt.compare(tempPassword, user!.passwordHash)
    expect(valid).toBe(true)
  })

  it('new user has mustChangePwd = true and CUSTOMER role', async () => {
    await createCustomerWithUser({ tenantId: ctx.tenant.id, name: 'Carol', email: 'carol@example.com' })
    const user = await db.user.findFirst({ where: { email: 'carol@example.com' } })
    expect(user?.role).toBe('CUSTOMER')
    expect(user?.mustChangePwd).toBe(true)
  })

  it('idempotent — same email returns existing customerId', async () => {
    const first = await createCustomerWithUser({ tenantId: ctx.tenant.id, name: 'Dave', email: 'dave@example.com' })
    const second = await createCustomerWithUser({ tenantId: ctx.tenant.id, name: 'Dave', email: 'dave@example.com' })
    expect(first.customerId).toBe(second.customerId)

    // Only one user should exist
    const users = await db.user.findMany({ where: { email: 'dave@example.com' } })
    expect(users).toHaveLength(1)
  })
})
