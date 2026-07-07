'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const BLUE = '#3B60F3'

type Availability = 'available' | 'likely' | 'taken'
interface NameCheckResult {
  availability: Availability
  message: string
  name: string
}

const STATUS: Record<Availability, { bg: string; text: string; dot: string; label: string }> = {
  available: { bg: '#f0fdf4', text: '#15803d', dot: '#16a34a', label: 'Available' },
  likely:    { bg: '#fffbeb', text: '#92400e', dot: '#d97706', label: 'Likely available' },
  taken:     { bg: '#fef2f2', text: '#b91c1c', dot: '#dc2626', label: 'Name taken' },
}

export default function NameCheckWidget() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NameCheckResult | null>(null)
  const [error, setError] = useState('')

  async function checkName(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const r = await fetch(`/api/name-search?name=${encodeURIComponent(trimmed)}`)
      const json = await r.json() as { data?: { availability: Availability; message: string }; error?: { message?: string } }
      if (json.error || !json.data) {
        setError(json.error?.message ?? 'Search failed. Please try again.')
        return
      }
      setResult({ ...json.data, name: trimmed })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const status = result ? STATUS[result.availability] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <form onSubmit={checkName} className="flex-col sm:flex-row" style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setResult(null); setError('') }}
          placeholder="Enter your business name…"
          style={{
            flex: 1,
            height: 50,
            borderRadius: 8,
            border: '1.5px solid #E0E0E0',
            padding: '0 16px',
            fontSize: 16,
            fontFamily: 'DM Sans, sans-serif',
            color: '#171717',
            outline: 'none',
            background: '#fff',
          }}
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          style={{
            height: 50,
            paddingInline: 28,
            borderRadius: 8,
            background: BLUE,
            color: '#fff',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            fontSize: 16,
            border: 'none',
            cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
            opacity: !name.trim() ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Checking…' : 'Check Name'}
        </button>
      </form>

      {error && (
        <p style={{ fontSize: 14, color: '#b91c1c', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>{error}</p>
      )}

      {result && status && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: status.bg,
            borderRadius: 10,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: status.dot, flexShrink: 0,
            }} />
            <div>
              <span style={{ fontWeight: 600, color: status.text, fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
                {status.label}
              </span>
              <span style={{ color: status.text, fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
                {' '}— {result.message}
              </span>
            </div>
          </div>

          {(result.availability === 'available' || result.availability === 'likely') && (
            <button
              type="button"
              onClick={() => router.push(`/llc?name=${encodeURIComponent(result.name)}`)}
              style={{
                height: 46,
                borderRadius: 8,
                background: BLUE,
                color: '#fff',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                alignSelf: 'flex-start',
                paddingInline: 24,
              }}
            >
              Start my LLC with this name →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
