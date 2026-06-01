import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, SENSITIVE_KEYS } from '@/lib/encryption'

describe('encryption', () => {
  it('roundtrip: encrypted value decrypts to original', () => {
    const original = 'test-value-123'
    const ciphertext = encrypt(original)
    expect(decrypt(ciphertext)).toBe(original)
  })

  it('produces different ciphertext each call (random IV)', () => {
    const val = 'same-input'
    expect(encrypt(val)).not.toBe(encrypt(val))
  })

  it('ciphertext has iv:tag:data format', () => {
    const parts = encrypt('hello').split(':')
    expect(parts).toHaveLength(3)
    // IV = 12 bytes = 24 hex chars
    expect(parts[0]).toHaveLength(24)
    // Auth tag = 16 bytes = 32 hex chars
    expect(parts[1]).toHaveLength(32)
  })

  it('decrypt throws on tampered ciphertext', () => {
    const ct = encrypt('secret')
    const [iv, tag, data] = ct.split(':')
    // Flip a byte in the data
    const tampered = `${iv}:${tag}:${'ff' + data.slice(2)}`
    expect(() => decrypt(tampered)).toThrow()
  })

  it('SENSITIVE_KEYS contains ssn, ein, dob', () => {
    expect(SENSITIVE_KEYS.has('ssn')).toBe(true)
    expect(SENSITIVE_KEYS.has('ein')).toBe(true)
    expect(SENSITIVE_KEYS.has('dob')).toBe(true)
    expect(SENSITIVE_KEYS.has('businessName')).toBe(false)
  })
})
