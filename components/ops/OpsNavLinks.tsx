'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Bell,
  LucideIcon,
} from 'lucide-react'

const NAV_GROUPS: {
  section: string
  items: { href: string; icon: LucideIcon; label: string }[]
}[] = [
  {
    section: 'Workbench',
    items: [
      { href: '/ops/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/ops/orders',    icon: ClipboardList,   label: 'Orders' },
    ],
  },
  {
    section: 'Records',
    items: [
      { href: '/ops/documents', icon: FileText, label: 'Documents' },
      { href: '/ops/notices',   icon: Bell,    label: 'Legal Notices' },
    ],
  },
]

export function OpsNavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 mt-2">
      {NAV_GROUPS.map(({ section, items }) => (
        <div key={section}>
          <p
            className="px-4 pt-4 pb-1 text-[11px] font-semibold tracking-[0.06em] uppercase"
            style={{ fontFamily: 'var(--font-inter)', color: 'oklch(0.65 0.05 245)', margin: 0 }}
          >
            {section}
          </p>
          {items.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 text-[13.5px] rounded-md transition-colors"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: active ? 500 : 400,
                  padding: '8px 16px',
                  margin: '0 8px',
                  width: 'calc(100% - 16px)',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
