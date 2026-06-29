import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: 'var(--font-dm-sans)',
        overflow: 'hidden',
      }}
    >
      {/* Background image as <img> */}
      <Image
        src="/hero-bg.webp"
        alt=""
        fill
        priority
        style={{ objectFit: 'cover', zIndex: 0 }}
        sizes="100vw"
      />
      {/* Overlay — matches reference: dark navy gradient, not black */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(10,10,41,0.33) 0%, rgba(10,10,41,0.50) 56.44%)',
          zIndex: 1,
        }}
      />
      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1440,
          width: '100%',
          padding: '0 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 17,
        }}
      >
        <h1
          style={{
            fontSize: 60,
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Start Your Business in Minutes
        </h1>
        <p
          style={{
            fontSize: 24,
            fontWeight: 500,
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
          className="lp-cta-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#3b60f3',
            color: '#ffffff',
            borderRadius: 8,
            padding: '0 40px',
            height: 70,
            minWidth: 418,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
          }}
        >
          Start My Business
        </Link>
      </div>
    </section>
  )
}
