'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function OpsLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password.')
      return
    }

    router.push('/ops/dashboard')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'linear-gradient(145deg, oklch(0.13 0.08 245) 0%, oklch(0.19 0.07 245) 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-inter)',
      }}
    >
      {/* Dot grid background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top glow */}
      <div
        style={{
          position: 'fixed',
          top: '-160px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(60,100,255,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Compass rose — right side */}
      <div
        style={{
          position: 'fixed',
          right: '-60px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '480px',
          height: '480px',
          color: 'rgba(255,255,255,0.07)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <svg viewBox="-150 -150 300 300" fill="currentColor" width="100%" height="100%">
          <path d="M0,-132 L16,-16 L0,132 L-16,-16 Z" />
          <path d="M132,0 L16,16 L-132,0 L16,-16 Z" />
          <path d="M0,-132 L10,-10 L96,-96 Z" opacity="0.55" />
          <path d="M132,0 L10,-10 L96,-96 Z" opacity="0.55" />
          <path d="M132,0 L10,10 L96,96 Z" opacity="0.55" />
          <path d="M0,132 L10,10 L96,96 Z" opacity="0.55" />
          <path d="M0,132 L-10,10 L-96,96 Z" opacity="0.55" />
          <path d="M-132,0 L-10,10 L-96,96 Z" opacity="0.55" />
          <path d="M-132,0 L-10,-10 L-96,-96 Z" opacity="0.55" />
          <path d="M0,-132 L-10,-10 L-96,-96 Z" opacity="0.55" />
          <circle cx="0" cy="0" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="8" />
          <circle cx="0" cy="0" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
          <circle cx="0" cy="0" r="88" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="0" r="138" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="7 5" />
          <text x="0" y="-118" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fill="currentColor" dominantBaseline="auto">N</text>
          <text x="0" y="132" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fill="currentColor" dominantBaseline="hanging">S</text>
          <text x="122" y="0" textAnchor="start" fontFamily="Georgia, serif" fontSize="14" fill="currentColor" dominantBaseline="middle">E</text>
          <text x="-122" y="0" textAnchor="end" fontFamily="Georgia, serif" fontSize="14" fill="currentColor" dominantBaseline="middle">W</text>
        </svg>
      </div>

      {/* Floating doc shape 1 */}
      <div
        style={{
          position: 'fixed',
          top: '12%',
          left: '-40px',
          width: '180px',
          height: '230px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '6px',
          transform: 'rotate(-14deg)',
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 22px, rgba(255,255,255,0.06) 22px, rgba(255,255,255,0.06) 23px)',
          backgroundPositionY: '40px',
        }}
      />

      {/* Floating doc shape 2 */}
      <div
        style={{
          position: 'fixed',
          bottom: '10%',
          left: '6%',
          width: '140px',
          height: '180px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '6px',
          transform: 'rotate(10deg)',
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 22px, rgba(255,255,255,0.06) 22px, rgba(255,255,255,0.06) 23px)',
          backgroundPositionY: '32px',
        }}
      />

      {/* Login card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '400px',
          padding: '36px',
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 20px 60px rgba(8,18,80,0.40)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, oklch(0.22 0.08 245) 0%, oklch(0.30 0.10 245) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="-12 -12 24 24" fill="rgba(255,255,255,0.95)">
              <path d="M0,-10 L1.5,-1.5 L0,10 L-1.5,-1.5 Z" />
              <path d="M10,0 L1.5,1.5 L-10,0 L1.5,-1.5 Z" />
              <circle cx="0" cy="0" r="2.5" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '16px',
                color: 'oklch(0.22 0.08 245)',
                lineHeight: 1.2,
                fontFamily: 'var(--font-inter)',
              }}
            >
              Compass
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'oklch(0.55 0.04 245)',
                marginTop: '1px',
                fontFamily: 'var(--font-inter)',
                letterSpacing: '0.02em',
              }}
            >
              Ops Workbench
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontWeight: 700,
            fontSize: '20px',
            color: 'oklch(0.22 0.08 245)',
            margin: '0 0 4px 0',
            fontFamily: 'var(--font-inter)',
          }}
        >
          Sign in to workspace
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'oklch(0.55 0.04 245)',
            margin: '0 0 24px 0',
            fontFamily: 'var(--font-inter)',
          }}
        >
          Internal team access only.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'oklch(0.28 0.07 245)',
                marginBottom: '6px',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="ops@compassregisteredagent.com"
              style={{
                width: '100%',
                border: '1px solid oklch(0.88 0.02 245)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px',
                fontFamily: 'var(--font-inter)',
                background: '#fff',
                color: 'oklch(0.18 0.06 245)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'oklch(0.56 0.18 250)'
                e.target.style.boxShadow = '0 0 0 3px oklch(0.56 0.18 250 / 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'oklch(0.88 0.02 245)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'oklch(0.28 0.07 245)',
                marginBottom: '6px',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                border: '1px solid oklch(0.88 0.02 245)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px',
                fontFamily: 'var(--font-inter)',
                background: '#fff',
                color: 'oklch(0.18 0.06 245)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'oklch(0.56 0.18 250)'
                e.target.style.boxShadow = '0 0 0 3px oklch(0.56 0.18 250 / 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'oklch(0.88 0.02 245)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#dc2626', margin: 0, fontFamily: 'var(--font-inter)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px 0',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.20 0.07 245) 100%)',
              border: 'none',
              borderRadius: '9px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              marginTop: '4px',
              boxShadow: '0 4px 20px rgba(8,18,80,0.30)',
              fontFamily: 'var(--font-inter)',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
