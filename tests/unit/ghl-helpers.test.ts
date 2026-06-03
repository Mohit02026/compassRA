// Unit tests for lib/ghl.ts pure helper functions.
// No network calls — tests env var parsing logic only.

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getStageId } from '@/lib/ghl'

const VALID_STAGE_MAP = JSON.stringify({
  INTAKE: 'stage-aaa',
  DATA_QC: 'stage-bbb',
  READY_TO_FILE: 'stage-ccc',
  FILED: 'stage-ddd',
  COMPLETED: 'stage-eee',
})

beforeEach(() => {
  process.env.GHL_STAGE_MAP = VALID_STAGE_MAP
})

afterEach(() => {
  delete process.env.GHL_STAGE_MAP
})

describe('getStageId', () => {
  it('returns the correct stage ID for INTAKE', () => {
    expect(getStageId('INTAKE')).toBe('stage-aaa')
  })

  it('returns the correct stage ID for COMPLETED', () => {
    expect(getStageId('COMPLETED')).toBe('stage-eee')
  })

  it('returns the correct stage ID for READY_TO_FILE', () => {
    expect(getStageId('READY_TO_FILE')).toBe('stage-ccc')
  })

  it('returns null for an unknown status key', () => {
    expect(getStageId('UNKNOWN_STATUS')).toBeNull()
  })

  it('returns null when GHL_STAGE_MAP is not set', () => {
    delete process.env.GHL_STAGE_MAP
    expect(getStageId('INTAKE')).toBeNull()
  })

  it('returns null when GHL_STAGE_MAP is invalid JSON', () => {
    process.env.GHL_STAGE_MAP = 'not-valid-json'
    expect(getStageId('INTAKE')).toBeNull()
  })

  it('returns null when GHL_STAGE_MAP is empty object', () => {
    process.env.GHL_STAGE_MAP = '{}'
    expect(getStageId('INTAKE')).toBeNull()
  })

  it('handles partial map — missing EXCEPTION returns null', () => {
    // EXCEPTION is not in the stage map (never pushed to GHL)
    expect(getStageId('EXCEPTION')).toBeNull()
  })
})
