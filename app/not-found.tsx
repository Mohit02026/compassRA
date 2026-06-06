import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ backgroundColor: 'var(--color-navy)' }}
          >
            <Building2 className="text-white" size={14} />
          </div>
          <span
            className="font-bold text-base"
            style={{ color: 'var(--color-navy)', fontFamily: 'var(--font-jakarta)' }}
          >
            Compass
          </span>
        </div>
        <h1
          className="text-4xl font-bold mb-3"
          style={{ color: 'var(--color-navy-mid)', fontFamily: 'var(--font-jakarta)' }}
        >
          404
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
          This page doesn't exist.
        </p>
        <Link
          href="/"
          className="text-sm underline"
          style={{ color: 'var(--color-blue)' }}
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
