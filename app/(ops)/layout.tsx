import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Building2, LayoutDashboard, ClipboardList, FilePlus, FileText, Bell } from 'lucide-react'
import Link from 'next/link'

const NAV = [
  {
    section: 'OVERVIEW',
    items: [
      { href: '/ops/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { href: '/ops/orders', icon: ClipboardList, label: 'Orders' },
      { href: '/ops/orders/new', icon: FilePlus, label: 'New Order' },
      { href: '/ops/documents', icon: FileText, label: 'Documents' },
    ],
  },
  {
    section: 'RETENTION',
    items: [
      { href: '/ops/reminders', icon: Bell, label: 'Reminders' },
    ],
  },
]

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
                  className="flex items-center gap-3 px-4 py-2 mx-2 text-sm rounded-md transition-colors"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = ''
                  }}
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
          className="p-4 flex items-center gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
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
