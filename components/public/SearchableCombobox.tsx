'use client'

import { useState, useRef, useEffect } from 'react'

interface SearchableComboboxProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export default function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  required,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    setOpen(true)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSelect(val: string) {
    onChange(val)
    setOpen(false)
    setQuery('')
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={open ? undefined : handleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          border: open ? '1.5px solid #3b60f3' : '1px solid rgb(220, 222, 226)',
          borderRadius: 8,
          background: '#ffffff',
          padding: '12px 14px',
          cursor: open ? 'default' : 'pointer',
          gap: 8,
          boxShadow: open ? '0 0 0 3px rgba(59,96,243,0.12)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selectedLabel || placeholder}
            required={required && !value}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              fontFamily: 'var(--font-dm-sans)',
              color: 'rgb(50,50,50)',
              background: 'transparent',
            }}
          />
        ) : (
          <span
            style={{
              flex: 1,
              fontSize: 15,
              fontFamily: 'var(--font-dm-sans)',
              color: value ? 'rgb(50,50,50)' : 'rgb(160,160,160)',
            }}
          >
            {selectedLabel || placeholder}
          </span>
        )}

        {value && !open && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgb(130,130,130)',
              fontSize: 16,
              lineHeight: 1,
              padding: '0 2px',
            }}
          >
            ×
          </button>
        )}

        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        >
          <path d="M4 6l4 4 4-4" stroke="rgb(130,130,130)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid rgb(220, 222, 226)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            zIndex: 100,
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '12px 16px', fontSize: 14, color: 'rgb(130,130,130)' }}>
              No results
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  padding: '11px 16px',
                  fontSize: 15,
                  cursor: 'pointer',
                  color: opt.value === value ? '#3b60f3' : 'rgb(50,50,50)',
                  fontWeight: opt.value === value ? 600 : 400,
                  background: opt.value === value ? 'rgba(59,96,243,0.05)' : 'transparent',
                  fontFamily: 'var(--font-dm-sans)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = 'rgb(247,248,252)'
                }}
                onMouseLeave={(e) => {
                  if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
