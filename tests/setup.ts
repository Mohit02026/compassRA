import { vi } from 'vitest'
import { PrismaClient } from '@prisma/client'

// Create a dedicated Prisma client pointing at compass_test.
// This avoids the timing issue where lib/prisma singleton might initialize
// with compass_db (from .env) before vitest's env injection fires.
const TEST_DB_URL = 'postgresql://compass:compass@localhost:5433/compass_test'

export const testPrisma = new PrismaClient({
  datasources: { db: { url: TEST_DB_URL } },
  log: ['error'],
})

// Replace the app's prisma singleton with our test client.
// setPrismaContext is a no-op — test DB has no RLS policies applied.
vi.mock('@/lib/prisma', () => ({
  prisma: testPrisma,
  setPrismaContext: vi.fn().mockResolvedValue(undefined),
}))

// Mock R2 — no real bucket needed
vi.mock('@/lib/r2', () => ({
  uploadToR2: vi.fn().mockResolvedValue(undefined),
  getPresignedUrl: vi.fn().mockResolvedValue('https://mock-r2.example.com/mock-key'),
}))

// Mock pdf service — uses JSX (@react-pdf/renderer), Vite can't parse without React plugin.
vi.mock('@/services/pdf', () => ({
  generateFilingSheet: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
}))

// Mock email service — all sends are void background tasks + JSX templates.
vi.mock('@/services/email', () => ({
  sendWelcome: vi.fn().mockResolvedValue(undefined),
  sendOrderFiled: vi.fn().mockResolvedValue(undefined),
  sendOrderCompleted: vi.fn().mockResolvedValue(undefined),
  sendException: vi.fn().mockResolvedValue(undefined),
  sendAnnualReportReminder: vi.fn().mockResolvedValue(undefined),
}))
