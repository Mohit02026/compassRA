import Link from 'next/link'

export default function HeroSection() {
  return (
    <section
      style={{
        height: 800,
        backgroundImage:
          'linear-gradient(rgba(8,10,20,0.62) 0%, rgba(8,10,20,0.75) 100%), url(/hero-bg.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: 'var(--font-dm-sans)',
      }}
    >
      <div style={{ maxWidth: 1440, width: '100%', padding: '0 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 17 }}>
        <h1
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: '78px',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Start Your Business in Minutes
        </h1>
        <p
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: 'rgb(255,255,255)',
            maxWidth: 670,
            margin: 0,
            lineHeight: '31.2px',
          }}
        >
          Create your business effortlessly. Our streamlined process ensures
          you&apos;re up and running in no time.
        </p>
        <Link
          href="/llc"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#3b60f3',
            color: '#ffffff',
            borderRadius: 8,
            padding: '14px 24px',
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
            width: 418,
          }}
        >
          Start My Business
        </Link>
      </div>
    </section>
  )
}
