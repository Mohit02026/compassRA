'use client'

import { useState } from 'react'

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid rgba(100,150,230,0.35)',
  borderRadius: 8, padding: '9px 12px', fontSize: 13.5,
  fontFamily: 'var(--font-dm)', background: 'rgba(255,255,255,0.85)',
  color: 'oklch(0.22 0.06 245)', outline: 'none', boxSizing: 'border-box',
}

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderRadius: 16,
  border: '1px solid rgba(100,150,230,0.22)',
  boxShadow: '0 2px 12px rgba(14,42,120,0.07)',
  padding: '22px 24px',
}

export function PortalAccountForm({ email }: { email: string }) {
  const [current, setCurrent]   = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(false)
    if (password.length < 8) { setError('New password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const res = await fetch('/api/customers/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, password }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data?.error?.message ?? 'Something went wrong.')
      return
    }
    setSuccess(true); setCurrent(''); setPassword(''); setConfirm('')
  }

  const label = (text: string) => (
    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'oklch(0.40 0.07 245)', marginBottom: 6, fontFamily: 'var(--font-jakarta)' }}>
      {text}
    </label>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
      {/* Email */}
      <div style={card}>
        <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 14, color: 'oklch(0.22 0.08 245)', marginBottom: 14 }}>
          Account info
        </p>
        <div>
          {label('Email address')}
          <p style={{ fontSize: 13.5, fontWeight: 500, color: 'oklch(0.26 0.08 245)' }}>{email}</p>
        </div>
      </div>

      {/* Change password */}
      <div style={card}>
        <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 14, color: 'oklch(0.22 0.08 245)', marginBottom: 16 }}>
          Change password
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            {label('Current password')}
            <input type="password" name="currentPassword" value={current} onChange={(e) => setCurrent(e.target.value)}
              required autoComplete="current-password" placeholder="Your current password" style={inputStyle} />
          </div>
          <div>
            {label('New password')}
            <input type="password" name="newPassword" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8} autoComplete="new-password" placeholder="Min. 8 characters" style={inputStyle} />
          </div>
          <div>
            {label('Confirm new password')}
            <input type="password" name="confirmPassword" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              required autoComplete="new-password" placeholder="Re-enter password" style={inputStyle} />
          </div>

          {error   && <p style={{ fontSize: 13, color: 'oklch(0.48 0.20 25)' }}>{error}</p>}
          {success && <p style={{ fontSize: 13, color: 'oklch(0.42 0.14 145)' }}>Password updated successfully.</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px 0', fontSize: 14, fontWeight: 600,
              fontFamily: 'var(--font-jakarta)', color: 'white', border: 'none',
              borderRadius: 9, cursor: loading ? 'not-allowed' : 'pointer',
              background: loading
                ? 'rgba(14,42,120,0.35)'
                : 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.20 0.07 245) 100%)',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(14,42,120,0.30)',
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
