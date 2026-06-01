import { describe, it, expect } from 'vitest'
import { isLegalTransition } from '@/services/orders'
import { OrderStatus } from '@prisma/client'

const { INTAKE, REVIEW, FILED, COMPLETED, EXCEPTION } = OrderStatus

describe('isLegalTransition', () => {
  // Legal paths
  it('INTAKE → REVIEW', () => expect(isLegalTransition(INTAKE, REVIEW)).toBe(true))
  it('REVIEW → FILED', () => expect(isLegalTransition(REVIEW, FILED)).toBe(true))
  it('REVIEW → EXCEPTION', () => expect(isLegalTransition(REVIEW, EXCEPTION)).toBe(true))
  it('FILED → COMPLETED', () => expect(isLegalTransition(FILED, COMPLETED)).toBe(true))
  it('FILED → EXCEPTION', () => expect(isLegalTransition(FILED, EXCEPTION)).toBe(true))
  it('EXCEPTION → REVIEW (reopen)', () => expect(isLegalTransition(EXCEPTION, REVIEW)).toBe(true))

  // Illegal paths
  it('INTAKE → FILED (skip)', () => expect(isLegalTransition(INTAKE, FILED)).toBe(false))
  it('INTAKE → COMPLETED (skip)', () => expect(isLegalTransition(INTAKE, COMPLETED)).toBe(false))
  it('INTAKE → EXCEPTION (not yet)', () => expect(isLegalTransition(INTAKE, EXCEPTION)).toBe(false))
  it('REVIEW → INTAKE (backward)', () => expect(isLegalTransition(REVIEW, INTAKE)).toBe(false))
  it('FILED → REVIEW (backward)', () => expect(isLegalTransition(FILED, REVIEW)).toBe(false))
  it('COMPLETED → anything', () => {
    expect(isLegalTransition(COMPLETED, REVIEW)).toBe(false)
    expect(isLegalTransition(COMPLETED, FILED)).toBe(false)
    expect(isLegalTransition(COMPLETED, EXCEPTION)).toBe(false)
  })
  it('EXCEPTION → FILED (must go through REVIEW)', () => {
    expect(isLegalTransition(EXCEPTION, FILED)).toBe(false)
  })

  // Same-status transitions are illegal
  it('same status is illegal', () => {
    for (const status of Object.values(OrderStatus)) {
      expect(isLegalTransition(status, status)).toBe(false)
    }
  })
})
