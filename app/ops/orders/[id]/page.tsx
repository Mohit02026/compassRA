'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, CheckCircle, AlertTriangle, RotateCcw, FileText, Download } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { OrderStatus, DocumentType } from '@prisma/client'

interface Props {
  params: { id: string }
}

const STAGE_ORDER: OrderStatus[] = ['INTAKE', 'DATA_QC', 'READY_TO_FILE', 'FILED', 'COMPLETED']

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatService(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function stageState(
  stage: OrderStatus,
  current: OrderStatus
): 'completed' | 'active' | 'future' | 'exception' {
  if (current === 'EXCEPTION') {
    const stageIdx = STAGE_ORDER.indexOf(stage)
    const currentIdx = STAGE_ORDER.indexOf('DATA_QC')
    if (stageIdx < currentIdx) return 'completed'
    if (stageIdx === currentIdx) return 'exception'
    return 'future'
  }
  const stageIdx = STAGE_ORDER.indexOf(stage)
  const currentIdx = STAGE_ORDER.indexOf(current)
  if (stageIdx < currentIdx) return 'completed'
  if (stageIdx === currentIdx) return 'active'
  return 'future'
}

function StageTracker({ status }: { status: OrderStatus }) {
  return (
    <div
      className="w-full border rounded-lg p-4 mb-4 bg-white flex items-center gap-2 flex-wrap"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {STAGE_ORDER.map((stage, i) => {
        const state = stageState(stage, status)
        return (
          <div key={stage} className="flex items-center gap-2">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 ${
                state === 'completed'
                  ? 'border-green-500 text-green-700 bg-green-50'
                  : state === 'active'
                  ? 'text-white border-transparent'
                  : state === 'exception'
                  ? 'border-orange-400 text-orange-700 bg-orange-50'
                  : 'border-gray-200 text-gray-400 bg-white'
              }`}
              style={state === 'active' ? { backgroundColor: 'var(--color-navy)' } : {}}
            >
              {stage === 'DATA_QC' ? 'Data QC' : stage === 'READY_TO_FILE' ? 'Ready to File' : stage.charAt(0) + stage.slice(1).toLowerCase()}
            </span>
            {i < STAGE_ORDER.length - 1 && (
              <span className="text-gray-300 text-sm select-none">——</span>
            )}
          </div>
        )
      })}
      {status === 'EXCEPTION' && (
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm select-none">——</span>
          <span className="px-4 py-1.5 rounded-full text-sm font-medium border-2 border-orange-400 text-orange-700 bg-orange-50">
            Exception
          </span>
        </div>
      )}
    </div>
  )
}

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  FILING_SHEET:       'Filing Sheet',
  SS4_DRAFT:          'SS-4 Draft',
  ARTICLES_OF_ORG:    'Articles of Organization',
  OPERATING_AGREEMENT:'Operating Agreement',
  EIN_CONFIRMATION:   'EIN Confirmation',
  FILING_RECEIPT:     'Filing Receipt',
  CERTIFICATE:        'Certificate of Status',
  PAYMENT_INVOICE:    'Payment Invoice',
  LEGAL_NOTICE:       'Legal Notice',
}

export default function OpsOrderDetailPage({ params }: Props) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'documents' | 'notes'>('documents')

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${params.id}`)
    const json = await res.json()
    setOrder(json.data)
    setLoading(false)
  }, [params.id])

  useEffect(() => { void fetchOrder() }, [fetchOrder])

  async function transition(toStatus: OrderStatus) {
    setTransitioning(true)
    await fetch(`/api/orders/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: toStatus, note: note || undefined }),
    })
    setNote('')
    setShowNote(false)
    await fetchOrder()
    setTransitioning(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const typeStr = (e.target.dataset.doctype ?? '') as DocumentType
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('orderId', params.id)
    fd.append('type', typeStr)
    await fetch('/api/documents', { method: 'POST', body: fd })
    await fetchOrder()
    setUploading(false)
  }

  async function downloadDoc(docId: string) {
    const res = await fetch(`/api/documents/${docId}/url`)
    const json = await res.json()
    window.open(json.data?.url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-gray-400">
        Loading order…
      </div>
    )
  }
  if (!order) {
    return <div className="text-sm text-gray-500 py-12">Order not found.</div>
  }

  const orderData: Record<string, string> = {}
  for (const row of order.orderData ?? []) {
    orderData[row.key] = row.value
  }

  const status: OrderStatus = order.status

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/ops/orders"
        className="flex items-center gap-1.5 text-sm mb-4 hover:underline"
        style={{ color: 'var(--color-muted)' }}
      >
        <ArrowLeft size={14} /> Orders / {order.customer.name}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)' }}>
            {orderData.businessName ?? order.customer.name}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {order.customer.email} · {order.state} · {formatService(order.serviceType)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={status} />
          <span className="text-xl font-bold" style={{ color: 'var(--color-navy-mid)' }}>
            ${Number(order.totalAmount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stage tracker */}
      <StageTracker status={status} />

      {/* Action buttons — one per legal transition */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {status === 'INTAKE' && (
          <button
            disabled={transitioning}
            onClick={() => transition(OrderStatus.DATA_QC)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-navy)' }}
          >
            <CheckCircle size={14} /> Move to Data QC
          </button>
        )}
        {status === 'DATA_QC' && (
          <>
            <button
              disabled={transitioning}
              onClick={() => transition(OrderStatus.READY_TO_FILE)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-navy)' }}
            >
              <CheckCircle size={14} /> Mark Ready to File
            </button>
            <button
              disabled={transitioning}
              onClick={() => setShowNote(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border disabled:opacity-50"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <AlertTriangle size={14} className="text-orange-500" /> Flag Exception
            </button>
          </>
        )}
        {status === 'READY_TO_FILE' && (
          <>
            <button
              disabled={transitioning}
              onClick={() => transition(OrderStatus.FILED)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-navy)' }}
            >
              <CheckCircle size={14} /> Mark Filed
            </button>
            <button
              disabled={transitioning}
              onClick={() => setShowNote(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border disabled:opacity-50"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <AlertTriangle size={14} className="text-orange-500" /> Flag Exception
            </button>
          </>
        )}
        {status === 'FILED' && (
          <>
            {/* Require filing receipt or certificate before completing */}
            {(() => {
              const hasRequiredDoc = order.documents?.some((d: any) =>
                d.type === 'FILING_RECEIPT' || d.type === 'CERTIFICATE'
              )
              return (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    disabled={transitioning || !hasRequiredDoc}
                    onClick={() => transition(OrderStatus.COMPLETED)}
                    title={!hasRequiredDoc ? 'Upload a filing receipt or certificate first' : undefined}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--color-navy)' }}
                  >
                    <CheckCircle size={14} /> Mark Completed
                  </button>
                  {!hasRequiredDoc && (
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                      <AlertTriangle size={12} className="text-amber-500" />
                      Upload a filing receipt or certificate to enable
                    </span>
                  )}
                </div>
              )
            })()}
            <label
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white cursor-pointer"
              style={{ backgroundColor: 'var(--color-navy-light)' }}
            >
              <Upload size={14} />
              {uploading ? 'Uploading…' : 'Upload Certificate'}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                data-doctype="CERTIFICATE"
                onChange={handleUpload}
              />
            </label>
            <button
              disabled={transitioning}
              onClick={() => setShowNote(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <AlertTriangle size={14} className="text-orange-500" /> Flag Exception
            </button>
          </>
        )}
        {status === 'EXCEPTION' && (
          <button
            disabled={transitioning}
            onClick={() => transition(OrderStatus.DATA_QC)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-navy)' }}
          >
            <RotateCcw size={14} /> Reopen to Data QC
          </button>
        )}

        {/* Generic upload for any doc type */}
        {status !== 'COMPLETED' && (
          <label
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Upload size={14} />
            {uploading ? 'Uploading…' : 'Upload Document'}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              data-doctype="FILING_RECEIPT"
              onChange={handleUpload}
            />
          </label>
        )}
      </div>

      {/* Exception note input */}
      {showNote && (
        <div
          className="mb-4 p-4 border rounded-lg bg-orange-50 flex flex-col gap-2"
          style={{ borderColor: '#fbbf24' }}
        >
          <label className="text-sm font-medium text-orange-800">
            Exception note (optional — sent to customer)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="text-sm border rounded-md px-3 py-2 outline-none"
            style={{ borderColor: 'var(--color-border)' }}
            placeholder="E.g. Missing registered agent signature…"
          />
          <div className="flex gap-2">
            <button
              onClick={() => transition(OrderStatus.EXCEPTION)}
              disabled={transitioning}
              className="px-4 py-1.5 text-sm font-medium rounded-md bg-orange-500 text-white disabled:opacity-50"
            >
              Confirm Exception
            </button>
            <button
              onClick={() => { setShowNote(false); setNote('') }}
              className="px-4 py-1.5 text-sm rounded-md border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Two-column body */}
      <div className="flex gap-4 items-start">
        {/* Left — tabs */}
        <div className="flex-1 min-w-0">
          <div className="flex border-b mb-0" style={{ borderColor: 'var(--color-border)' }}>
            {(['documents', 'notes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 -mb-px'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={
                  activeTab === tab
                    ? { borderColor: 'var(--color-navy)', color: 'var(--color-navy)' }
                    : {}
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <div
            className="border border-t-0 rounded-b-lg p-4 bg-white"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {activeTab === 'documents' && (
              <div>
                {order.documents?.length === 0 && (
                  <div className="flex flex-col items-center py-12">
                    <FileText className="text-gray-300" size={40} />
                    <p className="text-sm font-medium text-gray-500 mt-3">No documents yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Filing sheet generates automatically on order creation
                    </p>
                  </div>
                )}
                {order.documents?.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 py-3 border-b last:border-b-0"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <FileText className="shrink-0" size={20} style={{ color: 'var(--color-blue)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {DOC_TYPE_LABELS[doc.type as DocumentType] ?? doc.type}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                        {doc.filename} · {formatDate(doc.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadDoc(doc.id)}
                      className="shrink-0 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="text-sm text-gray-500">
                {order.internalNotes ? (
                  <p className="whitespace-pre-wrap">{order.internalNotes}</p>
                ) : (
                  <p className="text-gray-400">No internal notes.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div
            className="border rounded-lg p-4 bg-white"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-navy-mid)' }}>
              Order Details
            </p>
            <div className="space-y-2 text-sm">
              <Row label="Order ID" value={order.id.slice(0, 8) + '…'} />
              <Row label="Service" value={formatService(order.serviceType)} />
              <Row label="Tier" value={order.tier} />
              <Row label="State" value={order.state} />
              <Row label="Payment" value={order.paymentStatus ?? '—'} />
              <Row label="Due Date" value={formatDate(order.dueDate)} />
              <Row label="Filed At" value={formatDate(order.filedAt)} />
              <Row label="Completed" value={formatDate(order.completedAt)} />
              <hr style={{ borderColor: 'var(--color-border)' }} />
              <Row label="Service Fee" value={`$${Number(orderData.serviceFee ?? 0).toFixed(2)}`} />
              <Row label="State Fee" value={`$${Number(orderData.stateFee ?? 0).toFixed(2)}`} />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span style={{ color: 'var(--color-blue)' }}>
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div
            className="border rounded-lg p-4 bg-white"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-navy-mid)' }}>
              Business Info
            </p>
            <div className="space-y-2 text-sm">
              <Row label="Contact" value={order.customer.name} />
              <Row label="Email" value={order.customer.user?.email ?? '—'} />
              <Row label="Phone" value={order.customer.phone ?? '—'} />
              {orderData.principalAddress && (
                <Row label="Principal Address" value={orderData.principalAddress} />
              )}
              {orderData.organizerName && (
                <Row label="Organizer" value={orderData.organizerName} />
              )}
              {orderData.addOns && orderData.addOns !== '' && (
                <Row label="Add-ons" value={orderData.addOns} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span style={{ color: 'var(--color-muted)' }} className="text-xs">{label}</span>
      <span className="text-right text-xs font-medium text-gray-900 truncate max-w-[160px]">
        {value}
      </span>
    </div>
  )
}
