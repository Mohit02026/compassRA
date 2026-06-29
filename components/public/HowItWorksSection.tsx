'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const STEPS = [
  {
    num: 1,
    title: 'Provide your business details',
    body: 'Enter your preferred company name and basic details — it only takes a few minutes. Our system automatically prepares the necessary registration forms for you.',
    img: '/hiw-step1.webp',
  },
  {
    num: 2,
    title: 'Choose your plan',
    body: "Select the plan that best fits your business needs. Whether you're starting small or scaling fast, we've got you covered with flexible options.",
    img: '/hiw-step2.webp',
  },
  {
    num: 3,
    title: 'Complete payment and submit',
    body: 'Review your information, make a secure payment, and submit your application. Our experts will handle the rest and keep you updated every step of the way.',
    img: '/hiw-step3.webp',
  },
]

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    stepRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(i) },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <section
      style={{
        background: 'rgb(241,242,243)',
        fontFamily: 'var(--font-dm-sans)',
        paddingTop: 120,
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1440, padding: '0 40px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* ── Left: sticky panel, vertically centered in viewport ── */}
          <div
            className="hidden lg:flex flex-col justify-center"
            style={{ position: 'sticky', top: 0, height: '100vh' }}
          >
            <h2 style={{ fontSize: 48, fontWeight: 600, color: 'rgb(23,23,23)', marginBottom: 12 }}>
              How it Works
            </h2>
            <p style={{ fontSize: 19, color: 'rgb(100,100,100)', marginBottom: 40 }}>
              Get Your Business Created in 3 Simple Steps – Fast, Secure, and Stress-Free.
            </p>

            {/* Image carousel */}
            <div
              style={{
                borderRadius: 20,
                boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                width: '100%',
                aspectRatio: '4/3',
                position: 'relative',
                background: '#e8eaf0',
              }}
            >
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute', inset: 0,
                    opacity: activeStep === i ? 1 : 0,
                    transition: 'opacity 0.55s ease',
                  }}
                >
                  <Image
                    src={step.img} alt={step.title} fill priority
                    style={{ objectFit: 'cover' }} sizes="640px"
                  />
                </div>
              ))}
            </div>

            {/* Navigation dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 24 }}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{
                    width: activeStep === i ? 28 : 9, height: 9,
                    borderRadius: 99, padding: 0, border: 'none', cursor: 'pointer',
                    background: activeStep === i ? '#3b60f3' : 'rgb(200,205,215)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Right: each step is 100vh tall, content centered ──
              This ensures step #1 sits at viewport center when the
              section first appears, and each subsequent step does too.
          */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Mobile heading */}
            <div className="lg:hidden" style={{ padding: '80px 0 48px' }}>
              <h2 style={{ fontSize: 40, fontWeight: 700, color: 'rgb(23,23,23)', marginBottom: 10 }}>
                How it Works
              </h2>
              <p style={{ fontSize: 17, color: 'rgb(100,100,100)' }}>
                Get Your Business Created in 3 Simple Steps – Fast, Secure, and Stress-Free.
              </p>
            </div>

            {STEPS.map((step, i) => (
              <div
                key={step.num}
                ref={(el) => { stepRefs.current[i] = el }}
                style={{
                  minHeight: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    opacity: activeStep === i ? 1 : 0.28,
                    transform: activeStep === i ? 'translateX(0)' : 'translateX(-14px)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                  }}
                >
                  {/* Step number */}
                  <div
                    style={{
                      fontSize: 'clamp(60px, 7vw, 84px)',
                      fontWeight: 800,
                      color: activeStep === i ? '#3b60f3' : 'rgb(195,200,215)',
                      lineHeight: 1, marginBottom: 20, letterSpacing: '-0.02em',
                      transition: 'color 0.4s ease',
                    }}
                  >
                    #{step.num}
                  </div>

                  {/* Mobile image */}
                  <div
                    className="lg:hidden"
                    style={{ marginBottom: 24, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
                  >
                    <Image src={step.img} alt={step.title} width={600} height={450}
                      style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>

                  <h3 style={{ fontSize: 36, fontWeight: 600, color: 'rgb(23,23,23)', marginBottom: 16, lineHeight: 1.25 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 17, lineHeight: 1.85, color: 'rgb(80,80,80)' }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
