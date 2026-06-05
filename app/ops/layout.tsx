import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Building2, LayoutDashboard, ClipboardList, FilePlus, FileText, Bell } from 'lucide-react'
import Link from 'next/link'
import { signOutOpsAction } from '@/app/actions'

// Ops workbench nav is intentionally empty — Bridget uses GHL as the ops interface.
// Routes and code are kept intact for internal use / fallback access.
const NAV: { section: string; items: { href: string; icon: typeof LayoutDashboard; label: string }[] }[] = []

export default async function OpsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/ops/login')
  if (session.user.role !== 'OPS' && session.user.role !== 'ADMIN') {
    redirect('/ops/login')
  }

  const initials = session.user.email
    ? session.user.email.slice(0, 2).toUpperCase()
    : 'OP'

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Sidebar */}
      <aside
        className="w-[220px] flex-shrink-0 flex flex-col fixed inset-y-0 left-0"
        style={{ backgroundColor: 'var(--color-navy)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 p-4">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: 'oklch(0.32 0.09 245)' }}
          >
            <Building2 className="text-white" size={16} />
          </div>
          <span className="text-white font-bold text-sm">Compass</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 mt-2">
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <p
                className="px-4 pt-4 pb-1 text-xs font-semibold tracking-wider uppercase"
                style={{ color: 'oklch(0.65 0.05 245)' }}
              >
                {section}
              </p>
              {items.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-4 py-2 mx-2 text-sm rounded-md transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div
          className="p-4 flex flex-col gap-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
              style={{ backgroundColor: 'var(--color-blue)' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate leading-tight">
                {session.user.email}
              </p>
              <p className="text-xs leading-tight" style={{ color: 'oklch(0.65 0.05 245)' }}>
                {session.user.role}
              </p>
            </div>
          </div>
          <form action={signOutOpsAction}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md transition-colors hover:bg-white/10 w-full"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <main
        className="flex-1 ml-[220px] p-8 min-h-screen"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {children}
      </main>
    </div>
  )
}
