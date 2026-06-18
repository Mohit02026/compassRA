import Link from 'next/link'

export default function PublicNav() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'transparent',
        fontFamily: 'var(--font-dm-sans)',
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: 40,
          paddingRight: 40,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          height: 57,
          alignItems: 'stretch',
        }}
      >
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <ellipse cx="10" cy="10" rx="7" ry="5.5" stroke="white" strokeWidth="1.4" />
                <circle cx="10" cy="10" r="2" fill="white" />
                <line x1="10" y1="2" x2="10" y2="5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="10" y1="15" x2="10" y2="18" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="2" y1="10" x2="5" y2="10" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="15" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <span style={{ fontWeight: 700, fontSize: 14, color: '#ffffff', letterSpacing: '0.05em' }}>
                COMPASS
              </span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em' }}>
                Registered Agent ™
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Pricing', href: '#pricing' },
            { label: 'FAQ', href: '#faq' },
            { label: 'Blog', href: '/blog' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 400,
                textDecoration: 'none',
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right: Phone + Sign in */}
        <div className="flex items-center justify-end gap-4">
          <a
            href="tel:+17276163964"
            className="hidden md:block"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
            }}
          >
            +1 (727) 616-3964
          </a>
          <Link
            href="/login"
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: '#ffffff',
              border: '0.8px solid rgb(255,255,255)',
              borderRadius: 8,
              padding: '14px 24px',
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}
