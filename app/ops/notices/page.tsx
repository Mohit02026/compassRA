'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react'

const BLUE = '#3B60F3'

interface CustomerOption { id: string; name: string; email: string }

export default function OpsNoticesPage() {
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [customerId, setCustomerId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void fetch('/api/orders?limit=100')
      .then((r) => r.json())
      .then((j) => {
        const seen = new Set<string>()
        const list: CustomerOption[] = []
        for (const order of j.data?.items ?? []) {
          if (!seen.has(order.customerId)) {
            seen.add(order.customerId)
            list.push({ id: order.customerId, name: order.customer.name, email: order.customer.email })
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
    if (!customerId) { setError('Please select a customer.'); return }
    if (!file) { setError('Please select a PDF file.'); return }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.set('customerId', customerId)
      formData.set('file', file)
      const res = await fetch('/api/ops/notices', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) { setError(json.error?.message ?? 'Upload failed.'); return }
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-inter)' }}>
          Legal Notices
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          Upload a notice received on behalf of a customer — they will be notified by email.
        </p>
      </div>

      <div className="max-w-lg">
        {success && (
          <div
            className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl"
            style={{ background: '#f0fdf4', border: '1px solid #86efac' }}
          >
            <CheckCircle size={16} style={{ color: '#16a34a' }} />
            <p className="text-sm font-medium" style={{ color: '#15803d' }}>
              Notice uploaded and customer notified.
            </p>
          </div>
        )}
        {error && (
          <div
            className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl"
            style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}
          >
            <AlertCircle size={16} style={{ color: '#dc2626' }} />
            <p className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>
          </div>
        )}

        <div
          className="bg-white rounded-xl p-6"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
            {/* Customer select */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                Customer
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-shadow focus:shadow-sm"
                style={{
                  border: '1px solid var(--color-border)',
                  color: customerId ? 'var(--color-navy-mid)' : 'var(--color-muted)',
                  background: 'white',
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

            {/* File upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                PDF File
              </label>

              {/* Custom file drop area */}
              <label
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl cursor-pointer transition-colors"
                style={{
                  border: `2px dashed ${file ? BLUE : 'var(--color-border)'}`,
                  background: file ? `${BLUE}06` : 'rgb(248,249,250)',
                }}
              >
                {file ? (
                  <>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${BLUE}12` }}
                    >
                      <FileText size={18} style={{ color: BLUE }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-navy-mid)' }}>
                      {file.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {(file.size / 1024).toFixed(0)} KB · Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--color-border)' }}
                    >
                      <Upload size={18} style={{ color: 'var(--color-muted)' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-navy-mid)' }}>
                      Click to upload PDF
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>PDF only</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-60"
              style={{ background: BLUE }}
            >
              <Upload size={15} />
              {uploading ? 'Uploading…' : 'Upload notice'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
