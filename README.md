# Compass Registered Agent

Florida LLC formation, annual report filing, and registered agent services — client-facing platform built for [Compass Registered Agent](https://compassregisteredagent.com).

---

## What it does

**Public** — Name availability search, LLC formation intake, annual report filing, EIN application, Stripe checkout.

**Customer portal** — Track filing status, download documents (Articles of Org, EIN confirmation, certificate), compliance calendar, legal notice forwarding.

**Ops workbench** — Order management, document upload, stage transitions, filing sheet PDF generation. Bridget works in GoHighLevel; this workbench is a backstage view of the same data.

**GoHighLevel sync** — Bidirectional. Compass pushes new orders to GHL on payment. GHL stage changes sync back to Compass via webhook.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS v4 |
| ORM | Prisma |
| Database | Railway Postgres |
| Auth | NextAuth v5 |
| Email | Resend + React Email |
| PDF | `@react-pdf/renderer` |
| Document storage | Cloudflare R2 / MinIO (dev) |
| Payments | Stripe |
| Ops backend | GoHighLevel |
| Package manager | pnpm |

---

## Local dev

### Prerequisites

- Node 20+, pnpm
- Docker (for Postgres + MinIO)
- Stripe CLI

### Setup

```bash
# 1. Install deps
pnpm install

# 2. Start Postgres + MinIO
docker-compose up -d

# 3. Run migrations + seed ops accounts
pnpm prisma migrate deploy
pnpm prisma db seed

# 4. Copy env file and fill in secrets
cp .env.example .env.local

# 5. Start dev server
pnpm dev
```

### Running webhooks locally

```bash
# Terminal 1 — dev server
pnpm dev

# Terminal 2 — Stripe (get signing secret, paste into .env.local STRIPE_WEBHOOK_SECRET)
stripe listen --api-key sk_test_... --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3 — tunnel for GHL webhook testing
pnpm tunnel
# Prints the GHL webhook URL to paste into your GHL workflow
```

---

## Environment variables

```bash
# Database
DATABASE_URL

# Auth
NEXTAUTH_SECRET
NEXTAUTH_URL

# Email
RESEND_API_KEY
RESEND_FROM_EMAIL
RESEND_TEST_EMAIL        # Dev only — redirect all emails to this address

# Storage (R2 / MinIO)
R2_ENDPOINT
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME

# Encryption (AES-256-GCM — 32-byte hex)
ENCRYPTION_KEY

# Cron
CRON_SECRET

# App
NEXT_PUBLIC_APP_URL
COMPASS_TENANT_ID

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# GoHighLevel
GHL_API_KEY
GHL_LOCATION_ID
GHL_PIPELINE_ID
GHL_STAGE_MAP            # JSON: OrderStatus → GHL stage ID (Compass→GHL push)
GHL_STAGE_NAME_MAP       # JSON: GHL stage name → OrderStatus (GHL→Compass webhook)
GHL_WEBHOOK_SECRET       # Optional HMAC signing — leave empty to skip in dev
GHL_USER_ID

# Ops alerts (internal only)
OPS_ALERT_EMAIL
```

---

## Order lifecycle

```
INTAKE → DATA_QC → READY_TO_FILE → FILED → COMPLETED
                                 ↘ EXCEPTION → DATA_QC
```

Stage transitions are driven by GHL webhook (Bridget moves stages in GHL → Compass updates). Ops can also move stages directly in the workbench. Both directions sync.

---

## Test accounts (seeded)

| Role | Email | Password |
|---|---|---|
| Ops | ops@compassregisteredagent.com | ChangeMe123! |
| Admin | admin@compassregisteredagent.com | ChangeMe123! |

Customer accounts are created automatically at checkout.

---

## Tests

```bash
pnpm test          # Unit + integration (Vitest)
pnpm e2e           # End-to-end (Playwright)
```

---

## Deployment

Deployed on Railway. Auto-deploys on push to `main`.

Start command: `prisma migrate deploy && next start`
