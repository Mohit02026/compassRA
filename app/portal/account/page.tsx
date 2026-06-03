'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function PortalAccountPage() {
  const { data: session } = useSession()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (password.length < 8) {
      setError('New password must be at least 8 characters.')
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
      body: JSON.stringify({ currentPassword: current, password }),
    })
    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data?.error?.message ?? 'Something went wrong.')
      return
    }

    setSuccess(true)
    setCurrent('')
    setPassword('')
    setConfirm('')
  }

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
        >
          Account
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          Manage your account settings.
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-lg">
        {/* Email */}
        <div
          className="bg-white border rounded-xl p-5"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p
            className="text-sm font-semibold mb-3"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
          >
            Account info
          </p>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--color-muted)' }}>
              Email address
            </label>
            <p className="text-sm font-medium text-gray-900">{session?.user?.email ?? '—'}</p>
          </div>
        </div>

        {/* Change password */}
        <div
          className="bg-white border rounded-xl p-5"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p
            className="text-sm font-semibold mb-4"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
          >
            Change password
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-navy-mid)' }}
              >
                Current password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Your current password"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-navy-mid)' }}
              >
                New password
              </label>
              <input
                type="password"
                name="newPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-navy-mid)' }}
              >
                Confirm new password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && (
              <p className="text-sm text-green-600">Password updated successfully.</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white text-sm font-medium rounded-md py-2.5 mt-1 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-navy)', fontFamily: 'var(--font-jakarta)' }}
            >
              {loading ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
