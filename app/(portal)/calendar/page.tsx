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
  '7day': '7 days before',
  '3day': '3 days before',
}

function getNextMayFirst(): Date {
  const now = new Date()
  const thisYear = new Date(now.getFullYear(), 4, 1) // May = month 4
  if (now <= thisYear) return thisYear
  return new Date(now.getFullYear() + 1, 4, 1)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function CalendarPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetch('/api/portal/reminders')
      .then((r) => r.json())
      .then((j) => {
        setReminders(j.data?.items ?? [])
        setLoading(false)
      })
  }, [])

  const dueDate = getNextMayFirst()
  const today = new Date()
  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000)

  const dueDateLabel = dueDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
        >
          Compliance calendar
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          Florida LLC annual report deadline and reminder schedule.
        </p>
      </div>

      {/* Deadline card */}
      <div
        className="bg-white border rounded-xl p-6 mb-6"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
            style={{ backgroundColor: 'var(--color-intake-bg)' }}
          >
            <Calendar size={20} style={{ color: 'var(--color-blue)' }} />
          </div>
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-wide mb-1"
              style={{ color: 'var(--color-muted)' }}
            >
              Florida Annual Report Due
            </p>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
            >
              {dueDateLabel}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              {daysUntil > 0
                ? `${daysUntil} day${daysUntil !== 1 ? 's' : ''} from today`
                : 'Due today'}
            </p>
          </div>
        </div>
      </div>

      {/* Reminder schedule */}
      <div
        className="bg-white border rounded-xl overflow-hidden"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p
            className="text-sm font-semibold"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
          >
            Reminder schedule
          </p>
        </div>

        {loading && (
          <p className="text-sm text-gray-400 px-5 py-6">Loading…</p>
        )}

        {!loading && reminders.length === 0 && (
          <div className="flex flex-col items-center py-14">
            <Calendar className="text-gray-300" size={36} />
            <p className="text-sm font-medium text-gray-500 mt-3">No upcoming deadlines</p>
            <p className="text-xs text-gray-400 mt-1">
              Reminders appear here once an annual report order is on file.
            </p>
          </div>
        )}

        {!loading && reminders.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Reminder', 'Send date', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reminders.map((r) => (
                <tr
                  key={`${r.type}-${r.sendAt}`}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--color-navy-mid)' }}>
                    {REMINDER_LABELS[r.type] ?? r.type}
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--color-muted)' }}>
                    {formatDate(r.sendAt)}
                  </td>
                  <td className="px-5 py-3">
                    {r.sentAt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[--color-completed-bg] text-[--color-completed-text] border border-[--color-completed-border]">
                        Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
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
