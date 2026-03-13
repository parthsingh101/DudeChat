'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Users, UserSearch, User, LogOut, ShieldAlert } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import { cn } from '@/utils/cn'

export function Sidebar({ profile }) {
  const pathname = usePathname()

  const navLinks = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Messages', href: '/chat', icon: MessageSquare },
  ]

  return (
    <div className="w-20 lg:w-64 flex-shrink-0 flex flex-col justify-between h-full bg-slate-900 border-r border-slate-800 p-4 transition-all duration-300 z-20 relative">
      <div className="space-y-8">
        <div className="flex items-center justify-center lg:justify-start lg:px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
            D
          </div>
          <span className="ml-3 font-bold text-xl hidden lg:block tracking-tight text-white">DudeChat</span>
        </div>

        <nav className="space-y-2">
          {profile?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center p-3 rounded-xl transition duration-200 group relative mb-2",
                pathname.startsWith('/admin') ? "bg-amber-500/10 text-amber-500" : "text-slate-400 hover:bg-slate-800 hover:text-amber-400"
              )}
              title="Admin Panel"
            >
              <ShieldAlert className="w-6 h-6" />
              <span className="ml-3 font-medium hidden lg:block text-amber-500/80 group-hover:text-amber-400">
                Admin Panel
              </span>
            </Link>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname.startsWith(link.href)
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center p-3 rounded-xl transition duration-200 group relative",
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
                title={link.name}
              >
                <Icon className={cn("w-6 h-6", isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200")} />
                <span className={cn("ml-3 font-medium hidden lg:block", isActive ? "text-white" : "")}>
                  {link.name}
                </span>
                {/* Mobile Tooltip */}
                <div className="lg:hidden absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                  {link.name}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center p-3 text-slate-400 hover:bg-slate-800 hover:text-red-400 rounded-xl transition duration-200 group relative"
            title="Log Out"
          >
            <LogOut className="w-6 h-6" />
            <span className="ml-3 font-medium hidden lg:block">Log out</span>
          </button>
        </form>
      </div>
    </div>
  )
}
