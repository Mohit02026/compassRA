import { describe, it, expect } from 'vitest'
import { isLegalTransition } from '@/services/orders'
import { OrderStatus } from '@prisma/client'

const { INTAKE, DATA_QC, READY_TO_FILE, FILED, COMPLETED, EXCEPTION } = OrderStatus

describe('isLegalTransition', () => {
  // Legal paths
  it('INTAKE → DATA_QC', () => expect(isLegalTransition(INTAKE, DATA_QC)).toBe(true))
  it('DATA_QC → READY_TO_FILE', () => expect(isLegalTransition(DATA_QC, READY_TO_FILE)).toBe(true))
  it('DATA_QC → EXCEPTION', () => expect(isLegalTransition(DATA_QC, EXCEPTION)).toBe(true))
  it('READY_TO_FILE → FILED', () => expect(isLegalTransition(READY_TO_FILE, FILED)).toBe(true))
  it('READY_TO_FILE → EXCEPTION', () => expect(isLegalTransition(READY_TO_FILE, EXCEPTION)).toBe(true))
  it('FILED → COMPLETED', () => expect(isLegalTransition(FILED, COMPLETED)).toBe(true))
  it('FILED → EXCEPTION', () => expect(isLegalTransition(FILED, EXCEPTION)).toBe(true))
  it('EXCEPTION → DATA_QC (reopen)', () => expect(isLegalTransition(EXCEPTION, DATA_QC)).toBe(true))

  // Illegal paths — skipping stages
  it('INTAKE → FILED (skip)', () => expect(isLegalTransition(INTAKE, FILED)).toBe(false))
  it('INTAKE → COMPLETED (skip)', () => expect(isLegalTransition(INTAKE, COMPLETED)).toBe(false))
  it('INTAKE → EXCEPTION (not valid from INTAKE)', () => expect(isLegalTransition(INTAKE, EXCEPTION)).toBe(false))
  it('INTAKE → READY_TO_FILE (skip)', () => expect(isLegalTransition(INTAKE, READY_TO_FILE)).toBe(false))
  it('DATA_QC → FILED (skip)', () => expect(isLegalTransition(DATA_QC, FILED)).toBe(false))
  it('DATA_QC → INTAKE (backward)', () => expect(isLegalTransition(DATA_QC, INTAKE)).toBe(false))
  it('READY_TO_FILE → DATA_QC (backward)', () => expect(isLegalTransition(READY_TO_FILE, DATA_QC)).toBe(false))
  it('FILED → READY_TO_FILE (backward)', () => expect(isLegalTransition(FILED, READY_TO_FILE)).toBe(false))
  it('COMPLETED → anything is illegal', () => {
    expect(isLegalTransition(COMPLETED, DATA_QC)).toBe(false)
    expect(isLegalTransition(COMPLETED, FILED)).toBe(false)
    expect(isLegalTransition(COMPLETED, EXCEPTION)).toBe(false)
  })
  it('EXCEPTION → FILED (must go through DATA_QC first)', () => {
    expect(isLegalTransition(EXCEPTION, FILED)).toBe(false)
  })
  it('EXCEPTION → READY_TO_FILE (must go through DATA_QC)', () => {
    expect(isLegalTransition(EXCEPTION, READY_TO_FILE)).toBe(false)
  })

  // Same-status transitions are illegal
  it('same status is always illegal', () => {
    for (const status of Object.values(OrderStatus)) {
      expect(isLegalTransition(status, status)).toBe(false)
    }
  })
})
