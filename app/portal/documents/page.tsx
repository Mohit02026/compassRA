'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, Lock } from 'lucide-react'
import { OrderStatus, DocumentType } from '@prisma/client'

const OPS_INTERNAL_TYPES: DocumentType[] = ['FILING_SHEET', 'SS4_DRAFT'] as DocumentType[]

const DOC_TYPE_LABELS: Partial<Record<DocumentType, string>> = {
  ARTICLES_OF_ORG:    'Articles of Organization',
  OPERATING_AGREEMENT:'Operating Agreement',
  EIN_CONFIRMATION:   'EIN Confirmation',
  FILING_RECEIPT:     'Filing Receipt',
  CERTIFICATE:        'Certificate of Status',
  PAYMENT_INVOICE:    'Payment Invoice',
  LEGAL_NOTICE:       'Legal Notice',
}

interface DocItem {
  id: string
  type: DocumentType
  filename: string
  createdAt: string
  order: { id: string; status: OrderStatus; serviceType: string; state: string }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatService(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderRadius: 16,
  border: '1px solid rgba(100,150,230,0.22)',
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(14,42,120,0.07)',
}

export default function PortalDocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetch('/api/portal/orders')
      .then((r) => r.json())
      .then((j) => {
        const orders: any[] = j.data ?? []
        const allDocs: DocItem[] = orders.flatMap((o: any) =>
          (o.documents ?? [])
            .filter((d: any) => !OPS_INTERNAL_TYPES.includes(d.type))
            .map((d: any) => ({ ...d, order: { id: o.id, status: o.status, serviceType: o.serviceType, state: o.state } }))
        )
        setDocs(allDocs)
        setLoading(false)
      })
  }, [])

  async function download(docId: string) {
    const res = await fetch(`/api/documents/${docId}/url`)
    const json = await res.json()
    if (json.data?.url) window.open(json.data.url, '_blank')
    else alert(json.error?.message ?? 'Unable to download')
  }

  const availableDocs = docs.filter((d) => d.order.status === OrderStatus.COMPLETED)
  const lockedDocs    = docs.filter((d) => d.order.status !== OrderStatus.COMPLETED)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 24, color: 'oklch(0.20 0.08 245)', marginBottom: 4 }}>
          Documents
        </h1>
        <p style={{ fontSize: 14, color: 'oklch(0.42 0.07 245)' }}>
          Download your filing documents once your order is completed.
        </p>
      </div>

      {loading && <p style={{ fontSize: 14, color: 'oklch(0.50 0.06 245)' }}>Loading…</p>}

      {!loading && docs.length === 0 && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 32px', textAlign: 'center' }}>
          <FileText size={36} style={{ color: 'rgba(14,42,120,0.25)', marginBottom: 12 }} />
          <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 15, color: 'oklch(0.26 0.08 245)', marginBottom: 6 }}>
            No documents yet
          </p>
          <p style={{ fontSize: 13, color: 'oklch(0.48 0.06 245)' }}>
            Documents appear here once your filing is processed.
          </p>
        </div>
      )}

      {/* Available */}
      {!loading && availableDocs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'oklch(0.42 0.08 245)', marginBottom: 10 }}>
            Ready to download
          </p>
          <div style={card}>
            {availableDocs.map((doc, i) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  borderBottom: i < availableDocs.length - 1 ? '1px solid rgba(100,150,230,0.15)' : 'none',
                }}
              >
                <FileText size={18} style={{ color: 'oklch(0.50 0.16 250)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 13.5, color: 'oklch(0.22 0.08 245)', marginBottom: 2 }}>
                    {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                  </p>
                  <p style={{ fontSize: 12, color: 'oklch(0.50 0.05 245)' }}>
                    {formatService(doc.order.serviceType)} · {doc.order.state} · {formatDate(doc.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => download(doc.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 13, fontWeight: 600,
                    fontFamily: 'var(--font-jakarta)',
                    background: 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.20 0.07 245) 100%)',
                    color: 'white', border: 'none', borderRadius: 8,
                    padding: '7px 14px', cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(14,42,120,0.28)',
                  }}
                >
                  <Download size={13} /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {!loading && lockedDocs.length > 0 && (
        <div style={{ opacity: 0.65 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'oklch(0.42 0.08 245)', marginBottom: 10 }}>
            Pending filing completion
          </p>
          <div style={card}>
            {lockedDocs.map((doc, i) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  borderBottom: i < lockedDocs.length - 1 ? '1px solid rgba(100,150,230,0.15)' : 'none',
                }}
              >
                <FileText size={18} style={{ color: 'rgba(14,42,120,0.25)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 13.5, color: 'oklch(0.40 0.06 245)', marginBottom: 2 }}>
                    {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                  </p>
                  <p style={{ fontSize: 12, color: 'oklch(0.55 0.04 245)' }}>
                    {formatService(doc.order.serviceType)} · {doc.order.state}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'oklch(0.52 0.05 245)' }}>
                  <Lock size={12} /> Available once completed
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
