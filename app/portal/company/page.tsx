'use client'

import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { OrderStatus, ServiceType } from '@prisma/client'

interface CompanyData {
  businessName: string | null
  serviceType: ServiceType
  status: OrderStatus
  state: string
  dueDate: string | null
  flDocNumber: string | null
  ghlOpportunityId: string | null
}

function formatService(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDueDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex items-start justify-between py-3"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      <span className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
        {label}
      </span>
      <span
        className="text-sm font-medium text-right ml-4"
        style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
      >
        {value}
      </span>
    </div>
  )
}

export default function CompanyPage() {
  const [data, setData] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetch('/api/portal/company')
      .then((r) => r.json())
      .then((j) => {
        setData(j.data ?? null)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p className="text-sm text-gray-400">Loading…</p>
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center py-20">
        <Building2 className="text-gray-300" size={40} />
        <p className="text-sm font-medium text-gray-500 mt-3">No company on file yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Your company details will appear here once your order is created.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
        >
          Your company
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          LLC details and registered agent information.
        </p>
      </div>

      <div
        className="bg-white border rounded-xl p-5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h2
          className="text-base font-semibold mb-1"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
        >
          {data.businessName ?? '—'}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
          {formatService(data.serviceType)} · Florida LLC
        </p>

        <Row label="Status" value={<StatusPill status={data.status} />} />
        <Row label="State" value={data.state} />
        <Row label="Annual report due" value={formatDueDate(data.dueDate)} />
        <Row label="FL document number" value={data.flDocNumber ?? '—'} />
        <Row
          label="Registered agent"
          value={
            <span>
              Compass Registered Agent
              <br />
              <span className="font-normal text-xs" style={{ color: 'var(--color-muted)' }}>
                8 The Green Suite 300, Dover, DE 19901
              </span>
            </span>
          }
        />
        {data.ghlOpportunityId && (
          <div className="pt-3">
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Internal ref: {data.ghlOpportunityId}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
