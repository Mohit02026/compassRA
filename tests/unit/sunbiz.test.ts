// Unit tests for services/sunbiz.ts
// Tests against the SunBiz Daily API (JSON-based, session 30 rewrite).
// Mocks global fetch and Redis — no real HTTP calls.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { lookupByDocNumber } from '@/services/sunbiz'

// Skip Redis in unit tests — integration concerns tested elsewhere
vi.mock('@/lib/redis', () => ({ getRedis: () => null }))

function makeApiResponse(overrides: Partial<{
  corporation_number: string
  corporation_name: string
  status: string
  file_date: string
  county: string
  principal_address: { address_1: string; address_2?: string; city: string; state: string; zip: string }
  mailing_address: { address_1: string; address_2?: string; city: string; state: string; zip: string }
  registered_agent: { name: string }
}> = {}) {
  return {
    corporation_number: 'L23000012345',
    corporation_name: 'ACME HOLDINGS LLC',
    status: 'A',
    file_date: '2023-01-15',
    county: 'Hillsborough',
    principal_address: { address_1: '100 Main St', city: 'Tampa', state: 'FL', zip: '33601' },
    mailing_address: { address_1: '100 Main St', city: 'Tampa', state: 'FL', zip: '33601' },
    registered_agent: { name: 'COMPASS REGISTERED AGENT LLC' },
    ...overrides,
  }
}

function mockFetchJson(body: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  }) as unknown as typeof fetch
}

beforeEach(() => {
  vi.restoreAllMocks()
  process.env.SUNBIZ_DAILY_API_KEY = 'test-key'
})

afterEach(() => {
  delete process.env.SUNBIZ_DAILY_API_KEY
})

describe('lookupByDocNumber', () => {
  it('returns null when SUNBIZ_DAILY_API_KEY is not set', async () => {
    delete process.env.SUNBIZ_DAILY_API_KEY
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity).toBeNull()
  })

  it('returns mapped entity on successful response', async () => {
    mockFetchJson(makeApiResponse())
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity).not.toBeNull()
    expect(entity!.name).toBe('ACME HOLDINGS LLC')
    expect(entity!.documentNumber).toBe('L23000012345')
    expect(entity!.filingDate).toBe('2023-01-15')
    expect(entity!.county).toBe('Hillsborough')
  })

  it('maps status A → Active and I → Inactive', async () => {
    mockFetchJson(makeApiResponse({ status: 'A' }))
    expect((await lookupByDocNumber('L23000012345'))!.status).toBe('Active')

    mockFetchJson(makeApiResponse({ status: 'I' }))
    expect((await lookupByDocNumber('L23000012345'))!.status).toBe('Inactive')
  })

  it('returns registered agent name', async () => {
    mockFetchJson(makeApiResponse())
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity!.registeredAgent).toBe('COMPASS REGISTERED AGENT LLC')
  })

  it('composes principalAddress as a single line', async () => {
    mockFetchJson(makeApiResponse({
      principal_address: { address_1: '100 Main St', city: 'Tampa', state: 'FL', zip: '33601' },
    }))
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity!.principalAddress).toBe('100 Main St, Tampa, FL, 33601')
  })

  it('includes address_2 in composed address when present', async () => {
    mockFetchJson(makeApiResponse({
      principal_address: { address_1: '625 Court St', address_2: 'Ste 100', city: 'Clearwater', state: 'FL', zip: '33756' },
    }))
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity!.principalAddress).toContain('Ste 100')
    expect(entity!.principalStreet).toBe('625 Court St Ste 100')
  })

  it('returns null on 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch
    const entity = await lookupByDocNumber('L99999999999')
    expect(entity).toBeNull()
  })

  it('returns null on other non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity).toBeNull()
  })

  it('returns null on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as unknown as typeof fetch
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity).toBeNull()
  })

  it('calls sunbizdaily.com with docNumber in URL', async () => {
    mockFetchJson(makeApiResponse())
    await lookupByDocNumber('L23000012345')
    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(calledUrl).toContain('sunbizdaily.com')
    expect(calledUrl).toContain('L23000012345')
  })

  it('sends X-API-Key header', async () => {
    mockFetchJson(makeApiResponse())
    await lookupByDocNumber('L23000012345')
    const opts = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as { headers: Record<string, string> }
    expect(opts.headers['X-API-Key']).toBe('test-key')
  })

  it('requests fresh data with revalidate: 0', async () => {
    mockFetchJson(makeApiResponse())
    await lookupByDocNumber('L23000012345')
    const opts = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit & { next?: { revalidate: number } }
    expect(opts.next?.revalidate).toBe(0)
  })
})
