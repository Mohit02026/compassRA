'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { OrderStatus, DocumentType } from '@prisma/client'

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  FILING_SHEET: 'Filing Sheet',
  ARTICLES_OF_ORG: 'Articles of Organization',
  OPERATING_AGREEMENT: 'Operating Agreement',
  EIN_CONFIRMATION: 'EIN Confirmation',
  FILING_RECEIPT: 'Filing Receipt',
  CERTIFICATE: 'Certificate of Status',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface DocRow {
  id: string
  type: DocumentType
  filename: string
  createdAt: string
  order: {
    id: string
    state: string
    serviceType: string
    status: OrderStatus
    customer: { name: string }
  }
}

export default function OpsDocumentsPage() {
  const [docs, setDocs] = useState<DocRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetch('/api/documents')
      .then((r) => r.json())
      .then((j) => {
        setDocs(j.data ?? [])
        setLoading(false)
      })
  }, [])

  async function download(docId: string) {
    const res = await fetch(`/api/documents/${docId}/url`)
    const json = await res.json()
    window.open(json.data?.url, '_blank')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)' }}>
          Documents
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          All uploaded and generated documents
        </p>
      </div>

      <div
        className="bg-white border rounded-lg overflow-hidden"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {loading && (
          <p className="text-sm text-gray-400 text-center py-12">Loading…</p>
        )}
        {!loading && docs.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <FileText className="text-gray-300" size={40} />
            <p className="text-sm font-medium text-gray-500 mt-3">No documents yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Documents appear here once orders are created
            </p>
          </div>
        )}
        {!loading &&
          docs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => download(doc.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <FileText className="shrink-0" size={20} style={{ color: 'var(--color-blue)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {doc.order.customer.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {doc.order.state} · {doc.order.serviceType.replace(/_/g, ' ')} ·{' '}
                  {DOC_TYPE_LABELS[doc.type] ?? doc.type} · {doc.filename}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <StatusPill status={doc.order.status} />
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {formatDate(doc.createdAt)}
                </span>
              </div>
            </button>
          ))}
      </div>

      {/* Legend */}
      {!loading && docs.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
          <span>Document categories:</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            customer-provided
          </span>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            system-generated
          </span>
          <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
            state-issued
          </span>
        </div>
      )}
    </div>
  )
}
