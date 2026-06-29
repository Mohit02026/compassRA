'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Clock, AlertTriangle, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { OrderStatus } from '@prisma/client'

const BLUE = '#3B60F3'

interface Stats {
  total: number
  overdue: number
  byStatus: Record<string, number>
}

function KpiCard({
  label, value, sub, icon, accent,
}: {
  label: string
  value: number
  sub?: string
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div
      className="bg-white rounded-xl p-5 flex flex-col gap-1"
      style={{ border: '1px solid var(--color-border)', borderTop: `3px solid ${accent}` }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
          {label}
        </span>
        <span
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: `${accent}18` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </span>
      </div>
      <p className="text-3xl font-bold" style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-inter)' }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{sub}</p>
      )}
    </div>
  )
}

const PIPELINE_STAGES: OrderStatus[] = ['INTAKE', 'DATA_QC', 'READY_TO_FILE', 'FILED', 'COMPLETED', 'EXCEPTION']

export default function OpsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    void fetch('/api/orders/stats')
      .then((r) => r.json())
      .then((j) => setStats(j.data))
  }, [])

  const by = stats?.byStatus ?? {}
  const inProgress = (by.INTAKE ?? 0) + (by.DATA_QC ?? 0) + (by.READY_TO_FILE ?? 0) + (by.FILED ?? 0)

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-inter)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
            Pipeline overview · all orders
          </p>
        </div>
        <Link
          href="/ops/orders/new"
          className="flex items-center gap-2 text-sm font-medium text-white rounded-lg px-4 py-2"
          style={{ background: BLUE }}
        >
          + New Order
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        <KpiCard
          label="Total Orders"
          value={stats?.total ?? 0}
          sub="all time"
          icon={<FileText size={16} />}
          accent={BLUE}
        />
        <KpiCard
          label="In Progress"
          value={inProgress}
          sub="active in pipeline"
          icon={<TrendingUp size={16} />}
          accent="#f59e0b"
        />
        <KpiCard
          label="Exceptions"
          value={by.EXCEPTION ?? 0}
          sub="need attention"
          icon={<AlertTriangle size={16} />}
          accent="#ef4444"
        />
        <KpiCard
          label="Completed"
          value={by.COMPLETED ?? 0}
          sub="all time"
          icon={<CheckCircle size={16} />}
          accent="#22c55e"
        />
      </div>

      {/* Pipeline breakdown */}
      <div
        className="bg-white rounded-xl p-5 mb-5"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-inter)' }}>
            Pipeline
          </h2>
          <Link
            href="/ops/orders"
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: BLUE }}
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {PIPELINE_STAGES.map((stage) => (
            <Link
              key={stage}
              href={`/ops/orders?status=${stage}`}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:shadow-sm transition-shadow"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-inter)' }}>
                {by[stage] ?? 0}
              </p>
              <StatusPill status={stage} />
            </Link>
          ))}
        </div>
      </div>

      {/* Overdue alert */}
      {(stats?.overdue ?? 0) > 0 && (
        <div
          className="flex items-center justify-between gap-3 p-4 rounded-xl"
          style={{ background: '#fff7ed', border: '1px solid #fbbf24' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-orange-500" />
            </div>
            <p className="text-sm text-orange-800">
              <span className="font-semibold">{stats?.overdue}</span>{' '}
              {stats?.overdue === 1 ? 'order is' : 'orders are'} past due date.
            </p>
          </div>
          <Link
            href="/ops/orders"
            className="flex items-center gap-1 text-sm font-medium text-orange-700 shrink-0"
          >
            View orders <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  )
}
