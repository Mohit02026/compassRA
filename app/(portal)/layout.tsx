import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Building2, LayoutDashboard, FolderOpen, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--color-bg)',
        fontFamily: 'var(--font-dm)',
      }}
    >
      {/* Top nav */}
      <header
        className="h-14 border-b bg-white flex items-center px-6 gap-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ backgroundColor: 'var(--color-navy)' }}
          >
            <Building2 className="text-white" size={14} />
          </div>
          <span
            className="font-bold text-sm"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy)' }}
          >
            Compass
          </span>
        </div>

        <nav className="flex items-center gap-1 ml-4">
          {[
            { href: '/portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/portal/documents', icon: FileText, label: 'Documents' },
            { href: '/portal/account', icon: Settings, label: 'Account' },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-gray-100"
              style={{ color: 'var(--color-muted)' }}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--color-blue)' }}
          >
            {session.user.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-5xl mx-auto">{children}</main>
    </div>
  )
}
