import Link from 'next/link'
import { Building2 } from 'lucide-react'

// Compass rose SVG inner paths — the brand symbol.
// Used at different scales/opacities across public pages.
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

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        // Blue theme — matches the dark navy landing page in lighter form.
        // Cooler blue-slate gradient rather than warm cream.
        background: 'linear-gradient(145deg, #DDE8F8 0%, #D2E0F6 45%, #C6D8F4 100%)',
        fontFamily: 'var(--font-dm)',
      }}
    >

      {/* ─────────────────────────────────────────────────────────
          Fixed decorative background layer.
          Blue-themed: navy/blue tones only, no amber.
          Compass rose = brand identity.
          Floating paper docs = the service (filing documents).
          Notary seal rings = authority + trust.
      ───────────────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>

        {/* Deep navy glow — top-left */}
        <div style={{
          position: 'absolute', top: -160, left: -120, width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(18,60,165,0.22) 0%, transparent 62%)',
          borderRadius: '50%',
        }} />

        {/* Lighter blue glow — bottom-right */}
        <div style={{
          position: 'absolute', bottom: -120, right: -100, width: 740, height: 740,
          background: 'radial-gradient(circle, rgba(14,48,140,0.18) 0%, transparent 62%)',
          borderRadius: '50%',
        }} />

        {/* Mid accent — centre */}
        <div style={{
          position: 'absolute', top: '30%', left: '35%',
          width: 440, height: 440,
          background: 'radial-gradient(circle, rgba(30,80,200,0.10) 0%, transparent 65%)',
          borderRadius: '50%',
        }} />

        {/* ── Primary compass rose — centre-right, 580px ── */}
        <svg
          style={{
            position: 'absolute', top: '4%', right: '-4%',
            width: 580, height: 580,
            color: 'rgba(14,42,120,0.13)',
            overflow: 'visible',
          }}
          viewBox="-150 -150 300 300"
          fill="currentColor"
        >
          <RosePaths />
        </svg>

        {/* ── Secondary compass rose — bottom-left, rotated ── */}
        <svg
          style={{
            position: 'absolute', bottom: '-10%', left: '-8%',
            width: 380, height: 380,
            color: 'rgba(14,42,120,0.09)',
            overflow: 'visible',
            transform: 'rotate(22deg)',
          }}
          viewBox="-150 -150 300 300"
          fill="currentColor"
        >
          <RosePaths />
        </svg>

        {/* ── Floating document 1 — upper-right ──
            White paper with navy ruled lines. Angled like papers on a desk. */}
        <div style={{
          position: 'absolute', top: '5%', right: '22%',
          width: 210, height: 278,
          background: 'rgba(255,255,255,0.62)',
          border: '1.5px solid rgba(80,130,220,0.35)',
          borderRadius: 4,
          transform: 'rotate(6deg)',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 22px, rgba(40,80,200,0.10) 22px, rgba(40,80,200,0.10) 23px)',
          boxShadow: '0 8px 32px rgba(14,42,120,0.14), inset 0 1px 0 rgba(255,255,255,0.7)',
        }} />

        {/* ── Floating document 2 — mid-left ── */}
        <div style={{
          position: 'absolute', top: '36%', left: '-2%',
          width: 172, height: 228,
          background: 'rgba(255,255,255,0.50)',
          border: '1.5px solid rgba(80,130,220,0.28)',
          borderRadius: 4,
          transform: 'rotate(-11deg)',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 20px, rgba(40,80,200,0.08) 20px, rgba(40,80,200,0.08) 21px)',
          boxShadow: '0 6px 24px rgba(14,42,120,0.11)',
        }} />

        {/* ── Floating document 3 — bottom-right ── */}
        <div style={{
          position: 'absolute', bottom: '16%', right: '3%',
          width: 150, height: 198,
          background: 'rgba(255,255,255,0.42)',
          border: '1px solid rgba(80,130,220,0.24)',
          borderRadius: 4,
          transform: 'rotate(-4deg)',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 18px, rgba(40,80,200,0.07) 18px, rgba(40,80,200,0.07) 19px)',
          boxShadow: '0 4px 18px rgba(14,42,120,0.09)',
        }} />

        {/* ── Official notary seal — centred bottom ── */}
        <div style={{
          position: 'absolute', bottom: '-130px', left: '50%',
          transform: 'translateX(-50%)',
          width: 360, height: 360,
          border: '2.5px solid rgba(14,42,120,0.15)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 304, height: 304,
            border: '1.5px solid rgba(14,42,120,0.11)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 240, height: 240,
              border: '1px dashed rgba(14,42,120,0.08)',
              borderRadius: '50%',
            }} />
          </div>
        </div>

        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(14,42,120,0.14) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

      </div>

      {/* ─── Sticky glass header ─── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(200,220,248,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(100,150,230,0.28)',
        boxShadow: '0 1px 20px rgba(14,42,120,0.10)',
      }}>
        <div style={{
          maxWidth: 1440, margin: '0 auto',
          padding: '0 28px', height: 62,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.18 0.08 245) 100%)',
              borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(14,42,120,0.35)',
              flexShrink: 0,
            }}>
              <Building2 size={18} color="white" />
            </div>
            <span style={{
              fontFamily: 'var(--font-jakarta)',
              fontWeight: 800, fontSize: 17,
              color: 'oklch(0.20 0.08 245)',
              letterSpacing: '-0.025em',
            }}>
              Compass
            </span>
          </Link>
          <Link
            href="/login"
            style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: 13.5, fontWeight: 600,
              fontFamily: 'var(--font-jakarta)',
              color: 'oklch(0.26 0.10 245)',
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(80,130,220,0.40)',
              borderRadius: 9, padding: '8px 18px',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(14,42,120,0.14)',
            }}
          >
            Sign in
          </Link>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>

    </div>
  )
}
