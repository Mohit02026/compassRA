'use client'

import { useEffect, useState } from 'react'
import { Bell, Download } from 'lucide-react'

interface NoticeItem {
  id: string
  filename: string
  receivedAt: string
  forwardedAt: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    void fetch('/api/portal/notices')
      .then((r) => r.json())
      .then((j) => {
        setNotices(j.data?.items ?? [])
        setLoading(false)
      })
  }, [])

  async function download(id: string, filename: string) {
    setDownloading(id)
    try {
      const res = await fetch(`/api/portal/notices/${id}/url`)
      const json = await res.json()
      if (json.data?.url) {
        const a = document.createElement('a')
        a.href = json.data.url
        a.download = filename
        a.click()
      }
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
        >
          Legal notices
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          Notices forwarded to your registered agent.
        </p>
      </div>

      <div
        className="bg-white border rounded-xl overflow-hidden"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {loading && (
          <p className="text-sm text-gray-400 px-5 py-6">Loading…</p>
        )}

        {!loading && notices.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <Bell className="text-gray-300" size={40} />
            <p className="text-sm font-medium text-gray-500 mt-3">No legal notices</p>
            <p className="text-xs text-gray-400 mt-1">
              Notices forwarded to your registered agent appear here.
            </p>
          </div>
        )}

        {!loading && notices.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Document', 'Received', 'Status', ''].map((h, i) => (
                  <th
                    key={i}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr
                  key={notice.id}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="px-5 py-3">
                    <p className="font-medium" style={{ color: 'var(--color-navy-mid)' }}>
                      {notice.filename}
                    </p>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--color-muted)' }}>
                    {formatDate(notice.receivedAt)}
                  </td>
                  <td className="px-5 py-3">
                    {notice.forwardedAt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[--color-completed-bg] text-[--color-completed-text] border border-[--color-completed-border]">
                        Forwarded
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[--color-intake-bg] text-[--color-intake-text] border border-[--color-intake-border]">
                        Received
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => void download(notice.id, notice.filename)}
                      disabled={downloading === notice.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors hover:bg-gray-50 disabled:opacity-50"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-navy-mid)' }}
                    >
                      <Download size={13} />
                      {downloading === notice.id ? 'Downloading…' : 'Download'}
                    </button>
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
