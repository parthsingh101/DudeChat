'use client'

import { useState } from 'react'
import { sendConnectionRequest } from '@/lib/actions/connections'
import { UserCheck, UserPlus, Clock, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export function UserCard({ user }) {
  const [loading, setLoading] = useState(false)
  const [localStatus, setLocalStatus] = useState(user.status)

  const handleSendRequest = async () => {
    setLoading(true)
    const res = await sendConnectionRequest(user.id)
    if (res.success) {
      setLocalStatus('Request Sent')
      toast.success(`Request sent to ${user.username}`)
    } else if (res.error) {
      toast.error(res.error)
    }
    setLoading(false)
  }

  return (
    <div 
      className="rounded-xl p-4 flex items-center justify-between shadow-sm transition-all duration-200"
      style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}
    >
      <div className="flex items-center">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0"
          style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 0 10px var(--accent-glow)' }}
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            (user.full_name?.charAt(0) || user.username.charAt(0)).toUpperCase()
          )}
        </div>
        <div className="ml-4">
          <h4 className="font-semibold tracking-wide" style={{ color: 'var(--text)' }}>{user.full_name || 'No Name'}</h4>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>@{user.username}</p>
        </div>
      </div>

      <div>
        {localStatus === 'Connected' && (
          <Link 
            href="/chat" 
            className="flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{ 
              background: 'var(--accent-subtle)', 
              color: 'var(--accent)',
              border: '1px solid var(--accent-dim)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-subtle)'; e.currentTarget.style.color = 'var(--accent)' }}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Link>
        )}
        
        {localStatus === 'Request Sent' && (
          <div 
            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed opacity-60"
            style={{ background: 'var(--bg-3)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending
          </div>
        )}

        {localStatus === 'Request Received' && (
          <Link 
            href="/requests" 
            className="flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{ 
              background: 'rgba(245,158,11,0.1)', 
              color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.2)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)' }}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Respond
          </Link>
        )}

        {localStatus === 'Not Connected' && (
          <button 
            onClick={handleSendRequest}
            disabled={loading}
            className="flex items-center px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-50"
            style={{ 
              background: 'var(--accent)', 
              color: 'white',
              boxShadow: '0 0 12px var(--accent-glow)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 12px var(--accent-glow)' }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {loading ? 'Sending...' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  )
}
