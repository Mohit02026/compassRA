// Next.js instrumentation hook — runs once before the app handles any requests.
// In E2E mode (ENABLE_MSW=true), starts MSW server to intercept outgoing HTTP.
// This prevents test runs from hitting real Stripe, GHL, Resend, or SunBiz endpoints.
//
// Only active when ENABLE_MSW=true — zero impact on dev/prod.

export async function register() {
  if (process.env.ENABLE_MSW !== 'true') return

  // Only activate in the Node.js runtime (not Edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { server } = await import('./tests/e2e/support/msw-node')
    server.listen({ onUnhandledRequest: 'bypass' })
    console.log('[E2E] MSW server started — outgoing HTTP intercepted')
  }
}
