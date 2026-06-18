// experience: 'none' | 'some' | 'experienced'
interface PanelBubbleChartProps {
  experience: string
}

const POSITIONS = {
  none:        { x: 20, label: 'Getting Started' },
  some:        { x: 50, label: 'Growing' },
  experienced: { x: 80, label: 'Established' },
}

export default function PanelBubbleChart({ experience }: PanelBubbleChartProps) {
  const pos = POSITIONS[experience as keyof typeof POSITIONS] ?? POSITIONS.none

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid rgb(230, 232, 236)',
        padding: 32,
        minHeight: 340,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Bubble chart */}
      <svg viewBox="0 0 320 240" style={{ width: '100%', maxWidth: 320 }}>
        {/* Background grid */}
        {[40, 80, 120, 160, 200].map((y) => (
          <line key={y} x1="20" y1={y} x2="300" y2={y} stroke="rgb(235,238,244)" strokeWidth="1" />
        ))}
        {[60, 120, 180, 240, 300].map((x) => (
          <line key={x} x1={x} y1="20" x2={x} y2="220" stroke="rgb(235,238,244)" strokeWidth="1" />
        ))}

        {/* Other companies (static gray bubbles) */}
        <circle cx="80" cy="160" r="22" fill="rgb(225,228,238)" opacity="0.7" />
        <circle cx="150" cy="120" r="32" fill="rgb(215,220,235)" opacity="0.6" />
        <circle cx="220" cy="90" r="18" fill="rgb(225,228,238)" opacity="0.7" />
        <circle cx="260" cy="150" r="24" fill="rgb(215,220,235)" opacity="0.5" />
        <circle cx="100" cy="80" r="14" fill="rgb(230,232,240)" opacity="0.8" />
        <circle cx="190" cy="170" r="20" fill="rgb(220,224,236)" opacity="0.6" />

        {/* Axis labels */}
        <text x="160" y="235" textAnchor="middle" fontSize="9" fill="rgb(160,165,178)" fontFamily="var(--font-dm-sans)">
          Experience
        </text>
        <text x="12" y="120" textAnchor="middle" fontSize="9" fill="rgb(160,165,178)" fontFamily="var(--font-dm-sans)" transform="rotate(-90, 12, 120)">
          Growth
        </text>

        {/* "Your Company" bubble — animated position */}
        <circle
          cx={pos.x * 2.6 + 50}
          cy={180 - pos.x * 0.8}
          r="28"
          fill="#3b60f3"
          opacity="0.9"
          style={{ transition: 'cx 0.5s ease, cy 0.5s ease' }}
        />
        <text
          x={pos.x * 2.6 + 50}
          y={180 - pos.x * 0.8 - 36}
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill="#3b60f3"
          fontFamily="var(--font-dm-sans)"
        >
          Your Company
        </text>
        {/* Arrow pointing to bubble */}
        <line
          x1={pos.x * 2.6 + 50}
          y1={180 - pos.x * 0.8 - 30}
          x2={pos.x * 2.6 + 50}
          y2={180 - pos.x * 0.8 - 3}
          stroke="#3b60f3"
          strokeWidth="1.5"
          markerEnd="url(#arrow)"
        />
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#3b60f3" />
          </marker>
        </defs>
      </svg>

      <p style={{ marginTop: 8, fontSize: 13, color: 'rgb(130,130,130)', fontFamily: 'var(--font-dm-sans)' }}>
        {experience ? pos.label : 'Select your experience level'}
      </p>
    </div>
  )
}
