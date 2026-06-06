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
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderRadius: 16,
  border: '1px solid rgba(100,150,230,0.22)',
  boxShadow: '0 2px 12px rgba(14,42,120,0.07)',
  padding: '24px',
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid rgba(100,150,230,0.15)',
    }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'oklch(0.48 0.06 245)' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', marginLeft: 16, color: 'oklch(0.24 0.08 245)', fontFamily: 'var(--font-jakarta)' }}>
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
      .then((j) => { setData(j.data ?? null); setLoading(false) })
  }, [])

  if (loading) return <p style={{ fontSize: 14, color: 'oklch(0.50 0.06 245)' }}>Loading…</p>

  if (!data) return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 32px', textAlign: 'center' }}>
      <Building2 size={36} style={{ color: 'rgba(14,42,120,0.22)', marginBottom: 12 }} />
      <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 15, color: 'oklch(0.26 0.08 245)', marginBottom: 6 }}>
        No company on file yet
      </p>
      <p style={{ fontSize: 13, color: 'oklch(0.48 0.06 245)' }}>
        Your company details will appear here once your order is created.
      </p>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 24, color: 'oklch(0.20 0.08 245)', marginBottom: 4 }}>
          Your company
        </h1>
        <p style={{ fontSize: 14, color: 'oklch(0.42 0.07 245)' }}>
          LLC details and registered agent information.
        </p>
      </div>

      <div style={card}>
        {/* Company name + badge */}
        <div style={{ marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid rgba(100,150,230,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.18 0.08 245) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(14,42,120,0.28)', flexShrink: 0,
            }}>
              <Building2 color="white" size={18} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 17, color: 'oklch(0.20 0.08 245)', marginBottom: 2 }}>
                {data.businessName ?? '—'}
              </p>
              <p style={{ fontSize: 12.5, color: 'oklch(0.48 0.06 245)' }}>
                {formatService(data.serviceType)} · Florida LLC
              </p>
            </div>
          </div>
        </div>

        <Row label="Filing status" value={<StatusPill status={data.status} />} />
        <Row label="State" value={data.state} />
        <Row label="Annual report due" value={formatDueDate(data.dueDate)} />
        <Row label="FL document number" value={data.flDocNumber ?? '—'} />
        <Row
          label="Registered agent"
          value={
            <span>
              Compass Registered Agent
              <br />
              <span style={{ fontWeight: 400, fontSize: 11.5, color: 'oklch(0.52 0.05 245)' }}>
                625 Court St Ste 100, Clearwater, FL 33756
              </span>
            </span>
          }
        />

        {data.ghlOpportunityId && (
          <div style={{ paddingTop: 14, fontSize: 11.5, color: 'oklch(0.58 0.04 245)' }}>
            Internal ref: {data.ghlOpportunityId}
          </div>
        )}
      </div>
    </div>
  )
}
