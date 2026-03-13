export const metadata = {
  title: 'Chats - DudeChat'
}

export default function ChatDashboardPage() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)' }}
        >
          <svg
            className="w-7 h-7"
            style={{ color: 'var(--accent)', opacity: 0.7 }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold tracking-wide uppercase" style={{ color: 'var(--text)', letterSpacing: '0.1em' }}>
          Select a conversation
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Choose a connection to start chatting.
        </p>
      </div>
    </div>
  )
}
