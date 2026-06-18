export default function PanelUSMap() {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid rgb(230, 232, 236)',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 340,
      }}
    >
      <svg viewBox="0 0 500 320" style={{ width: '100%', maxWidth: 420 }} fill="none">
        {/* Simplified US continental outline */}
        <path
          d="M60,80 L70,60 L90,55 L110,50 L140,45 L180,42 L220,40 L260,38 L300,36 L340,38 L380,42 L410,48 L430,58 L440,72 L445,88 L442,105 L438,120 L430,135 L420,148 L405,158 L390,165 L375,168 L358,170 L340,172 L320,174 L300,176 L280,178 L260,180 L240,185 L220,190 L200,196 L180,200 L160,204 L140,206 L120,205 L100,202 L82,196 L68,186 L58,172 L55,158 L54,142 L55,126 L57,110 L60,95 Z"
          fill="rgb(226, 232, 246)"
          stroke="rgb(200, 210, 235)"
          strokeWidth="1.5"
        />

        {/* Florida peninsula */}
        <path
          d="M300,176 L310,180 L318,188 L324,198 L328,210 L330,224 L328,238 L324,250 L318,260 L312,268 L305,272 L298,270 L292,264 L287,255 L284,244 L283,232 L284,220 L286,208 L290,198 L295,188 Z"
          fill="#3b60f3"
          stroke="#2d4fd4"
          strokeWidth="1.5"
        />

        {/* Florida label */}
        <text x="295" y="230" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="600" fontFamily="var(--font-dm-sans)">
          FL
        </text>

        {/* Location pin on Florida */}
        <circle cx="298" cy="205" r="7" fill="#ffffff" stroke="#3b60f3" strokeWidth="2" />
        <circle cx="298" cy="205" r="3" fill="#3b60f3" />

        {/* Faint state grid lines */}
        <line x1="170" y1="42" x2="170" y2="200" stroke="rgb(210,215,230)" strokeWidth="0.5" strokeDasharray="3,3" />
        <line x1="250" y1="38" x2="250" y2="185" stroke="rgb(210,215,230)" strokeWidth="0.5" strokeDasharray="3,3" />
        <line x1="330" y1="38" x2="330" y2="174" stroke="rgb(210,215,230)" strokeWidth="0.5" strokeDasharray="3,3" />
        <line x1="60" y1="120" x2="440" y2="120" stroke="rgb(210,215,230)" strokeWidth="0.5" strokeDasharray="3,3" />

        {/* Decorative dots on other states */}
        {[
          [130, 90], [200, 70], [280, 65], [360, 75], [400, 100],
          [380, 140], [340, 160], [220, 155], [150, 150], [100, 130],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill="rgb(200,210,235)" />
        ))}
      </svg>

      <p style={{ marginTop: 16, fontSize: 14, color: 'rgb(130,130,130)', fontFamily: 'var(--font-dm-sans)' }}>
        Florida, United States
      </p>
    </div>
  )
}
