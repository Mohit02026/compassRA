'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Menu, X } from 'lucide-react'
import { PortalNavLinks } from '@/components/portal/PortalNavLinks'

export function PortalHeader({
  initials,
  signOutAction,
}: {
  initials: string
  signOutAction: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(200,220,248,0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(100,150,230,0.25)',
        boxShadow: '0 1px 16px rgba(14,42,120,0.08)',
      }}
    >
      <div
        className="px-5 md:px-8"
        style={{
          maxWidth: 1200, margin: '0 auto',
          height: 76,
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        {/* Logo */}
        <Link href="/portal/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.18 0.08 245) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(14,42,120,0.36)',
            flexShrink: 0,
          }}>
            <Building2 color="white" size={22} />
          </div>
          <span
            className="hidden sm:inline"
            style={{
              fontFamily: 'var(--font-jakarta)',
              fontWeight: 800, fontSize: 20,
              color: 'oklch(0.20 0.08 245)',
              letterSpacing: '-0.02em',
            }}
          >
            Compass
          </span>
        </Link>

        {/* Nav — hidden below lg, shown in mobile drawer instead */}
        <div className="hidden lg:block">
          <PortalNavLinks />
        </div>

        {/* Right: avatar + sign out — hidden below lg */}
        <div className="hidden lg:flex" style={{ marginLeft: 'auto', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, oklch(0.48 0.16 250) 0%, oklch(0.38 0.14 250) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: 'white',
            flexShrink: 0, fontFamily: 'var(--font-jakarta)',
            boxShadow: '0 3px 12px rgba(14,42,120,0.30)',
          }}>
            {initials}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              style={{
                fontSize: 14.5, padding: '10px 24px', borderRadius: 10,
                border: '1.5px solid rgba(80,130,220,0.44)',
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(8px)',
                color: 'oklch(0.24 0.09 245)',
                cursor: 'pointer',
                fontFamily: 'var(--font-jakarta)',
                fontWeight: 600,
                boxShadow: '0 2px 10px rgba(14,42,120,0.12)',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Hamburger toggle — below lg only */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex lg:hidden"
          style={{
            marginLeft: 'auto',
            width: 40, height: 40,
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.6)',
            border: '1.5px solid rgba(80,130,220,0.3)',
            borderRadius: 10,
            cursor: 'pointer',
            flexShrink: 0,
            color: 'oklch(0.24 0.09 245)',
          }}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile/tablet drawer */}
      {open && (
        <div
          className="lg:hidden"
          style={{
            borderTop: '1px solid rgba(100,150,230,0.25)',
            background: 'rgba(220,232,250,0.97)',
            padding: '16px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div onClick={() => setOpen(false)}>
            <PortalNavLinks vertical />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 16, borderTop: '1px solid rgba(100,150,230,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, oklch(0.48 0.16 250) 0%, oklch(0.38 0.14 250) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: 'white',
                fontFamily: 'var(--font-jakarta)',
              }}>
                {initials}
              </div>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                style={{
                  fontSize: 14, padding: '9px 18px', borderRadius: 10,
                  border: '1.5px solid rgba(80,130,220,0.44)',
                  background: 'rgba(255,255,255,0.88)',
                  color: 'oklch(0.24 0.09 245)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-jakarta)',
                  fontWeight: 600,
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
