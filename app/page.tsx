import Link from 'next/link'
import { Building2, ShieldCheck, Clock, DollarSign, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(160deg, oklch(0.15 0.08 245), oklch(0.22 0.06 245))',
        fontFamily: 'var(--font-dm)',
      }}
    >
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: 'oklch(0.32 0.09 245)' }}
          >
            <Building2 className="text-white" size={16} />
          </div>
          <span
            className="font-bold text-white text-sm"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Compass
          </span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium transition-colors"
          style={{ color: 'oklch(0.80 0.08 245)' }}
        >
          Sign in →
        </Link>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-4 max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium"
          style={{ backgroundColor: 'oklch(0.28 0.10 250)', color: 'oklch(0.78 0.12 250)', border: '1px solid oklch(0.38 0.12 250)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          Florida LLC filings — real people, flat fees
        </div>

        <h1
          className="text-5xl font-bold text-white leading-tight mb-5"
          style={{ fontFamily: 'var(--font-jakarta)' }}
        >
          Filed. Done. Active.
        </h1>
        <p
          className="text-lg leading-relaxed mb-10"
          style={{ color: 'oklch(0.72 0.08 250)' }}
        >
          Compass handles your Florida LLC filing and registered agent service.
          No auto-renewals. No surprise charges. A real person files it and you
          track every step online.
        </p>
        <Link
          href="/name-search"
          className="inline-block px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-blue)',
            fontFamily: 'var(--font-jakarta)',
          }}
        >
          Get started →
        </Link>
      </section>

      {/* Service cards */}
      <section className="max-w-5xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-3 gap-6">
          {/* Annual Report */}
          <ServiceCard
            iconBg="oklch(0.38 0.15 250)"
            iconColor="oklch(0.75 0.14 250)"
            badge="Most Common"
            badgeColor="oklch(0.38 0.15 250)"
            badgeText="oklch(0.78 0.12 250)"
            title="Annual Report"
            description="Keep your LLC active on Sunbiz. Filed by May 1 every year — $125 service fee + $138.75 state fee. One flat total, no surprises."
            cta="File annual report"
            href="/annual-report"
          />

          {/* LLC Formation */}
          <ServiceCard
            iconBg="oklch(0.35 0.12 185)"
            iconColor="oklch(0.72 0.12 185)"
            badge="No Auto-Renewal"
            badgeColor="oklch(0.35 0.12 185)"
            badgeText="oklch(0.75 0.10 185)"
            title="LLC Formation"
            description="Form your Florida LLC the right way. We handle the Articles of Organization, registered agent designation, and EIN if needed."
            cta="Form an LLC"
            href="/llc"
          />

          {/* RA Takeover */}
          <ServiceCard
            iconBg="oklch(0.35 0.12 295)"
            iconColor="oklch(0.72 0.10 295)"
            badge="Full Service"
            badgeColor="oklch(0.35 0.12 295)"
            badgeText="oklch(0.74 0.10 295)"
            title="RA Takeover"
            description="Already have an LLC? Switch your registered agent to Compass. We'll handle the paperwork and verify the update on Sunbiz."
            cta="Switch agent"
            href="/login"
          />
        </div>
      </section>

      {/* Trust bar */}
      <section className="max-w-5xl mx-auto px-6 mt-16 pb-20">
        <div
          className="flex justify-center gap-10 flex-wrap text-sm"
          style={{ color: 'oklch(0.58 0.05 245)' }}
        >
          <TrustItem icon={<ShieldCheck size={15} />} label="Verified on Sunbiz" />
          <TrustItem icon={<DollarSign size={15} />} label="Flat fee, always" />
          <TrustItem icon={<Users size={15} />} label="Real people file it" />
          <TrustItem icon={<Clock size={15} />} label="Track every step" />
        </div>
      </section>
    </div>
  )
}

function ServiceCard({
  iconBg,
  iconColor,
  badge,
  badgeColor,
  badgeText,
  title,
  description,
  cta,
  href,
}: {
  iconBg: string
  iconColor: string
  badge: string
  badgeColor: string
  badgeText: string
  title: string
  description: string
  cta: string
  href: string
}) {
  return (
    <div
      className="rounded-xl p-6 flex flex-col"
      style={{
        backgroundColor: 'oklch(0.28 0.07 245)',
        border: '1px solid oklch(0.32 0.06 245)',
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: iconBg }}
      >
        <Building2 size={18} style={{ color: iconColor }} />
      </div>

      {/* Badge */}
      <span
        className="self-start text-xs font-medium px-2.5 py-0.5 rounded-full mb-3"
        style={{ backgroundColor: badgeColor, color: badgeText }}
      >
        {badge}
      </span>

      <h3
        className="text-xl font-bold text-white mb-2"
        style={{ fontFamily: 'var(--font-jakarta)' }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed flex-1" style={{ color: 'oklch(0.68 0.07 250)' }}>
        {description}
      </p>
      <Link
        href={href}
        className="mt-4 flex items-center gap-1 text-sm font-medium hover:underline"
        style={{ color: 'var(--color-blue)' }}
      >
        {cta} →
      </Link>
    </div>
  )
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
  )
}
