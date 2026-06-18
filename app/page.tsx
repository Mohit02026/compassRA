import Link from 'next/link'
import Image from 'next/image'
import PublicNav from '@/components/public/PublicNav'
import HeroSection from '@/components/public/HeroSection'
import HowItWorksSection from '@/components/public/HowItWorksSection'
import PricingSection from '@/components/public/PricingSection'
import FaqAccordion from '@/components/public/FaqAccordion'
import StateStartWidget from '@/components/public/StateStartWidget'

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

      {/* State selection — contained blue card */}
      <section style={{ background: 'rgb(241,242,243)', padding: '60px 40px 0', fontFamily: 'var(--font-dm-sans)' }}>
        <div style={{ maxWidth: 1360, marginLeft: 'auto', marginRight: 'auto' }}>
          {/* Blue card with map + overlaid text */}
          <div style={{ background: '#3b60f3', borderRadius: 24, overflow: 'hidden', height: 445, position: 'relative' }}>
            {/* US map SVG — full width background */}
            <svg
              viewBox="0 0 900 445"
              preserveAspectRatio="xMaxYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              {/* State fills — lighter blue */}
              <path d="M110,80 L420,50 L680,60 L820,100 L840,180 L800,260 L720,300 L580,320 L440,330 L300,320 L180,290 L100,240 L80,180 Z" fill="rgba(255,255,255,0.08)" />
              {/* State outlines grid */}
              {[150,250,350,450,550,650,750].map(x => <line key={x} x1={x} y1="40" x2={x} y2="420" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />)}
              {[100,180,260,340].map(y => <line key={y} x1="80" y1={y} x2="860" y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />)}
              {/* Continental US outline */}
              <path d="M110,88 L145,62 L200,55 L270,48 L360,44 L450,42 L540,42 L630,46 L710,56 L770,72 L810,92 L830,116 L832,142 L820,168 L798,192 L768,212 L730,226 L688,234 L642,238 L594,240 L546,242 L498,246 L450,252 L402,260 L356,268 L310,274 L268,276 L230,272 L196,262 L166,246 L142,226 L124,204 L112,180 L106,156 L106,130 Z"
                fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
              {/* Florida */}
              <path d="M594,240 L606,248 L618,260 L628,276 L634,294 L634,314 L628,332 L618,346 L606,354 L594,354 L582,346 L572,332 L566,314 L566,294 L572,276 L582,260 L590,248 Z"
                fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
              {/* State label boxes (white pill shapes like reference) */}
              {[[160,110,52],[280,90,44],[420,76,42],[560,80,38],[690,110,46],[730,175,42],[640,220,40],[480,230,42],[340,225,44],[210,200,44]].map(([x,y,w],i) => (
                <rect key={i} x={x-w/2} y={y-12} width={w} height={22} rx="11" fill="rgba(255,255,255,0.18)" />
              ))}
              {/* FL pin */}
              <circle cx="594" cy="276" r="14" fill="rgba(255,255,255,0.25)" />
              <circle cx="594" cy="276" r="9" fill="#ffffff" />
              <circle cx="594" cy="276" r="4" fill="#3b60f3" />
            </svg>
            {/* Text content overlaid */}
            <div style={{ position: 'absolute', top: 222, left: 47, width: 528 }}>
              <h2 style={{ fontSize: 48, fontWeight: 600, color: '#ffffff', marginBottom: 12, lineHeight: 1.2 }}>
                Select Your State
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 24, lineHeight: 1.5 }}>
                Use the drop-down menu to choose your state and start your business.
              </p>
              <StateStartWidget light />
            </div>
          </div>
        </div>
      </section>

      {/* RA Takeover CTA — white card */}
      <section style={{ background: 'rgb(241,242,243)', padding: '24px 40px 60px', fontFamily: 'var(--font-dm-sans)' }}>
        <div style={{ maxWidth: 1360, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ background: '#ffffff', borderRadius: 24, overflow: 'hidden', height: 240, position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Left: text */}
            <div style={{ padding: '40px 48px', flex: '0 0 auto', width: 520, zIndex: 1 }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'rgb(15,15,15)', marginBottom: 10, lineHeight: 1.25 }}>
                Is your business already active and filed?
              </h2>
              <p style={{ fontSize: 15, color: 'rgb(80,80,80)', lineHeight: 1.55, marginBottom: 24 }}>
                Choose Compass as your Registered Agent.
              </p>
              <Link
                href="/login"
                style={{
                  display: 'inline-block',
                  background: '#3b60f3',
                  borderRadius: 8,
                  padding: '12px 28px',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'none',
                }}
              >
                Choose Compass
              </Link>
            </div>
            {/* Right: photo */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '58%' }}>
              <Image
                src="/ra-card.webp"
                alt="Business owners"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                sizes="800px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        style={{
          padding: '80px 40px',
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        <div style={{ maxWidth: 1440, marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 style={{ fontSize: 48, fontWeight: 600, color: 'rgb(23, 23, 23)', marginBottom: 40 }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 20, alignItems: 'start' }}>
            {/* Left: contact card */}
            <div style={{ background: '#ffffff', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 40 }}>
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
      <footer
        style={{
          background: '#3b60f3',
          padding: '80px 40px',
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 1440 }}>
          <div className="flex flex-wrap items-start justify-between gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <ellipse cx="10" cy="10" rx="7" ry="5.5" stroke="white" strokeWidth="1.4" />
                    <circle cx="10" cy="10" r="2" fill="white" />
                    <line x1="10" y1="2" x2="10" y2="5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="10" y1="15" x2="10" y2="18" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="2" y1="10" x2="5" y2="10" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="15" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#ffffff', letterSpacing: '0.05em' }}>COMPASS</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>Navigating business. The right way.</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>Form, file, and go.</p>
            </div>

            {/* Services */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Services</p>
              {[
                { label: 'Pricing', href: '#pricing' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact', href: '/contact' },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ display: 'block', fontSize: 15, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', marginBottom: 8 }}>
                  {label}
                </a>
              ))}
            </div>

            {/* Contact */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Contact</p>
              <a href="mailto:support@compassregisteredagent.com" style={{ display: 'block', fontSize: 15, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', marginBottom: 8 }}>
                support@compassregisteredagent.com
              </a>
              <a href="tel:+17276163964" style={{ display: 'block', fontSize: 15, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', marginBottom: 8 }}>
                +1 (727) 616-3964
              </a>
              {/* Social icons */}
              <div className="flex gap-3 mt-5">
                {[
                  { label: 'X', href: 'https://x.com/Compass_R_A' },
                  { label: 'in', href: 'https://www.linkedin.com/company/compass-registered-agent/' },
                  { label: 'ig', href: 'https://www.instagram.com/compassregisteredagent/' },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.65)',
                      textDecoration: 'none',
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 22, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}
          >
            <span>© Compass Registered Agent LLC</span>
            <a href="/privacy-policy" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
