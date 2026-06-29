import Link from 'next/link'
import Image from 'next/image'

export default function PublicNav() {
  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '15px 0',
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
          display: 'flex',
          height: 57,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" aria-label="Go to the main page" style={{ flexShrink: 0, display: 'block', lineHeight: 0 }}>
          <Image
            src="/compass-logo.svg"
            alt="Compass Registered Agent"
            width={215}
            height={57}
            priority
          />
        </Link>

        {/* Center: Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { label: 'Pricing', href: '/#pricing' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Blog', href: '/blog' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: '#ffffff',
                textDecoration: 'none',
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right: Phone + Sign in */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a
            href="tel:+17276163964"
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: '#ffffff',
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
              border: '0.8px solid rgb(255, 255, 255)',
              borderRadius: 8,
              padding: '14px 24px',
              textDecoration: 'none',
              lineHeight: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}
