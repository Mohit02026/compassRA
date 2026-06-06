import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { withSentryConfig } from '@sentry/nextjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const _require = createRequire(import.meta.url)

const canonicalNext = path.dirname(_require.resolve('next/package.json'))

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      next: canonicalNext,
    }
    return config
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
