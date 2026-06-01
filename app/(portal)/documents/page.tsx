'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, Lock } from 'lucide-react'
import { OrderStatus, DocumentType } from '@prisma/client'

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  FILING_SHEET: 'Filing Sheet',
  ARTICLES_OF_ORG: 'Articles of Organization',
  OPERATING_AGREEMENT: 'Operating Agreement',
  EIN_CONFIRMATION: 'EIN Confirmation',
  FILING_RECEIPT: 'Filing Receipt',
  CERTIFICATE: 'Certificate of Status',
}

interface DocItem {
  id: string
  type: DocumentType
  filename: string
  createdAt: string
  order: {
    id: string
    status: OrderStatus
    serviceType: string
    state: string
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatService(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function PortalDocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Build doc list from portal orders endpoint
    void fetch('/api/portal/orders')
      .then((r) => r.json())
      .then((j) => {
        const orders: any[] = j.data ?? []
        const allDocs: DocItem[] = orders.flatMap((o: any) =>
          (o.documents ?? []).map((d: any) => ({
            ...d,
            order: { id: o.id, status: o.status, serviceType: o.serviceType, state: o.state },
          }))
        )
        setDocs(allDocs)
        setLoading(false)
      })
  }, [])

  async function download(docId: string) {
    const res = await fetch(`/api/documents/${docId}/url`)
    const json = await res.json()
    if (json.data?.url) {
      window.open(json.data.url, '_blank')
    } else {
      alert(json.error?.message ?? 'Unable to download')
    }
  }

  const availableDocs = docs.filter((d) => d.order.status === OrderStatus.COMPLETED)
  const lockedDocs = docs.filter((d) => d.order.status !== OrderStatus.COMPLETED)

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
        >
          Documents
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          Download your filing documents once your order is completed.
        </p>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}

      {!loading && docs.length === 0 && (
        <div className="flex flex-col items-center py-20">
          <FileText className="text-gray-300" size={40} />
          <p className="text-sm font-medium text-gray-500 mt-3">No documents yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Documents appear here once your filing is processed.
          </p>
        </div>
      )}

      {/* Available documents */}
      {!loading && availableDocs.length > 0 && (
        <div className="mb-6">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-muted)' }}
          >
            Ready to download
          </p>
          <div
            className="bg-white border rounded-xl overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {availableDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <FileText
                  className="shrink-0"
                  size={20}
                  style={{ color: 'var(--color-blue)' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    {formatService(doc.order.serviceType)} · {doc.order.state} ·{' '}
                    {formatDate(doc.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => download(doc.id)}
                  className="flex items-center gap-1 text-sm font-medium hover:underline"
                  style={{ color: 'var(--color-blue)' }}
                >
                  <Download size={14} /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked documents */}
      {!loading && lockedDocs.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-muted)' }}
          >
            Pending filing completion
          </p>
          <div
            className="bg-white border rounded-xl overflow-hidden opacity-60"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {lockedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <FileText size={20} className="shrink-0 text-gray-300" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                  </p>
                  <p className="text-xs mt-0.5 text-gray-400">
                    {formatService(doc.order.serviceType)} · {doc.order.state}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Lock size={13} />
                  <span>Available once completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
