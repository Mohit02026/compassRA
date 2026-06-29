'use client'

import { useEffect, useRef, useState } from 'react'

const PLACEHOLDER = 'Your Business Name'

export default function PanelBusinessNamePreview({ businessName }: { businessName: string }) {
  const displayName = businessName.trim() || PLACEHOLDER
  const isPlaceholder = !businessName.trim()

  const [revealedCount, setRevealedCount] = useState(0)
  const prevNameRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (displayName !== prevNameRef.current) {
      let common = 0
      while (
        common < prevNameRef.current.length &&
        common < displayName.length &&
        prevNameRef.current[common] === displayName[common]
      ) common++
      setRevealedCount(common)
      prevNameRef.current = displayName
      const reveal = (idx: number) => {
        if (idx >= displayName.length) return
        setRevealedCount(idx + 1)
        timerRef.current = setTimeout(() => reveal(idx + 1), 40)
      }
      reveal(common)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [displayName])

  const letters = displayName.split('')

  return (
    // Outer card — matches reference: 555×378, borderRadius 24px, white bg
    <div style={{
      width: 555,
      height: 378,
      borderRadius: 24,
      background: 'var(--color-bg)',
      position: 'relative',
    }}>
      {/* Inner content area — inset 8px on all sides, borderRadius 20px, overflow hidden */}
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8,
        bottom: 8,
        left: 8,
        borderRadius: 20,
        overflow: 'hidden',
        background: 'rgb(255,255,255)',
      }}>
        {/* Stamp SVG — same viewBox as reference (0 0 539 362), fills inner area exactly */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/stamp.svg"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />

        {/* Text — matches reference foreignObject: x=5%, y=58% of 539×362 inner area */}
        <div className="font-script" style={{
          position: 'absolute',
          left: '5%',
          top: '58%',
          width: '80%',
          height: 80,
          fontSize: 64,
          fontWeight: 400,
          color: 'rgb(59,96,243)',
          lineHeight: '80px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'pre',
          textAlign: 'center',
          opacity: isPlaceholder ? 0.35 : 1,
          transition: 'opacity 0.3s ease',
        }}>
          {letters.map((ch, i) => (
            <span
              key={`${displayName}-${i}`}
              style={{
                display: 'inline-block',
                minWidth: ch === ' ' ? '0.3em' : undefined,
                opacity: i < revealedCount ? 1 : 0,
                transform: i < revealedCount ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
              }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
