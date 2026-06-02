'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { NameAvailability } from '@/services/nameSearch'

export default function NameSearchPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    available: NameAvailability
    matches: string[]
  } | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/name-search?name=${encodeURIComponent(name)}`)
      const json = await res.json()
      setResult(json.data)
    } finally {
      setLoading(false)
    }
  }

  function handleProceed() {
    // Pass name to LLC formation via URL param
    router.push(`/llc?name=${encodeURIComponent(name)}`)
  }

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
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            Search
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-lg p-5 mb-4" style={{ border: '1px solid var(--color-border)' }}>
          <AvailabilityBanner available={result.available} name={name} />

          {result.matches.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-muted)' }}>
                Similar names on Sunbiz
              </p>
              <ul className="space-y-1">
                {result.matches.map((match, i) => (
                  <li key={i} className="text-sm py-1.5 px-2 rounded" style={{ backgroundColor: 'var(--color-bg)' }}>
                    {match}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(result.available === 'available' || result.available === 'likely') && (
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
        Results are pulled directly from Sunbiz. Name availability is confirmed during filing.
      </p>
    </div>
  )
}

function AvailabilityBanner({
  available,
  name,
}: {
  available: NameAvailability
  name: string
}) {
  if (available === 'available') {
    return (
      <div className="flex items-start gap-3 p-3 rounded-md bg-green-50 border border-green-200">
        <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800">Looks available</p>
          <p className="text-xs text-green-700 mt-0.5">
            No exact match found for &ldquo;{name}&rdquo; on Sunbiz.
          </p>
        </div>
      </div>
    )
  }

  if (available === 'taken') {
    return (
      <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200">
        <XCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-800">Name already taken</p>
          <p className="text-xs text-red-700 mt-0.5">
            An exact match for &ldquo;{name}&rdquo; exists on Sunbiz. Try a different name.
          </p>
        </div>
      </div>
    )
  }

  if (available === 'likely') {
    return (
      <div className="flex items-start gap-3 p-3 rounded-md border"
        style={{ backgroundColor: 'var(--color-review-bg)', borderColor: 'var(--color-review-border)' }}
      >
        <AlertCircle size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-review-text)' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-review-text)' }}>
            Likely available
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-review-text)' }}>
            Similar names exist but no exact match for &ldquo;{name}&rdquo;. We&apos;ll verify on Sunbiz when filing.
          </p>
        </div>
      </div>
    )
  }

  // unknown
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
