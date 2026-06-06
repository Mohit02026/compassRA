import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Only capture errors in production — skip noise in dev
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
})
