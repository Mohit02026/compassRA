# E2E Tests — Setup & Run

## Install (run once before first e2e run)

```bash
pnpm add -D @playwright/test msw dotenv dotenv-cli
pnpx playwright install chromium
```

## First run checklist

1. Ensure Docker Postgres is running on port 5433 (`docker compose up -d`)
2. Ensure compass_test DB is migrated (`pnpm prisma migrate deploy`)
3. Copy `.env.e2e` is present at project root (already created — not committed to git)
4. Verify `STRIPE_WEBHOOK_SECRET` in `.env.e2e` matches the value used in `helpers.ts` `signStripePayload()`
5. Verify `GHL_WEBHOOK_SECRET` in `.env.e2e` matches the value used in `helpers.ts` `signGhlPayload()`

## Run all E2E tests

```bash
pnpm e2e
```

## Run with Playwright UI (visual debugger)

```bash
pnpm e2e:ui
```

## Run a single spec

```bash
pnpm e2e -- tests/e2e/auth.spec.ts
pnpm e2e -- tests/e2e/golden-path.spec.ts
```

## Architecture

```
tests/e2e/
├── support/
│   ├── msw-handlers.ts      # MSW handlers: Stripe, GHL, SunBiz, Resend
│   ├── msw-node.ts          # MSW setupServer() instance
│   ├── global-setup.ts      # Seeds compass_test DB (fixed tenant ID)
│   ├── global-teardown.ts   # Cleans E2E tenant rows after test run
│   └── helpers.ts           # signStripePayload(), loginOps(), simulateGhlStageChange(), etc.
├── auth.spec.ts             # Login flows, role redirects, force-password-change
├── ops-workflow.spec.ts     # Ops: create order, advance lifecycle, upload cert
├── golden-path.spec.ts      # Full: public intake → payment → GHL webhooks → portal
└── portal.spec.ts           # Customer portal: dashboard, orders, documents, calendar
```

## How external services are mocked

| Service    | Method                                            |
|------------|---------------------------------------------------|
| Stripe     | MSW intercepts `api.stripe.com` (all PI calls)    |
| GHL        | MSW intercepts `services.leadconnectorhq.com`     |
| Resend     | `RESEND_API_KEY=` empty → service mock mode (noop)|
| R2         | `R2_ACCESS_KEY_ID=` empty → service mock mode     |
| Google Drive | `GOOGLE_SERVICE_ACCOUNT_JSON=` empty → mock mode |
| SunBiz     | MSW intercepts `search.sunbiz.org`                |

MSW is activated by `ENABLE_MSW=true` in `.env.e2e`. `instrumentation.ts` registers the
MSW server before Next.js handles any requests (`experimental.instrumentationHook: true`).

## Stripe + GHL webhooks without real keys

`tests/e2e/support/helpers.ts` `signStripePayload()` and `signGhlPayload()` compute
valid HMAC signatures using the test keys in `.env.e2e`. The webhook routes verify
these signatures normally — no mocking needed at the route level.
