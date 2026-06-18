interface PanelIndustryGaugeProps {
  industry: string
}

// Map industries to needle angle (-90=left, 0=center, 90=right)
function getAngle(industry: string): number {
  if (!industry) return 0
  const hash = industry.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return ((hash % 7) - 3) * 25
}

export default function PanelIndustryGauge({ industry }: PanelIndustryGaugeProps) {
  const angle = getAngle(industry)
  const hasSelection = !!industry

  // Build arc path for the gauge
  const cx = 160, cy = 160, r = 110
  function polarToXY(angleDeg: number, radius: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    }
  }

  // Sectors: each 36 degrees wide, total 180 (semicircle)
  const sectors = [
    { start: 180, end: 216, color: hasSelection ? 'rgb(215,222,240)' : 'rgb(215,222,240)', icon: '📊' },
    { start: 216, end: 252, color: hasSelection ? 'rgb(200,212,238)' : '#3b60f3', icon: '🏗️' },
    { start: 252, end: 288, color: hasSelection ? 'rgb(215,222,240)' : 'rgb(215,222,240)', icon: '💼' },
    { start: 288, end: 324, color: 'rgb(215,222,240)', icon: '🛍️' },
    { start: 324, end: 360, color: 'rgb(220,226,242)', icon: '🎯' },
  ]

  // Active sector index based on angle
  const activeIdx = Math.floor(((angle + 90) / 180) * 5)

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid rgb(230, 232, 236)',
        padding: 24,
        minHeight: 340,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg viewBox="0 0 320 200" style={{ width: '100%', maxWidth: 320, overflow: 'visible' }}>
        {/* Gauge sectors */}
        {sectors.map((sector, i) => {
          const start = polarToXY(sector.start, r)
          const end = polarToXY(sector.end, r)
          const innerStart = polarToXY(sector.start, r - 40)
          const innerEnd = polarToXY(sector.end, r - 40)
          const isActive = i === activeIdx && hasSelection

          return (
            <path
              key={i}
              d={`M ${innerStart.x} ${innerStart.y}
                  A ${r - 40} ${r - 40} 0 0 1 ${innerEnd.x} ${innerEnd.y}
                  L ${end.x} ${end.y}
                  A ${r} ${r} 0 0 0 ${start.x} ${start.y} Z`}
              fill={isActive ? '#3b60f3' : sector.color}
              stroke="#ffffff"
              strokeWidth="2"
              style={{ transition: 'fill 0.3s ease' }}
            />
          )
        })}

        {/* Center hub */}
        <circle cx={cx} cy={cy} r="18" fill="#ffffff" stroke="rgb(220,224,235)" strokeWidth="2" />

        {/* Needle */}
        <g
          transform={`rotate(${angle}, ${cx}, ${cy})`}
          style={{ transition: 'transform 0.5s ease' }}
        >
          <line
            x1={cx}
            y1={cy - 8}
            x2={cx}
            y2={cy - r + 20}
            stroke={hasSelection ? '#1a1a2e' : 'rgb(180,185,200)'}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transition: 'stroke 0.3s' }}
          />
          <circle cx={cx} cy={cy} r="6" fill={hasSelection ? '#1a1a2e' : 'rgb(180,185,200)'} />
        </g>

        {/* Bottom icons at sector centers */}
        <text x="75" y="178" textAnchor="middle" fontSize="14">📊</text>
        <text x="115" y="158" textAnchor="middle" fontSize="14">🏗️</text>
        <text x={cx} y="148" textAnchor="middle" fontSize="14">💼</text>
        <text x="205" y="158" textAnchor="middle" fontSize="14">🛍️</text>
        <text x="245" y="178" textAnchor="middle" fontSize="14">🎯</text>
      </svg>

      <p
        style={{
          marginTop: 8,
          fontSize: 13,
          color: industry ? 'rgb(50,50,50)' : 'rgb(130,130,130)',
          fontFamily: 'var(--font-dm-sans)',
          fontWeight: industry ? 600 : 400,
          textAlign: 'center',
        }}
      >
        {industry
          ? industry.charAt(0).toUpperCase() + industry.slice(1)
          : 'Select your industry'}
      </p>
    </div>
  )
}
