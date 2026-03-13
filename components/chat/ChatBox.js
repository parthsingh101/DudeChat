'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/lib/actions/chat'
import { Send, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import toast from 'react-hot-toast'

export function ChatBox({ initialMessages, conversationId, currentUser, otherUser }) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef(null)
  
  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    
    console.log('Setting up realtime for conversation:', conversationId)

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Realtime payload received:', payload.new.id)
          setMessages(prev => {
            // Robust check: check by exact ID
            const alreadyExists = prev.some(m => m.id === payload.new.id)
            if (alreadyExists) {
              // Update existing (e.g. from optimistic to real)
              return prev.map(m => m.id === payload.new.id ? payload.new : m)
            }
            
            // Fallback check: if the sender and content match perfectly within a 5-second window, 
            // it's probably the same message even if IDs don't match (though they should)
            const isProbablyDuplicate = prev.some(m => 
              m.sender_id === payload.new.sender_id && 
              m.content === payload.new.content &&
              Math.abs(new Date(m.created_at) - new Date(payload.new.created_at)) < 5000
            )
            
            if (isProbablyDuplicate) {
              console.log('Detected probable duplicate by content/time, replacing...')
              // Find the optimistic one (it usually has the temporary ID)
              const optIndex = prev.findLastIndex(m => 
                m.sender_id === payload.new.sender_id && 
                m.content === payload.new.content
              )
              if (optIndex !== -1) {
                const next = [...prev]
                next[optIndex] = payload.new
                return next
              }
            }

            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    const content = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    // Generate a unique ID for tracking
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const optimisticMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, optimisticMessage])

    sendMessage(conversationId, content, tempId).then(res => {
      if (res.error) {
        setMessages(prev => prev.filter(m => m.id !== tempId))
        toast.error(res.error)
      } else if (res.message) {
        setMessages(prev => {
          // Replace our temp message with the real one from the server
          const exists = prev.some(m => m.id === res.message.id || m.id === tempId)
          if (exists) {
            return prev.map(m => (m.id === tempId || m.id === res.message.id) ? res.message : m)
          }
          return [...prev, res.message]
        })
      }
    }).finally(() => {
      setIsSending(false)
    })
  }

  return (
    <div
      className="flex flex-col h-full w-full relative"
      style={{ background: 'var(--bg)', borderLeft: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 h-[60px] flex items-center px-4 z-10 shadow-sm"
        style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}
      >
        <Link
          href="/chat"
          className="sm:hidden mr-3 p-2 -ml-2 rounded-md transition"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--accent-subtle)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0"
          style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 0 12px var(--accent-glow)' }}
        >
          {otherUser?.avatar_url ? (
            <img src={otherUser.avatar_url} alt={otherUser.username} className="w-full h-full object-cover" />
          ) : (
            (otherUser?.full_name?.charAt(0) || otherUser?.username?.charAt(0) || '?').toUpperCase()
          )}
        </div>
        
        <div className="ml-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {otherUser?.full_name || otherUser?.username || 'Chat'}
          </h2>
          <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--accent)' }}>
            @{otherUser?.username}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:px-6 space-y-5"
        style={{ background: 'var(--bg)' }}
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div
              className="text-center rounded-2xl p-6 sm:p-8 max-w-sm mx-auto"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--border-2)' }}
              >
                <Send className="w-6 h-6 ml-0.5" />
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>Say Hello!</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                You're connected with {otherUser?.full_name || otherUser?.username}. Start the conversation.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUser.id
            const showTime = idx === 0 || new Date(msg.created_at) - new Date(messages[idx - 1].created_at) > 5 * 60 * 1000

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showTime && (
                  <div className="w-full text-center my-3">
                    <span
                      className="text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full"
                      style={{ color: 'var(--text-dim)', background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                    >
                      {format(new Date(msg.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                )}
                <div
                  className="max-w-[85%] sm:max-w-[72%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed"
                  style={isMe ? {
                    background: 'var(--accent)',
                    color: 'white',
                    borderBottomRightRadius: '4px',
                    boxShadow: '0 2px 12px var(--accent-glow)',
                  } : {
                    background: 'var(--bg-3)',
                    color: 'var(--text)',
                    border: '1px solid var(--border-2)',
                    borderBottomLeftRadius: '4px',
                  }}
                >
                  <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="flex-shrink-0 p-3"
        style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }}
      >
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 max-w-4xl mx-auto rounded-xl p-1"
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)' }}
        >
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-transparent border-none resize-none h-11 min-h-[44px] max-h-32 py-2.5 px-3 outline-none text-sm"
            style={{ color: 'var(--text)', caretColor: 'var(--accent)' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
          />
          <div className="pb-[5px] pr-[5px]">
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="p-2.5 rounded-lg w-10 h-10 flex items-center justify-center transition-all duration-150 active:scale-90"
              style={{
                background: newMessage.trim() ? 'var(--accent)' : 'var(--border-2)',
                color: 'white',
                boxShadow: newMessage.trim() ? '0 0 14px var(--accent-glow)' : 'none',
                cursor: !newMessage.trim() || isSending ? 'not-allowed' : 'pointer',
                opacity: isSending ? 0.7 : 1,
              }}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
