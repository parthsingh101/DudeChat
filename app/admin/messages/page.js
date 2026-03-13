import { getAdminMessages } from '@/lib/actions/admin'
import { format } from 'date-fns'

export const metadata = { title: 'Messages Monitor - DudeChat' }

const thTw = "px-5 py-3 text-xs font-semibold uppercase tracking-widest"
const tdTw = "px-5 py-3 text-sm"

export default async function AdminMessagesPage() {
  const messages = await getAdminMessages()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold uppercase tracking-widest" style={{ color: 'var(--text)', letterSpacing: '0.15em' }}>
          Messages Monitor
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Showing last {messages.length} messages on the platform.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden overflow-x-auto" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}>
        <table className="w-full text-left">
          <thead>
            <tr style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border-2)' }}>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>Sender</th>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>Content</th>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>Sent At</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className={`${tdTw} font-medium`} style={{ color: 'var(--accent)' }}>
                  @{m.sender?.username || 'System'}
                </td>
                <td className={`${tdTw} max-w-md truncate`} style={{ color: 'var(--text)' }}>
                  {m.content}
                </td>
                <td className={`${tdTw} whitespace-nowrap`} style={{ color: 'var(--text-muted)' }}>
                  {format(new Date(m.created_at), 'MMM d, yy h:mm a')}
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr>
                <td colSpan="3" className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
