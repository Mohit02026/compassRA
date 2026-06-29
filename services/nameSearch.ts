// Florida LLC name availability via SunBiz Daily API.
// Replaces the old SunBiz HTML scraper — returns structured JSON with true
// substring matching instead of alphabetical-neighbor guessing.

import { getRedis } from '@/lib/redis'

export type NameAvailability = 'available' | 'taken' | 'likely' | 'unknown'

export interface SunBizMatch {
  name: string
  status: string  // 'Active' | 'Inactive'
}

export interface NameSearchResult {
  available: NameAvailability
  matches: SunBizMatch[]
  exactMatch?: SunBizMatch
}

// Normalize for comparison: strip punctuation, collapse whitespace, uppercase.
// API stores "SUNSHINE VENTURES, LLC" — users type "Sunshine Ventures LLC".
function normalize(n: string): string {
  return n.toUpperCase().replace(/[,.\-'&]/g, '').replace(/\s+/g, ' ').trim()
}

// Map API status codes to display strings the UI StatusBadge expects
function mapStatus(raw: string): string {
  if (raw === 'A') return 'Active'
  if (raw === 'I') return 'Inactive'
  return raw
}

interface SunBizFiling {
  corporation_name: string
  status: string
}

// Strip entity suffixes so the API substring search matches stored names that
// have commas: "Acme Holdings LLC" → search "ACME HOLDINGS", which returns
// "ACME HOLDINGS, LLC" (stored with comma). Without this, the API misses the
// exact match because "ACME HOLDINGS LLC" ≠ substring of "ACME HOLDINGS, LLC".
const ENTITY_SUFFIXES = /\b(LLC|L\.L\.C\.|INC|INC\.|CORP|CORP\.|LLP|L\.L\.P\.|LTD|LTD\.|LC|L\.C\.|PA|P\.A\.|PLLC|P\.L\.L\.C\.)\s*$/i

function stripSuffix(name: string): string {
  return name.replace(ENTITY_SUFFIXES, '').trim()
}

export async function searchName(name: string): Promise<NameSearchResult> {
  const key = process.env.SUNBIZ_DAILY_API_KEY
  if (!key) {
    console.error('[nameSearch] SUNBIZ_DAILY_API_KEY not set')
    return { available: 'unknown', matches: [] }
  }

  // Search without suffix to catch comma-separated variants in the registry
  const searchTerm = stripSuffix(name.trim().toUpperCase())

  // Redis cache — 24h TTL keyed on the normalised search term
  const redis = getRedis()
  const cacheKey = `ns:${normalize(searchTerm)}`
  if (redis) {
    try {
      const cached = await redis.get(cacheKey)
      if (cached) return JSON.parse(cached) as NameSearchResult
    } catch (err) {
      console.error('[nameSearch] redis get error:', err)
    }
  }

  const encoded = encodeURIComponent(searchTerm)
  const url = `https://www.sunbizdaily.com/api/v2/filings/?corporation_name=${encoded}&per_page=25`

  let filings: SunBizFiling[]
  try {
    const res = await fetch(url, {
      headers: { 'X-API-Key': key },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      console.error(`[nameSearch] API returned ${res.status}`)
      return { available: 'unknown', matches: [] }
    }
    const data = await res.json()
    filings = data.filings ?? []
  } catch {
    return { available: 'unknown', matches: [] }
  }

  let result: NameSearchResult

  if (filings.length === 0) {
    result = { available: 'available', matches: [] }
  } else {
    const matches: SunBizMatch[] = filings.map((f) => ({
      name: f.corporation_name,
      status: mapStatus(f.status),
    }))

    const normalizedQuery = normalize(name)
    const exact = matches.find((m) => normalize(m.name) === normalizedQuery)

    result = exact
      // Return 'taken' for both active and inactive — UI handles inactive separately
      ? { available: 'taken', matches, exactMatch: exact }
      : { available: 'likely', matches }
  }

  // Write to cache — skip 'unknown' (transient errors shouldn't be cached)
  if (redis && result.available !== 'unknown') {
    try {
      await redis.setex(cacheKey, 86400, JSON.stringify(result))
    } catch (err) {
      console.error('[nameSearch] redis set error:', err)
    }
  }

  return result
}
