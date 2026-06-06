// Next.js instrumentation hook — runs once before the app handles any requests.
// In E2E mode (ENABLE_MSW=true), starts MSW server to intercept outgoing HTTP.
// This prevents test runs from hitting real Stripe, GHL, Resend, or SunBiz endpoints.
//
// Only active when ENABLE_MSW=true — zero impact on dev/prod.

export async function register() {
  // Sentry — initialise before anything else so all errors are captured
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
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
