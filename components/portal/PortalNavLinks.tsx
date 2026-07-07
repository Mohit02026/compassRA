'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Bell,
  FileText,
  Settings,
  LucideIcon,
} from 'lucide-react'

const NAV_ITEMS: { href: string; icon: LucideIcon; label: string }[] = [
  { href: '/portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/portal/company',   icon: Building2,       label: 'Company'   },
  { href: '/portal/calendar',  icon: Calendar,        label: 'Calendar'  },
  { href: '/portal/notices',   icon: Bell,            label: 'Notices'   },
  { href: '/portal/documents', icon: FileText,        label: 'Documents' },
  { href: '/portal/account',   icon: Settings,        label: 'Account'   },
]

export function PortalNavLinks({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname()

  return (
    <nav
      style={
        vertical
          ? { display: 'flex', flexDirection: 'column', gap: 4 }
          : { display: 'flex', alignItems: 'center', gap: 4, marginLeft: 24 }
      }
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 16px',
              borderRadius: 10,
              fontSize: 14.5,
              fontFamily: 'var(--font-jakarta)',
              fontWeight: active ? 650 : 500,
              background: active
                ? 'rgba(255,255,255,0.88)'
                : 'transparent',
              color: active
                ? 'oklch(0.19 0.10 245)'
                : 'oklch(0.32 0.08 245)',
              textDecoration: 'none',
              transition: 'background 0.15s, color 0.15s',
              border: active
                ? '1.5px solid rgba(80,130,220,0.45)'
                : '1.5px solid transparent',
              boxShadow: active
                ? '0 2px 12px rgba(14,42,120,0.14)'
                : 'none',
            }}
          >
            <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
