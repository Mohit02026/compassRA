'use client'

import { LogOut } from 'lucide-react'

interface SignOutButtonProps {
  variant?: 'portal' | 'ops'
}

export function SignOutButton({ variant = 'portal' }: SignOutButtonProps) {
  const callbackUrl = variant === 'ops' ? '/ops/login' : '/login'

  if (variant === 'ops') {
    return (
      <form action={`/api/auth/signout`} method="POST">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <button
          type="submit"
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </form>
    )
  }

  return (
    <form action={`/api/auth/signout`} method="POST">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <button
        type="submit"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-gray-100"
        style={{ color: 'var(--color-muted)' }}
      >
        <LogOut size={14} />
        Sign out
      </button>
    </form>
  )
}
