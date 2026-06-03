'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
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

    router.push('/portal/dashboard')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)', fontFamily: 'var(--font-dm)' }}
    >
      <div className="w-full max-w-[400px] bg-white rounded-xl shadow-sm border p-8"
           style={{ borderColor: 'var(--color-border)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ backgroundColor: 'var(--color-navy)' }}
          >
            <Building2 className="text-white" size={18} />
          </div>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy)' }}
          >
            Compass
          </span>
        </div>

        <h1
          className="text-xl font-semibold mb-1"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
        >
          Sign in to your workspace
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
          Track your LLC filing and documents.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
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
              className="w-full border rounded-md px-3 py-2.5 text-sm outline-none transition-all"
              style={{ borderColor: 'var(--color-border)' }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-blue)'
                e.target.style.boxShadow = '0 0 0 2px oklch(0.56 0.18 250 / 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
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
              className="w-full border rounded-md px-3 py-2.5 text-sm outline-none transition-all"
              style={{ borderColor: 'var(--color-border)' }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-blue)'
                e.target.style.boxShadow = '0 0 0 2px oklch(0.56 0.18 250 / 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white text-sm font-medium rounded-md py-2.5 mt-1 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-navy)', fontFamily: 'var(--font-jakarta)' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
