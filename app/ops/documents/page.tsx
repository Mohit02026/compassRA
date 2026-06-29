'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, Search } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { OrderStatus, DocumentType } from '@prisma/client'

const BLUE = '#3B60F3'

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  FILING_SHEET:        'Filing Sheet',
  SS4_DRAFT:           'SS-4 Draft',
  ARTICLES_OF_ORG:     'Articles of Organization',
  OPERATING_AGREEMENT: 'Operating Agreement',
  EIN_CONFIRMATION:    'EIN Confirmation',
  FILING_RECEIPT:      'Filing Receipt',
  CERTIFICATE:         'Certificate of Status',
  PAYMENT_INVOICE:     'Payment Invoice',
  LEGAL_NOTICE:        'Legal Notice',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
  const [search, setSearch] = useState('')

  useEffect(() => {
    void fetch('/api/documents')
      .then((r) => r.json())
      .then((j) => { setDocs(j.data ?? []); setLoading(false) })
  }, [])

  async function download(docId: string) {
    const res = await fetch(`/api/documents/${docId}/url`)
    const json = await res.json()
    window.open(json.data?.url, '_blank')
  }

  const visible = docs.filter((d) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      d.order.customer.name.toLowerCase().includes(q) ||
      d.filename.toLowerCase().includes(q) ||
      DOC_TYPE_LABELS[d.type]?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-inter)' }}>
            Documents
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
            All uploaded and generated documents
          </p>
        </div>
      </div>

      {/* Search */}
      {!loading && docs.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--color-muted)' }} />
          <input
            type="text"
            placeholder="Search by customer, filename, or document type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none"
            style={{ border: '1px solid var(--color-border)', background: 'white' }}
          />
        </div>
      )}

      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--color-border)' }}
      >
        {/* Table header */}
        {!loading && visible.length > 0 && (
          <div
            className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
            style={{ background: 'rgb(248,249,250)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
          >
            <span>Customer / Document</span>
            <span>Status</span>
            <span>Date</span>
            <span></span>
          </div>
        )}

        {loading && (
          <p className="text-sm text-center py-12" style={{ color: 'var(--color-muted)' }}>Loading…</p>
        )}

        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <FileText size={36} style={{ color: 'var(--color-border)' }} />
            <p className="text-sm font-medium mt-3" style={{ color: 'var(--color-muted)' }}>
              {search ? 'No documents match your search' : 'No documents yet'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>
              {search ? 'Try a different search term' : 'Documents appear here once orders are created'}
            </p>
          </div>
        )}

        {!loading && visible.map((doc) => (
          <div
            key={doc.id}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 py-3.5 border-b last:border-b-0 hover:bg-[rgb(248,249,250)] transition-colors"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${BLUE}12` }}
              >
                <FileText size={14} style={{ color: BLUE }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-navy-mid)' }}>
                  {doc.order.customer.name}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>
                  {DOC_TYPE_LABELS[doc.type] ?? doc.type} · {doc.filename}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <StatusPill status={doc.order.status} />
            </div>
            <span className="text-xs shrink-0" style={{ color: 'var(--color-muted)' }}>
              {formatDate(doc.createdAt)}
            </span>
            <button
              onClick={() => download(doc.id)}
              className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            >
              <Download size={12} /> Download
            </button>
          </div>
        ))}
      </div>

      {!loading && visible.length > 0 && (
        <p className="text-xs mt-3 text-right" style={{ color: 'var(--color-muted)' }}>
          {visible.length} document{visible.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
