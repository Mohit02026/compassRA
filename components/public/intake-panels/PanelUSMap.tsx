'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  selectedState?: string
}

// State centroids extracted from the reference site's baked-in circle cx/cy values.
// These are the geographic pin dot positions inside the SVG pan group coordinate space.
// The GSAP transform origins (what the old values were) sit 22.5 units above the dot
// and up to 45 units to the right for small NE states — those caused visible pin drift.
const STATE_CENTROIDS: Record<string, { x: number; y: number; name: string }> = {
  AL: { x: 1011, y: 404,  name: 'Alabama' },
  AK: { x: 262,  y: 506,  name: 'Alaska' },
  AZ: { x: 319,  y: 375,  name: 'Arizona' },
  AR: { x: 844,  y: 369,  name: 'Arkansas' },
  CA: { x: 153,  y: 336,  name: 'California' },
  CO: { x: 462,  y: 296,  name: 'Colorado' },
  CT: { x: 1282, y: 173,  name: 'Connecticut' },
  DC: { x: 1176, y: 232,  name: 'District of Columbia' },
  DE: { x: 1257, y: 238,  name: 'Delaware' },
  FL: { x: 1194, y: 456,  name: 'Florida' },
  GA: { x: 1091, y: 396,  name: 'Georgia' },
  HI: { x: 730,  y: 608,  name: 'Hawaii' },
  ID: { x: 251,  y: 178,  name: 'Idaho' },
  IL: { x: 893,  y: 258,  name: 'Illinois' },
  IN: { x: 974,  y: 250,  name: 'Indiana' },
  IA: { x: 763,  y: 222,  name: 'Iowa' },
  KS: { x: 631,  y: 296,  name: 'Kansas' },
  KY: { x: 1041, y: 295,  name: 'Kentucky' },
  LA: { x: 861,  y: 432,  name: 'Louisiana' },
  ME: { x: 1318, y: 80,   name: 'Maine' },
  MD: { x: 1216, y: 241,  name: 'Maryland' },
  MA: { x: 1291, y: 155,  name: 'Massachusetts' },
  MI: { x: 975,  y: 180,  name: 'Michigan' },
  MN: { x: 730,  y: 122,  name: 'Minnesota' },
  MS: { x: 937,  y: 404,  name: 'Mississippi' },
  MO: { x: 798,  y: 296,  name: 'Missouri' },
  MT: { x: 340,  y: 132,  name: 'Montana' },
  NE: { x: 640,  y: 233,  name: 'Nebraska' },
  NV: { x: 182,  y: 273,  name: 'Nevada' },
  NH: { x: 1281, y: 123,  name: 'New Hampshire' },
  NJ: { x: 1261, y: 212,  name: 'New Jersey' },
  NM: { x: 472,  y: 391,  name: 'New Mexico' },
  NY: { x: 1202, y: 148,  name: 'New York' },
  NC: { x: 1230, y: 326,  name: 'North Carolina' },
  ND: { x: 585,  y: 119,  name: 'North Dakota' },
  OH: { x: 1047, y: 234,  name: 'Ohio' },
  OK: { x: 723,  y: 363,  name: 'Oklahoma' },
  OR: { x: 128,  y: 174,  name: 'Oregon' },
  PA: { x: 1136, y: 208,  name: 'Pennsylvania' },
  RI: { x: 1313, y: 165,  name: 'Rhode Island' },
  SC: { x: 1169, y: 360,  name: 'South Carolina' },
  SD: { x: 585,  y: 185,  name: 'South Dakota' },
  TN: { x: 961,  y: 335,  name: 'Tennessee' },
  TX: { x: 688,  y: 456,  name: 'Texas' },
  UT: { x: 317,  y: 286,  name: 'Utah' },
  VT: { x: 1254, y: 130,  name: 'Vermont' },
  VA: { x: 1178, y: 283,  name: 'Virginia' },
  WA: { x: 128,  y: 97,   name: 'Washington' },
  WV: { x: 1116, y: 258,  name: 'West Virginia' },
  WI: { x: 844,  y: 176,  name: 'Wisconsin' },
  WY: { x: 403,  y: 205,  name: 'Wyoming' },
}

const VIEWBOX_W = 780
const VIEWBOX_H = 362

// Container forces aspectRatio 539/362, SVG viewBox is 780/362.
// With preserveAspectRatio="xMidYMid meet", width constrains (780 > 539 ratio-wise).
// Scale = containerW/780 → SVG content fills 539/780 of container height.
// Y letterbox = (1 - 539/780) / 2 on each side (constant regardless of actual px size).
const SVG_FILL_H = 539 / 780                  // 0.6910 — fraction of container height used
const LETTERBOX_Y = (1 - SVG_FILL_H) / 2      // 0.1545 — top letterbox fraction

// Pan limits match the reference site's unclamped range.
// WA requires tx=261.5, ty=106.5 — old TX_MAX=50/TY_MAX=20 were clipping them.
const TX_MIN = -960
const TX_MAX = 300
const TY_MIN = -440  // HI needs -427, AK needs -325 — old -260 clipped both
const TY_MAX = 130
const DEFAULT_TX = -650
const DEFAULT_TY = -150

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function getMapTransform(state: { x: number; y: number } | null): { tx: number; ty: number } {
  if (!state) return { tx: DEFAULT_TX, ty: DEFAULT_TY }
  return {
    tx: clamp(VIEWBOX_W / 2 - state.x, TX_MIN, TX_MAX),
    ty: clamp(VIEWBOX_H / 2 - state.y, TY_MIN, TY_MAX),
  }
}

// Module-level cache so React Strict Mode's double-invoke doesn't race the fetch.
let svgTextCache: string | null = null
let svgTextPromise: Promise<string> | null = null

function loadSvg(): Promise<string> {
  if (svgTextCache) return Promise.resolve(svgTextCache)
  if (!svgTextPromise) {
    svgTextPromise = fetch('/us-map-3d.svg')
      .then((r) => r.text())
      .then((text) => {
        svgTextCache = text
        return text
      })
  }
  return svgTextPromise
}

export default function PanelUSMap({ selectedState }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadSvg().then((text) => {
      const container = containerRef.current
      if (!container) return
      if (container.querySelector('svg[viewBox="0 0 780 362"]')) {
        setLoaded(true)
        return
      }
      container.innerHTML = text
      const svg = container.querySelector('svg')
      if (svg) {
        svg.removeAttribute('width')
        svg.removeAttribute('height')
        // The SVG file's viewBox was patched for the homepage background display.
        // Restore the interactive coordinate system here so pan/label math works.
        svg.setAttribute('viewBox', '0 0 780 362')
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        svg.style.width = '100%'
        svg.style.height = '100%'
        svg.style.display = 'block'
        // Each <g id="state-XX"> in the source SVG contains a pre-baked label
        // (pin line + dot + rounded rect + state-name glyph paths). The reference
        // site uses GSAP to scale these in/out per-selection; without that they
        // all show at once. Remove them entirely — we render our own label.
        svg.querySelectorAll('[id^="state-"]').forEach((el) => el.remove())
        const g = svg.querySelector('g')
        if (g) {
          // Matches GSAP power2.inOut at 0.7s (extracted from reference JS bundle)
          g.style.transition = 'transform 0.7s cubic-bezier(0.645, 0.045, 0.355, 1)'
        }
      }
      setLoaded(true)
    })
  }, [])

  const stateKey = selectedState && STATE_CENTROIDS[selectedState] ? selectedState : null
  const state = stateKey ? STATE_CENTROIDS[stateKey] : null
  const { tx, ty } = getMapTransform(state)

  useEffect(() => {
    if (!loaded || !containerRef.current) return
    const svg = containerRef.current.querySelector('svg')
    const g = svg?.querySelector('g')
    if (g) g.setAttribute('transform', `translate(${tx}, ${ty})`)
  }, [tx, ty, loaded])

  const labelX = state ? state.x + tx : 0
  const labelY = state ? state.y + ty : 0
  const labelBelow = labelY < 60

  return (
    <div style={{ background: '#ffffff', borderRadius: 24, padding: 8 }}>
      <style>{`
        @keyframes mapLabelPop {
          0%   { opacity: 0; transform: scale(0); }
          65%  { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '539 / 362',
          maxHeight: 378,
          borderRadius: 20,
          overflow: 'hidden',
          background: '#f6f7f8',
        }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        {state && loaded && (
          <div
            key={stateKey}
            style={{
              position: 'absolute',
              left: `${((labelX / VIEWBOX_W) * 100).toFixed(2)}%`,
              top: `${((LETTERBOX_Y + (labelY / VIEWBOX_H) * SVG_FILL_H) * 100).toFixed(2)}%`,
              transform: labelBelow ? 'translate(-50%, 0%)' : 'translate(-50%, -100%)',
              pointerEvents: 'none',
              transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1), top 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: labelBelow ? 'column-reverse' : 'column',
                alignItems: 'center',
                animation: 'mapLabelPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both',
                transformOrigin: labelBelow ? '50% 0%' : '50% 100%',
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  color: '#1a1a1a',
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                  letterSpacing: '-0.005em',
                }}
              >
                {state.name}
              </div>
              <div style={{ width: 1, height: 10, background: '#3b60f3' }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b60f3', marginTop: -1 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
