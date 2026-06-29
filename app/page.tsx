import Link from 'next/link'
import Image from 'next/image'
import PublicNav from '@/components/public/PublicNav'
import HeroSection from '@/components/public/HeroSection'
import HowItWorksSection from '@/components/public/HowItWorksSection'
import PricingSection from '@/components/public/PricingSection'
import FaqAccordion from '@/components/public/FaqAccordion'
import StateStartWidget from '@/components/public/StateStartWidget'
import NameCheckWidget from '@/components/public/NameCheckWidget'

const HOMEPAGE_FAQ = [
  {
    question: 'What is a registered agent, and why does my business need one?',
    answer:
      'A registered agent (also known as statutory agent, agent for service of process, or resident agent) is an individual or company designated to receive legal documents, government notices, and compliance correspondence on behalf of your business. Most U.S. jurisdictions require that every LLC, corporation, or other registered entity designate one. Without a registered agent, your business could miss important deadlines, incur fines, or risk being administratively dissolved.',
  },
  {
    question: 'Can I act as my own registered agent?',
    answer:
      "Yes — in many states, you (or another responsible individual) may serve as your own registered agent. However, you must list a physical address (no P.O. boxes), be available during business hours, and personally receive legal documents. Most business owners choose a professional registered agent to protect their privacy, ensure consistent availability, and avoid missing important notices.",
  },
  {
    question: 'What services does Compass Registered Agent provide?',
    answer:
      'We handle Florida LLC formation, annual report filing, EIN (federal tax ID) applications, and registered agent service. Our flat-fee model means no surprises — you pay once and we do the work.',
  },
  {
    question: 'How does Compass protect my privacy?',
    answer:
      "Whenever possible, we use our address on public filings so your personal or business address doesn't appear in public records. All legal documents and government notices are received at our address and forwarded to you digitally.",
  },
]

export default function HomePage() {
  return (
    <div style={{ background: 'rgb(241, 242, 243)', fontFamily: 'var(--font-dm-sans)' }}>
      <PublicNav />
      <HeroSection />
      <HowItWorksSection />
      <PricingSection />

      {/* Additional services — EIN and Annual Report */}
      <section style={{ background: 'rgb(241,242,243)', padding: '100px 40px 0', fontFamily: 'var(--font-dm-sans)' }}>
        <div style={{ maxWidth: 1360, marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 style={{ fontSize: 34, fontWeight: 700, color: 'rgb(15,15,15)', marginBottom: 8 }}>
            More ways we can help
          </h2>
          <p style={{ fontSize: 16, color: 'rgb(80,80,80)', lineHeight: 1.6, marginBottom: 36 }}>
            Beyond LLC formation — every service your business needs.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* EIN card */}
            <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #E0E0E0', padding: '36px 40px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(59,96,243,0.08)', borderRadius: 100, padding: '4px 12px', alignSelf: 'flex-start', marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#3B60F3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>EIN / Tax ID</span>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'rgb(15,15,15)', marginBottom: 12, lineHeight: 1.3 }}>Federal Tax ID Number</h3>
              <p style={{ fontSize: 15, color: 'rgb(80,80,80)', lineHeight: 1.65, marginBottom: 28, flex: 1 }}>
                Required for opening a business bank account, hiring employees, and filing taxes. We prepare and submit your SS-4 to the IRS — flat fee, no surprises.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 26, fontWeight: 700, color: '#3B60F3' }}>$75</span>
                  <span style={{ fontSize: 14, color: 'rgb(80,80,80)', marginLeft: 4 }}>flat fee</span>
                </div>
                <Link href="/ein" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3b60f3', borderRadius: 8, padding: '11px 22px', color: '#ffffff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                  Apply for EIN →
                </Link>
              </div>
            </div>
            {/* Annual Report card */}
            <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #E0E0E0', padding: '36px 40px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(59,96,243,0.08)', borderRadius: 100, padding: '4px 12px', alignSelf: 'flex-start', marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#3B60F3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Annual Report</span>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'rgb(15,15,15)', marginBottom: 12, lineHeight: 1.3 }}>Florida Annual Report Filing</h3>
              <p style={{ fontSize: 15, color: 'rgb(80,80,80)', lineHeight: 1.65, marginBottom: 28, flex: 1 }}>
                Keep your LLC in good standing with the state. Due May 1 every year. We handle the filing so you never miss a deadline.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 26, fontWeight: 700, color: '#3B60F3' }}>$263.75</span>
                  <span style={{ fontSize: 14, color: 'rgb(80,80,80)', marginLeft: 4 }}>total</span>
                </div>
                <Link href="/annual-report" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3b60f3', borderRadius: 8, padding: '11px 22px', color: '#ffffff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                  File Now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Talk to a specialist — compact blue card */}
      <section style={{ background: 'rgb(241,242,243)', padding: '100px 40px 0', fontFamily: 'var(--font-dm-sans)' }}>
        <div style={{ maxWidth: 1360, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ background: '#3b60f3', borderRadius: 24, overflow: 'hidden', height: 220, display: 'flex', alignItems: 'stretch' }}>
            {/* Left text */}
            <div style={{ flex: '0 0 52%', padding: '40px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: 34, fontWeight: 700, color: '#ffffff', lineHeight: 1.2, marginBottom: 10 }}>
                Talk to a specialist
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 20 }}>
                Have multiple businesses or have specific questions? Call a specialist today.
              </p>
              <a
                href="tel:+17276163964"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: '#ffffff', color: '#3b60f3',
                  fontWeight: 700, fontSize: 15, borderRadius: 8,
                  padding: '11px 24px', textDecoration: 'none', alignSelf: 'flex-start',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.72 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.64 1.25h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 8.91a16 16 0 006 6l.91-.91a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                +1 (727) 616-3964
              </a>
            </div>
            {/* Right: photo with left-edge fade into blue */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Image
                src="/cta-photo.webp"
                alt="Specialist on call"
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                sizes="680px"
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, #3b60f3 0%, transparent 35%)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* More than half a century — on page background, no card */}
      <section style={{ background: 'rgb(241,242,243)', padding: '100px 40px', fontFamily: 'var(--font-dm-sans)' }}>
        <div style={{ maxWidth: 1360, marginLeft: 'auto', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 80 }}>
          {/* Left: text */}
          <div style={{ flex: '0 0 54%' }}>
            <h2 style={{ fontSize: 48, fontWeight: 600, color: 'rgb(15,15,15)', lineHeight: 1.2, marginBottom: 20 }}>
              More than half a century of combined experience
            </h2>
            <p style={{ fontSize: 17, color: 'rgb(80,80,80)', lineHeight: 1.75 }}>
              We&apos;ve helped thousands of businesses launch and grow with confidence — from first-time founders to seasoned entrepreneurs. Our team brings decades of expertise to guide you through every step. Simple, reliable and built for real results.
            </p>
          </div>
          {/* Right: compass graphic — white card */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: '#ffffff', borderRadius: 20, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: 340, height: 340 }}>
                {[170, 127, 86, 45].map((r, i) => (
                  <div key={i} style={{
                    position: 'absolute', inset: 0, margin: 'auto',
                    width: r * 2, height: r * 2, borderRadius: '50%',
                    border: `1.5px solid rgba(59,96,243,${0.08 + i * 0.06})`,
                  }} />
                ))}
                <svg viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <path d="M150,150 L150,0 A150,150 0 0,1 280,225 Z" fill="rgba(59,96,243,0.07)" />
                  <path d="M150,150 L280,225 A150,150 0 0,1 20,225 Z" fill="rgba(59,96,243,0.04)" />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0, margin: 'auto',
                  width: 80, height: 80, borderRadius: '50%',
                  background: '#3b60f3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="36" height="36" viewBox="0 0 20 20" fill="none">
                    <ellipse cx="10" cy="10" rx="7" ry="5.5" stroke="white" strokeWidth="1.4" />
                    <circle cx="10" cy="10" r="2" fill="white" />
                    <line x1="10" y1="2" x2="10" y2="5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="10" y1="15" x2="10" y2="18" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="2" y1="10" x2="5" y2="10" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="15" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                {[0, 72, 144, 216, 288].map((deg, i) => {
                  const r = [147, 113, 134, 100, 122][i]
                  const rad = (deg * Math.PI) / 180
                  const x = 170 + r * Math.cos(rad)
                  const y = 170 + r * Math.sin(rad)
                  return (
                    <div key={i} style={{
                      position: 'absolute', left: x - 18, top: y - 18,
                      width: 36, height: 36, borderRadius: '50%',
                      background: '#f4f5f8', border: '1px solid rgba(59,96,243,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(59,96,243,0.2)' }} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* State selection — contained blue card */}
      <section style={{ background: 'rgb(241,242,243)', padding: '100px 40px 0', fontFamily: 'var(--font-dm-sans)' }}>
        <div style={{ maxWidth: 1360, marginLeft: 'auto', marginRight: 'auto' }}>
          {/* Blue card with map + overlaid text */}
          <div style={{ background: '#3b60f3', borderRadius: 24, overflow: 'hidden', height: 445, position: 'relative' }}>
            {/* 3D US map — full background, matches reference select-state__svg-container */}
            <img
              src="/us-map-3d.svg"
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
            />
            {/* Left-fade overlay — matches reference .select-state:before */}
            <div style={{
              position: 'absolute', inset: '0 auto 0 0',
              width: '80%', height: '100%',
              background: 'linear-gradient(90deg, #3b60f3 20%, rgba(59,96,243,0) 90%)',
              zIndex: 2, pointerEvents: 'none',
            }} />
            {/* Text content — vertically centered, matches reference .select-state__inner */}
            <div style={{ position: 'absolute', top: '50%', left: 47, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 32, zIndex: 3 }}>
              {/* hgroup: gap:24 between h2 and p, matches reference .base-heading-group */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h2 style={{ fontSize: 48, fontWeight: 600, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                  Select Your State
                </h2>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
                  Use the drop-down menu to choose your state and start your business.
                </p>
              </div>
              <StateStartWidget light />
            </div>
          </div>
        </div>
      </section>

      {/* Name Check Widget */}
      <section style={{ background: 'rgb(241,242,243)', padding: '64px 40px 0', fontFamily: 'var(--font-dm-sans)' }}>
        <div style={{ maxWidth: 1360, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ background: '#ffffff', borderRadius: 24, padding: '48px 52px' }}>
            <div style={{ maxWidth: 640 }}>
              <h2 style={{ fontSize: 34, fontWeight: 700, color: 'rgb(15,15,15)', marginBottom: 10, lineHeight: 1.2 }}>
                Check your business name
              </h2>
              <p style={{ fontSize: 15, color: 'rgb(80,80,80)', lineHeight: 1.6, marginBottom: 28 }}>
                Instantly verify name availability in Florida before you file.
              </p>
              <NameCheckWidget />
            </div>
          </div>
        </div>
      </section>

      {/* RA Takeover CTA — white card */}
      <section style={{ background: 'rgb(241,242,243)', padding: '64px 40px 80px', fontFamily: 'var(--font-dm-sans)' }}>
        <div style={{ maxWidth: 1360, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ background: '#ffffff', borderRadius: 24, overflow: 'hidden', height: 220, display: 'flex', alignItems: 'stretch' }}>
            {/* Left: text */}
            <div style={{ padding: '40px 52px', flex: '0 0 52%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'rgb(15,15,15)', marginBottom: 8, lineHeight: 1.25 }}>
                Is your business already active and filed?
              </h2>
              <p style={{ fontSize: 15, color: 'rgb(80,80,80)', lineHeight: 1.6, marginBottom: 20 }}>
                Choose Compass as your Registered Agent.
              </p>
              <Link
                href="/ra-takeover"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#3b60f3', borderRadius: 8,
                  padding: '11px 24px', color: '#ffffff',
                  fontWeight: 600, fontSize: 15,
                  textDecoration: 'none', alignSelf: 'flex-start',
                }}
              >
                Choose Compass
              </Link>
            </div>
            {/* Right: photo with left-edge fade into white */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Image
                src="/ra-card.webp"
                alt="Small business owners"
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center center' }}
                sizes="700px"
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, #ffffff 0%, transparent 35%)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        style={{
          background: 'rgb(241,242,243)',
          padding: '100px 40px',
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        <div style={{ maxWidth: 1440, marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 style={{ fontSize: 48, fontWeight: 600, color: 'rgb(23, 23, 23)', marginBottom: 40 }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 20, alignItems: 'start' }}>
            {/* Left: contact card */}
            <div style={{ background: '#ffffff', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 40, border: '1px solid rgb(230,232,240)' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'rgb(76, 76, 76)', marginBottom: 12 }}>
                  Get in Touch
                </p>
                <a
                  href="mailto:support@compassregisteredagent.com"
                  style={{ display: 'block', fontSize: 16, color: '#3b60f3', marginBottom: 8, textDecoration: 'none' }}
                >
                  support@compassregisteredagent.com
                </a>
                <a
                  href="tel:+17276163964"
                  style={{ display: 'block', fontSize: 16, color: '#3b60f3', textDecoration: 'none' }}
                >
                  +1 (727) 616-3964
                </a>
              </div>
              <a
                href="/contact"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#3b60f3',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '14px 24px',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Ask us a question
              </a>
            </div>
            {/* Right: accordion */}
            <div>
              <FaqAccordion items={HOMEPAGE_FAQ} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#3b60f3', padding: '80px 40px 40px', fontFamily: 'var(--font-dm-sans)' }}>
        <div style={{ maxWidth: 1360, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40, alignItems: 'start', marginBottom: 64 }}>

            {/* Left: nav links */}
            <div>
              {[
                { label: 'Pricing', href: '#pricing' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact', href: '/contact' },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ display: 'block', fontSize: 17, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', marginBottom: 18, fontWeight: 400 }}>
                  {label}
                </a>
              ))}
            </div>

            {/* Center: large compass globe logo + company name + tagline */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="65" cy="65" rx="50" ry="36" stroke="white" strokeWidth="2"/>
                <ellipse cx="65" cy="65" rx="50" ry="36" stroke="white" strokeWidth="2" transform="rotate(60,65,65)"/>
                <ellipse cx="65" cy="65" rx="50" ry="36" stroke="white" strokeWidth="2" transform="rotate(-60,65,65)"/>
                <path d="M65,15 L70,58 L115,65 L70,72 L65,115 L60,72 L15,65 L60,58 Z" fill="white"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: 22, color: '#ffffff', letterSpacing: '0.08em', marginTop: 16, display: 'block' }}>COMPASS</span>
              <p style={{ fontSize: 24, fontWeight: 600, color: '#ffffff', lineHeight: 1.3, margin: '16px 0 8px' }}>
                Navigating business. The right way.
              </p>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                Form, file, and go.
              </p>
            </div>

            {/* Right: email + social icons */}
            <div style={{ textAlign: 'right' }}>
              <a
                href="mailto:support@compassregisteredagent.com"
                style={{ display: 'block', fontSize: 15, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', marginBottom: 24 }}
              >
                support@compassregisteredagent.com
              </a>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, alignItems: 'center' }}>
                {/* X (Twitter) */}
                <a href="https://x.com/Compass_R_A" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/company/compass-registered-agent/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/compassregisteredagent/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="https://www.facebook.com/compassregisteredagent" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* Reddit */}
                <a href="https://www.reddit.com/r/compassregisteredagent" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            <a href="/privacy-policy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy Policy</a>
            <span>© Compass Registered Agent LLC</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
