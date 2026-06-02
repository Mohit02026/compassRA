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
  // GHL upserts on email by default when using the contacts endpoint
  const data = await ghlFetch('/contacts/', {
    method: 'POST',
    body: JSON.stringify(input),
  }) as { contact: GhlContact }
  return data.contact
}

// ── Opportunities (pipeline cards) ───────────────────────────────────────────

export interface GhlOpportunityInput {
  name: string
  pipelineId: string
  pipelineStageId: string
  contactId: string
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

// GHL_STAGE_MAP env var: JSON mapping OrderStatus → GHL pipeline stage ID
// e.g. {"INTAKE":"abc123","DATA_QC":"def456","READY_TO_FILE":"ghi789","FILED":"jkl012","COMPLETED":"mno345"}
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
