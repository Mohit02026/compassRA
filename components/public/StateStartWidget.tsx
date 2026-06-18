'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
]

export default function StateStartWidget({ light = false }: { light?: boolean }) {
  const [state, setState] = useState('')
  const router = useRouter()

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
      style={{ fontFamily: 'var(--font-dm-sans)' }}
    >
      <select
        value={state}
        onChange={(e) => setState(e.target.value)}
        style={{
          border: light ? '1.5px solid rgba(255,255,255,0.4)' : '1px solid rgb(220, 220, 220)',
          borderRadius: 8,
          padding: '12px 16px',
          fontSize: 15,
          color: state ? (light ? '#ffffff' : 'rgb(30, 30, 30)') : (light ? 'rgba(255,255,255,0.6)' : 'rgb(130, 130, 130)'),
          background: light ? 'rgba(255,255,255,0.12)' : '#fff',
          minWidth: 220,
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        <option value="" disabled>Select State</option>
        {US_STATES.map((s) => (
          <option key={s} value={s} style={{ color: 'rgb(30,30,30)', background: '#fff' }}>{s}</option>
        ))}
      </select>
      <button
        onClick={() =>
          router.push(`/llc${state ? `?state=${encodeURIComponent(state)}` : ''}`)
        }
        style={{
          background: light ? '#ffffff' : '#3b60f3',
          color: light ? '#3b60f3' : '#fff',
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          border: 'none',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = light ? 'rgba(255,255,255,0.9)' : '#2d4fd4'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = light ? '#ffffff' : '#3b60f3'
        }}
      >
        Get Started
      </button>
    </div>
  )
}
