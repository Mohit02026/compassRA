'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Building2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) { setError('Invalid email or password.'); return }
    // Check role and route to the correct dashboard
    const session = await getSession()
    const role = session?.user?.role
    if (role === 'OPS' || role === 'ADMIN') {
      router.push('/ops/dashboard')
    } else {
      router.push('/portal/dashboard')
    }
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    border: '1.5px solid oklch(0.88 0.015 245)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
    background: 'white',
    color: 'oklch(0.20 0.06 245)',
    fontFamily: 'var(--font-dm)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: 'var(--font-dm)',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, oklch(0.14 0.07 245) 0%, oklch(0.20 0.06 245) 100%)',
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* Top-centre soft glow */}
      <div
        style={{
          position: 'fixed',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80vw',
          height: '60vh',
          background: 'radial-gradient(circle, rgba(80,130,255,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Compass rose watermark — centre-right */}
      <div
        style={{
          position: 'fixed',
          right: '-60px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 480,
          height: 480,
          opacity: 0.07,
          color: 'white',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="-150 -150 300 300" width="100%" height="100%" fill="currentColor">
          {/* Cardinal spokes */}
          <path d="M0,-132 L16,-16 L0,132 L-16,-16 Z" />
          <path d="M132,0 L16,16 L-132,0 L16,-16 Z" />
          {/* Intercardinal paths */}
          <path d="M0,-132 L10,-10 L96,-96 Z" opacity="0.55" />
          <path d="M0,-132 L-10,-10 L-96,-96 Z" opacity="0.55" />
          <path d="M0,132 L10,10 L96,96 Z" opacity="0.55" />
          <path d="M0,132 L-10,10 L-96,96 Z" opacity="0.55" />
          <path d="M132,0 L10,10 L96,96 Z" opacity="0.55" />
          <path d="M132,0 L10,-10 L96,-96 Z" opacity="0.55" />
          <path d="M-132,0 L-10,10 L-96,96 Z" opacity="0.55" />
          <path d="M-132,0 L-10,-10 L-96,-96 Z" opacity="0.55" />
          {/* Rings */}
          <circle cx="0" cy="0" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="8" />
          <circle cx="0" cy="0" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
          <circle cx="0" cy="0" r="88" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="0" r="138" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="7 5" />
          {/* Cardinal labels */}
          <text x="0" y="-108" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor" fontFamily="serif">N</text>
          <text x="0" y="122" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor" fontFamily="serif">S</text>
          <text x="118" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor" fontFamily="serif">E</text>
          <text x="-118" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor" fontFamily="serif">W</text>
        </svg>
      </div>

      {/* Floating paper document 1 */}
      <div
        style={{
          position: 'fixed',
          top: '12%',
          left: '6%',
          width: 90,
          height: 116,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 3,
          transform: 'rotate(-8deg)',
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 20px, rgba(255,255,255,0.06) 20px, rgba(255,255,255,0.06) 21px)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating paper document 2 */}
      <div
        style={{
          position: 'fixed',
          bottom: '14%',
          left: '10%',
          width: 76,
          height: 98,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 3,
          transform: 'rotate(6deg)',
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 20px, rgba(255,255,255,0.06) 20px, rgba(255,255,255,0.06) 21px)',
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 400,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 20px 60px rgba(10,20,80,0.35)',
          padding: 36,
          boxSizing: 'border-box',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, oklch(0.26 0.08 245), oklch(0.18 0.08 245))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Building2 color="white" size={18} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-jakarta)',
              fontWeight: 700,
              fontSize: 18,
              color: 'oklch(0.22 0.06 245)',
            }}
          >
            Compass
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontWeight: 700,
            fontSize: 20,
            color: 'oklch(0.22 0.06 245)',
            marginBottom: 4,
            marginTop: 0,
          }}
        >
          Sign in
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'oklch(0.55 0.04 245)',
            marginBottom: 24,
            marginTop: 0,
          }}
        >
          Track your LLC filing and documents.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'var(--font-jakarta)',
                color: 'oklch(0.32 0.06 245)',
                marginBottom: 6,
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
              placeholder="you@example.com"
              style={inputBase}
              onFocus={(e) => {
                e.target.style.borderColor = 'oklch(0.56 0.18 250)'
                e.target.style.boxShadow = '0 0 0 3px oklch(0.56 0.18 250 / 0.12)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'oklch(0.88 0.015 245)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'var(--font-jakarta)',
                color: 'oklch(0.32 0.06 245)',
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{ ...inputBase, paddingRight: 40 }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'oklch(0.56 0.18 250)'
                  e.target.style.boxShadow = '0 0 0 3px oklch(0.56 0.18 250 / 0.12)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'oklch(0.88 0.015 245)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'oklch(0.60 0.04 245)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'oklch(0.50 0.18 25)', marginTop: -4, marginBottom: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading
                ? 'oklch(0.40 0.08 245)'
                : 'linear-gradient(135deg, oklch(0.26 0.08 245) 0%, oklch(0.20 0.07 245) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 9,
              padding: '11px 0',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-jakarta)',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
              transition: 'opacity 0.15s',
              boxShadow: loading ? 'none' : '0 4px 16px oklch(0.22 0.06 245 / 0.40)',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p
          style={{
            fontSize: 12,
            color: 'oklch(0.62 0.04 245)',
            textAlign: 'center',
            marginTop: 20,
            marginBottom: 0,
          }}
        >
          Don&apos;t have an account?{' '}
          <a
            href="/llc"
            style={{ color: 'oklch(0.45 0.14 250)', fontWeight: 500, textDecoration: 'none' }}
          >
            Start an LLC filing
          </a>
        </p>
      </div>
    </div>
  )
}
