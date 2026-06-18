interface PanelCertificateProps {
  businessName: string
}

export default function PanelCertificate({ businessName }: PanelCertificateProps) {
  const displayName = businessName.trim() || 'Your Company Name'

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
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Certificate card */}
      <div
        style={{
          width: '100%',
          maxWidth: 340,
          background: '#ffffff',
          border: '3px double rgb(200, 210, 235)',
          borderRadius: 12,
          padding: '28px 24px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(59,96,243,0.08)',
          position: 'relative',
        }}
      >
        {/* Corner decorations */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
          <div
            key={pos}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              border: '2px solid #3b60f3',
              borderRadius: 2,
              top: pos.includes('top') ? 8 : 'auto',
              bottom: pos.includes('bottom') ? 8 : 'auto',
              left: pos.includes('left') ? 8 : 'auto',
              right: pos.includes('right') ? 8 : 'auto',
              opacity: 0.4,
            }}
          />
        ))}

        {/* State seal placeholder */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '2px solid rgb(200,210,235)',
            background: 'rgb(240,244,255)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          🏛️
        </div>

        <p style={{ fontSize: 10, letterSpacing: '0.14em', color: 'rgb(130,130,130)', fontFamily: 'var(--font-dm-sans)', marginBottom: 8, textTransform: 'uppercase' }}>
          State of Florida
        </p>

        <p style={{ fontSize: 11, color: 'rgb(100,100,100)', fontFamily: 'var(--font-dm-sans)', marginBottom: 20 }}>
          Articles of Organization
        </p>

        {/* Business name — script style, updates live */}
        <p
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            fontSize: businessName.trim().length > 24 ? 18 : 24,
            fontWeight: 400,
            color: '#3b60f3',
            lineHeight: 1.3,
            minHeight: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'font-size 0.2s',
          }}
        >
          {displayName}
        </p>

        {/* Signature lines */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          {['Filed', 'Effective'].map((label) => (
            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: 1, background: 'rgb(210,215,225)', marginBottom: 6 }} />
              <p style={{ fontSize: 9, color: 'rgb(160,160,160)', fontFamily: 'var(--font-dm-sans)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* FL badge */}
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: 16,
            background: '#3b60f3',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 4,
            fontFamily: 'var(--font-dm-sans)',
            letterSpacing: '0.06em',
          }}
        >
          FL
        </div>
      </div>
    </div>
  )
}
