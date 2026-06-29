'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, CheckCircle, AlertTriangle, RotateCcw, FileText, Download } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { OrderStatus, DocumentType } from '@prisma/client'

const BLUE = '#3B60F3'

interface Props { params: { id: string } }

const STAGE_ORDER: OrderStatus[] = ['INTAKE', 'DATA_QC', 'READY_TO_FILE', 'FILED', 'COMPLETED']

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatService(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function stageLabel(s: OrderStatus) {
  if (s === 'DATA_QC') return 'Data QC'
  if (s === 'READY_TO_FILE') return 'Ready to File'
  return s.charAt(0) + s.slice(1).toLowerCase()
}

function stageState(stage: OrderStatus, current: OrderStatus): 'completed' | 'active' | 'future' | 'exception' {
  if (current === 'EXCEPTION') {
    const si = STAGE_ORDER.indexOf(stage)
    const ci = STAGE_ORDER.indexOf('DATA_QC')
    if (si < ci) return 'completed'
    if (si === ci) return 'exception'
    return 'future'
  }
  const si = STAGE_ORDER.indexOf(stage)
  const ci = STAGE_ORDER.indexOf(current)
  if (si < ci) return 'completed'
  if (si === ci) return 'active'
  return 'future'
}

function StageTracker({ status }: { status: OrderStatus }) {
  return (
    <div
      className="bg-white rounded-xl p-4 mb-4 flex items-center"
      style={{ border: '1px solid var(--color-border)' }}
    >
      {STAGE_ORDER.map((stage, i) => {
        const state = stageState(stage, status)
        return (
          <div key={stage} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center mb-1.5 shrink-0"
                style={{
                  background: state === 'completed' ? '#dcfce7'
                    : state === 'active' ? BLUE
                    : state === 'exception' ? '#fed7aa'
                    : 'var(--color-border)',
                  border: state === 'active' ? `2px solid ${BLUE}` : '2px solid transparent',
                }}
              >
                {state === 'completed' && <CheckCircle size={14} style={{ color: '#16a34a' }} />}
                {state === 'active' && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                {state === 'exception' && <AlertTriangle size={12} style={{ color: '#ea580c' }} />}
                {state === 'future' && <span className="w-2 h-2 rounded-full bg-gray-300" />}
              </div>
              <span
                className="text-[11px] font-medium text-center whitespace-nowrap"
                style={{
                  color: state === 'completed' ? '#16a34a'
                    : state === 'active' ? BLUE
                    : state === 'exception' ? '#ea580c'
                    : 'var(--color-muted)',
                }}
              >
                {stageLabel(stage)}
              </span>
            </div>
            {i < STAGE_ORDER.length - 1 && (
              <div
                className="h-0.5 flex-shrink-0 mx-1"
                style={{
                  width: 24,
                  background: stageState(STAGE_ORDER[i + 1], status) === 'future' ? 'var(--color-border)' : '#86efac',
                }}
              />
            )}
          </div>
        )
      })}
      {status === 'EXCEPTION' && (
        <>
          <div className="h-0.5 w-6 mx-1 shrink-0" style={{ background: '#fdba74' }} />
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1.5 bg-orange-100">
              <AlertTriangle size={13} style={{ color: '#ea580c' }} />
            </div>
            <span className="text-[11px] font-medium text-orange-600">Exception</span>
          </div>
        </>
      )}
    </div>
  )
}

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 py-1.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{label}</span>
      <span className="text-xs font-medium text-right truncate max-w-[160px]" style={{ color: 'var(--color-navy-mid)' }}>
        {value}
      </span>
    </div>
  )
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
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--color-muted)' }}>
        Loading order…
      </div>
    )
  }
  if (!order) {
    return <div className="text-sm py-12" style={{ color: 'var(--color-muted)' }}>Order not found.</div>
  }

  const orderData: Record<string, string> = {}
  for (const row of order.orderData ?? []) orderData[row.key] = row.value

  const status: OrderStatus = order.status

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/ops/orders"
        className="inline-flex items-center gap-1.5 text-xs mb-5 hover:underline"
        style={{ color: 'var(--color-muted)' }}
      >
        <ArrowLeft size={13} /> Orders / {order.customer.name}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-inter)' }}>
            {orderData.businessName ?? order.customer.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            {order.customer.email} · {order.state} · {formatService(order.serviceType)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={status} />
          <span className="text-xl font-bold" style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-inter)' }}>
            ${Number(order.totalAmount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stage tracker */}
      <StageTracker status={status} />

      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {status === 'INTAKE' && (
          <button
            disabled={transitioning}
            onClick={() => transition(OrderStatus.DATA_QC)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ background: BLUE }}
          >
            <CheckCircle size={14} /> Move to Data QC
          </button>
        )}
        {status === 'DATA_QC' && (
          <>
            <button
              disabled={transitioning}
              onClick={() => transition(OrderStatus.READY_TO_FILE)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: BLUE }}
            >
              <CheckCircle size={14} /> Mark Ready to File
            </button>
            <button
              disabled={transitioning}
              onClick={() => setShowNote(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-50"
              style={{ borderColor: '#fbbf24', background: '#fffbeb', color: '#92400e' }}
            >
              <AlertTriangle size={14} className="text-amber-500" /> Flag Exception
            </button>
          </>
        )}
        {status === 'READY_TO_FILE' && (
          <>
            <button
              disabled={transitioning}
              onClick={() => transition(OrderStatus.FILED)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: BLUE }}
            >
              <CheckCircle size={14} /> Mark Filed
            </button>
            <button
              disabled={transitioning}
              onClick={() => setShowNote(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-50"
              style={{ borderColor: '#fbbf24', background: '#fffbeb', color: '#92400e' }}
            >
              <AlertTriangle size={14} className="text-amber-500" /> Flag Exception
            </button>
          </>
        )}
        {status === 'FILED' && (
          <>
            {(() => {
              const hasRequiredDoc = order.documents?.some((d: any) =>
                d.type === 'FILING_RECEIPT' || d.type === 'CERTIFICATE'
              )
              return (
                <>
                  <button
                    disabled={transitioning || !hasRequiredDoc}
                    onClick={() => transition(OrderStatus.COMPLETED)}
                    title={!hasRequiredDoc ? 'Upload a filing receipt or certificate first' : undefined}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: BLUE }}
                  >
                    <CheckCircle size={14} /> Mark Completed
                  </button>
                  {!hasRequiredDoc && (
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                      <AlertTriangle size={12} className="text-amber-500" />
                      Upload a filing receipt or certificate to enable
                    </span>
                  )}
                </>
              )
            })()}
            <label
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
              style={{ background: '#475569' }}
            >
              <Upload size={14} />
              {uploading ? 'Uploading…' : 'Upload Certificate'}
              <input type="file" accept=".pdf" className="hidden" data-doctype="CERTIFICATE" onChange={handleUpload} />
            </label>
            <button
              disabled={transitioning}
              onClick={() => setShowNote(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border"
              style={{ borderColor: '#fbbf24', background: '#fffbeb', color: '#92400e' }}
            >
              <AlertTriangle size={14} className="text-amber-500" /> Flag Exception
            </button>
          </>
        )}
        {status === 'EXCEPTION' && (
          <button
            disabled={transitioning}
            onClick={() => transition(OrderStatus.DATA_QC)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: BLUE }}
          >
            <RotateCcw size={14} /> Reopen to Data QC
          </button>
        )}
        {status !== 'COMPLETED' && (
          <label
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', background: 'white' }}
          >
            <Upload size={14} />
            {uploading ? 'Uploading…' : 'Upload Document'}
            <input type="file" accept=".pdf" className="hidden" data-doctype="FILING_RECEIPT" onChange={handleUpload} />
          </label>
        )}
      </div>

      {/* Exception note input */}
      {showNote && (
        <div
          className="mb-4 p-4 rounded-xl flex flex-col gap-3"
          style={{ background: '#fffbeb', border: '1px solid #fbbf24' }}
        >
          <label className="text-sm font-semibold text-amber-800">
            Exception note <span className="font-normal text-amber-700">(optional — sent to customer)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="text-sm rounded-lg px-3 py-2 outline-none resize-none"
            style={{ border: '1px solid #fbbf24', background: 'white' }}
            placeholder="E.g. Missing registered agent signature…"
          />
          <div className="flex gap-2">
            <button
              onClick={() => transition(OrderStatus.EXCEPTION)}
              disabled={transitioning}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-amber-500 text-white disabled:opacity-50"
            >
              Confirm Exception
            </button>
            <button
              onClick={() => { setShowNote(false); setNote('') }}
              className="px-4 py-1.5 text-sm rounded-lg border"
              style={{ borderColor: 'var(--color-border)', background: 'white', color: 'var(--color-muted)' }}
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
          <div
            className="bg-white rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)' }}
          >
            {/* Tab bar */}
            <div className="flex" style={{ borderBottom: '1px solid var(--color-border)', background: 'rgb(248,249,250)' }}>
              {(['documents', 'notes'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-5 py-3 text-sm font-medium capitalize transition-colors"
                  style={
                    activeTab === tab
                      ? { color: BLUE, borderBottom: `2px solid ${BLUE}`, marginBottom: -1, background: 'white' }
                      : { color: 'var(--color-muted)' }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === 'documents' && (
                <div>
                  {order.documents?.length === 0 && (
                    <div className="flex flex-col items-center py-12">
                      <FileText size={36} style={{ color: 'var(--color-border)' }} />
                      <p className="text-sm font-medium mt-3" style={{ color: 'var(--color-muted)' }}>No documents yet</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>
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
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${BLUE}12` }}
                      >
                        <FileText size={15} style={{ color: BLUE }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-navy-mid)' }}>
                          {DOC_TYPE_LABELS[doc.type as DocumentType] ?? doc.type}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                          {doc.filename} · {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadDoc(doc.id)}
                        className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                      >
                        <Download size={12} /> Download
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  {order.internalNotes ? (
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-navy-mid)' }}>
                      {order.internalNotes}
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No internal notes.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
              Order Details
            </p>
            <div>
              <Row label="Order ID" value={order.id.slice(0, 8) + '…'} />
              <Row label="Service" value={formatService(order.serviceType)} />
              <Row label="Tier" value={order.tier} />
              <Row label="State" value={order.state} />
              <Row label="Payment" value={order.paymentStatus ?? '—'} />
              <Row label="Due Date" value={formatDate(order.dueDate)} />
              <Row label="Filed At" value={formatDate(order.filedAt)} />
              <Row label="Completed" value={formatDate(order.completedAt)} />
            </div>
            <div className="mt-3 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="flex justify-between py-1.5">
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Service Fee</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-navy-mid)' }}>
                  ${Number(orderData.serviceFee ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>State Fee</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-navy-mid)' }}>
                  ${Number(orderData.stateFee ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 mt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-navy-mid)' }}>Total</span>
                <span className="text-sm font-bold" style={{ color: BLUE }}>
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
              Business Info
            </p>
            <div>
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
