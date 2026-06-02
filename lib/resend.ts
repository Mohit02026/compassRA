import { Resend } from 'resend'

export const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@compassregisteredagent.com'

export const isMock = !process.env.RESEND_API_KEY

// In dev/test, redirect all outgoing email to this address instead of the real recipient.
// Resend trial accounts can only send to verified emails — set RESEND_TEST_EMAIL to override.
export function resolveRecipient(to: string): string {
  return process.env.RESEND_TEST_EMAIL ?? to
}

// Lazy — only initialised when actually needed (avoids throw at module load with no key)
let _client: Resend | null = null

export function getResend(): Resend {
  if (isMock) throw new Error('Resend called in mock mode — this should not happen')
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY!)
  return _client
}
