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
        className="px-5 md:px-10"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1440,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 17,
        }}
      >
        <h1
          className="text-[36px] md:text-[60px]"
          style={{
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Start Your Business in Minutes
        </h1>
        <p
          className="text-[18px] md:text-[24px]"
          style={{
            fontWeight: 500,
            color: 'rgb(255,255,255)',
            maxWidth: 670,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          Create your business effortlessly. Our streamlined process ensures
          you&apos;re up and running in no time.
        </p>
        <Link
          href="/llc"
          className="w-full md:w-auto md:min-w-[418px]"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#3b60f3',
            color: '#ffffff',
            borderRadius: 8,
            padding: '0 40px',
            height: 70,
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
