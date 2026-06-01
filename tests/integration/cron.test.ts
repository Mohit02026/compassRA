import { describe, it, expect, vi, afterAll } from 'vitest'
import { NextRequest } from 'next/server'

// Mock processReminders so cron test doesn't need real DB state
vi.mock('@/services/reminders', () => ({
  processReminders: vi.fn().mockResolvedValue({ processed: 2, sent: 1, errors: 0 }),
}))

// Mock prisma tenant lookup
vi.mock('@/lib/prisma', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/prisma')>()
  return {
    ...actual,
    prisma: {
      ...actual.prisma,
      tenant: {
        findMany: vi.fn().mockResolvedValue([{ id: 'tenant-1' }]),
      },
    },
  }
})

import { GET } from '@/app/api/cron/reminders/route'

function makeRequest(secret?: string) {
  const headers: Record<string, string> = {}
  if (secret) headers['x-cron-secret'] = secret
  return new NextRequest('http://localhost/api/cron/reminders', { headers })
}

afterAll(() => vi.restoreAllMocks())

describe('GET /api/cron/reminders', () => {
  it('rejects missing secret with 401', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('rejects wrong secret with 401', async () => {
    const res = await GET(makeRequest('wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('accepts correct secret and returns totals', async () => {
    const res = await GET(makeRequest('test-cron-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.sent).toBe(1)
    expect(body.data.processed).toBe(2)
  })
})
