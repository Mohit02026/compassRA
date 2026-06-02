import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--color-bg)',
        fontFamily: 'var(--font-dm)',
      }}
    >
      {/* Top nav — logo only */}
      <header
        className="border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'white' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ backgroundColor: 'var(--color-navy)' }}
            >
              <Building2 className="text-white" size={16} />
            </div>
            <span
              className="font-bold text-sm"
              style={{ color: 'var(--color-navy)', fontFamily: 'var(--font-jakarta)' }}
            >
              Compass
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm"
            style={{ color: 'var(--color-muted)' }}
          >
            Sign in
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
