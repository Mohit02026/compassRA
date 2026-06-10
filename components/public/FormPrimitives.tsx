'use client'

// Shared input primitives used by llc/page.tsx and EINAddOnFields.tsx.
// Single source of truth — guarantees identical styling everywhere.

export const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid oklch(0.88 0.015 245)',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 14,
  outline: 'none',
  background: 'white',
  color: 'oklch(0.22 0.06 245)',
  fontFamily: 'var(--font-dm)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

export function StyledInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { extraStyle?: React.CSSProperties }
) {
  const { extraStyle, ...rest } = props
  return (
    <input
      {...rest}
      style={{ ...INPUT_STYLE, ...extraStyle }}
      onFocus={(e) => {
        e.target.style.borderColor = 'oklch(0.56 0.18 250)'
        e.target.style.boxShadow = '0 0 0 3px oklch(0.56 0.18 250 / 0.12)'
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'oklch(0.88 0.015 245)'
        e.target.style.boxShadow = 'none'
        props.onBlur?.(e)
      }}
    />
  )
}

export function StyledSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ ...INPUT_STYLE, cursor: 'pointer', ...props.style }}
      onFocus={(e) => {
        e.target.style.borderColor = 'oklch(0.56 0.18 250)'
        e.target.style.boxShadow = '0 0 0 3px oklch(0.56 0.18 250 / 0.12)'
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'oklch(0.88 0.015 245)'
        e.target.style.boxShadow = 'none'
        props.onBlur?.(e)
      }}
    />
  )
}

export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: 'var(--font-jakarta)',
          color: 'oklch(0.34 0.06 245)',
          marginBottom: hint ? 4 : 6,
        }}
      >
        {label}
        {required && (
          <span style={{ color: 'oklch(0.55 0.18 25)', marginLeft: 2 }}>*</span>
        )}
      </label>
      {hint && (
        <p style={{ fontSize: 12, color: 'oklch(0.55 0.05 245)', marginBottom: 5, lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}
