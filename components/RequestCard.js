'use client'

import { useState } from 'react'
import { acceptConnectionRequest, rejectConnectionRequest } from '@/lib/actions/connections'
import { Check, X, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export function RequestCard({ request, type }) {
  const [loading, setLoading] = useState(false)
  const profile = request.profile

  const handleAccept = async () => {
    setLoading(true)
    const res = await acceptConnectionRequest(request.id)
    if (res?.error) toast.error(res.error)
    else toast.success("Request accepted!")
    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)
    const res = await rejectConnectionRequest(request.id)
    if (res?.error) toast.error(res.error)
    else toast.success("Request rejected.")
    setLoading(false)
  }

  return (
    <div 
      className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm transition-all duration-200"
      style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}
    >
      <div className="flex items-center mb-4 sm:mb-0">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0"
          style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 0 10px var(--accent-glow)' }}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            (profile?.full_name?.charAt(0) || profile?.username.charAt(0) || '?').toUpperCase()
          )}
        </div>
        <div className="ml-4">
          <h4 className="font-semibold tracking-wide" style={{ color: 'var(--text)' }}>{profile?.full_name || 'No Name'}</h4>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>@{profile?.username}</p>
        </div>
      </div>

      <div className="flex items-center w-full sm:w-auto space-x-2">
        {type === 'incoming' && (
          <>
            <button 
              onClick={handleReject}
              disabled={loading}
              className="flex-1 sm:flex-none flex justify-center items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-50"
              style={{ 
                background: 'rgba(255,32,32,0.08)', 
                color: 'var(--accent)',
                border: '1px solid rgba(255,32,32,0.15)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,32,32,0.08)'; e.currentTarget.style.color = 'var(--accent)' }}
              title="Reject Request"
            >
              <X className="w-4 h-4 mr-1 sm:mr-0 lg:mr-2" />
              <span className="sm:hidden lg:inline">Reject</span>
            </button>
            <button 
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 sm:flex-none flex justify-center items-center px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-50"
              style={{ 
                background: 'var(--accent)', 
                color: 'white',
                boxShadow: '0 0 12px var(--accent-glow)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 12px var(--accent-glow)' }}
              title="Accept Request"
            >
              <Check className="w-4 h-4 mr-1 sm:mr-0 lg:mr-2" />
              <span className="sm:hidden lg:inline">Accept</span>
            </button>
          </>
        )}

        {type === 'outgoing' && (
          <div 
            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium opacity-60"
            style={{ background: 'var(--bg-3)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending Response
          </div>
        )}
      </div>
    </div>
  )
}
