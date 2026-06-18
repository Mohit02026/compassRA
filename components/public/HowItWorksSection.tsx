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
    function onScroll() {
      // The "activation point" sits 40% from the top of the viewport
      const activationY = window.scrollY + window.innerHeight * 0.4
      let closest = 0
      let closestDist = Infinity
      stepRefs.current.forEach((el, i) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const stepMid = window.scrollY + rect.top + rect.height / 2
        const dist = Math.abs(stepMid - activationY)
        if (dist < closestDist) { closestDist = dist; closest = i }
      })
      setActiveStep(closest)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      style={{
        padding: '0 40px',
        fontFamily: 'var(--font-dm-sans)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1440, marginTop: 120 }}>
        <h2
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: 'rgb(23, 23, 23)',
            marginBottom: 10,
          }}
        >
          How it Works
        </h2>
        <p
          style={{
            fontSize: 17,
            color: 'rgb(100, 100, 100)',
            marginBottom: 72,
          }}
        >
          Get Your Business Created in 3 Simple Steps – Fast, Secure, and Stress-Free.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: sticky illustration panel */}
          <div className="hidden lg:block" style={{ position: 'sticky', top: 96 }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                border: '1px solid rgb(230,232,240)',
                overflow: 'hidden',
                width: '100%',
                aspectRatio: '4/3',
                position: 'relative',
              }}
            >
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: activeStep === i ? 1 : 0,
                    transition: 'opacity 0.45s ease',
                    pointerEvents: activeStep === i ? 'auto' : 'none',
                  }}
                >
                  <Image
                    src={step.img}
                    alt={step.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="580px"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            {/* Step dots */}
            <div className="flex justify-center gap-2.5" style={{ marginTop: 20 }}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{
                    width: activeStep === i ? 24 : 8,
                    height: 8,
                    borderRadius: 99,
                    background: activeStep === i ? '#3b60f3' : 'rgb(200,205,215)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: steps */}
          <div className="flex flex-col gap-20">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                ref={(el) => {
                  stepRefs.current[i] = el
                }}
                style={{
                  opacity: activeStep === i ? 1 : 0.45,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(52px, 6vw, 72px)',
                    fontWeight: 800,
                    color: activeStep === i ? '#3b60f3' : 'rgb(200,205,215)',
                    lineHeight: 1,
                    marginBottom: 18,
                    letterSpacing: '-0.02em',
                    transition: 'color 0.3s ease',
                  }}
                >
                  #{step.num}
                </div>

                {/* Mobile: show image inline */}
                <div className="lg:hidden" style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid rgb(230,232,240)' }}>
                  <Image
                    src={step.img}
                    alt={step.title}
                    width={600}
                    height={450}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>

                <h3
                  style={{
                    fontSize: 32,
                    fontWeight: 500,
                    color: 'rgb(23, 23, 23)',
                    marginBottom: 14,
                    lineHeight: 1.25,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: 'rgb(80, 80, 80)' }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
