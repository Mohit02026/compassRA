// SunBiz entity lookup — pre-populates annual report intake form.
// Scrapes the Florida Division of Corporations public search.

export interface SunbizEntity {
  name: string
  documentNumber: string
  status: string
  filingDate: string
  principalAddress: string
  mailingAddress: string
  registeredAgent: string
  registeredAgentAddress: string
}

// Look up a Florida entity by its document number (format: Lxxxxxxxx or Pxxxxxxxx).
// Returns null if not found or on network error (caller should fall back to manual entry).
export async function lookupByDocNumber(docNumber: string): Promise<SunbizEntity | null> {
  const url = `https://search.sunbiz.org/Inquiry/CorporationSearch/GetFilingInformation?inquiryType=DocumentNumber&inquiryDirectionType=ForwardList&masterDataToListOn=${encodeURIComponent(docNumber.trim())}`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Compass/1.0)' },
      next: { revalidate: 0 }, // always fresh — never cache SunBiz responses
    })

    if (!res.ok) return null

    const html = await res.text()
    return parseEntityDetail(html, docNumber)
  } catch {
    return null
  }
}

function parseEntityDetail(html: string, docNumber: string): SunbizEntity | null {
  // [\s\S] used in place of . with s-flag (ES2018+) to match across newlines

  // Extract entity name
  const nameMatch = html.match(/<span[^>]*id="lblEntityName"[^>]*>([^<]+)<\/span>/i)
    ?? html.match(/Entity Name[^>]*>[\s\S]{0,200}?<span[^>]*>([^<]+)<\/span>/i)

  // Document number from page
  const docMatch = html.match(/Document\s+Number[^>]*>[\s\S]{0,200}?<span[^>]*>([LP]\d{8,9})<\/span>/i)

  // Status
  const statusMatch = html.match(/Status[^>]*>[\s\S]{0,200}?<span[^>]*>(ACTIVE|INACTIVE|DISSOLVED)[^<]*<\/span>/i)

  // Filing date
  const filingMatch = html.match(/Filing\s+Date[^>]*>[\s\S]{0,200}?<span[^>]*>(\d{2}\/\d{2}\/\d{4})<\/span>/i)

  // Principal address
  const principalMatch = html.match(/Principal\s+Address[\s\S]{0,400}?<span[^>]*>([\d][^<]{10,80})<\/span>/i)

  // Mailing address
  const mailingMatch = html.match(/Mailing\s+Address[\s\S]{0,400}?<span[^>]*>([\d][^<]{10,80})<\/span>/i)

  // Registered agent name
  const raNameMatch = html.match(/Registered\s+Agent\s+Name[^>]*>[\s\S]{0,200}?<span[^>]*>([^<]+)<\/span>/i)

  // Registered agent address
  const raAddrMatch = html.match(/Registered\s+Agent\s+Address[\s\S]{0,400}?<span[^>]*>([\d][^<]{10,80})<\/span>/i)

  // If we can't find basic info, return null
  if (!nameMatch && !docMatch) return null

  return {
    name: cleanText(nameMatch?.[1] ?? ''),
    documentNumber: cleanText(docMatch?.[1] ?? docNumber),
    status: cleanText(statusMatch?.[1] ?? 'Unknown'),
    filingDate: cleanText(filingMatch?.[1] ?? ''),
    principalAddress: cleanText(principalMatch?.[1] ?? ''),
    mailingAddress: cleanText(mailingMatch?.[1] ?? ''),
    registeredAgent: cleanText(raNameMatch?.[1] ?? ''),
    registeredAgentAddress: cleanText(raAddrMatch?.[1] ?? ''),
  }
}

function cleanText(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}
