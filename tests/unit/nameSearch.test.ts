// Unit tests for services/nameSearch.ts
// Mocks global fetch — no SunBiz network calls in tests.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchName } from '@/services/nameSearch'

// Helper to produce minimal SunBiz results HTML
function htmlWithResults(names: string[]): string {
  const rows = names
    .map(
      (n) =>
        `<a href="/Inquiry/CorporationSearch/SearchResultDetail?inquiryType=EntityName&directionType=ForwardList&searchNameOrder=AVAILABLE&masterDataToListOn=${encodeURIComponent(n)}">${n}</a>`
    )
    .join('\n')
  return `<html><body><table>${rows}</table></body></html>`
}

function htmlNoResults(): string {
  return '<html><body><p>No records found.</p></body></html>'
}

function mockFetch(html: string, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(html),
  }) as unknown as typeof fetch
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('searchName — availability classification', () => {
  it('returns available when no matches found', async () => {
    mockFetch(htmlNoResults())
    const result = await searchName('UNIQUE XYZ HOLDINGS LLC')
    expect(result.available).toBe('available')
    expect(result.matches).toHaveLength(0)
  })

  it('returns taken on exact match (case-insensitive)', async () => {
    mockFetch(htmlWithResults(['DOE ENTERPRISES LLC', 'DOE HOLDINGS LLC']))
    const result = await searchName('doe enterprises llc')
    expect(result.available).toBe('taken')
    expect(result.matches).toContain('DOE ENTERPRISES LLC')
  })

  it('returns likely when matches exist but no exact match', async () => {
    mockFetch(htmlWithResults(['DOE ENTERPRISES LLC', 'DOE HOLDINGS LLC']))
    const result = await searchName('Doe Ventures LLC')
    expect(result.available).toBe('likely')
    expect(result.matches.length).toBeGreaterThan(0)
  })

  it('returns unknown on fetch error (network failure)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as unknown as typeof fetch
    const result = await searchName('Some LLC')
    expect(result.available).toBe('unknown')
    expect(result.matches).toHaveLength(0)
  })

  it('returns unknown on fetch timeout (AbortError)', async () => {
    const err = new DOMException('Aborted', 'AbortError')
    global.fetch = vi.fn().mockRejectedValue(err) as unknown as typeof fetch
    const result = await searchName('Some LLC')
    expect(result.available).toBe('unknown')
  })

  it('trims and uppercases name before search', async () => {
    mockFetch(htmlNoResults())
    await searchName('  test company llc  ')
    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(calledUrl).toContain('TEST%20COMPANY%20LLC')
  })

  it('returns all matched names in matches array', async () => {
    const names = ['ALPHA LLC', 'BETA LLC', 'GAMMA LLC']
    mockFetch(htmlWithResults(names))
    const result = await searchName('ALPHA LLC')
    expect(result.matches).toHaveLength(3)
  })

  it('sends correct User-Agent header', async () => {
    mockFetch(htmlNoResults())
    await searchName('test')
    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const options = callArgs[1] as RequestInit
    expect((options.headers as Record<string, string>)['User-Agent']).toContain('Compass')
  })
})
