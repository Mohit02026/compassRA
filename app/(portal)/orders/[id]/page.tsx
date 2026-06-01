'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Download, Lock } from 'lucide-react'
import { StageTracker } from '@/components/ui/StageTracker'
import { StatusPill } from '@/components/ui/StatusPill'
import { OrderStatus, DocumentType } from '@prisma/client'

interface Props {
  params: { id: string }
}

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  FILING_SHEET: 'Filing Sheet',
  ARTICLES_OF_ORG: 'Articles of Organization',
  OPERATING_AGREEMENT: 'Operating Agreement',
  EIN_CONFIRMATION: 'EIN Confirmation',
  FILING_RECEIPT: 'Filing Receipt',
  CERTIFICATE: 'Certificate of Status',
}

function formatService(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PortalOrderDetailPage({ params }: Props) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetch(`/api/portal/orders/${params.id}`)
      .then((r) => r.json())
      .then((j) => {
        setOrder(j.data)
        setLoading(false)
      })
  }, [params.id])

  async function download(docId: string) {
    const res = await fetch(`/api/documents/${docId}/url`)
    const json = await res.json()
    if (json.data?.url) {
      window.open(json.data.url, '_blank')
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
  }
  if (!order) {
    return <div className="text-sm text-gray-500 py-12">Order not found.</div>
  }

  const isCompleted = order.status === OrderStatus.COMPLETED
  const orderData: Record<string, string> = {}
  for (const row of order.orderData ?? []) {
    orderData[row.key] = row.value
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/portal/dashboard"
        className="flex items-center gap-1.5 text-sm mb-4 hover:underline"
        style={{ color: 'var(--color-muted)' }}
      >
        <ArrowLeft size={14} /> Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
          >
            {formatService(order.serviceType)}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {order.state}
            {order.dueDate ? ` · Due ${formatDate(order.dueDate)}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={order.status} />
          <span className="text-lg font-bold" style={{ color: 'var(--color-navy-mid)' }}>
            ${Number(order.totalAmount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stage tracker */}
      <StageTracker status={order.status} className="mb-4" />

      {/* Exception notice */}
      {order.status === 'EXCEPTION' && (
        <div className="mb-4 p-4 border rounded-lg bg-orange-50" style={{ borderColor: '#fbbf24' }}>
          <p className="text-sm font-medium text-orange-800">
            There's a hold on your filing — our team will reach out shortly. No action needed from you unless we contact you.
          </p>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex gap-4 items-start">
        {/* Left — documents */}
        <div className="flex-1 min-w-0">
          <div
            className="bg-white border rounded-xl overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <p
                className="text-sm font-semibold"
                style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
              >
                Documents
              </p>
            </div>

            {order.documents?.length === 0 && (
              <div className="flex flex-col items-center py-12">
                <FileText className="text-gray-300" size={40} />
                <p className="text-sm font-medium text-gray-500 mt-3">No documents yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your documents will appear here once filed.
                </p>
              </div>
            )}

            {order.documents?.map((doc: any) => {
              const locked = !isCompleted
              return (
                <div
                  key={doc.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b last:border-b-0 ${
                    locked ? 'opacity-50' : 'hover:bg-gray-50'
                  } transition-colors`}
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <FileText
                    className="shrink-0"
                    size={20}
                    style={{ color: locked ? '#9ca3af' : 'var(--color-blue)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {DOC_TYPE_LABELS[doc.type as DocumentType] ?? doc.type}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      {doc.filename}
                    </p>
                  </div>
                  {locked ? (
                    <div
                      className="flex items-center gap-1 text-xs text-gray-400"
                      title="Available once your filing is completed"
                    >
                      <Lock size={13} />
                      <span>Locked</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => download(doc.id)}
                      className="flex items-center gap-1 text-sm font-medium hover:underline"
                      style={{ color: 'var(--color-blue)' }}
                    >
                      <Download size={14} /> Download
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {!isCompleted && order.documents?.length > 0 && (
            <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
              Documents unlock once your filing is marked completed.
            </p>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-3">
          <div
            className="bg-white border rounded-xl p-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p
              className="text-sm font-semibold mb-3"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
            >
              Filing details
            </p>
            <div className="space-y-2.5 text-sm">
              <Row label="Service" value={formatService(order.serviceType)} />
              <Row label="State" value={order.state} />
              <Row label="Due date" value={formatDate(order.dueDate)} />
              {order.filedAt && <Row label="Filed on" value={formatDate(order.filedAt)} />}
              {order.completedAt && (
                <Row label="Completed" value={formatDate(order.completedAt)} />
              )}
              <hr style={{ borderColor: 'var(--color-border)' }} />
              <Row
                label="Service fee"
                value={`$${Number(orderData.serviceFee ?? 0).toFixed(2)}`}
              />
              <Row
                label="State fee"
                value={`$${Number(orderData.stateFee ?? 0).toFixed(2)}`}
              />
              <div className="flex justify-between font-semibold">
                <span className="text-gray-700">Total</span>
                <span style={{ color: 'var(--color-blue)' }}>
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {orderData.addOns && orderData.addOns !== '' && (
            <div
              className="bg-white border rounded-xl p-4"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
              >
                Add-ons
              </p>
              <ul className="text-sm space-y-1" style={{ color: 'var(--color-muted)' }}>
                {orderData.addOns.split(',').map((addon) => (
                  <li key={addon}>· {addon.trim()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
        {label}
      </span>
      <span className="text-xs font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}
