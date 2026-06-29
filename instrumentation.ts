// Next.js instrumentation hook — runs once before the app handles any requests.
// Validates required env vars and GHL stage map at boot so misconfiguration surfaces
// immediately (clear error) rather than mid-flight (cryptic runtime crash).
// In E2E mode (ENABLE_MSW=true), starts MSW server to intercept outgoing HTTP.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
    validateEnv()
    validateGhlStageMap()
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }

  // MSW — E2E only, zero impact on dev/prod
  if (process.env.ENABLE_MSW !== 'true') return
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { server } = await import('./tests/e2e/support/msw-node')
    server.listen({ onUnhandledRequest: 'bypass' })
    console.log('[E2E] MSW server started — outgoing HTTP intercepted')
  }
}

// ── Environment validation ────────────────────────────────────────────────────

const REQUIRED_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'ENCRYPTION_KEY',
  'R2_ENDPOINT',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'CRON_SECRET',
] as const

function validateEnv(): void {
  // Skip in test environments — .env.test / .env.e2e set only the vars they need
  if (process.env.NODE_ENV === 'test') return

  const missing = REQUIRED_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `[Compass] Missing required environment variables:\n${missing.map((k) => `  • ${k}`).join('\n')}\n\nSet these in your .env file or Railway dashboard before starting the server.`
    )
  }

  // ENCRYPTION_KEY must be a 32-byte hex string (64 hex chars)
  const encKey = process.env.ENCRYPTION_KEY!
  if (!/^[0-9a-fA-F]{64}$/.test(encKey)) {
    throw new Error(
      '[Compass] ENCRYPTION_KEY must be a 64-character hex string (32 bytes).\nGenerate one with: openssl rand -hex 32'
    )
  }
}

// ── GHL stage map validation ──────────────────────────────────────────────────

const VALID_ORDER_STATUSES = new Set([
  'INTAKE',
  'DATA_QC',
  'READY_TO_FILE',
  'FILED',
  'COMPLETED',
  'EXCEPTION',
])

function validateGhlStageMap(): void {
  const raw = process.env.GHL_STAGE_NAME_MAP
  if (!raw) return // Optional — webhook just won't update statuses without it

  let map: unknown
  try {
    map = JSON.parse(raw)
  } catch {
    throw new Error(
      '[Compass] GHL_STAGE_NAME_MAP is not valid JSON.\nExpected: {"Stage Name":"ORDER_STATUS",...}'
    )
  }

  if (typeof map !== 'object' || map === null || Array.isArray(map)) {
    throw new Error('[Compass] GHL_STAGE_NAME_MAP must be a JSON object, not an array or primitive')
  }

  const invalid: string[] = []
  for (const [stageName, status] of Object.entries(map as Record<string, unknown>)) {
    if (typeof status !== 'string' || !VALID_ORDER_STATUSES.has(status)) {
      invalid.push(`"${stageName}" → "${status}"`)
    }
  }

  if (invalid.length > 0) {
    throw new Error(
      `[Compass] GHL_STAGE_NAME_MAP has invalid OrderStatus values:\n${invalid.map((e) => `  • ${e}`).join('\n')}\nValid values: ${Array.from(VALID_ORDER_STATUSES).join(', ')}`
    )
  }

  console.log(`[Compass] GHL_STAGE_NAME_MAP validated — ${Object.keys(map as object).length} stage(s) mapped`)
}
