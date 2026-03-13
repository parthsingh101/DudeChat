'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/utils/cn'
import { formatDistanceToNowStrict } from 'date-fns'
import { UserSearch, Users } from 'lucide-react'
import { markConversationAsRead } from '@/lib/actions/chat'

export function ChatSidebar({ conversations }) {
  const pathname = usePathname()
  const router = useRouter()

  const isChatActive = pathname.startsWith('/chat/') && pathname !== '/chat'

  const handleChatClick = async (e, convId) => {
    // Mark as read non-blocking
    markConversationAsRead(convId).catch(() => {})
    router.push(`/chat/${convId}`)
  }

  return (
    <div
      className={`w-full sm:w-80 flex-shrink-0 flex flex-col h-full ${isChatActive ? 'hidden sm:flex' : 'flex'}`}
      style={{ background: 'var(--bg-2)', borderRight: '1px solid var(--border)' }}
    >
      <div
        className="p-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-3)' }}
      >
        <h2 className="text-base font-bold tracking-widest uppercase" style={{ color: 'var(--text)', letterSpacing: '0.12em' }}>Messages</h2>
        <div className="flex space-x-1">
          <Link
            href="/requests"
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Connection Requests"
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <Users className="w-4 h-4" />
          </Link>
          <Link
            href="/search"
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Search Users"
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <UserSearch className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            <p>No conversations yet.</p>
            <p className="mt-2">Search for users and connect to start chatting.</p>
          </div>
        ) : (
          <ul>
            {conversations.map(conv => {
              const user = conv.otherUser
              const isActive = pathname === `/chat/${conv.id}`
              const hasUnread = !isActive && (conv.unreadCount || 0) > 0
              const timeStr = conv.lastMessage 
                ? formatDistanceToNowStrict(new Date(conv.lastMessage.created_at), { addSuffix: false }) 
                : null

              return (
                <li key={conv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <button
                    onClick={(e) => handleChatClick(e, conv.id)}
                    className="w-full flex items-center p-4 transition-colors text-left"
                    style={{
                      background: isActive ? 'var(--accent-subtle)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? 'var(--accent)' : hasUnread ? 'rgba(185,28,28,0.4)' : 'transparent'}`,
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-3)' }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                        style={{ background: 'var(--accent)', color: 'white', boxShadow: hasUnread ? '0 0 10px var(--accent-glow)' : 'none' }}
                      >
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} alt={user?.username} className="w-full h-full object-cover" />
                        ) : (
                          (user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?').toUpperCase()
                        )}
                      </div>
                      {hasUnread && (
                        <span
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                          style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 0 8px var(--accent-glow)' }}
                        >
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className="text-sm truncate"
                          style={{ color: hasUnread ? 'var(--text)' : 'var(--text-muted)', fontWeight: hasUnread ? 700 : 500 }}
                        >
                          {user?.full_name || user?.username}
                        </span>
                        {timeStr && (
                          <span className="text-[11px] flex-shrink-0" style={{ color: hasUnread ? 'var(--accent)' : 'var(--text-dim)' }}>
                            {timeStr}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{ color: hasUnread ? 'var(--text-muted)' : 'var(--text-dim)', fontWeight: hasUnread ? 500 : 400 }}
                      >
                        {conv.lastMessage ? conv.lastMessage.content : 'Started a conversation'}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
