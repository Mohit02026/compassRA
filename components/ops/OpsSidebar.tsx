'use client'

import { useState } from 'react'
import { Building2, Menu, X } from 'lucide-react'
import { OpsNavLinks } from '@/components/ops/OpsNavLinks'

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

export function OpsSidebar({
  initials,
  email,
  role,
  signOutOpsAction,
}: {
  initials: string
  email: string
  role: string
  signOutOpsAction: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ─── Mobile top bar — below lg only ─── */}
      <div
        className="flex lg:hidden"
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: 'var(--color-navy)',
        }}
      >
        <div className="flex items-center gap-2.5">
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
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            cursor: 'pointer',
            color: 'white',
          }}
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden"
          style={{ backgroundColor: 'var(--color-navy)', padding: '8px 12px 16px' }}
        >
          <div onClick={() => setOpen(false)}>
            <OpsNavLinks />
          </div>
          <div className="p-2 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3 mt-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                style={{ backgroundColor: 'var(--color-blue)' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white font-medium truncate leading-snug" style={{ fontFamily: 'var(--font-inter)', fontSize: 12.5 }}>
                  {email}
                </p>
                <p className="leading-snug" style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'oklch(0.65 0.05 245)' }}>
                  {role}
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
        </div>
      )}

      {/* ─── Sidebar — dark navy, 220px fixed, lg+ only ─── */}
      <aside
        className="hidden lg:flex w-[220px] flex-shrink-0 flex-col fixed inset-y-0 left-0 h-screen overflow-hidden"
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

        {/* ── Compass rose — fills the empty vertical space in the sidebar. */}
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
                {email}
              </p>
              <p className="leading-snug" style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'oklch(0.65 0.05 245)' }}>
                {role}
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
    </>
  )
}
