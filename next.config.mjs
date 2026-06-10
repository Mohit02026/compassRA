import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Silent in CI/build to avoid noise when DSN not set
  silent: !process.env.SENTRY_DSN,
  // No source map upload needed unless you want readable stack traces in Sentry
  sourcemaps: { disable: true },
  // Don't auto-instrument — we capture what matters manually
  autoInstrumentServerFunctions: false,
})
