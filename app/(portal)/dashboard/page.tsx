'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, ChevronRight } from 'lucide-react'
import { StageTracker } from '@/components/ui/StageTracker'
import { StatusPill } from '@/components/ui/StatusPill'
import { OrderStatus } from '@prisma/client'

interface Order {
  id: string
  status: OrderStatus
  serviceType: string
  state: string
  totalAmount: string
  dueDate: string | null
  createdAt: string
  filedAt: string | null
  completedAt: string | null
  documents: { id: string }[]
}

function formatService(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PortalDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetch('/api/portal/orders')
      .then((r) => r.json())
      .then((j) => {
        setOrders(j.data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
        >
          Your filings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          Track each filing as it moves through the process.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-gray-400">Loading…</p>
      )}

      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center py-20">
          <FileText className="text-gray-300" size={40} />
          <p className="text-sm font-medium text-gray-500 mt-3">No filings yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your filings will appear here once your order is created.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/portal/orders/${order.id}`}
            className="block bg-white border rounded-xl p-5 hover:shadow-sm transition-shadow"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {/* Order header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p
                  className="font-semibold text-base"
                  style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
                >
                  {formatService(order.serviceType)}
                </p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {order.state}
                  {order.dueDate ? ` · Due ${formatDate(order.dueDate)}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={order.status} />
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Stage tracker */}
            <StageTracker status={order.status} />

            {/* Footer details */}
            <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--color-muted)' }}>
              <span>${Number(order.totalAmount).toFixed(2)} flat fee</span>
              {order.filedAt && <span>Filed {formatDate(order.filedAt)}</span>}
              {order.completedAt && <span>Completed {formatDate(order.completedAt)}</span>}
              {order.documents.length > 0 && (
                <span>{order.documents.length} document{order.documents.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
