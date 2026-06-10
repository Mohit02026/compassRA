// Integration tests for the standalone EIN checkout flow.
// Covers: EIN_FILING serviceType, pricing, orderData storage, SSN encryption,
// non-US path, and tenant isolation.
// Mocks @/lib/stripe — no real Stripe calls.

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { ServiceType } from '@prisma/client'
import { POST } from '@/app/api/public/checkout/route'
import { db, seedTestTenant, cleanDb } from './helpers'
import { decrypt } from '@/lib/encryption'

vi.mock('@/lib/stripe', () => ({
  stripe: vi.fn().mockReturnValue({
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: 'pi_test_ein_001',
        client_secret: 'pi_test_ein_001_secret',
        amount: 7500,
        currency: 'usd',
      }),
    },
  }),
  constructStripeEvent: vi.fn(),
}))

import { stripe } from '@/lib/stripe'

let ctx: Awaited<ReturnType<typeof seedTestTenant>>

beforeEach(async () => {
  await cleanDb()
  ctx = await seedTestTenant()
  // Checkout route resolves tenant by slug: 'compass' — rename the seeded tenant to match
  await db.tenant.update({ where: { id: ctx.tenant.id }, data: { slug: 'compass' } })
  vi.mocked(stripe().paymentIntents.create).mockClear()
})

afterAll(async () => {
  await cleanDb()
})

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/public/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

// Minimal valid EIN payload matching what ein/page.tsx sends
const einPayload = () => ({
  serviceType: 'EIN_FILING',
  tier: 'STANDARD',
  businessName: 'Sunshine Ventures LLC',
  customerName: 'Jane Doe',
  customerEmail: `jane-ein-${Date.now()}@example.com`,
  serviceFee: 75,
  stateFee: 0,
  einOnly: true,
  principalAddress: '123 Main St, Miami, FL 33101',
  mailingAddress: '123 Main St, Miami, FL 33101',
  einTradeName: 'Sunshine',
  einMemberCount: '1',
  einResponsibleParty: 'Jane Doe',
  einResponsiblePartyFirstName: 'Jane',
  einResponsiblePartyMiddleName: '',
  einResponsiblePartyLastName: 'Doe',
  einResponsiblePartySuffix: '',
  einTaxIdType: 'ssn',
  einTaxId: '123-45-6789',
  einBusinessPurpose: 'Professional services',
  einDateStarted: '2026-01-01',
  einReasonApplying: 'new-business',
  einIsUSCitizen: true,
  einCounty: 'Miami-Dade',
  einClosingMonth: 'December',
  einEmployeesAgricultural: '0',
  einEmployeesHousehold: '0',
  einEmployeesOther: '0',
  einWants944: false,
  einFirstWagesDate: '',
  einProductService: 'Consulting services',
  einPreviousEin: false,
})

// ── Service type ────────────────────────────────────────────────────────────

describe('EIN_FILING service type', () => {
  it('accepts EIN_FILING as a valid serviceType and returns 201', async () => {
    const res = await POST(makeRequest(einPayload()))
    const json = await res.json()
    expect(res.status).toBe(201)
    expect(json.data.orderId).toBeTruthy()
  })

  it('creates order with serviceType EIN_FILING (not LLC_FORMATION)', async () => {
    const email = `svctype-${Date.now()}@example.com`
    const res = await POST(makeRequest({ ...einPayload(), customerEmail: email }))
    const json = await res.json()
    const order = await db.order.findUnique({ where: { id: json.data.orderId } })
    expect(order?.serviceType).toBe(ServiceType.EIN_FILING)
    expect(order?.serviceType).not.toBe(ServiceType.LLC_FORMATION)
  })

  it('order starts in INTAKE status', async () => {
    const email = `status-${Date.now()}@example.com`
    const res = await POST(makeRequest({ ...einPayload(), customerEmail: email }))
    const json = await res.json()
    const order = await db.order.findUnique({ where: { id: json.data.orderId } })
    expect(order?.status).toBe('INTAKE')
  })
})

// ── Pricing ─────────────────────────────────────────────────────────────────

describe('EIN_FILING pricing', () => {
  it('charges $75 (serviceFee only) — no extra EIN add-on charge', async () => {
    const email = `price-us-${Date.now()}@example.com`
    await POST(makeRequest({ ...einPayload(), customerEmail: email, serviceFee: 75 }))
    const piCreate = vi.mocked(stripe().paymentIntents.create)
    const callArgs = piCreate.mock.lastCall![0] as { amount: number }
    expect(callArgs.amount).toBe(7500) // $75.00 × 100 — no +$75 add-on
  })

  it('charges $175 for non-US path without double-counting', async () => {
    const email = `price-nonus-${Date.now()}@example.com`
    await POST(makeRequest({
      ...einPayload(),
      customerEmail: email,
      serviceFee: 175,
      einIsUSCitizen: false,
      einTaxId: '',
    }))
    const piCreate = vi.mocked(stripe().paymentIntents.create)
    const callArgs = piCreate.mock.lastCall![0] as { amount: number }
    expect(callArgs.amount).toBe(17500) // $175 only
  })

  it('einOnly: true prevents adding EIN add-on charge on top', async () => {
    // Even if addOnEin accidentally passed as true, einOnly prevents double-charge
    const email = `nodouble-${Date.now()}@example.com`
    await POST(makeRequest({
      ...einPayload(),
      customerEmail: email,
      serviceFee: 75,
      addOnEin: true, // would normally add $75 — must not here
      einOnly: true,
    }))
    const piCreate = vi.mocked(stripe().paymentIntents.create)
    const callArgs = piCreate.mock.lastCall![0] as { amount: number }
    expect(callArgs.amount).toBe(7500) // still $75, not $150
  })
})

// ── OrderData storage ────────────────────────────────────────────────────────

describe('EIN orderData storage', () => {
  it('stores all core EIN fields in OrderData', async () => {
    const email = `fields-${Date.now()}@example.com`
    const res = await POST(makeRequest({ ...einPayload(), customerEmail: email }))
    const json = await res.json()
    const orderData = await db.orderData.findMany({ where: { orderId: json.data.orderId } })
    const get = (key: string) => orderData.find((d) => d.key === key)?.value

    expect(get('einTradeName')).toBe('Sunshine')
    expect(get('einMemberCount')).toBe('1')
    expect(get('einResponsibleParty')).toBe('Jane Doe')
    expect(get('einBusinessPurpose')).toBe('Professional services')
    expect(get('einDateStarted')).toBe('2026-01-01')
    expect(get('einReasonApplying')).toBe('new-business')
    expect(get('einCounty')).toBe('Miami-Dade')
    expect(get('einClosingMonth')).toBe('December')
    expect(get('einProductService')).toBe('Consulting services')
    expect(get('einEmployeesOther')).toBe('0')
    expect(get('einWants944')).toBe('false')
    expect(get('einPreviousEin')).toBe('false')
    expect(get('einIsUSCitizen')).toBe('true')
  })

  it('stores SSN encrypted — plaintext never in DB', async () => {
    const email = `ssn-enc-${Date.now()}@example.com`
    const res = await POST(makeRequest({
      ...einPayload(),
      customerEmail: email,
      einTaxId: '987-65-4321',
      einTaxIdType: 'ssn',
    }))
    const json = await res.json()
    const ssnRow = await db.orderData.findFirst({
      where: { orderId: json.data.orderId, key: 'ssn' },
    })
    expect(ssnRow).not.toBeNull()
    // Stored value must not be the raw SSN
    expect(ssnRow!.value).not.toBe('987-65-4321')
    // But decryption must round-trip correctly
    expect(decrypt(ssnRow!.value)).toBe('987-65-4321')
  })

  it('stores ITIN encrypted under key "itin" when taxIdType is itin', async () => {
    const email = `itin-${Date.now()}@example.com`
    const res = await POST(makeRequest({
      ...einPayload(),
      customerEmail: email,
      einTaxIdType: 'itin',
      einTaxId: '900-70-1234',
    }))
    const json = await res.json()
    const itinRow = await db.orderData.findFirst({
      where: { orderId: json.data.orderId, key: 'itin' },
    })
    expect(itinRow).not.toBeNull()
    expect(itinRow!.value).not.toBe('900-70-1234')
    expect(decrypt(itinRow!.value)).toBe('900-70-1234')
    // 'ssn' key must NOT be present for itin orders
    const ssnRow = await db.orderData.findFirst({
      where: { orderId: json.data.orderId, key: 'ssn' },
    })
    expect(ssnRow).toBeNull()
  })

  it('addOns stored as empty string — EIN is not an add-on for EIN_FILING orders', async () => {
    const email = `addons-${Date.now()}@example.com`
    const res = await POST(makeRequest({ ...einPayload(), customerEmail: email }))
    const json = await res.json()
    const addOnsRow = await db.orderData.findFirst({
      where: { orderId: json.data.orderId, key: 'addOns' },
    })
    // addOns field should be empty — not 'EIN'
    expect(addOnsRow?.value ?? '').toBe('')
  })
})

// ── Non-US national path ─────────────────────────────────────────────────────

describe('non-US national EIN path', () => {
  it('accepts order without taxId for non-US citizen', async () => {
    const email = `nonus-${Date.now()}@example.com`
    const res = await POST(makeRequest({
      ...einPayload(),
      customerEmail: email,
      einIsUSCitizen: false,
      einTaxId: '', // ITIN may not exist yet
      einTaxIdType: 'itin',
      serviceFee: 175,
    }))
    expect(res.status).toBe(201)
  })

  it('stores einIsUSCitizen as "false" for non-US path', async () => {
    const email = `nonus-store-${Date.now()}@example.com`
    const res = await POST(makeRequest({
      ...einPayload(),
      customerEmail: email,
      einIsUSCitizen: false,
      einTaxId: '',
      serviceFee: 175,
    }))
    const json = await res.json()
    const row = await db.orderData.findFirst({
      where: { orderId: json.data.orderId, key: 'einIsUSCitizen' },
    })
    expect(row?.value).toBe('false')
  })
})

// ── Stripe PaymentIntent ─────────────────────────────────────────────────────

describe('Stripe PaymentIntent creation', () => {
  it('stores paymentRef (Stripe PI id) on the order', async () => {
    const email = `piref-${Date.now()}@example.com`
    const res = await POST(makeRequest({ ...einPayload(), customerEmail: email }))
    const json = await res.json()
    const order = await db.order.findUnique({ where: { id: json.data.orderId } })
    expect(order?.paymentRef).toBe('pi_test_ein_001')
  })

  it('includes orderId and tenantId in Stripe metadata', async () => {
    const email = `meta-${Date.now()}@example.com`
    const res = await POST(makeRequest({ ...einPayload(), customerEmail: email }))
    const json = await res.json()
    const piCreate = vi.mocked(stripe().paymentIntents.create)
    const callArgs = piCreate.mock.lastCall![0] as unknown as {
      metadata: { orderId: string; tenantId: string }
    }
    expect(callArgs.metadata.orderId).toBe(json.data.orderId)
    expect(callArgs.metadata.tenantId).toBe(ctx.tenant.id)
  })

  it('description includes EIN_FILING and business name', async () => {
    const email = `desc-${Date.now()}@example.com`
    await POST(makeRequest({ ...einPayload(), customerEmail: email }))
    const piCreate = vi.mocked(stripe().paymentIntents.create)
    const callArgs = piCreate.mock.lastCall![0] as unknown as { description: string }
    expect(callArgs.description).toContain('EIN_FILING')
    expect(callArgs.description).toContain('Sunshine Ventures LLC')
  })
})

// ── Customer creation ────────────────────────────────────────────────────────

describe('customer creation', () => {
  it('creates a Customer and User for a new email', async () => {
    const email = `newcust-ein-${Date.now()}@example.com`
    await POST(makeRequest({ ...einPayload(), customerEmail: email }))
    const user = await db.user.findFirst({ where: { email } })
    expect(user).not.toBeNull()
    expect(user?.role).toBe('CUSTOMER')
    expect(user?.mustChangePwd).toBe(true)
  })

  it('reuses existing Customer for repeat email', async () => {
    const email = `repeat-ein-${Date.now()}@example.com`
    await POST(makeRequest({ ...einPayload(), customerEmail: email }))
    await POST(makeRequest({ ...einPayload(), customerEmail: email }))
    const users = await db.user.findMany({ where: { email } })
    expect(users).toHaveLength(1) // not duplicated
  })
})

// ── Tenant isolation ─────────────────────────────────────────────────────────

describe('tenant isolation', () => {
  it('order is created under COMPASS_TENANT_ID, not user-supplied tenantId', async () => {
    const injected = {
      ...einPayload(),
      customerEmail: `iso-ein-${Date.now()}@example.com`,
      tenantId: 'malicious-tenant-id',
    }
    const res = await POST(makeRequest(injected))
    const json = await res.json()
    const order = await db.order.findUnique({ where: { id: json.data.orderId } })
    expect(order?.tenantId).toBe(ctx.tenant.id)
    expect(order?.tenantId).not.toBe('malicious-tenant-id')
  })
})
