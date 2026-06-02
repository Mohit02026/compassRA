'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'

interface CustomerOption {
  id: string
  name: string
  email: string
}

export default function OpsNoticesPage() {
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [customerId, setCustomerId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Derive customer list from orders — deduplicated by customerId
  useEffect(() => {
    void fetch('/api/orders?limit=100')
      .then((r) => r.json())
      .then((j) => {
        const seen = new Set<string>()
        const list: CustomerOption[] = []
        for (const order of j.data?.items ?? []) {
          if (!seen.has(order.customerId)) {
            seen.add(order.customerId)
            list.push({
              id: order.customerId,
              name: order.customer.name,
              email: order.customer.email,
            })
          }
        }
        list.sort((a, b) => a.name.localeCompare(b.name))
        setCustomers(list)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!customerId) {
      setError('Please select a customer.')
      return
    }
    if (!file) {
      setError('Please select a file.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.set('customerId', customerId)
      formData.set('file', file)

      const res = await fetch('/api/ops/notices', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error?.message ?? 'Upload failed.')
        return
      }

      setSuccess(true)
      setCustomerId('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)' }}>
          Upload legal notice
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          Upload a notice received on behalf of a customer. They will be notified by email.
        </p>
      </div>

      <div
        className="bg-white border rounded-xl p-6 max-w-lg"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {success && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Notice uploaded and customer notified.
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-navy-mid)' }}
            >
              Customer
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:ring-2"
              style={{
                borderColor: 'var(--color-border)',
                color: customerId ? 'var(--color-navy-mid)' : 'var(--color-muted)',
              }}
            >
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-navy-mid)' }}
            >
              File (PDF)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-navy)' }}
          >
            <Upload size={15} />
            {uploading ? 'Uploading…' : 'Upload notice'}
          </button>
        </form>
      </div>
    </div>
  )
}
