'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/customers/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data?.error?.message ?? 'Something went wrong.')
      return
    }

    router.push('/portal/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)', fontFamily: 'var(--font-dm)' }}
    >
      <div
        className="w-full max-w-[400px] bg-white rounded-xl shadow-sm border p-8"
        style={{ borderColor: 'var(--color-border)' }}
      >
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
          Set your password
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
          Choose a password to secure your account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
            >
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="w-full border rounded-md px-3 py-2.5 text-sm outline-none transition-all"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
            >
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Re-enter password"
              className="w-full border rounded-md px-3 py-2.5 text-sm outline-none transition-all"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white text-sm font-medium rounded-md py-2.5 mt-1 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-navy)', fontFamily: 'var(--font-jakarta)' }}
          >
            {loading ? 'Saving…' : 'Set password & continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
