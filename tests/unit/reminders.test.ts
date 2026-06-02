import { describe, it, expect } from 'vitest'

// Pure date math extracted from reminders service for unit testing
const REMINDER_INTERVALS = [90, 60, 30, 14, 7, 3] as const

function daysUntil(date: Date, from: Date = new Date()): number {
  const now = new Date(from)
  now.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86400000)
}

function shouldSendInterval(days: number, interval: number): boolean {
  return days <= interval && days >= interval - 1
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

describe('daysUntil', () => {
  const now = new Date('2026-06-01T12:00:00Z')

  it('returns 0 for today', () => {
    expect(daysUntil(new Date('2026-06-01'), now)).toBe(0)
  })

  it('returns 1 for tomorrow', () => {
    expect(daysUntil(new Date('2026-06-02'), now)).toBe(1)
  })

  it('returns 90 for 90 days out', () => {
    expect(daysUntil(addDays(now, 90), now)).toBe(90)
  })

  it('returns negative for past dates', () => {
    expect(daysUntil(new Date('2026-05-31'), now)).toBe(-1)
  })
})

describe('reminder interval matching — [90, 60, 30, 14, 7, 3]', () => {
  it('triggers 90d reminder exactly at 90 days', () => {
    expect(shouldSendInterval(90, 90)).toBe(true)
  })

  it('triggers 3d reminder exactly at 3 days', () => {
    expect(shouldSendInterval(3, 3)).toBe(true)
  })

  it('triggers 14d reminder exactly at 14 days', () => {
    expect(shouldSendInterval(14, 14)).toBe(true)
  })

  it('does not trigger 30d reminder at 31 days', () => {
    expect(shouldSendInterval(31, 30)).toBe(false)
  })

  // Window is [interval-1, interval] to handle crons that run a day late.
  // Double-send prevented by sentAt idempotency check in the service.
  it('triggers 30d reminder at 29 days (late cron window)', () => {
    expect(shouldSendInterval(29, 30)).toBe(true)
  })

  it('triggers 14d reminder at 13 days (late cron window)', () => {
    expect(shouldSendInterval(13, 14)).toBe(true)
  })

  it('each interval only fires once per window', () => {
    const now = new Date('2026-06-01')
    const dueDate = addDays(now, 90)

    const firing = REMINDER_INTERVALS.filter((interval) =>
      shouldSendInterval(daysUntil(dueDate, now), interval)
    )
    expect(firing).toEqual([90])
  })

  it('no interval fires when overdue', () => {
    const now = new Date('2026-06-01')
    const dueDate = addDays(now, -5)

    const firing = REMINDER_INTERVALS.filter((interval) =>
      shouldSendInterval(daysUntil(dueDate, now), interval)
    )
    expect(firing).toHaveLength(0)
  })

  it('all 6 intervals are covered', () => {
    expect(REMINDER_INTERVALS).toHaveLength(6)
    expect(REMINDER_INTERVALS).toContain(14)
    expect(REMINDER_INTERVALS).toContain(3)
    expect(REMINDER_INTERVALS).not.toContain(1)
  })
})
