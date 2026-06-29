'use client'

interface PanelContactCardProps {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function PanelContactCard({ firstName, lastName, email, phone }: PanelContactCardProps) {
  const rows = [
    { label: 'First name', value: firstName, y: 65, valid: firstName.trim().length > 0 },
    { label: 'Last name', value: lastName, y: 127, valid: lastName.trim().length > 0 },
    { label: 'Email', value: email, y: 189, valid: email.includes('@') },
    { label: 'Phone', value: phone, y: 251, valid: phone.replace(/\D/g, '').length >= 10 },
  ]

  return (
    <div style={{ width: 555, height: 378, borderRadius: 24, background: 'var(--color-bg)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 8, right: 8, bottom: 8, left: 8, borderRadius: 20, overflow: 'hidden', background: '#f6f7f8' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="539" height="362" viewBox="0 0 539 362" fill="none">
          <defs>
            <clipPath id="step3-clip">
              <rect width="539" height="362" fill="#fff" rx="16" />
            </clipPath>
            <filter id="step3-shadow" width="623" height="517" x="-42" y="18" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="9" />
              <feGaussianBlur stdDeviation="10" />
              <feColorMatrix values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.05 0" />
              <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="36" />
              <feGaussianBlur stdDeviation="18" />
              <feColorMatrix values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.04 0" />
              <feBlend in2="effect1_dropShadow" result="effect2_dropShadow" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="81" />
              <feGaussianBlur stdDeviation="24.5" />
              <feColorMatrix values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.03 0" />
              <feBlend in2="effect2_dropShadow" result="effect3_dropShadow" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="144" />
              <feGaussianBlur stdDeviation="28.5" />
              <feColorMatrix values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.01 0" />
              <feBlend in2="effect3_dropShadow" result="effect4_dropShadow" />
              <feBlend in="SourceGraphic" in2="effect4_dropShadow" result="shape" />
            </filter>
          </defs>

          <g clipPath="url(#step3-clip)">
            {/* Background */}
            <rect width="539" height="362" fill="#f6f7f8" rx="16" />

            {/* White card with layered shadow */}
            <g filter="url(#step3-shadow)">
              <rect width="509" height="305" x="15" y="29" fill="#fff" rx="24" />
            </g>

            {/* Person avatar circle */}
            <circle cx="76" cy="90" r="37" fill="#f5f7fe" />
            <path stroke="#3b60f3" d="M70.669 82a5.333 5.333 0 1 0 10.667 0 5.333 5.333 0 0 0-10.667 0ZM86.664 97.333c0 3.314 0 6-10.666 6s-10.667-2.686-10.667-6 4.776-6 10.667-6c5.89 0 10.666 2.687 10.666 6Z" />

            {/* Field rows */}
            {rows.map((row) => (
              <g key={row.label}>
                {/* Field background rect */}
                <rect width="369" height="53" x="125" y={row.y} fill="#f5f7fe" rx="16" />

                {/* Field text via foreignObject */}
                <foreignObject x="125" y={row.y} width="369" height="53">
                  <div
                    // @ts-expect-error xmlns required for foreignObject
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '0 16px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
                      color: 'rgb(140,140,140)',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.06em',
                      lineHeight: 1,
                      marginBottom: 3,
                    }}>
                      {row.label}
                    </span>
                    <span style={{
                      fontSize: 14,
                      fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
                      color: row.value.trim() ? 'rgb(30,30,30)' : 'rgb(180,180,180)',
                      lineHeight: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {row.value.trim() || '—'}
                    </span>
                  </div>
                </foreignObject>

                {/* Green check mark — shows when valid */}
                {row.valid && (
                  <g>
                    <path
                      stroke="#27c250"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={`M472 ${row.y + 27}a10.002 10.002 0 0 0 17.071 7.071A10.002 10.002 0 0 0 482 ${row.y + 17}a10 10 0 0 0-10 10`}
                    />
                    <path
                      stroke="#27c250"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={`m479 ${row.y + 27} 2 2 4-4`}
                    />
                  </g>
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
