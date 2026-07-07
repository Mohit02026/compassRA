import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { signOutOpsAction } from '@/app/actions'
import { OpsSidebar } from '@/components/ops/OpsSidebar'

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
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ fontFamily: 'var(--font-inter)' }}>

      <OpsSidebar
        initials={initials}
        email={session.user.email ?? ''}
        role={session.user.role}
        signOutOpsAction={signOutOpsAction}
      />

      {/* ─── Main content area ───
          Subtle compass rose watermark + dot grid in the background.
          The ops surface is work-dense, so decorations are more muted
          than the public pages — opacity 0.04 vs 0.10. */}
      <main
        className="flex-1 lg:ml-[220px] min-h-screen"
        style={{
          position: 'relative',
          background: 'linear-gradient(145deg, #DDE8F8 0%, #D2E0F6 55%, #C6D8F4 100%)',
        }}
      >
        {/* Background decoration layer */}
        <div className="left-0 lg:left-[220px]" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>

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
        <div className="px-4 py-6 md:p-8" style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </main>

    </div>
  )
}
