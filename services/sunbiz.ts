// SunBiz entity lookup via SunBiz Daily API.
// Endpoint: GET /api/v2/filings/{documentNumber}/
// Same API key used for name availability search.

import { getRedis } from '@/lib/redis'

export interface SunbizEntity {
  name: string
  documentNumber: string
  status: string
  filingDate: string       // YYYY-MM-DD (from API — no conversion needed)
  county: string
  principalStreet: string
  principalCity: string
  principalState: string
  principalZip: string
  principalAddress: string // composed single-line for display
  mailingStreet: string
  mailingCity: string
  mailingState: string
  mailingZip: string
  mailingAddress: string   // composed single-line for display
  registeredAgent: string
}

interface ApiAddress {
  address_1: string
  address_2?: string
  city: string
  state: string
  zip: string
}

interface ApiResponse {
  corporation_number: string
  corporation_name: string
  status: string
  file_date: string
  county?: string
  principal_address?: ApiAddress
  mailing_address?: ApiAddress
  registered_agent?: { name: string }
}

function composeAddress(a?: ApiAddress): string {
  if (!a) return ''
  return [a.address_1, a.address_2, a.city, a.state, a.zip].filter(Boolean).join(', ')
}

function streetLine(a?: ApiAddress): string {
  if (!a) return ''
  return [a.address_1, a.address_2].filter(Boolean).join(' ')
}

function mapStatus(s: string): string {
  if (s === 'A') return 'Active'
  if (s === 'I') return 'Inactive'
  return s
}

export async function lookupByDocNumber(docNumber: string): Promise<SunbizEntity | null> {
  const key = process.env.SUNBIZ_DAILY_API_KEY
  if (!key) {
    console.error('[sunbiz] SUNBIZ_DAILY_API_KEY not set')
    return null
  }

  // Redis cache — 7-day TTL (SunBiz data updates daily; 7d balances freshness vs API rate limits)
  const redis = getRedis()
  const cacheKey = `sunbiz:${docNumber.trim().toLowerCase()}`
  if (redis) {
    try {
      const cached = await redis.get(cacheKey)
      if (cached) return JSON.parse(cached) as SunbizEntity
    } catch (err) {
      console.error('[sunbiz] redis get error:', err)
    }
  }

  const url = `https://www.sunbizdaily.com/api/v2/filings/${encodeURIComponent(docNumber.trim())}/`

  try {
    const res = await fetch(url, {
      headers: { 'X-API-Key': key },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(10000),
    })

    if (res.status === 404) return null
    if (!res.ok) {
      console.error(`[sunbiz] API ${res.status} for ${docNumber}`)
      return null
    }

    const data: ApiResponse = await res.json()
    const pa = data.principal_address
    const ma = data.mailing_address

    const entity: SunbizEntity = {
      name:             data.corporation_name ?? '',
      documentNumber:   data.corporation_number ?? docNumber,
      status:           mapStatus(data.status ?? ''),
      filingDate:       data.file_date ?? '',
      county:           data.county ?? '',
      principalStreet:  streetLine(pa),
      principalCity:    pa?.city ?? '',
      principalState:   pa?.state ?? '',
      principalZip:     pa?.zip ?? '',
      principalAddress: composeAddress(pa),
      mailingStreet:    streetLine(ma),
      mailingCity:      ma?.city ?? '',
      mailingState:     ma?.state ?? '',
      mailingZip:       ma?.zip ?? '',
      mailingAddress:   composeAddress(ma),
      registeredAgent:  data.registered_agent?.name?.replace(/\s+/g, ' ').trim() ?? '',
    }

    // Write to cache — don't cache null (404) so a re-registered entity is found next time
    if (redis) {
      try {
        await redis.setex(cacheKey, 604800, JSON.stringify(entity))
      } catch (err) {
        console.error('[sunbiz] redis set error:', err)
      }
    }

    return entity
  } catch (err) {
    console.error(`[sunbiz] fetch error for ${docNumber}:`, err)
    return null
  }
}
