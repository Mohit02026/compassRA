import { Resend } from 'resend'

export const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@compassregisteredagent.com'

export const isMock = !process.env.RESEND_API_KEY

// Lazy — only initialised when actually needed (avoids throw at module load with no key)
let _client: Resend | null = null

export function getResend(): Resend {
  if (isMock) throw new Error('Resend called in mock mode — this should not happen')
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY!)
  return _client
}
