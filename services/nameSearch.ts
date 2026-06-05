// SunBiz name availability search.
// Scrapes HTML results — no official API exists.
//
// SunBiz is an alphabetical forward list, NOT a keyword search. Searching
// "XYZZY TEST LLC" returns the 20 entities nearest alphabetically, not similar
// names. We filter results to only surface ones that share a keyword with the
// query — everything else is a false positive.

export type NameAvailability = 'available' | 'taken' | 'likely' | 'unknown'

export interface SunBizMatch {
  name: string
  status: string  // 'Active' | 'INACT' | 'INACT/UA' | 'NAME HS' | 'InActive' etc.
}

export interface NameSearchResult {
  available: NameAvailability
  matches: SunBizMatch[]      // nearby related names to display
  exactMatch?: SunBizMatch    // populated when the exact name is found in registry
}

// Normalize for comparison: strip punctuation, collapse whitespace.
// SunBiz stores "SUNSHINE VENTURES, LLC" — customers type "SUNSHINE VENTURES LLC".
function normalize(n: string): string {
  return n.toUpperCase().replace(/[,.\-'&]/g, '').replace(/\s+/g, ' ').trim()
}

export async function searchName(name: string): Promise<NameSearchResult> {
  const encoded = encodeURIComponent(name.trim().toUpperCase())
  const url =
    `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults` +
    `?inquiryType=EntityName&searchTerm=${encoded}&listSize=20`

  let html: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000),
    })
    html = await res.text()
  } catch {
    return { available: 'unknown', matches: [] }
  }

  // Parse each <tr> — extract name and status together so they stay paired
  const entries: SunBizMatch[] = []
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let row: RegExpExecArray | null
  while ((row = rowRegex.exec(html)) !== null) {
    const rowHtml = row[1]
    const nameMatch = rowHtml.match(/SearchResultDetail[^"]*"[^>]*>([^<]+)<\/a>/)
    const statusMatch = rowHtml.match(/<td class="small-width">([^<]+)<\/td>/)
    if (nameMatch && statusMatch) {
      entries.push({
        name: nameMatch[1].trim(),
        status: statusMatch[1].trim(),
      })
    }
  }

  if (entries.length === 0) {
    return { available: 'available', matches: [] }
  }

  // Exact match after normalization
  const normalizedQuery = normalize(name)
  const exact = entries.find((e) => normalize(e.name) === normalizedQuery)
  if (exact) {
    return { available: 'taken', matches: entries, exactMatch: exact }
  }

  // Only flag "likely" if at least one result shares a significant keyword
  const STOP_WORDS = new Set(['LLC', 'INC', 'CORP', 'CO', 'THE', 'AND', 'OF', 'FOR', 'LLP'])
  const queryWords = normalizedQuery
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))

  const relatedMatches = entries.filter((e) => {
    const mNorm = normalize(e.name)
    return queryWords.some((w) => mNorm.includes(w))
  })

  if (relatedMatches.length === 0) {
    // All results are alphabetical neighbors only — no real name conflict
    return { available: 'available', matches: [] }
  }

  return { available: 'likely', matches: relatedMatches }
}
