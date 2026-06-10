'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  FileCheck,
  Building2,
  ArrowLeftRight,
  Hash,
  ClipboardList,
  FilePen,
  MonitorCheck,
  ShieldCheck,
  DollarSign,
  Users,
  Clock,
} from 'lucide-react'
import LandingNav from '@/components/landing/LandingNav'

// ─── Motion config ─────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 22, filter: 'blur(5px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE },
  },
}

const slideRight = {
  hidden: { opacity: 0, x: 36, scale: 0.97, filter: 'blur(8px)' },
  visible: {
    opacity: 1, x: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE, delay: 0.22 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 22, filter: 'blur(5px)' },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE, delay },
  }),
}

// ─── Content ───────────────────────────────────────────────────────────────────

type Service = {
  icon: React.ElementType
  hue: number
  badge: string
  title: string
  description: string
  cta: string
  href: string
  comingSoon?: boolean
}

const SERVICES: Service[] = [
  {
    icon: FileCheck,
    hue: 250,
    badge: 'Most Common',
    title: 'Annual Report',
    description:
      'Keep your LLC active on Sunbiz. Filed by May 1 every year — $125 service fee + $138.75 state fee. One flat total, no surprises.',
    cta: 'File your report',
    href: '/annual-report',
  },
  {
    icon: Building2,
    hue: 185,
    badge: 'No Auto-Renewal',
    title: 'LLC Formation',
    description:
      'Form your Florida LLC the right way. Articles of Organization, registered agent designation, and EIN if needed.',
    cta: 'Form your LLC',
    href: '/llc',
  },
  {
    icon: Hash,
    hue: 45,
    badge: 'Standalone',
    title: 'EIN Filing',
    description:
      'Need a federal tax ID without forming a new LLC? We prepare and file your SS-4 directly with the IRS. Flat fee, no surprises.',
    cta: 'Get your EIN',
    href: '/ein',
  },
  {
    icon: ArrowLeftRight,
    hue: 295,
    badge: 'Full Service',
    title: 'RA Takeover',
    description:
      "Already have an LLC? Switch your registered agent to Compass. We handle the paperwork and verify the update on Sunbiz.",
    cta: 'Switch to Compass',
    href: '/login',
    comingSoon: true,
  },
]

const STEPS = [
  {
    num: '01',
    icon: ClipboardList,
    title: 'Fill out our form',
    body: 'Tell us about your LLC. Takes about 5 minutes. Plain questions — no legal jargon.',
  },
  {
    num: '02',
    icon: FilePen,
    title: 'We file with the state',
    body: 'A real person reviews your info and files directly with the Florida Division of Corporations.',
  },
  {
    num: '03',
    icon: MonitorCheck,
    title: 'Track it live',
    body: 'Log into your portal and watch every stage — from intake to filed to completed.',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: 'oklch(0.12 0.055 245)', fontFamily: 'var(--font-dm)' }}
    >
      {/* Noise grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px', opacity: 0.028,
        }}
      />

      {/* Dot grid */}
      <div aria-hidden="true" className="lp-dot-grid" />

      {/* Spotlight */}
      <div aria-hidden="true" className="lp-spotlight" />

      {/* Ambient orbs */}
      <div aria-hidden="true" className="lp-orb lp-orb-1" />
      <div aria-hidden="true" className="lp-orb lp-orb-2" />
      <div aria-hidden="true" className="lp-orb lp-orb-3" />

      <LandingNav />

      <main className="relative z-10">
        <HeroSection />
        <HowItWorksSection />
        <ServicesSection />
        <TrustSection />
      </main>

      <footer
        className="relative z-10 py-8 text-xs"
        style={{ color: 'oklch(0.40 0.04 245)', borderTop: '1px solid oklch(1 0 0 / 0.07)' }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3">
          <span>© 2025 Compass Registered Agent LLC. All rights reserved.</span>
          <a href="mailto:hello@compassregisteredagent.com" className="lp-footer-link">
            hello@compassregisteredagent.com
          </a>
        </div>
      </footer>
    </div>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-32 pb-16">
      <div className="flex items-center justify-between gap-12 flex-wrap lg:flex-nowrap">
        <HeroCopy />
        <motion.div
          variants={slideRight}
          initial="hidden"
          animate="visible"
          className="hidden lg:block shrink-0"
          style={{ width: 380 }}
        >
          <DocumentVisual />
        </motion.div>
      </div>
    </section>
  )
}

function HeroCopy() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: 540, flex: 1, minWidth: 300 }}
    >
      {/* Live badge */}
      <motion.div variants={item}>
        <span
          className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-3.5 py-1.5 mb-8"
          style={{
            background: 'oklch(0.24 0.09 250 / 0.70)',
            color: 'oklch(0.76 0.12 250)',
            border: '1px solid oklch(0.38 0.12 250 / 0.50)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: 'oklch(0.70 0.15 250)',
              animation: 'lp-pulse 2.2s infinite',
            }}
          />
          Florida LLC filings — flat fee, real people
        </span>
      </motion.div>

      {/* H1 */}
      <motion.h1
        variants={item}
        className="font-bold text-white mb-6"
        style={{
          fontFamily: 'var(--font-jakarta)',
          fontSize: 'clamp(40px, 5vw, 62px)',
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
        }}
      >
        Your LLC filed by{' '}
        <span
          style={{
            background:
              'linear-gradient(108deg, oklch(0.74 0.17 252), oklch(0.78 0.14 192))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          a real person.
        </span>
      </motion.h1>

      {/* Body */}
      <motion.p
        variants={item}
        style={{
          fontSize: 17.5,
          lineHeight: 1.76,
          color: 'oklch(0.64 0.07 250)',
          maxWidth: 440,
          marginBottom: 36,
        }}
      >
        Compass handles your Florida Articles of Organization, registered agent
        service, and annual reports. No auto-renewals. No hidden fees.{' '}
        <span style={{ color: 'oklch(0.88 0.04 245)', fontWeight: 600 }}>
          Track every step online.
        </span>
      </motion.p>

      {/* CTAs */}
      <motion.div variants={item} className="flex flex-wrap items-center gap-3 mb-8">
        <motion.div
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        >
          <Link
            href="/name-search"
            className="lp-cta-btn inline-flex items-center gap-2.5 font-semibold text-white rounded-xl"
            style={{ fontFamily: 'var(--font-jakarta)', fontSize: 15.5, padding: '14px 26px' }}
          >
            Start My LLC <ArrowRight size={16} />
          </Link>
        </motion.div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: 'oklch(0.50 0.07 250)', fontFamily: 'var(--font-jakarta)' }}
        >
          Already have an LLC? →
        </Link>
      </motion.div>

      {/* Trust chips */}
      <motion.div variants={item} className="flex flex-wrap gap-x-5 gap-y-2">
        {[
          'Flat fee — no auto-renewal',
          'Verified on Sunbiz',
          'Real person files it',
        ].map((l) => (
          <span
            key={l}
            className="inline-flex items-center gap-1.5 text-sm"
            style={{ color: 'oklch(0.52 0.06 250)' }}
          >
            <CheckCircle2 size={13} style={{ color: 'oklch(0.56 0.15 145)' }} />
            {l}
          </span>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ─── Document visual ───────────────────────────────────────────────────────────

function DocumentVisual() {
  return (
    <div style={{ position: 'relative', height: 500 }}>

      {/* Back doc — Annual Report, tilted behind */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: -10,
          width: 310,
          transform: 'rotate(7deg)',
          animation: 'lp-floaty2 9.5s ease-in-out infinite 1.2s',
          opacity: 0.62,
        }}
      >
        <div
          style={{
            background: 'oklch(0.95 0.006 245)',
            borderRadius: 10,
            border: '1px solid oklch(0.84 0.02 245)',
            boxShadow: '0 20px 56px -14px oklch(0.07 0.04 245 / 0.85)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, oklch(0.19 0.07 245), oklch(0.24 0.09 252))',
              padding: '11px 16px',
            }}
          >
            <p
              style={{
                fontSize: 7.5,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                color: 'oklch(0.60 0.08 250)',
                fontFamily: 'var(--font-jakarta)',
                fontWeight: 600,
              }}
            >
              State of Florida · Division of Corporations
            </p>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'var(--font-jakarta)',
                marginTop: 3,
                letterSpacing: '0.03em',
              }}
            >
              ANNUAL REPORT 2025
            </p>
          </div>
          <div style={{ padding: '13px 16px 15px' }}>
            {[
              ['Document Number', 'L18000198432'],
              ['Entity Name', 'Sunrise Ventures LLC'],
              ['Registered Agent', 'Compass Registered Agent LLC'],
              ['Status', 'ACTIVE'],
            ].map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <p
                  style={{
                    fontSize: 7.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                    color: 'oklch(0.55 0.04 245)',
                    marginBottom: 1.5,
                  }}
                >
                  {k}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: k === 'Status' ? 'oklch(0.38 0.14 145)' : 'oklch(0.28 0.06 245)',
                    fontFamily: 'var(--font-jakarta)',
                  }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main doc — Articles of Organization */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 28,
          animation: 'lp-floaty 8.5s ease-in-out infinite',
        }}
      >
        <div
          style={{
            width: 330,
            background: 'oklch(0.997 0.001 245)',
            borderRadius: 14,
            border: '1px solid oklch(0.87 0.015 245)',
            boxShadow:
              '0 0 0 1px oklch(0.56 0.18 250 / 0.08), 0 48px 96px -24px oklch(0.07 0.04 245 / 0.92), 0 12px 32px -8px oklch(0.07 0.04 245 / 0.45)',
            overflow: 'hidden',
          }}
        >
          {/* Dark header */}
          <div
            style={{
              background: 'linear-gradient(140deg, oklch(0.21 0.08 245), oklch(0.27 0.11 252))',
              padding: '16px 20px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              {/* State seal ring */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '2px solid oklch(0.52 0.10 250 / 0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: 'oklch(0.28 0.10 250 / 0.40)',
                }}
              >
                <Shield size={14} color="oklch(0.68 0.11 250)" />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 7.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: 'oklch(0.60 0.08 250)',
                    fontFamily: 'var(--font-jakarta)',
                    fontWeight: 700,
                  }}
                >
                  State of Florida
                </p>
                <p
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'oklch(0.90 0.04 250)',
                    fontFamily: 'var(--font-jakarta)',
                    marginTop: 2,
                  }}
                >
                  Division of Corporations
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: 11,
                borderTop: '1px solid oklch(1 0 0 / 0.10)',
                paddingTop: 10,
              }}
            >
              <p
                style={{
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: 'white',
                  fontFamily: 'var(--font-jakarta)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Articles of Organization
              </p>
              <p
                style={{
                  fontSize: 8.5,
                  color: 'oklch(0.58 0.07 250)',
                  marginTop: 2.5,
                }}
              >
                Limited Liability Company · Florida Statutes Ch. 605
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div style={{ padding: '16px 20px 14px' }}>
            {[
              { label: 'Article I — Company Name', value: 'Sunrise Ventures LLC', accent: true },
              { label: 'Article II — Principal Address', value: '2847 Biscayne Blvd, Miami FL 33137' },
              { label: 'Article III — Registered Agent', value: 'Compass Registered Agent LLC' },
              { label: 'Registered Office Address', value: '123 Orange Ave, Orlando FL 32801' },
              { label: 'Article IV — Organizer', value: 'James A. Reeves' },
            ].map(({ label, value, accent }, idx, arr) => (
              <div
                key={label}
                style={{
                  marginBottom: idx < arr.length - 1 ? 11 : 0,
                  paddingBottom: idx < arr.length - 1 ? 11 : 0,
                  borderBottom:
                    idx < arr.length - 1 ? '1px solid oklch(0.91 0.008 245)' : 'none',
                }}
              >
                <p
                  style={{
                    fontSize: 7.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                    color: 'oklch(0.60 0.04 245)',
                    marginBottom: 2.5,
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: accent ? 700 : 500,
                    color: accent ? 'oklch(0.24 0.09 250)' : 'oklch(0.32 0.05 245)',
                    fontFamily: 'var(--font-jakarta)',
                    lineHeight: 1.35,
                  }}
                >
                  {value}
                </p>
              </div>
            ))}

            {/* Date + Doc # row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 13,
                paddingTop: 11,
                borderTop: '1px solid oklch(0.91 0.008 245)',
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 7.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                    color: 'oklch(0.60 0.04 245)',
                    marginBottom: 2.5,
                  }}
                >
                  Date Filed
                </p>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'oklch(0.30 0.05 245)',
                    fontFamily: 'var(--font-jakarta)',
                  }}
                >
                  May 1, 2025
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p
                  style={{
                    fontSize: 7.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                    color: 'oklch(0.60 0.04 245)',
                    marginBottom: 2.5,
                  }}
                >
                  Document #
                </p>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'oklch(0.30 0.05 245)',
                    fontFamily: 'var(--font-jakarta)',
                  }}
                >
                  L25000082341
                </p>
              </div>
            </div>
          </div>

          {/* Filed status footer */}
          <div
            style={{
              background: 'oklch(0.955 0.065 145)',
              borderTop: '1px solid oklch(0.86 0.09 145)',
              padding: '9px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <CheckCircle2 size={13} style={{ color: 'oklch(0.40 0.15 145)', flexShrink: 0 }} />
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: 'oklch(0.33 0.14 145)',
                fontFamily: 'var(--font-jakarta)',
              }}
            >
              FILED &amp; ACTIVE — Sunbiz Verified
            </span>
          </div>
        </div>

        {/* Rotated FILED stamp */}
        <div
          style={{
            position: 'absolute',
            top: -16,
            right: -14,
            width: 68,
            height: 68,
            borderRadius: '50%',
            border: '3px solid oklch(0.40 0.15 145)',
            background: 'oklch(0.975 0.045 145)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-15deg)',
            boxShadow: '0 4px 18px oklch(0.40 0.15 145 / 0.38)',
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'oklch(0.33 0.15 145)',
              fontFamily: 'var(--font-jakarta)',
              lineHeight: 1,
            }}
          >
            FILED
          </span>
          <span
            style={{
              fontSize: 7.5,
              fontWeight: 700,
              color: 'oklch(0.48 0.13 145)',
              fontFamily: 'var(--font-jakarta)',
              marginTop: 2,
            }}
          >
            ✓ 2025
          </span>
        </div>

        {/* Floating chip — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: -12,
            right: -20,
            background: 'white',
            borderRadius: 12,
            border: '1px solid oklch(0.90 0.01 245)',
            boxShadow: '0 8px 28px oklch(0.10 0.04 245 / 0.20)',
            padding: '8px 13px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'lp-floaty2 6s ease-in-out infinite 1.8s',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#22c55e',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: 'oklch(0.26 0.07 245)',
              fontFamily: 'var(--font-jakarta)',
              whiteSpace: 'nowrap',
            }}
          >
            Filed on Sunbiz · just now
          </span>
        </div>

        {/* Floating chip — top left */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: -32,
            background: 'white',
            borderRadius: 14,
            border: '1px solid oklch(0.90 0.01 245)',
            boxShadow: '0 10px 28px oklch(0.10 0.04 245 / 0.16)',
            padding: '9px 13px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'lp-floaty2 7s ease-in-out infinite 0.5s',
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'oklch(0.94 0.04 250)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={14} style={{ color: 'oklch(0.45 0.15 250)' }} />
          </span>
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'oklch(0.24 0.08 250)',
                fontFamily: 'var(--font-jakarta)',
                lineHeight: 1.2,
              }}
            >
              RA Designated
            </p>
            <p
              style={{
                fontSize: 9.5,
                color: 'oklch(0.54 0.04 245)',
                marginTop: 1.5,
              }}
            >
              Compass · Orlando FL
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── How it works ──────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <div ref={ref}>
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-12 text-center"
        >
          <p
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              fontWeight: 700,
              color: 'oklch(0.48 0.09 250)',
              fontFamily: 'var(--font-jakarta)',
              marginBottom: 10,
            }}
          >
            How it works
          </p>
          <h2
            className="font-bold text-white"
            style={{
              fontFamily: 'var(--font-jakarta)',
              fontSize: 'clamp(26px, 3.2vw, 38px)',
              lineHeight: 1.18,
              letterSpacing: '-0.022em',
            }}
          >
            Done in three steps
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i * 0.11}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                style={{
                  background: 'oklch(0.165 0.06 245 / 0.65)',
                  border: '1px solid oklch(0.26 0.06 245)',
                  borderRadius: 16,
                  padding: '28px 24px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: 'oklch(0.38 0.10 250)',
                      fontFamily: 'var(--font-jakarta)',
                      letterSpacing: '0.06em',
                      paddingTop: 4,
                      flexShrink: 0,
                    }}
                  >
                    {step.num}
                  </span>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'oklch(0.25 0.10 250)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} style={{ color: 'oklch(0.68 0.14 250)' }} />
                  </div>
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    fontWeight: 700,
                    fontSize: 16,
                    color: 'white',
                    marginBottom: 9,
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.68,
                    color: 'oklch(0.57 0.06 250)',
                  }}
                >
                  {step.body}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Services ─────────────────────────────────────────────────────────────────

function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <div ref={ref}>
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-10"
        >
          <p
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              fontWeight: 700,
              color: 'oklch(0.48 0.09 250)',
              fontFamily: 'var(--font-jakarta)',
              marginBottom: 10,
            }}
          >
            Services
          </p>
          <h2
            className="font-bold text-white"
            style={{
              fontFamily: 'var(--font-jakarta)',
              fontSize: 'clamp(26px, 3.2vw, 38px)',
              lineHeight: 1.18,
              letterSpacing: '-0.022em',
            }}
          >
            Everything your Florida LLC needs
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => {
            const Icon = s.icon
            const cardInner = (
              <>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    marginBottom: 14,
                    background: `oklch(0.29 0.10 ${s.hue})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    opacity: s.comingSoon ? 0.55 : 1,
                  }}
                >
                  <Icon size={18} style={{ color: `oklch(0.72 0.13 ${s.hue})` }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: '2.5px 10px',
                      borderRadius: 99,
                      background: `oklch(0.25 0.08 ${s.hue} / 0.75)`,
                      color: `oklch(0.74 0.11 ${s.hue})`,
                      border: `1px solid oklch(0.37 0.09 ${s.hue} / 0.45)`,
                    }}
                  >
                    {s.badge}
                  </span>
                  {s.comingSoon && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 99,
                        background: 'oklch(0.24 0.04 245 / 0.70)',
                        color: 'oklch(0.52 0.04 245)',
                        border: '1px solid oklch(0.34 0.04 245 / 0.60)',
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    fontWeight: 700,
                    fontSize: 17,
                    color: s.comingSoon ? 'oklch(0.58 0.05 245)' : 'white',
                    marginBottom: 9,
                    lineHeight: 1.25,
                  }}
                >
                  {s.title}
                </h3>

                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.68,
                    color: 'oklch(0.58 0.06 250)',
                    flexGrow: 1,
                    marginBottom: 18,
                  }}
                >
                  {s.description}
                </p>

                {!s.comingSoon && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 13.5,
                      fontWeight: 600,
                      fontFamily: 'var(--font-jakarta)',
                      color: `oklch(0.66 0.14 ${s.hue})`,
                    }}
                  >
                    {s.cta}
                    <ArrowRight size={13} className="lp-cta-arrow" />
                  </div>
                )}
              </>
            )

            const cardStyle: React.CSSProperties = {
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 16,
              padding: '24px 22px',
              minHeight: 244,
              background: 'oklch(0.175 0.065 245 / 0.60)',
              border: '1px solid oklch(0.27 0.06 245)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              textDecoration: 'none',
              opacity: s.comingSoon ? 0.55 : 1,
              cursor: s.comingSoon ? 'default' : undefined,
              pointerEvents: s.comingSoon ? 'none' : undefined,
            }

            return (
              <motion.div
                key={s.title}
                variants={fadeUp}
                custom={i * 0.1}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
              >
                <motion.div
                  whileHover={s.comingSoon ? {} : { y: -6, borderColor: `oklch(0.44 0.11 ${s.hue})` }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  style={{ borderRadius: 16, height: '100%' }}
                >
                  {s.comingSoon ? (
                    <div className="lp-service-card-fm" style={cardStyle}>
                      {cardInner}
                    </div>
                  ) : (
                    <Link href={s.href} className="lp-service-card-fm" style={cardStyle}>
                      {cardInner}
                    </Link>
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Trust bar ─────────────────────────────────────────────────────────────────

function TrustSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  const trustItems = [
    { Icon: ShieldCheck, label: 'Verified on Sunbiz' },
    { Icon: DollarSign, label: 'Flat fee, always' },
    { Icon: Users, label: 'Real person files it' },
    { Icon: Clock, label: 'Track every step' },
  ]

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24" ref={ref}>
      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          height: 1,
          background: 'oklch(1 0 0 / 0.08)',
          transformOrigin: 'left',
          marginBottom: 32,
        }}
      />

      <motion.div
        variants={fadeUp}
        custom={0.1}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
      >
        {trustItems.map(({ Icon, label }, i) => (
          <div
            key={label}
            className="flex items-center gap-2.5 text-sm"
            style={{ color: 'oklch(0.50 0.05 250)' }}
          >
            <Icon size={15} style={{ color: 'oklch(0.46 0.09 250)' }} />
            {label}
            {i < trustItems.length - 1 && (
              <span
                className="hidden md:block w-1 h-1 rounded-full ml-10"
                style={{ background: 'oklch(1 0 0 / 0.14)' }}
              />
            )}
          </div>
        ))}
      </motion.div>
    </section>
  )
}
