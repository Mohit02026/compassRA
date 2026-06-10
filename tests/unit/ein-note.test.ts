// Unit tests for buildOrderNote() — EIN_FILING specific output.
// No DB, no mocks needed — pure function.

import { describe, it, expect } from 'vitest'
import { buildOrderNote, type OrderNoteData } from '@/services/ghl'

function baseNote(overrides: Partial<OrderNoteData> = {}): OrderNoteData {
  return {
    orderId: 'ord_test_001',
    shortId: 'TEST0001',
    serviceLabel: 'EIN Filing',
    tierLabel: 'Standard',
    businessName: 'Sunshine Ventures LLC',
    state: 'FL',
    principalAddress: '123 Main St, Miami, FL 33101',
    mailingAddress: '123 Main St, Miami, FL 33101',
    managementType: '',
    members: [],
    effectiveDate: '',
    organizerName: 'Jane Doe',
    organizerEmail: 'jane@example.com',
    organizerPhone: '',
    addOns: [],
    serviceFee: '75',
    stateFee: '0',
    totalAmount: 75,
    compassPortalUrl: 'https://compassregisteredagent.com/ops/orders/ord_test_001',
    ...overrides,
  }
}

describe('buildOrderNote — EIN standalone', () => {
  it('includes service label EIN Filing in header', () => {
    const note = buildOrderNote(baseNote())
    expect(note).toContain('COMPASS ORDER — EIN Filing')
  })

  it('includes EIN DETAILS section when EIN fields are present', () => {
    const note = buildOrderNote(baseNote({
      einResponsibleParty: 'Jane Doe',
      einTaxIdType: 'ssn',
      einBusinessPurpose: 'Professional services',
      einDateStarted: '2026-01-01',
      einReasonApplying: 'Started new business',
      einMemberCount: '1',
      einCounty: 'Miami-Dade',
      einClosingMonth: 'December',
      einIsUSCitizen: 'true',
    }))
    expect(note).toContain('EIN DETAILS')
    expect(note).toContain('Jane Doe')
    expect(note).toContain('SSN (value encrypted')
    expect(note).toContain('Professional services')
    expect(note).toContain('Started new business')
    expect(note).toContain('Miami-Dade')
  })

  it('does NOT include "Add-ons: EIN" for standalone EIN order', () => {
    // addOns is empty for EIN_FILING — the whole order is the EIN
    const note = buildOrderNote(baseNote({ addOns: [] }))
    expect(note).not.toContain('ADD-ONS:')
    expect(note).not.toContain('EIN add-on')
  })

  it('includes total amount correctly', () => {
    const note = buildOrderNote(baseNote({ totalAmount: 75, serviceFee: '75', stateFee: '0' }))
    expect(note).toContain('TOTAL')
    expect(note).toContain('75.00')
  })

  it('includes non-US national note when isUSCitizen is false', () => {
    const note = buildOrderNote(baseNote({
      einResponsibleParty: 'Carlos Ruiz',
      einIsUSCitizen: 'false',
    }))
    expect(note).toContain('US citizen/resident: false')
  })

  it('includes employee counts when present', () => {
    const note = buildOrderNote(baseNote({
      einResponsibleParty: 'Jane Doe',
      einEmployeesAgricultural: '0',
      einEmployeesHousehold: '0',
      einEmployeesOther: '5',
    }))
    expect(note).toContain('Employees (Agri/Household/Other): 0/0/5')
  })

  it('includes previous EIN flag when set', () => {
    const note = buildOrderNote(baseNote({
      einResponsibleParty: 'Jane Doe',
      einPreviousEin: 'true',
    }))
    expect(note).toContain('Previously issued EIN: true')
  })

  it('includes compass portal URL', () => {
    const note = buildOrderNote(baseNote())
    expect(note).toContain('COMPASS PORTAL')
    expect(note).toContain('ops/orders/ord_test_001')
  })

  it('includes ITIN label when taxIdType is itin', () => {
    const note = buildOrderNote(baseNote({
      einResponsibleParty: 'Jane Doe',
      einTaxIdType: 'itin',
    }))
    expect(note).toContain('ITIN (value encrypted')
  })

  it('does not include EIN DETAILS section when no EIN fields provided', () => {
    const note = buildOrderNote(baseNote())
    expect(note).not.toContain('EIN DETAILS')
  })
})
