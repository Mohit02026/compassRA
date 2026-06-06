import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Building2 } from 'lucide-react'
import Link from 'next/link'
import { signOutAction } from '@/app/actions'
import { PortalNavLinks } from '@/components/portal/PortalNavLinks'

function RosePaths() {
  return (
    <>
      <path d="M0,-132 L16,-16 L0,132 L-16,-16 Z" />
      <path d="M132,0 L16,16 L-132,0 L16,-16 Z" />
      <path d="M0,-132 L10,-10 L96,-96 Z" opacity="0.55" />
      <path d="M132,0 L10,-10 L96,-96 Z" opacity="0.55" />
      <path d="M132,0 L10,10 L96,96 Z" opacity="0.55" />
      <path d="M0,132 L10,10 L96,96 Z" opacity="0.55" />
      <path d="M0,132 L-10,10 L-96,96 Z" opacity="0.55" />
      <path d="M-132,0 L-10,10 L-96,96 Z" opacity="0.55" />
      <path d="M-132,0 L-10,-10 L-96,-96 Z" opacity="0.55" />
      <path d="M0,-132 L-10,-10 L-96,-96 Z" opacity="0.55" />
      <circle cx="0" cy="0" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="0" cy="0" r="8" />
      <circle cx="0" cy="0" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
      <circle cx="0" cy="0" r="88" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="0" cy="0" r="138" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="7 5" />
      <text x="0" y="-148" textAnchor="middle" fontSize="18" fontWeight="900" fontFamily="Georgia, serif">N</text>
      <text x="0" y="164"  textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Georgia, serif">S</text>
      <text x="152" y="6"  textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Georgia, serif">E</text>
      <text x="-152" y="6" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Georgia, serif">W</text>
    </>
  )
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const initials = session.user.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <div style={{
      position: 'relative',
      minHeight: '100dvh',
      background: 'linear-gradient(145deg, #DDE8F8 0%, #D2E0F6 45%, #C6D8F4 100%)',
      fontFamily: 'var(--font-dm)',
    }}>

      {/* ── Fixed decorative background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>

        {/* Navy glow — top-left */}
        <div style={{
          position: 'absolute', top: -160, left: -120, width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(18,60,165,0.16) 0%, transparent 62%)',
          borderRadius: '50%',
        }} />

        {/* Blue glow — bottom-right */}
        <div style={{
          position: 'absolute', bottom: -120, right: -100, width: 740, height: 740,
          background: 'radial-gradient(circle, rgba(14,48,140,0.14) 0%, transparent 62%)',
          borderRadius: '50%',
        }} />

        {/* Primary compass rose — right */}
        <svg
          style={{
            position: 'absolute', top: '6%', right: '-3%',
            width: 520, height: 520,
            color: 'rgba(14,42,120,0.11)',
            overflow: 'visible',
          }}
          viewBox="-150 -150 300 300" fill="currentColor"
        >
          <RosePaths />
        </svg>

        {/* Secondary compass rose — bottom-left */}
        <svg
          style={{
            position: 'absolute', bottom: '-8%', left: '-6%',
            width: 340, height: 340,
            color: 'rgba(14,42,120,0.08)',
            overflow: 'visible',
            transform: 'rotate(22deg)',
          }}
          viewBox="-150 -150 300 300" fill="currentColor"
        >
          <RosePaths />
        </svg>

        {/* Floating document 1 — upper-right */}
        <div style={{
          position: 'absolute', top: '8%', right: '20%',
          width: 160, height: 210,
          background: 'rgba(255,255,255,0.55)',
          border: '1.5px solid rgba(80,130,220,0.30)',
          borderRadius: 4,
          transform: 'rotate(6deg)',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 22px, rgba(40,80,200,0.09) 22px, rgba(40,80,200,0.09) 23px)',
          boxShadow: '0 8px 28px rgba(14,42,120,0.12)',
        }} />

        {/* Floating document 2 — mid-left */}
        <div style={{
          position: 'absolute', top: '40%', left: '-1%',
          width: 130, height: 172,
          background: 'rgba(255,255,255,0.45)',
          border: '1px solid rgba(80,130,220,0.25)',
          borderRadius: 4,
          transform: 'rotate(-10deg)',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 20px, rgba(40,80,200,0.07) 20px, rgba(40,80,200,0.07) 21px)',
          boxShadow: '0 6px 20px rgba(14,42,120,0.09)',
        }} />

        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(14,42,120,0.13) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      {/* ── Sticky glass header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(200,220,248,0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(100,150,230,0.25)',
        boxShadow: '0 1px 16px rgba(14,42,120,0.08)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 32px', height: 76,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
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
            <span style={{
              fontFamily: 'var(--font-jakarta)',
              fontWeight: 800, fontSize: 20,
              color: 'oklch(0.20 0.08 245)',
              letterSpacing: '-0.02em',
            }}>
              Compass
            </span>
          </Link>

          {/* Nav */}
          <PortalNavLinks />

          {/* Right: avatar + sign out */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
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
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '36px 32px 80px' }}>
        {children}
      </main>
    </div>
  )
}
