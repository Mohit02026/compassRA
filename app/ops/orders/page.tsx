'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, FileText } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { OrderStatus } from '@prisma/client'

const STATUS_FILTERS = ['All', 'INTAKE', 'REVIEW', 'FILED', 'COMPLETED', 'EXCEPTION'] as const
type Filter = (typeof STATUS_FILTERS)[number]

interface OrderRow {
  id: string
  status: OrderStatus
  serviceType: string
  state: string
  totalAmount: string
  dueDate: string | null
  createdAt: string
  customer: {
    name: string
    email: string
  }
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
  const diff = Date.now() - new Date(dueDate).getTime()
  return Math.floor(diff / 86400000)
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)' }}>
            Orders
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
            All filings across all customers
          </p>
        </div>
        <Link
          href="/ops/orders/new"
          className="px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--color-navy)' }}
        >
          + New Order
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === f
                ? 'text-white'
                : 'border text-gray-600 hover:bg-gray-50'
            }`}
            style={
              filter === f
                ? { backgroundColor: 'var(--color-navy)', borderColor: 'transparent' }
                : { borderColor: 'var(--color-border)' }
            }
          >
            {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search by customer, email, or order ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-md border outline-none focus:ring-2"
          style={{
            borderColor: 'var(--color-border)',
            ['--tw-ring-color' as string]: 'var(--color-blue)',
          }}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden border"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <table className="w-full text-sm bg-white">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['BUSINESS', 'SERVICE', 'STATE', 'STATUS', 'DUE DATE', 'AMOUNT'].map((h) => (
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
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <FileText className="text-gray-300" size={40} />
                    <p className="text-sm font-medium text-gray-500 mt-3">No orders found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {filter !== 'All' ? 'Try a different filter' : 'Create your first order above'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {!loading &&
              visible.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  onClick={() => { window.location.href = `/ops/orders/${order.id}` }}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      {order.customer.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatService(order.serviceType)}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{order.state}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-700">{formatDate(order.dueDate)}</span>
                    {order.dueDate && isDue(order.dueDate) && order.status !== 'COMPLETED' && (
                      <p className="text-xs text-orange-500 mt-0.5">
                        {daysOverdue(order.dueDate)}d overdue
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ${Number(order.totalAmount).toFixed(2)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
