import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Building2 } from 'lucide-react'
import { signOutOpsAction } from '@/app/actions'
import { OpsNavLinks } from '@/components/ops/OpsNavLinks'

// Shared compass rose SVG inner markup — same brand symbol as public pages,
// but rendered lighter inside the dark navy sidebar and very faintly in content.
function CompassRose({ size = 180, opacity = 0.07, rotate = 0 }: {
  size?: number
  opacity?: number
  rotate?: number
}) {
  return (
    <svg
      width={size} height={size}
      viewBox="-150 -150 300 300"
      style={{ color: `rgba(255,255,255,${opacity})`, transform: `rotate(${rotate}deg)`, overflow: 'visible', flexShrink: 0 }}
      fill="currentColor"
    >
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
      <text x="0" y="164" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Georgia, serif">S</text>
      <text x="152" y="6" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Georgia, serif">E</text>
      <text x="-152" y="6" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Georgia, serif">W</text>
    </svg>
  )
}

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/ops/login')
  if (session.user.role !== 'OPS' && session.user.role !== 'ADMIN') {
    redirect('/ops/login')
  }

  const initials = session.user.email
    ? session.user.email.slice(0, 2).toUpperCase()
    : 'OP'

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'var(--font-inter)' }}>

      {/* ─── Sidebar — dark navy, 220px fixed ─── */}
      <aside
        className="w-[220px] flex-shrink-0 flex flex-col fixed inset-y-0 left-0 h-screen overflow-hidden"
        style={{ backgroundColor: 'var(--color-navy)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 p-4" style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: 'oklch(0.32 0.09 245)' }}
          >
            <Building2 className="text-white" size={16} />
          </div>
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
            Compass
          </span>
        </div>

        {/* Nav items */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <OpsNavLinks />
        </div>

        {/* ── Compass rose — fills the empty vertical space in the sidebar.
            Very subtle against the navy background. Only visible if you look.
            Same brand symbol as the public pages. */}
        <div style={{
          position: 'absolute',
          bottom: '100px', left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 1,
        }}>
          <CompassRose size={200} opacity={0.07} rotate={15} />
        </div>

        {/* Subtle glow behind the rose */}
        <div style={{
          position: 'absolute',
          bottom: '60px', left: '50%',
          transform: 'translateX(-50%)',
          width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* User info + sign out */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 1 }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
              style={{ backgroundColor: 'var(--color-blue)' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p
                className="text-white font-medium truncate leading-snug"
                style={{ fontFamily: 'var(--font-inter)', fontSize: 12.5 }}
              >
                {session.user.email}
              </p>
              <p className="leading-snug" style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'oklch(0.65 0.05 245)' }}>
                {session.user.role}
              </p>
            </div>
          </div>
          <form action={signOutOpsAction} className="mt-3">
            <button
              type="submit"
              className="w-full flex items-center gap-2 text-sm px-2 py-1.5 rounded-md transition-colors hover:bg-white/10 text-left"
              style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.6)' }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ─── Main content area ───
          Subtle compass rose watermark + dot grid in the background.
          The ops surface is work-dense, so decorations are more muted
          than the public pages — opacity 0.04 vs 0.10. */}
      <main
        className="flex-1 ml-[220px] min-h-screen"
        style={{
          position: 'relative',
          background: 'linear-gradient(145deg, #DDE8F8 0%, #D2E0F6 55%, #C6D8F4 100%)',
        }}
      >
        {/* Background decoration layer */}
        <div style={{ position: 'fixed', top: 0, left: 220, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>

          {/* Compass rose — bottom-right of content area */}
          <svg
            style={{
              position: 'absolute',
              bottom: '-6%', right: '-4%',
              width: 400, height: 400,
              color: 'rgba(14,42,120,0.10)',
              overflow: 'visible',
              transform: 'rotate(10deg)',
            }}
            viewBox="-150 -150 300 300"
            fill="currentColor"
          >
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
            <text x="0" y="164" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Georgia, serif">S</text>
            <text x="152" y="6" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Georgia, serif">E</text>
            <text x="-152" y="6" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Georgia, serif">W</text>
          </svg>

          {/* Small secondary rose — top-left of content */}
          <svg
            style={{
              position: 'absolute',
              top: '-5%', left: '2%',
              width: 240, height: 240,
              color: 'rgba(14,42,120,0.07)',
              overflow: 'visible',
              transform: 'rotate(-20deg)',
            }}
            viewBox="-150 -150 300 300"
            fill="currentColor"
          >
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
            <circle cx="0" cy="0" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="0" cy="0" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
            <circle cx="0" cy="0" r="88" fill="none" stroke="currentColor" strokeWidth="0.75" />
          </svg>

          {/* Dot grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(14,42,120,0.14) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          {/* Subtle navy blue glow — bottom right */}
          <div style={{
            position: 'absolute', bottom: -80, right: -60, width: 460, height: 460,
            background: 'radial-gradient(circle, rgba(14,48,155,0.12) 0%, transparent 65%)',
            borderRadius: '50%',
          }} />

        </div>

        {/* Content sits above decoration */}
        <div style={{ position: 'relative', zIndex: 1, padding: '2rem' }}>
          {children}
        </div>
      </main>

    </div>
  )
}
