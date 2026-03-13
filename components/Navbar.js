'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { useTheme } from './ThemeProvider'
import { 
  MessageSquare, ShieldAlert, Sun, Moon, 
  User, Settings, LogOut, ChevronDown
} from 'lucide-react'

export function Navbar({ profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { theme, toggle } = useTheme()

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [dropdownOpen])

  const navLinks = [
    { name: 'Messages', href: '/chat', icon: MessageSquare },
  ]

  if (profile?.role === 'ADMIN') {
    navLinks.push({ name: 'Admin', href: '/admin', icon: ShieldAlert, isAdmin: true })
  }

  const isActive = (href) => pathname.startsWith(href)

  return (
    <header
      style={{
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--border)',
        color: 'var(--text)',
      }}
      className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 h-14 z-50 relative"
    >
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-1 sm:gap-6">
        {/* Brand */}
        <Link href="/chat" className="flex items-center gap-2 mr-2 sm:mr-4 group">
          <div
            style={{ background: 'var(--accent)', boxShadow: '0 0 12px var(--accent-glow)' }}
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-bold tracking-widest text-sm uppercase hidden sm:block"
            style={{ color: 'var(--text)', letterSpacing: '0.18em' }}
          >
            DudeChat
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
                style={{
                  color: active
                    ? link.isAdmin ? '#f59e0b' : 'var(--accent)'
                    : 'var(--text-muted)',
                  background: active ? 'var(--accent-subtle)' : 'transparent',
                  borderBottom: active ? `2px solid ${link.isAdmin ? '#f59e0b' : 'var(--accent)'}` : '2px solid transparent',
                  borderRadius: '6px 6px 0 0',
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{link.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right: Theme + Profile */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-md transition-all duration-150"
          style={{ color: 'var(--text-muted)' }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--accent-subtle)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-subtle)' }}
            onMouseLeave={(e) => { if (!dropdownOpen) e.currentTarget.style.background = 'transparent' }}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0"
              style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 0 8px var(--accent-glow)' }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (profile?.full_name || profile?.username || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <span
              className="hidden md:block text-sm font-medium max-w-24 truncate"
              style={{ color: 'var(--text)' }}
            >
              {profile?.username || 'Account'}
            </span>
            <ChevronDown
              className="w-3 h-3 transition-transform"
              style={{
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                color: 'var(--text-muted)'
              }}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden shadow-2xl z-50"
              style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--border-2)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px var(--border)',
              }}
            >
              {/* User info header */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Signed in as
                </p>
                <p className="text-sm font-bold truncate mt-0.5" style={{ color: 'var(--text)' }}>
                  @{profile?.username}
                </p>
                {profile?.role === 'ADMIN' && (
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                  >
                    Admin
                  </span>
                )}
              </div>

              {/* Menu items */}
              <div className="py-1">
                <DropdownItem
                  href="/profile"
                  icon={Settings}
                  label="Profile Settings"
                  onClick={() => setDropdownOpen(false)}
                />
              </div>

              {/* Danger zone */}
              <div className="py-1 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={async () => { setDropdownOpen(false); await logout() }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all"
                  style={{ color: 'var(--danger)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,32,32,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function DropdownItem({ href, icon: Icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}
