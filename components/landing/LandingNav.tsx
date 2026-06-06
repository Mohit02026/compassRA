'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Phone } from 'lucide-react'

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'oklch(1 0 0 / 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--color-border)' : 'transparent'}`,
        boxShadow: scrolled ? '0 1px 2px oklch(0.22 0.06 245 / 0.05)' : 'none',
      }}
    >
      <div className="mx-auto px-7 flex items-center gap-7 h-[72px]" style={{ maxWidth: 1140 }}>
        {/* Logo */}
        <Link href="#top" className="flex items-center gap-3 shrink-0">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-[10px]"
            style={{
              background: scrolled ? 'var(--color-navy)' : 'oklch(0.32 0.09 245)',
              boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.12)',
            }}
          >
            <Building2 size={19} className="text-white" />
          </div>
          <span
            className="font-bold text-[18px]"
            style={{
              fontFamily: 'var(--font-jakarta)',
              letterSpacing: '-0.01em',
              color: scrolled ? 'var(--color-navy)' : '#fff',
            }}
          >
            Compass
          </span>
        </Link>

        {/* Right: phone + sign in */}
        <div className="ml-auto flex items-center gap-2">
          <a
            href="tel:+17276163964"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-semibold text-sm transition-colors"
            style={{
              fontFamily: 'var(--font-jakarta)',
              color: scrolled ? 'var(--color-navy-mid)' : '#fff',
            }}
          >
            <Phone
              size={15}
              style={{ color: scrolled ? 'var(--color-blue)' : 'oklch(0.72 0.14 250)' }}
            />
            +1 (727) 616-3964
          </a>
          <Link
            href="/login"
            className="text-sm font-semibold px-4 py-2 rounded-md border transition-all"
            style={{
              fontFamily: 'var(--font-jakarta)',
              color: scrolled ? 'var(--color-navy-mid)' : '#fff',
              borderColor: scrolled ? 'var(--color-border)' : 'oklch(1 0 0 / 0.28)',
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}
