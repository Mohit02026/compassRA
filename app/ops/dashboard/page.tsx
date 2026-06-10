'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { OrderStatus } from '@prisma/client'

interface Stats {
  total: number
  overdue: number
  byStatus: Record<string, number>
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  iconColor,
}: {
  label: string
  value: number
  sub?: string
  icon: React.ReactNode
  iconColor: string
}) {
  return (
    <div
      className="bg-white border rounded-lg p-5"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {label}
        </span>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <p className="text-3xl font-bold mt-2" style={{ color: 'var(--color-navy-mid)' }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
          {sub}
        </p>
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          Pipeline overview
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Orders"
          value={stats?.total ?? 0}
          sub="all time"
          icon={<FileText size={20} />}
          iconColor="var(--color-blue)"
        />
        <KpiCard
          label="In Progress"
          value={(by.INTAKE ?? 0) + (by.DATA_QC ?? 0) + (by.READY_TO_FILE ?? 0) + (by.FILED ?? 0)}
          sub="intake + in progress + filed"
          icon={<Clock size={20} />}
          iconColor="#f59e0b"
        />
        <KpiCard
          label="Exceptions"
          value={by.EXCEPTION ?? 0}
          sub="need attention"
          icon={<AlertTriangle size={20} />}
          iconColor="#ef4444"
        />
        <KpiCard
          label="Completed"
          value={by.COMPLETED ?? 0}
          sub="all time"
          icon={<CheckCircle size={20} />}
          iconColor="#22c55e"
        />
      </div>

      {/* Pipeline count cards */}
      <div className="mb-6">
        <h2
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--color-muted)' }}
        >
          Pipeline
        </h2>
        <div className="grid grid-cols-5 gap-3">
          {PIPELINE_STAGES.map((stage) => (
            <Link
              key={stage}
              href={`/ops/orders?status=${stage}`}
              className="bg-white border rounded-lg p-4 text-center hover:shadow-sm transition-shadow"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--color-navy-mid)' }}
              >
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
          className="flex items-center gap-3 p-4 border rounded-lg bg-orange-50"
          style={{ borderColor: '#fbbf24' }}
        >
          <AlertTriangle className="text-orange-500 shrink-0" size={18} />
          <p className="text-sm text-orange-800">
            <span className="font-semibold">{stats?.overdue}</span>{' '}
            {stats?.overdue === 1 ? 'order is' : 'orders are'} past due date.{' '}
            <Link href="/ops/orders" className="underline">
              View orders →
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
