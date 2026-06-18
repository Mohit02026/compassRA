// timeline: 'future' | 'soon' | 'active'
interface PanelCalendarProps {
  timeline: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DATES = [9, 10, 11, 12, 13, 14, 15]

const BARS: Record<string, { label: string; color: string; start: number; span: number }[]> = {
  future: [
    { label: 'Now', color: 'rgb(200,210,240)', start: 0, span: 1 },
    { label: 'Later', color: 'rgb(150,175,230)', start: 2, span: 2 },
    { label: 'Launch', color: '#3b60f3', start: 5, span: 2 },
  ],
  soon: [
    { label: 'Now', color: '#3b60f3', start: 0, span: 2 },
    { label: 'Launch', color: 'rgb(100,150,220)', start: 2, span: 3 },
    { label: 'Future', color: 'rgb(180,200,240)', start: 5, span: 2 },
  ],
  active: [
    { label: 'Started', color: 'rgb(34,197,94)', start: 0, span: 3 },
    { label: 'Now', color: '#3b60f3', start: 3, span: 4 },
  ],
}

export default function PanelCalendar({ timeline }: PanelCalendarProps) {
  const bars = BARS[timeline] ?? BARS.soon

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid rgb(230, 232, 236)',
        padding: 32,
        minHeight: 340,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Month label */}
      <p style={{ fontSize: 13, fontWeight: 600, color: 'rgb(50,50,50)', marginBottom: 16, fontFamily: 'var(--font-dm-sans)' }}>
        June 2026
      </p>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 20 }}>
        {/* Day headers */}
        {DAYS.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'rgb(140,140,140)', fontFamily: 'var(--font-dm-sans)', paddingBottom: 6, fontWeight: 500 }}>
            {d}
          </div>
        ))}
        {/* Date cells */}
        {DATES.map((date, i) => {
          const isToday = date === 12
          return (
            <div
              key={date}
              style={{
                textAlign: 'center',
                padding: '6px 0',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: isToday ? 700 : 400,
                color: isToday ? '#ffffff' : 'rgb(50,50,50)',
                background: isToday ? '#3b60f3' : 'transparent',
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              {date}
            </div>
          )
        })}
      </div>

      {/* Timeline bars */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bars.map((bar) => (
          <div key={bar.label} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, alignItems: 'center' }}>
            {/* Empty cells before bar */}
            {Array.from({ length: bar.start }).map((_, i) => (
              <div key={i} />
            ))}
            {/* Bar */}
            <div
              style={{
                gridColumn: `span ${bar.span}`,
                background: bar.color,
                borderRadius: 6,
                padding: '5px 8px',
                fontSize: 10,
                fontWeight: 600,
                color: bar.color === '#3b60f3' || bar.color === 'rgb(34,197,94)' ? '#ffffff' : 'rgb(60,80,160)',
                fontFamily: 'var(--font-dm-sans)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'all 0.3s ease',
              }}
            >
              {bar.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
