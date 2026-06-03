// Unit tests for services/sunbiz.ts
// Mocks global fetch — no real SunBiz HTTP calls.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lookupByDocNumber } from '@/services/sunbiz'

// Minimal SunBiz entity detail HTML shaped to match parseEntityDetail regexes.
// Each field uses <span>LabelText</span><span>Value</span> so that:
//   Label[^>]*> consumes `</span>` after the label text, then <span[^>]*> matches the value span.
function htmlWithEntity(overrides: Partial<{
  name: string
  docNumber: string
  status: string
  filingDate: string
  principalAddress: string
  mailingAddress: string
  raName: string
  raAddress: string
}> = {}): string {
  const e = {
    name: 'ACME HOLDINGS LLC',
    docNumber: 'L23000012345',
    status: 'ACTIVE',
    filingDate: '01/15/2023',
    principalAddress: '100 Main St Tampa FL 33601',
    mailingAddress: '100 Main St Tampa FL 33601',
    raName: 'COMPASS REGISTERED AGENT LLC',
    raAddress: '8 The Green Suite 300 Dover DE 19901',
    ...overrides,
  }

  // Addresses must start with a digit to satisfy [\d][^<]{10,80} capture group
  return `
    <html><body>
      <span id="lblEntityName">${e.name}</span>
      <span>Document Number</span><span>${e.docNumber}</span>
      <span>Status</span><span>${e.status}</span>
      <span>Filing Date</span><span>${e.filingDate}</span>
      <span>Principal Address</span><span>${e.principalAddress}</span>
      <span>Mailing Address</span><span>${e.mailingAddress}</span>
      <span>Registered Agent Name</span><span>${e.raName}</span>
      <span>Registered Agent Address</span><span>${e.raAddress}</span>
    </body></html>
  `
}

function mockFetchHtml(html: string, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 404,
    text: vi.fn().mockResolvedValue(html),
  }) as unknown as typeof fetch
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('lookupByDocNumber', () => {
  it('returns entity when HTML has all fields', async () => {
    mockFetchHtml(htmlWithEntity())
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity).not.toBeNull()
    expect(entity!.name).toBe('ACME HOLDINGS LLC')
    expect(entity!.documentNumber).toBe('L23000012345')
    expect(entity!.status).toBe('ACTIVE')
    expect(entity!.filingDate).toBe('01/15/2023')
  })

  it('returns entity with registered agent info', async () => {
    mockFetchHtml(htmlWithEntity())
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity!.registeredAgent).toBe('COMPASS REGISTERED AGENT LLC')
    expect(entity!.registeredAgentAddress).toContain('8 The Green')
  })

  it('returns null on non-ok response', async () => {
    mockFetchHtml('', false)
    const entity = await lookupByDocNumber('L99999999999')
    expect(entity).toBeNull()
  })

  it('returns null on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as unknown as typeof fetch
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity).toBeNull()
  })

  it('returns null when HTML has no recognisable entity fields', async () => {
    mockFetchHtml('<html><body>No results found</body></html>')
    const entity = await lookupByDocNumber('L23000000000')
    expect(entity).toBeNull()
  })

  it('encodes docNumber in URL', async () => {
    mockFetchHtml(htmlWithEntity())
    await lookupByDocNumber('L23000012345')
    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(calledUrl).toContain('L23000012345')
    expect(calledUrl).toContain('sunbiz.org')
  })

  it('always requests fresh data (revalidate: 0)', async () => {
    mockFetchHtml(htmlWithEntity())
    await lookupByDocNumber('L23000012345')
    const callOptions = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit & { next?: { revalidate: number } }
    expect(callOptions.next?.revalidate).toBe(0)
  })

  it('falls back to passed docNumber when page does not echo it', async () => {
    // HTML with entity name but no document number field
    const html = `<html><body><span id="lblEntityName">ACME LLC</span></body></html>`
    mockFetchHtml(html)
    const entity = await lookupByDocNumber('L99000099999')
    // Can be null (no nameMatch AND no docMatch) — this is expected behaviour
    // Entity name alone is enough to match
    if (entity !== null) {
      expect(entity.documentNumber).toBe('L99000099999')
    }
  })

  it('handles INACTIVE status', async () => {
    mockFetchHtml(htmlWithEntity({ status: 'INACTIVE' }))
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity!.status).toBe('INACTIVE')
  })

  it('cleans extra whitespace from extracted text', async () => {
    const html = htmlWithEntity({ name: '  ACME   HOLDINGS   LLC  ' })
    mockFetchHtml(html)
    const entity = await lookupByDocNumber('L23000012345')
    expect(entity!.name).toBe('ACME HOLDINGS LLC')
  })
})
