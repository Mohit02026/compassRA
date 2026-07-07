'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const NAV_LINKS = [
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Blog', href: '/blog' },
]

export default function PublicNav() {
  const [open, setOpen] = useState(false)

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
          paddingLeft: 20,
          paddingRight: 20,
          display: 'flex',
          height: 57,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        className="md:px-10"
      >
        {/* Logo */}
        <Link href="/" aria-label="Go to the main page" style={{ flexShrink: 0, display: 'block', lineHeight: 0 }}>
          <Image
            src="/compass-logo.svg"
            alt="Compass Registered Agent"
            width={215}
            height={57}
            priority
            className="h-auto w-[150px] md:w-[215px]"
          />
        </Link>

        {/* Center: Nav links — hidden below md, shown in mobile drawer instead */}
        <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map(({ label, href }) => (
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

        {/* Right: Phone + Sign in — phone hidden below md */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a
            href="tel:+17276163964"
            className="hidden md:inline"
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
            className="hidden md:flex"
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: '#ffffff',
              border: '0.8px solid rgb(255, 255, 255)',
              borderRadius: 8,
              padding: '14px 24px',
              textDecoration: 'none',
              lineHeight: '16px',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
            }}
          >
            Sign in
          </Link>

          {/* Hamburger toggle — mobile/tablet only */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex md:hidden"
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 8,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden"
          style={{
            margin: '8px 20px 0',
            background: 'rgb(15,23,42)',
            borderRadius: 12,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={{ fontSize: 16, fontWeight: 500, color: '#ffffff', textDecoration: 'none' }}
            >
              {label}
            </a>
          ))}
          <a
            href="tel:+17276163964"
            style={{ fontSize: 16, fontWeight: 500, color: '#ffffff', textDecoration: 'none' }}
          >
            +1 (727) 616-3964
          </a>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: '#ffffff',
              border: '0.8px solid rgb(255, 255, 255)',
              borderRadius: 8,
              padding: '12px 20px',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Sign in
          </Link>
        </div>
      )}
    </header>
  )
}
