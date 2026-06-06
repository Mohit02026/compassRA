'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, ChevronRight, Clock } from 'lucide-react'
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
  businessName?: string
}

function formatService(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PortalDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetch('/api/portal/orders')
      .then((r) => r.json())
      .then((j) => { setOrders(j.data ?? []); setLoading(false) })
  }, [])

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 24,
          color: 'oklch(0.20 0.08 245)', marginBottom: 4,
        }}>
          Your filings
        </h1>
        <p style={{ fontSize: 14, color: 'oklch(0.42 0.07 245)' }}>
          Track each filing as it moves through the process.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          color: 'oklch(0.45 0.08 245)', fontSize: 14, paddingTop: 24,
        }}>
          <Clock size={15} className="animate-spin" />
          Loading…
        </div>
      )}

      {/* Empty state */}
      {!loading && orders.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '64px 32px',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: 18,
          border: '1px solid rgba(100,150,230,0.25)',
          boxShadow: '0 4px 24px rgba(14,42,120,0.08)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, oklch(0.92 0.04 250) 0%, oklch(0.88 0.07 250) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
            boxShadow: '0 4px 12px rgba(14,42,120,0.14)',
          }}>
            <FileText size={22} style={{ color: 'oklch(0.42 0.14 250)' }} />
          </div>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 15,
            color: 'oklch(0.26 0.08 245)', marginBottom: 6,
          }}>
            No filings yet
          </p>
          <p style={{ fontSize: 13, color: 'oklch(0.48 0.06 245)', maxWidth: 300 }}>
            Your filings appear here once an order is created. Ready to get started?
          </p>
          <Link
            href="/llc"
            style={{
              display: 'inline-block', marginTop: 20,
              background: 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.20 0.07 245) 100%)',
              color: 'white', padding: '10px 22px', borderRadius: 10,
              fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-jakarta)', textDecoration: 'none',
              boxShadow: '0 4px 16px oklch(0.22 0.06 245 / 0.35)',
            }}
          >
            Start a filing →
          </Link>
        </div>
      )}

      {/* Orders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/portal/orders/${order.id}`}
            style={{
              display: 'block',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              borderRadius: 16,
              border: '1px solid rgba(100,150,230,0.22)',
              padding: '22px 24px',
              textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(14,42,120,0.07)',
              transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(14,42,120,0.13)'
              e.currentTarget.style.borderColor = 'rgba(80,130,220,0.40)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(14,42,120,0.07)'
              e.currentTarget.style.borderColor = 'rgba(100,150,230,0.22)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.85)'
            }}
          >
            {/* Order header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 16,
                  color: 'oklch(0.22 0.08 245)', marginBottom: 4,
                }}>
                  {order.businessName ?? formatService(order.serviceType)}
                </p>
                <p style={{ fontSize: 13, color: 'oklch(0.45 0.07 245)' }}>
                  {formatService(order.serviceType)} · {order.state}
                  {order.dueDate ? (
                    <span style={{ color: 'oklch(0.50 0.14 60)', fontWeight: 500 }}>
                      {' '}· Due {formatDate(order.dueDate)}
                    </span>
                  ) : null}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusPill status={order.status} />
                <ChevronRight size={15} style={{ color: 'oklch(0.60 0.06 245)' }} />
              </div>
            </div>

            {/* Stage tracker */}
            <StageTracker status={order.status} />

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16, marginTop: 16,
              paddingTop: 14, borderTop: '1px solid rgba(100,150,230,0.18)',
              fontSize: 12, color: 'oklch(0.50 0.05 245)',
            }}>
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontWeight: 700,
                fontSize: 13,
                color: 'oklch(0.36 0.12 250)',
                background: 'rgba(14,42,120,0.06)',
                padding: '3px 10px', borderRadius: 6,
                border: '1px solid rgba(14,42,120,0.10)',
              }}>
                ${Number(order.totalAmount).toFixed(2)} flat fee
              </span>
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
