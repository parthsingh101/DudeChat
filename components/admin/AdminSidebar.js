'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, UserPlus, MessageSquare, MessagesSquare, ArrowLeft } from 'lucide-react'

const navItems = [
  { href: '/admin',               icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users',         icon: Users,           label: 'Users' },
  { href: '/admin/requests',      icon: UserPlus,        label: 'Requests' },
  { href: '/admin/conversations', icon: MessageSquare,   label: 'Conversations' },
  { href: '/admin/messages',      icon: MessagesSquare,  label: 'Messages' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div
      className="w-52 flex-shrink-0 flex flex-col h-full overflow-y-auto"
      style={{ background: 'var(--bg-3)', borderRight: '1px solid var(--border-2)' }}
    >
      {/* Brand */}
      <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-black"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          A
        </div>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f59e0b', letterSpacing: '0.15em' }}>
          Admin Panel
        </span>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all"
              style={{
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
        <Link
          href="/chat"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all"
          style={{ color: 'var(--accent)' }}
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          Back to App
        </Link>
      </div>
    </div>
  )
}
