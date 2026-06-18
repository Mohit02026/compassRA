export default function PanelRAInfo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* "Why recommended" card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid rgb(230, 232, 236)',
          padding: 24,
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 700, color: 'rgb(30,30,30)', marginBottom: 10, fontFamily: 'var(--font-dm-sans)' }}>
          Why is this recommended?
        </p>
        <p style={{ fontSize: 13, color: 'rgb(80,80,80)', lineHeight: 1.65, fontFamily: 'var(--font-dm-sans)' }}>
          Over 95% of our customers appoint us as their Registered Agent, and many say the top benefit is privacy protection and peace of mind.
        </p>
        <button
          style={{
            marginTop: 14,
            fontSize: 13,
            fontWeight: 600,
            color: '#3b60f3',
            border: '1.5px solid #3b60f3',
            borderRadius: 8,
            padding: '8px 16px',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          Learn more
        </button>
      </div>

      {/* Compass RA visual card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid rgb(230, 232, 236)',
          padding: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative circles */}
        <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', border: '1.5px solid rgb(220,228,248)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', border: '1.5px solid rgb(210,220,244)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

        {/* Center compass icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#3b60f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 20 20" fill="none">
            <ellipse cx="10" cy="10" rx="7" ry="5.5" stroke="#fff" strokeWidth="1.4" />
            <circle cx="10" cy="10" r="2" fill="#fff" />
            <line x1="10" y1="2" x2="10" y2="5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="10" y1="15" x2="10" y2="18" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="2" y1="10" x2="5" y2="10" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="15" y1="10" x2="18" y2="10" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        {/* Orbit icons */}
        {[
          { angle: 0,   emoji: '📄', label: 'Legal notices' },
          { angle: 72,  emoji: '🏛️', label: 'State filings' },
          { angle: 144, emoji: '🔒', label: 'Privacy' },
          { angle: 216, emoji: '📬', label: 'Mail handling' },
          { angle: 288, emoji: '✅', label: 'Compliance' },
        ].map(({ angle, emoji }) => {
          const rad = ((angle - 90) * Math.PI) / 180
          const r = 90
          const x = 50 + (r / 2) * Math.cos(rad)
          const y = 50 + (r / 2) * Math.sin(rad)
          return (
            <div
              key={angle}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgb(240, 244, 255)',
                border: '1px solid rgb(210, 220, 248)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              {emoji}
            </div>
          )
        })}
      </div>
    </div>
  )
}
