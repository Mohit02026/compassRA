// Unit tests for services/nameSearch.ts
// Tests against the SunBiz Daily API (JSON-based, session 30 rewrite).
// Mocks global fetch and Redis — no real HTTP calls.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { searchName } from '@/services/nameSearch'

// Skip Redis in unit tests
vi.mock('@/lib/redis', () => ({ getRedis: () => null }))

function makeFilingsResponse(names: Array<{ corporation_name: string; status?: string }>) {
  return {
    filings: names.map((n) => ({ corporation_name: n.corporation_name, status: n.status ?? 'A' })),
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

describe('searchName — availability classification', () => {
  it('returns unknown when SUNBIZ_DAILY_API_KEY is not set', async () => {
    delete process.env.SUNBIZ_DAILY_API_KEY
    const result = await searchName('UNIQUE XYZ HOLDINGS LLC')
    expect(result.available).toBe('unknown')
    expect(result.matches).toHaveLength(0)
  })

  it('returns available when API returns no filings', async () => {
    mockFetchJson(makeFilingsResponse([]))
    const result = await searchName('UNIQUE XYZ HOLDINGS LLC')
    expect(result.available).toBe('available')
    expect(result.matches).toHaveLength(0)
  })

  it('returns taken on exact match (case-insensitive)', async () => {
    mockFetchJson(makeFilingsResponse([
      { corporation_name: 'DOE ENTERPRISES LLC' },
      { corporation_name: 'DOE HOLDINGS LLC' },
    ]))
    const result = await searchName('doe enterprises llc')
    expect(result.available).toBe('taken')
    expect(result.exactMatch?.name).toBe('DOE ENTERPRISES LLC')
  })

  it('returns likely when matches exist but no exact match', async () => {
    mockFetchJson(makeFilingsResponse([
      { corporation_name: 'DOE ENTERPRISES LLC' },
      { corporation_name: 'DOE HOLDINGS LLC' },
    ]))
    const result = await searchName('Doe Ventures LLC')
    expect(result.available).toBe('likely')
    expect(result.matches.length).toBeGreaterThan(0)
  })

  it('returns all matches as SunBizMatch objects with name and status', async () => {
    mockFetchJson(makeFilingsResponse([
      { corporation_name: 'ALPHA LLC', status: 'A' },
      { corporation_name: 'BETA LLC', status: 'I' },
      { corporation_name: 'GAMMA LLC', status: 'A' },
    ]))
    const result = await searchName('ALPHA LLC')
    expect(result.matches).toHaveLength(3)
    expect(result.matches[0]).toMatchObject({ name: 'ALPHA LLC', status: 'Active' })
    expect(result.matches[1]).toMatchObject({ name: 'BETA LLC', status: 'Inactive' })
  })

  it('returns unknown on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as unknown as typeof fetch
    const result = await searchName('Some LLC')
    expect(result.available).toBe('unknown')
    expect(result.matches).toHaveLength(0)
  })

  it('returns unknown on AbortError (timeout)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')) as unknown as typeof fetch
    const result = await searchName('Some LLC')
    expect(result.available).toBe('unknown')
  })

  it('returns unknown on non-ok API response', async () => {
    mockFetchJson({}, 500)
    const result = await searchName('Some LLC')
    expect(result.available).toBe('unknown')
  })

  it('strips entity suffix and uppercases before searching', async () => {
    mockFetchJson(makeFilingsResponse([]))
    await searchName('  test company llc  ')
    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    // Suffix stripped: "TEST COMPANY LLC" → "TEST COMPANY"
    expect(calledUrl).toContain('sunbizdaily.com')
    expect(calledUrl).toContain('TEST%20COMPANY')
  })

  it('sends X-API-Key header', async () => {
    mockFetchJson(makeFilingsResponse([]))
    await searchName('Test LLC')
    const opts = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as { headers: Record<string, string> }
    expect(opts.headers['X-API-Key']).toBe('test-key')
  })
})
