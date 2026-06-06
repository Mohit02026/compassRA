'use client'

import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'

interface ReminderItem {
  type: string
  sendAt: string
  sentAt: string | null
}

const REMINDER_LABELS: Record<string, string> = {
  '90day': '90 days before',
  '60day': '60 days before',
  '30day': '30 days before',
  '14day': '14 days before',
  '7day':  '7 days before',
  '3day':  '3 days before',
}

function getNextMayFirst(): Date {
  const now = new Date()
  const thisYear = new Date(now.getFullYear(), 4, 1)
  if (now <= thisYear) return thisYear
  return new Date(now.getFullYear() + 1, 4, 1)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderRadius: 16,
  border: '1px solid rgba(100,150,230,0.22)',
  boxShadow: '0 2px 12px rgba(14,42,120,0.07)',
  overflow: 'hidden',
}

export default function CalendarPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetch('/api/portal/reminders')
      .then((r) => r.json())
      .then((j) => { setReminders(j.data?.items ?? []); setLoading(false) })
  }, [])

  const dueDate = getNextMayFirst()
  const today = new Date()
  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000)
  const dueDateLabel = dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 24, color: 'oklch(0.20 0.08 245)', marginBottom: 4 }}>
          Compliance calendar
        </h1>
        <p style={{ fontSize: 14, color: 'oklch(0.42 0.07 245)' }}>
          Florida LLC annual report deadline and reminder schedule.
        </p>
      </div>

      {/* Deadline card */}
      <div style={{ ...card, padding: '24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, oklch(0.92 0.04 250) 0%, oklch(0.86 0.09 250) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(14,42,120,0.15)',
          }}>
            <Calendar size={20} style={{ color: 'oklch(0.42 0.16 250)' }} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'oklch(0.48 0.08 245)', marginBottom: 4 }}>
              Florida Annual Report Due
            </p>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 26, color: 'oklch(0.20 0.08 245)', marginBottom: 4 }}>
              {dueDateLabel}
            </p>
            <p style={{ fontSize: 13, color: 'oklch(0.48 0.06 245)' }}>
              {daysUntil > 0 ? `${daysUntil} day${daysUntil !== 1 ? 's' : ''} from today` : 'Due today'}
            </p>
          </div>
        </div>
      </div>

      {/* Reminder schedule */}
      <div style={card}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(100,150,230,0.18)' }}>
          <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 13.5, color: 'oklch(0.22 0.08 245)' }}>
            Reminder schedule
          </p>
        </div>

        {loading && <p style={{ fontSize: 13, color: 'oklch(0.50 0.06 245)', padding: '20px' }}>Loading…</p>}

        {!loading && reminders.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px', textAlign: 'center' }}>
            <Calendar size={32} style={{ color: 'rgba(14,42,120,0.22)', marginBottom: 10 }} />
            <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 14, color: 'oklch(0.26 0.08 245)', marginBottom: 4 }}>
              No upcoming deadlines
            </p>
            <p style={{ fontSize: 12.5, color: 'oklch(0.50 0.05 245)' }}>
              Reminders appear here once an annual report order is on file.
            </p>
          </div>
        )}

        {!loading && reminders.length > 0 && (
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(100,150,230,0.18)' }}>
                {['Reminder', 'Send date', 'Status'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 20px', textAlign: 'left', fontSize: 11,
                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                    color: 'oklch(0.50 0.06 245)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reminders.map((r) => (
                <tr key={`${r.type}-${r.sendAt}`} style={{ borderBottom: '1px solid rgba(100,150,230,0.12)' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 500, color: 'oklch(0.24 0.08 245)', fontFamily: 'var(--font-jakarta)' }}>
                    {REMINDER_LABELS[r.type] ?? r.type}
                  </td>
                  <td style={{ padding: '12px 20px', color: 'oklch(0.48 0.06 245)' }}>
                    {formatDate(r.sendAt)}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    {r.sentAt ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: 'oklch(0.94 0.06 145)', color: 'oklch(0.40 0.14 145)', border: '1px solid oklch(0.75 0.12 145)' }}>
                        Sent
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: 'rgba(14,42,120,0.06)', color: 'oklch(0.42 0.08 245)', border: '1px solid rgba(14,42,120,0.12)' }}>
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
