import Link from 'next/link'

const PLANS = [
  {
    name: 'Basic',
    price: '$249',
    popular: false,
    features: [
      'Name availability search',
      'Company registration in the selected state',
      '7-10 day processing time*',
      '100% accuracy guaranteed',
      'Access to Customer Portal to track your business filings',
      'File necessary annual reports',
    ],
  },
  {
    name: 'Professional',
    price: '$349',
    popular: true,
    features: [
      'Name availability search',
      'Company registration in the selected state',
      '24 hour processing time*',
      '100% accuracy guaranteed',
      'Access to Customer Portal to track your business filings',
      'File necessary annual reports',
      'Ongoing compliance (state-required)',
      'Operating Agreement template',
    ],
  },
  {
    name: 'Enterprise',
    price: '$449',
    popular: false,
    features: [
      'Name availability search',
      'Company registration in the selected state',
      '24 hour processing time*',
      '100% accuracy guaranteed',
      'Access to Customer Portal to track your business filings',
      'File necessary annual reports',
      'Ongoing compliance (state-required)',
      'Operating Agreement template',
      'Obtaining an EIN (Taxpayer ID)',
    ],
  },
]

function CheckIcon({ popular }: { popular: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, marginTop: 1 }}
    >
      <rect
        x="1"
        y="1"
        width="16"
        height="16"
        rx="3"
        fill={popular ? 'rgba(255,255,255,0.25)' : 'transparent'}
        stroke={popular ? 'rgba(255,255,255,0.5)' : 'rgb(180,185,200)'}
        strokeWidth="1.2"
      />
      <polyline
        points="4.5,9 7.5,12 13.5,6"
        stroke={popular ? 'white' : 'rgb(80,100,160)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default function PricingSection() {
  return (
    <section
      id="pricing"
      style={{
        background: 'rgb(241,242,243)',
        padding: '100px 40px',
        fontFamily: 'var(--font-dm-sans)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1440 }}>
        <h2
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: 'rgb(23, 23, 23)',
            marginBottom: 8,
          }}
        >
          Simple, Transparent Pricing
        </h2>
        <p style={{ fontSize: 16, color: 'rgb(100, 100, 100)', marginBottom: 48 }}>
          Compare our three pricing plans and choose the best option for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="flex flex-col"
              style={{
                background: plan.popular ? '#3b60f3' : '#ffffff',
                border: plan.popular ? 'none' : '1px solid rgba(0,0,0,0.08)',
                borderTop: plan.popular ? '3px solid rgba(255,255,255,0.3)' : undefined,
                borderRadius: 16,
                padding: '28px 28px 32px',
              }}
            >
              {/* Plan name + badge */}
              <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: plan.popular ? '#ffffff' : 'rgb(20,20,20)',
                    margin: 0,
                  }}
                >
                  {plan.name} Plan
                </h3>
                {plan.popular && (
                  <span
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      color: '#3b60f3',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 99,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Most popular
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1" style={{ marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 44,
                    fontWeight: 700,
                    color: plan.popular ? '#ffffff' : '#3b60f3',
                  }}
                >
                  {plan.price}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: plan.popular ? 'rgba(255,255,255,0.75)' : 'rgb(130,130,130)',
                  }}
                >
                  /year
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: plan.popular ? 'rgba(255,255,255,0.7)' : 'rgb(130,130,130)',
                  marginBottom: 28,
                }}
              >
                + state filing fee
              </p>

              {/* CTA */}
              <Link
                href="/llc"
                className="block text-center"
                style={{
                  background: plan.popular ? '#ffffff' : '#3b60f3',
                  color: plan.popular ? '#3b60f3' : '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: 15,
                  marginBottom: 28,
                  textDecoration: 'none',
                }}
              >
                Get Started
              </Link>

              {/* Features */}
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: plan.popular ? 'rgba(255,255,255,0.85)' : 'rgb(60,60,60)',
                  marginBottom: 16,
                }}
              >
                What is included{plan.popular ? ':' : ''}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5"
                    style={{ marginBottom: 10 }}
                  >
                    <CheckIcon popular={plan.popular} />
                    <span
                      style={{
                        fontSize: 14,
                        color: plan.popular ? 'rgba(255,255,255,0.9)' : 'rgb(76,76,76)',
                        lineHeight: 1.5,
                      }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: 12,
            color: 'rgb(130,130,130)',
            textAlign: 'center',
            marginTop: 24,
            lineHeight: 1.6,
          }}
        >
          *Processing times are based on receiving complete information. Compass Registered Agent
          processing times do not include Secretary of State processing times, which can vary.
        </p>
      </div>
    </section>
  )
}
