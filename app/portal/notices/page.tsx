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
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
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

export default function NoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    void fetch('/api/portal/notices')
      .then((r) => r.json())
      .then((j) => { setNotices(j.data?.items ?? []); setLoading(false) })
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
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 24, color: 'oklch(0.20 0.08 245)', marginBottom: 4 }}>
          Legal notices
        </h1>
        <p style={{ fontSize: 14, color: 'oklch(0.42 0.07 245)' }}>
          Notices forwarded to your registered agent.
        </p>
      </div>

      <div style={card}>
        {loading && <p style={{ fontSize: 13, color: 'oklch(0.50 0.06 245)', padding: '20px' }}>Loading…</p>}

        {!loading && notices.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 32px', textAlign: 'center' }}>
            <Bell size={36} style={{ color: 'rgba(14,42,120,0.22)', marginBottom: 12 }} />
            <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 14, color: 'oklch(0.26 0.08 245)', marginBottom: 4 }}>
              No legal notices
            </p>
            <p style={{ fontSize: 12.5, color: 'oklch(0.50 0.05 245)' }}>
              Notices forwarded to your registered agent appear here.
            </p>
          </div>
        )}

        {!loading && notices.length > 0 && (
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(100,150,230,0.18)' }}>
                {['Document', 'Received', 'Status', ''].map((h, i) => (
                  <th key={i} style={{
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
              {notices.map((notice) => (
                <tr key={notice.id} style={{ borderBottom: '1px solid rgba(100,150,230,0.12)' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600, color: 'oklch(0.24 0.08 245)', fontFamily: 'var(--font-jakarta)' }}>
                    {notice.filename}
                  </td>
                  <td style={{ padding: '12px 20px', color: 'oklch(0.48 0.06 245)' }}>
                    {formatDate(notice.receivedAt)}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    {notice.forwardedAt ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: 'oklch(0.94 0.06 145)', color: 'oklch(0.40 0.14 145)', border: '1px solid oklch(0.75 0.12 145)' }}>
                        Forwarded
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: 'oklch(0.94 0.04 250)', color: 'oklch(0.45 0.14 250)', border: '1px solid oklch(0.80 0.08 250)' }}>
                        Received
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => void download(notice.id, notice.filename)}
                      disabled={downloading === notice.id}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 12.5, fontWeight: 600,
                        fontFamily: 'var(--font-jakarta)',
                        background: downloading === notice.id
                          ? 'rgba(14,42,120,0.06)'
                          : 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.20 0.07 245) 100%)',
                        color: downloading === notice.id ? 'oklch(0.42 0.08 245)' : 'white',
                        border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer',
                        boxShadow: downloading === notice.id ? 'none' : '0 2px 8px rgba(14,42,120,0.25)',
                        opacity: downloading === notice.id ? 0.7 : 1,
                      }}
                    >
                      <Download size={12} />
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
