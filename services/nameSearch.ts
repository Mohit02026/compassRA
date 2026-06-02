// SunBiz name availability search.
// Scrapes HTML results — no official API exists.

export type NameAvailability = 'available' | 'taken' | 'likely' | 'unknown'

export interface NameSearchResult {
  available: NameAvailability
  matches: string[]
}

export async function searchName(name: string): Promise<NameSearchResult> {
  const encoded = encodeURIComponent(name.trim().toUpperCase())
  const url =
    `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults` +
    `?inquiryType=EntityName&inquiryDirectionType=ForwardList` +
    `&searchNameOrder=AVAILABLE&masterDataToListOn=AVAILABLE` +
    `&searchTerm=${encoded}&listSize=10`

  let html: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CompassBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    html = await res.text()
  } catch {
    return { available: 'unknown', matches: [] }
  }

  // Extract entity names from results table — each row has a link with entity name text
  const rowRegex =
    /<a[^>]+href="[^"]*CorporationSearch\/SearchResultDetail[^"]*"[^>]*>([^<]+)<\/a>/gi
  const matches: string[] = []
  let m: RegExpExecArray | null
  while ((m = rowRegex.exec(html)) !== null) {
    const entityName = m[1].trim()
    if (entityName) matches.push(entityName)
  }

  if (matches.length === 0) {
    return { available: 'available', matches: [] }
  }

  // Exact match (case-insensitive) → taken
  const upperName = name.trim().toUpperCase()
  const exactMatch = matches.some((n) => n.toUpperCase() === upperName)
  if (exactMatch) {
    return { available: 'taken', matches }
  }

  // Results exist but no exact match → likely available
  return { available: 'likely', matches }
}
