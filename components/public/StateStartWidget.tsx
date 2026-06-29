'use client'

import { useState } from 'react'

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

  return (
    <div
      style={{ fontFamily: 'var(--font-dm-sans)', display: 'flex', flexDirection: 'column', gap: 11, maxWidth: 441 }}
    >
      <select
        value={state}
        onChange={(e) => setState(e.target.value)}
        style={{
          border: '0.8px solid rgb(224,224,224)',
          borderRadius: 8,
          padding: '12px 16px',
          fontSize: 15,
          color: state ? 'rgb(23,23,23)' : (light ? 'rgb(23,23,23)' : 'rgb(130,130,130)'),
          background: light ? 'rgb(255,255,255)' : '#fff',
          width: '100%',
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
        onClick={() => {
          window.location.href = `/llc${state ? `?state=${encodeURIComponent(state)}` : ''}`
        }}
        style={{
          background: light ? 'transparent' : '#3b60f3',
          color: '#ffffff',
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          border: light ? '0.8px solid rgb(255,255,255)' : 'none',
          width: '100%',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = light ? 'rgba(255,255,255,0.1)' : '#2d4fd4'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = light ? 'transparent' : '#3b60f3'
        }}
      >
        Get Started
      </button>
    </div>
  )
}
