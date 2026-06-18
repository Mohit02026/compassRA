import Link from 'next/link'

interface IntakeLayoutProps {
  children: React.ReactNode
  backHref?: string
  onBack?: () => void
  rightPanel?: React.ReactNode
  onClose?: string // href to navigate on X click
  wide?: boolean  // removes 560px max-width on content (e.g. plan selection step)
}

export default function IntakeLayout({
  children,
  backHref,
  onBack,
  rightPanel,
  onClose = '/',
  wide = false,
}: IntakeLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'rgb(241, 242, 243)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-dm-sans)',
      }}
    >
      {/* Top bar — centered logo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 64,
          background: 'rgb(241, 242, 243)',
          borderBottom: '1px solid rgb(220, 222, 226)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '2px solid #3b60f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <ellipse cx="10" cy="10" rx="7" ry="5.5" stroke="#3b60f3" strokeWidth="1.4" />
              <circle cx="10" cy="10" r="2" fill="#3b60f3" />
              <line x1="10" y1="2" x2="10" y2="5" stroke="#3b60f3" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="10" y1="15" x2="10" y2="18" stroke="#3b60f3" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="2" y1="10" x2="5" y2="10" stroke="#3b60f3" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="15" y1="10" x2="18" y2="10" stroke="#3b60f3" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', letterSpacing: '0.06em' }}>
              COMPASS
            </div>
            <div style={{ fontSize: 9, color: 'rgb(130,130,130)', letterSpacing: '0.05em', marginTop: 2 }}>
              Registered Agent ™
            </div>
          </div>
        </Link>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Back link */}
          <div style={{ paddingTop: 20, paddingBottom: 8 }}>
            {onBack ? (
              <button
                onClick={onBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'rgb(76, 76, 76)',
                  padding: 0,
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                ← Back
              </button>
            ) : backHref ? (
              <Link
                href={backHref}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 14,
                  color: 'rgb(76, 76, 76)',
                  textDecoration: 'none',
                }}
              >
                ← Back
              </Link>
            ) : null}
          </div>

          {/* Two-column layout */}
          <div
            className={rightPanel ? 'lg:grid lg:gap-12' : ''}
            style={{
              display: rightPanel ? undefined : 'block',
              gridTemplateColumns: '1fr 1fr',
              alignItems: 'start',
              paddingTop: 16,
            }}
          >
            {/* Left: form content */}
            <div style={{ maxWidth: rightPanel ? undefined : wide ? undefined : 560 }}>{children}</div>

            {/* Right: illustration panel */}
            {rightPanel && (
              <div className="hidden lg:block" style={{ position: 'sticky', top: 24 }}>
                {rightPanel}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blue footer bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 54,
          background: '#3b60f3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 24px',
          zIndex: 50,
        }}
      >
        <Link
          href={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: '#ffffff',
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </Link>
      </div>
    </div>
  )
}
