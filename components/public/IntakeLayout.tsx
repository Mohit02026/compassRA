import Link from 'next/link'

interface IntakeLayoutProps {
  children: React.ReactNode
  backHref?: string
  onBack?: () => void
  rightPanel?: React.ReactNode
  onClose?: string
  wide?: boolean
}

export default function IntakeLayout({
  children,
  backHref,
  onBack,
  rightPanel,
  wide = false,
}: IntakeLayoutProps) {
  const hasBack = !!(onBack || backHref)

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
      {/* Header — 57px, matches reference exactly */}
      <div
        className="px-5 md:px-20"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 57,
          background: 'rgb(241, 242, 243)',
          borderBottom: '1px solid rgb(228, 230, 234)',
          flexShrink: 0,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '2px solid #3b60f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
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
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', letterSpacing: '0.06em' }}>
              COMPASS
            </div>
            <div style={{ fontSize: 10, color: 'rgb(130,130,130)', letterSpacing: '0.05em', marginTop: 3 }}>
              Registered Agent ™
            </div>
          </div>
        </Link>

        <a
          href="tel:+17276163964"
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: 'rgb(59, 96, 243)',
            textDecoration: 'none',
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          +1 (727) 616-3964
        </a>
      </div>

      {/* Content area — extracted from compassregisteredagent.com .base-container
          { max-width:1440px; padding-inline:40px; margin-inline:auto } — padding INSIDE the max-width */}
      <div style={{ flex: 1, paddingBottom: 60 }}>
        <div className="px-5 md:px-10" style={{ maxWidth: 1440, margin: '0 auto' }}>

          {/* Back link — only renders when provided, no extra space otherwise */}
          {hasBack && (
            <div style={{ paddingTop: 24, paddingBottom: 4 }}>
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
              ) : (
                <Link
                  href={backHref!}
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
              )}
            </div>
          )}

          {/* Two-column layout — single column below lg; the two-track grid only
              applies at lg+ where the right panel is actually visible. Without this,
              CSS Grid still reserves ~50% width for the hidden right-panel track
              (equal-distribution of leftover space between un-maxed tracks), squeezing
              main content into half the viewport on mobile/tablet. */}
          <div
            className={rightPanel ? 'grid grid-cols-1 lg:[grid-template-columns:minmax(0,670px)_minmax(0,555px)] lg:justify-between' : ''}
            style={{
              display: rightPanel ? undefined : 'block',
              gap: 20,
              alignItems: 'start',
              paddingTop: 19,
            }}
          >
            <div style={{ maxWidth: rightPanel ? undefined : wide ? undefined : 600 }}>
              {children}
            </div>

            {rightPanel && (
              <div className="hidden lg:block" style={{ position: 'sticky', top: 32 }}>
                {rightPanel}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
