'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div style={{ fontFamily: 'var(--font-dm-sans)' }}>
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom: '1px solid rgb(220, 220, 220)' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left"
          >
            <span style={{ fontSize: 15, fontWeight: 500, color: 'rgb(30, 30, 30)' }}>
              {item.question}
            </span>
            <ChevronDown
              size={18}
              style={{
                color: '#3b60f3',
                flexShrink: 0,
                marginLeft: 16,
                transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </button>
          {open === i && (
            <div
              style={{
                paddingBottom: 16,
                fontSize: 14,
                lineHeight: 1.75,
                color: 'rgb(76, 76, 76)',
              }}
            >
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
