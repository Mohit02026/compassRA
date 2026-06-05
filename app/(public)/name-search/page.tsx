'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { NameAvailability, SunBizMatch, NameSearchResult } from '@/services/nameSearch'

export default function NameSearchPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NameSearchResult | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/name-search?name=${encodeURIComponent(name)}`)
      const json = await res.json()
      setResult(json.data as NameSearchResult)
    } finally {
      setLoading(false)
    }
  }

  function handleProceed() {
    router.push(`/llc?name=${encodeURIComponent(name)}`)
  }

  const canProceed =
    result &&
    (result.available === 'available' ||
      result.available === 'likely' ||
      // taken but inactive — entity may be dissolved, still let them proceed
      (result.available === 'taken' && isInactive(result.exactMatch?.status)))

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
      >
        Florida LLC Name Search
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
        Check if your desired LLC name is available on Sunbiz before filing.
      </p>

      <div className="bg-white rounded-lg p-5 mb-4" style={{ border: '1px solid var(--color-border)' }}>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sunshine Ventures LLC"
            className="flex-1 border rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-border)' }}
            required
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 text-white text-sm font-medium rounded-md px-5 py-2.5 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-navy)' }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Search
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-lg p-5 mb-4" style={{ border: '1px solid var(--color-border)' }}>
          <AvailabilityBanner result={result} name={name} />

          {result.matches.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>
                Nearby names in the Florida registry
              </p>
              <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                      <th className="text-left px-3 py-2 text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                        Corporate Name
                      </th>
                      <th className="text-left px-3 py-2 text-xs font-medium w-24" style={{ color: 'var(--color-muted)' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.matches.map((match, i) => {
                      const isExact = result.exactMatch?.name === match.name
                      return (
                        <tr
                          key={i}
                          style={{
                            borderTop: i > 0 ? '1px solid var(--color-border)' : undefined,
                            backgroundColor: isExact ? 'oklch(0.97 0.02 25)' : undefined,
                          }}
                        >
                          <td className="px-3 py-2 font-medium" style={{ color: isExact ? 'var(--color-exception-text)' : '#374151' }}>
                            {match.name}
                            {isExact && (
                              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--color-exception-text)' }}>
                                ← exact match
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <StatusBadge status={match.status} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {canProceed && (
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleProceed}
                className="text-white text-sm font-medium rounded-md px-6 py-2.5 transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-navy)' }}
              >
                Form LLC with this name →
              </button>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-center" style={{ color: 'var(--color-muted)' }}>
        Data pulled directly from the Florida Division of Corporations. Name availability is confirmed during filing.
      </p>
    </div>
  )
}

function isInactive(status?: string): boolean {
  if (!status) return false
  const s = status.toUpperCase()
  return s.startsWith('INACT') || s === 'INACTIVE'
}

function AvailabilityBanner({ result, name }: { result: NameSearchResult; name: string }) {
  const { available, exactMatch } = result

  if (available === 'available') {
    return (
      <div className="flex items-start gap-3 p-3 rounded-md bg-green-50 border border-green-200">
        <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800">Looks available</p>
          <p className="text-xs text-green-700 mt-0.5">
            No exact or similar match found for &ldquo;{name}&rdquo; on Sunbiz.
          </p>
        </div>
      </div>
    )
  }

  if (available === 'taken') {
    // Inactive exact match — name is registered but entity may be dissolved
    if (exactMatch && isInactive(exactMatch.status)) {
      return (
        <div className="flex items-start gap-3 p-3 rounded-md border"
          style={{ backgroundColor: 'var(--color-review-bg)', borderColor: 'var(--color-review-border)' }}>
          <AlertCircle size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-review-text)' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-review-text)' }}>
              Name exists but entity is inactive
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-review-text)' }}>
              &ldquo;{exactMatch.name}&rdquo; is marked <strong>{exactMatch.status}</strong> on Sunbiz.
              Dissolved names may become available after a waiting period. We confirm availability before filing.
            </p>
          </div>
        </div>
      )
    }

    // Active exact match — definitely taken
    return (
      <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200">
        <XCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-800">Name already taken</p>
          <p className="text-xs text-red-700 mt-0.5">
            &ldquo;{exactMatch?.name ?? name}&rdquo; is already registered
            {exactMatch ? ` and marked ${exactMatch.status}` : ''} on Sunbiz. Try a different name.
          </p>
        </div>
      </div>
    )
  }

  if (available === 'likely') {
    return (
      <div className="flex items-start gap-3 p-3 rounded-md border"
        style={{ backgroundColor: 'var(--color-review-bg)', borderColor: 'var(--color-review-border)' }}>
        <AlertCircle size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-review-text)' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-review-text)' }}>
            Likely available
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-review-text)' }}>
            No exact match for &ldquo;{name}&rdquo;, but similar names exist nearby. We confirm availability before filing.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50 border border-gray-200">
      <AlertCircle size={18} className="text-gray-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-700">Could not reach Sunbiz</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Try again in a moment. We&apos;ll verify the name when filing.
        </p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = status.trim().toUpperCase()

  if (s === 'ACTIVE') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        Active
      </span>
    )
  }
  if (s === 'NAME HS') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        Reserved
      </span>
    )
  }
  if (s.startsWith('INACT') || s === 'INACTIVE') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
        Inactive
      </span>
    )
  }
  // Any other status (NAME CHANGE, etc.)
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
      {status}
    </span>
  )
}
