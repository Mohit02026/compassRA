'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, FileText, Plus } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { OrderStatus } from '@prisma/client'

const BLUE = '#3B60F3'

const STATUS_FILTERS = ['All', 'INTAKE', 'DATA_QC', 'READY_TO_FILE', 'FILED', 'COMPLETED', 'EXCEPTION'] as const
type Filter = (typeof STATUS_FILTERS)[number]

interface OrderRow {
  id: string
  status: OrderStatus
  serviceType: string
  state: string
  totalAmount: string
  dueDate: string | null
  createdAt: string
  customer: { name: string; email: string }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatService(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function isDue(dueDate: string | null) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

function daysOverdue(dueDate: string) {
  return Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000)
}

function filterLabel(f: Filter) {
  if (f === 'All') return 'All'
  if (f === 'DATA_QC') return 'Data QC'
  if (f === 'READY_TO_FILE') return 'Ready to File'
  return f.charAt(0) + f.slice(1).toLowerCase()
}

export default function OpsOrdersPage() {
  const [filter, setFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (filter !== 'All') params.set('status', filter)
    const res = await fetch(`/api/orders?${params}`)
    const json = await res.json()
    setOrders(json.data?.items ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => { void fetchOrders() }, [fetchOrders])

  const visible = orders.filter((o) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-inter)' }}>
            Orders
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
            All filings across all customers
          </p>
        </div>
        <Link
          href="/ops/orders/new"
          className="flex items-center gap-2 text-sm font-medium text-white rounded-lg px-4 py-2"
          style={{ background: BLUE }}
        >
          <Plus size={15} /> New Order
        </Link>
      </div>

      {/* Toolbar */}
      <div
        className="bg-white rounded-xl p-4 mb-4"
        style={{ border: '1px solid var(--color-border)' }}
      >
        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={
                filter === f
                  ? { background: BLUE, color: '#fff' }
                  : { background: 'transparent', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }
              }
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--color-muted)' }} />
          <input
            type="text"
            placeholder="Search by customer, email, or order ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition-shadow focus:shadow-sm"
            style={{ border: '1px solid var(--color-border)', background: 'rgb(248,249,250)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgb(248,249,250)' }}>
              {['Business', 'Service', 'State', 'Status', 'Due Date', 'Amount'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <FileText size={36} style={{ color: 'var(--color-border)' }} />
                    <p className="text-sm font-medium mt-3" style={{ color: 'var(--color-muted)' }}>No orders found</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>
                      {filter !== 'All' ? 'Try a different filter' : 'Create your first order above'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {!loading && visible.map((order) => (
              <tr
                key={order.id}
                className="cursor-pointer transition-colors hover:bg-[rgb(248,249,250)]"
                style={{ borderBottom: '1px solid var(--color-border)' }}
                onClick={() => { window.location.href = `/ops/orders/${order.id}` }}
              >
                <td className="px-4 py-3.5">
                  <p className="font-medium" style={{ color: 'var(--color-navy-mid)' }}>{order.customer.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{order.customer.email}</p>
                </td>
                <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-muted)' }}>
                  {formatService(order.serviceType)}
                </td>
                <td className="px-4 py-3.5 text-sm font-semibold" style={{ color: 'var(--color-navy-mid)' }}>
                  {order.state}
                </td>
                <td className="px-4 py-3.5">
                  <StatusPill status={order.status} />
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm" style={{ color: isDue(order.dueDate) && order.status !== 'COMPLETED' ? '#ef4444' : 'var(--color-muted)' }}>
                    {formatDate(order.dueDate)}
                  </span>
                  {order.dueDate && isDue(order.dueDate) && order.status !== 'COMPLETED' && (
                    <p className="text-xs text-red-400 mt-0.5">{daysOverdue(order.dueDate)}d overdue</p>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-semibold" style={{ color: 'var(--color-navy-mid)' }}>
                  ${Number(order.totalAmount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && visible.length > 0 && (
        <p className="text-xs mt-3 text-right" style={{ color: 'var(--color-muted)' }}>
          {visible.length} order{visible.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
