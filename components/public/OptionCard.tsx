'use client'

interface OptionCardProps {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
}

export default function OptionCard({ selected, onClick, children, disabled }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '16px 20px',
        borderRadius: 10,
        border: selected ? '2px solid #3b60f3' : '1px solid rgb(220, 222, 226)',
        background: selected ? 'rgba(59,96,243,0.04)' : '#ffffff',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 15,
        fontWeight: selected ? 600 : 400,
        color: selected ? '#3b60f3' : 'rgb(50, 50, 50)',
        fontFamily: 'var(--font-dm-sans)',
        transition: 'border-color 0.15s, color 0.15s, background 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Selection indicator dot */}
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: selected ? '2px solid #3b60f3' : '1.5px solid rgb(200, 202, 208)',
          background: selected ? '#3b60f3' : 'transparent',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {selected && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff', display: 'block' }} />
        )}
      </span>
      {children}
    </button>
  )
}
