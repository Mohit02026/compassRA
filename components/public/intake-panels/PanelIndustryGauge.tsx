'use client'

import { useEffect, useState } from 'react'

interface PanelIndustryGaugeProps {
  industry: string
}

const SECTOR: Record<string, number> = {
  accounting: 0, advertising: 0, consulting: 0, it: 0, software: 0,
  legal: 0, marketing: 0, media: 0, telecom: 0, sales: 0, other: 0,
  architecture: 0,
  'food-beverage': 1, restaurant: 1, catering: 1, 'food-truck': 1,
  entertainment: 1, events: 1, travel: 1,
  construction: 2, manufacturing: 2, agriculture: 2, automotive: 2,
  landscaping: 2, 'home-services': 2, warehousing: 2, logistics: 2, transportation: 2,
  'health-wellness': 3, fitness: 3, sports: 3, nonprofit: 3, education: 3, security: 3,
  beauty: 3,
  retail: 4, ecommerce: 4, fashion: 4, 'real-estate': 4,
  property: 4, wholesale: 4, 'import-export': 4,
}

// Each sector's resting offset from 0°.
// Spin target = 3600 + offset so the active sector lands at the top after 10 rotations.
const SECTOR_OFFSET = [0, -72, 72, 144, -144]

const SPRITE_ID: Record<string, string> = {
  accounting: 'accounting',
  advertising: 'advertising',
  agriculture: 'agriculture',
  architecture: 'architecture',
  automotive: 'automotive-services',
  beauty: 'beauty-and-personal-care',
  catering: 'catering',
  construction: 'construction',
  consulting: 'consulting',
  ecommerce: 'e-commerce',
  education: 'education-and-training',
  entertainment: 'entertainment',
  events: 'event-planning',
  fashion: 'fashion-and-apparel',
  fitness: 'fitness',
  'food-beverage': 'food-and-beverage',
  'food-truck': 'food-truck',
  'health-wellness': 'health-and-wellness',
  'home-services': 'home-services',
  'import-export': 'import-and-export',
  it: 'information-technology',
  landscaping: 'home-services',
  legal: 'legal-services',
  logistics: 'logistics',
  manufacturing: 'manufacturing',
  marketing: 'marketing-services',
  media: 'media-and-publishing',
  nonprofit: 'nonprofit2',
  other: 'other',
  property: 'property-management',
  'real-estate': 'real-estate',
  restaurant: 'restaurant',
  retail: 'retail',
  sales: 'sales-services',
  security: 'security-services',
  software: 'software-development',
  sports: 'sports-and-recreation',
  telecom: 'telecommunications',
  transportation: 'transportation',
  travel: 'tourism',
  warehousing: 'warehousing',
  wholesale: 'wholesale',
}

export default function PanelIndustryGauge({ industry }: PanelIndustryGaugeProps) {
  const s = SECTOR[industry] ?? 0
  const [spinKey, setSpinKey] = useState(0)
  const [showIcon, setShowIcon] = useState(false)

  useEffect(() => {
    if (!industry) {
      setShowIcon(false)
      return
    }
    setShowIcon(false)
    setSpinKey(k => k + 1)
    const t = setTimeout(() => setShowIcon(true), 2500)
    return () => clearTimeout(t)
  }, [industry])

  const fill = (idx: number) =>
    (!industry && idx === 0) || (industry && s === idx) ? '#3B60F3' : '#E2E9F7'

  const spriteId = SPRITE_ID[industry] ?? 'other'

  // Each sector's keyframe spins 3600° + its offset so it lands at the top
  const spinDeg = 3600 + SECTOR_OFFSET[s]

  return (
    <div style={{
      width: 555,
      height: 394,
      borderRadius: 24,
      background: '#ffffff',
      padding: 8,
      boxSizing: 'border-box',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        background: '#F6F7F8',
      }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="570"
          height="710"
          viewBox="0 0 570 710"
          fill="none"
          style={{ display: 'block' }}
        >
          <defs>
            <style>{`
              @keyframes ig-spin {
                0%   { transform: rotate(0deg); }
                100% { transform: rotate(${spinDeg}deg); }
              }
            `}</style>
            <filter id="ig-f" x="106" y="155" width="492" height="588" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="9" /><feGaussianBlur stdDeviation="10" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.05 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="e1" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="36" /><feGaussianBlur stdDeviation="18" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.04 0" />
              <feBlend mode="normal" in2="e1" result="e2" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="81" /><feGaussianBlur stdDeviation="24.5" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.03 0" />
              <feBlend mode="normal" in2="e2" result="e3" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="144" /><feGaussianBlur stdDeviation="28.5" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0 0.709804 0 0 0 0.01 0" />
              <feBlend mode="normal" in2="e3" result="e4" />
              <feBlend mode="normal" in="SourceGraphic" in2="e4" result="shape" />
            </filter>
            <clipPath id="ig-a">
              <rect width="707" height="710" rx="16" fill="white" />
            </clipPath>
          </defs>

          <g clipPath="url(#ig-a)" transform="translate(-62, 0)">
            {/*
              key={spinKey} remounts the element on each selection, resetting the
              animation to frame 0. The keyframe spins to (3600 + sector_offset)°
              so after 10 full rotations the active sector lands at the top.
            */}
            <g
              key={spinKey}
              style={{
                transformOrigin: '352px 354px',
                transformBox: 'fill-box' as React.CSSProperties['transformBox'],
                animation: spinKey > 0 ? 'ig-spin 2.5s ease forwards' : undefined,
              }}
            >
              <rect width="707" height="710" rx="16" fill="#F6F7F8" />
              <path d="M547.233 68.3424C487.079 27.2306 415.483 6.1573 342.649 8.12638C269.816 10.0955 199.462 35.0065 141.618 79.3083L237.462 204.45C268.954 180.331 307.257 166.769 346.909 165.697C386.562 164.625 425.541 176.098 458.29 198.48L547.233 68.3424Z" fill={fill(0)} />
              <path d="M683.752 452.269C704.445 382.41 702.557 307.8 678.357 239.076C654.156 170.353 608.878 111.023 548.978 69.5432L459.24 199.134C491.852 221.716 516.502 254.017 529.678 291.432C542.853 328.847 543.881 369.467 532.615 407.501L683.752 452.269Z" fill={fill(1)} />
              <path d="M141.369 79.4997C83.565 123.854 41.2382 185.324 20.4219 255.147C-0.394402 324.97 1.36224 399.582 25.4414 468.348L174.212 416.254C161.103 378.816 160.147 338.195 171.48 300.182C182.813 262.168 205.857 228.702 237.326 204.554L141.369 79.4997Z" fill={fill(2)} />
              <path d="M25.846 469.497C50.1672 538.178 95.5488 597.428 155.522 638.802C215.495 680.176 286.998 701.562 359.84 699.911L356.268 542.324C316.611 543.222 277.683 531.579 245.032 509.054C212.381 486.529 187.674 454.272 174.433 416.88L25.846 469.497Z" fill={fill(3)} />
              <path d="M361.057 699.881C433.892 697.974 504.266 673.123 562.148 628.871C620.03 584.618 662.465 523.223 683.404 453.437L532.425 408.136C521.025 446.13 497.923 479.555 466.41 503.647C434.898 527.739 396.584 541.269 356.931 542.307L361.057 699.881Z" fill={fill(4)} />
            </g>

            <g>
              <path d="M343.439 126.5C346.133 121.833 352.869 121.833 355.563 126.5L402.761 208.25H296.24L343.439 126.5Z" fill="white" />
              <g filter="url(#ig-f)">
                <rect x="163" y="166" width="378" height="376" rx="188" fill="white" />
              </g>
              <line x1="549.277" y1="69.2938" x2="458.098" y2="199.553" stroke="white" strokeWidth="8" />
              <line x1="141.194" y1="79.5919" x2="236.194" y2="205.592" stroke="white" strokeWidth="8" />
            </g>
          </g>
        </svg>

        {industry && (
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            style={{
              position: 'absolute',
              top: 58,
              left: 287,
              transform: 'translateX(-50%)',
              color: 'rgb(226, 233, 247)',
              opacity: showIcon ? 1 : 0,
              transition: 'opacity 0.05s ease',
              pointerEvents: 'none',
            }}
          >
            <use href={`/sprites/bussiness-type.svg#${spriteId}`} />
          </svg>
        )}
      </div>
    </div>
  )
}
