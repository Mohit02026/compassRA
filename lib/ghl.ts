// GoHighLevel REST API v2 client.
// All calls go server-side only — never expose GHL_API_KEY to the browser.

const GHL_BASE = 'https://services.leadconnectorhq.com'

function headers() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY ?? ''}`,
    Version: '2021-07-28',
    'Content-Type': 'application/json',
  }
}

async function ghlFetch(path: string, init: RequestInit): Promise<unknown> {
  const res = await fetch(`${GHL_BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...(init.headers ?? {}) },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GHL API ${init.method ?? 'GET'} ${path} → ${res.status}: ${body}`)
  }

  return res.json()
}

// ── Contacts ─────────────────────────────────────────────────────────────────

export interface GhlContactInput {
  firstName: string
  lastName?: string
  email: string
  phone?: string
  locationId: string
  tags?: string[]
  customFields?: Array<{ id: string; field_value: string }>
}

export interface GhlContact {
  id: string
  email: string
}

export async function createOrUpdateContact(input: GhlContactInput): Promise<GhlContact> {
  const data = await ghlFetch('/contacts/', {
    method: 'POST',
    body: JSON.stringify(input),
  }) as { contact: GhlContact }
  return data.contact
}

// ── Notes ─────────────────────────────────────────────────────────────────────
// GHL notes require a userId — set GHL_USER_ID in env once.
// GHL → Settings → My Profile → copy the ID from the URL.

export async function createContactNote(contactId: string, body: string): Promise<void> {
  const userId = process.env.GHL_USER_ID
  if (!userId) {
    console.warn('[GHL] createContactNote skipped — GHL_USER_ID not set in env')
    return
  }
  await ghlFetch(`/contacts/${contactId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ userId, body }),
  })
}

// ── Media upload ──────────────────────────────────────────────────────────────
// Uploads a PDF to GHL's media library and returns the hosted URL.
// The URL is permanent (no expiry) — safe to store in GHL notes/contacts.

export interface GhlMediaUploadResult {
  fileId: string
  url: string
  fileName: string
}

export async function uploadMediaToGHL(
  buffer: Buffer,
  fileName: string,
): Promise<GhlMediaUploadResult> {
  const locationId = process.env.GHL_LOCATION_ID ?? ''

  // Use native FormData — do NOT set Content-Type header manually.
  // fetch sets it automatically with the correct multipart boundary.
  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(buffer)], { type: 'application/pdf' }), fileName)
  form.append('fileName', fileName)

  const res = await fetch(`${GHL_BASE}/medias/upload-file`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GHL_API_KEY ?? ''}`,
      Version: '2021-07-28',
      'Location-Id': locationId,
    },
    body: form,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GHL media upload failed: ${res.status} ${text}`)
  }

  const data = await res.json() as Record<string, unknown>
  // GHL returns the URL under different keys depending on API version — handle both
  const url = (data.url ?? data.fileUrl ?? data.data) as string
  const fileId = (data.fileId ?? data.id ?? '') as string
  return { fileId, url, fileName }
}

// ── Opportunities (pipeline cards) ───────────────────────────────────────────

export interface GhlOpportunityInput {
  name: string
  pipelineId: string
  pipelineStageId: string
  contactId: string
  status: 'open' | 'won' | 'lost' | 'abandoned' // required — omitting causes 422
  monetaryValue?: number
  customFields?: Array<{ id: string; field_value: string }>
}

export interface GhlOpportunity {
  id: string
  name: string
  pipelineStageId: string
}

export async function createOpportunity(input: GhlOpportunityInput): Promise<GhlOpportunity> {
  const locationId = process.env.GHL_LOCATION_ID ?? ''
  const data = await ghlFetch(`/opportunities/`, {
    method: 'POST',
    body: JSON.stringify({ ...input, locationId }),
  }) as { opportunity: GhlOpportunity }
  return data.opportunity
}

export async function updateOpportunityStage(
  opportunityId: string,
  pipelineStageId: string
): Promise<void> {
  await ghlFetch(`/opportunities/${opportunityId}`, {
    method: 'PUT',
    body: JSON.stringify({ pipelineStageId }),
  })
}

// ── SMS / Workflow enrollment ──────────────────────────────────────────────

export async function enrollContactInWorkflow(
  contactId: string,
  workflowId: string
): Promise<void> {
  const locationId = process.env.GHL_LOCATION_ID ?? ''
  await ghlFetch(`/contacts/${contactId}/workflow/${workflowId}`, {
    method: 'POST',
    body: JSON.stringify({ eventStartTime: new Date().toISOString() }),
    headers: { 'Location-Id': locationId } as Record<string, string>,
  })
}

// ── Stage map helpers ─────────────────────────────────────────────────────────

export function getStageId(orderStatus: string): string | null {
  const raw = process.env.GHL_STAGE_MAP
  if (!raw) return null
  try {
    const map = JSON.parse(raw) as Record<string, string>
    return map[orderStatus] ?? null
  } catch {
    return null
  }
}
