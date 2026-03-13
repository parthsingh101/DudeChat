import { getAdminConversations } from '@/lib/actions/admin'
import { format } from 'date-fns'

export const metadata = { title: 'Conversations Registry - DudeChat' }

const thTw = "px-5 py-3 text-xs font-semibold uppercase tracking-widest"
const tdTw = "px-5 py-3 text-sm"

export default async function AdminConversationsPage() {
  const conversations = await getAdminConversations()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold uppercase tracking-widest" style={{ color: 'var(--text)', letterSpacing: '0.15em' }}>
          Conversations Registry
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {conversations.length} total conversation{conversations.length !== 1 ? 's' : ''} on the platform.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden overflow-x-auto" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}>
        <table className="w-full text-left">
          <thead>
            <tr style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border-2)' }}>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>Conv ID</th>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>Participants</th>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>Created</th>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map(conv => (
              <tr key={conv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className={`${tdTw} font-mono text-xs`} style={{ color: 'var(--text-dim)' }}>
                  {conv.id.split('-')[0]}…
                </td>
                <td className={tdTw}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: 'var(--accent)' }}>@{conv.userOne}</span>
                    <span style={{ color: 'var(--text-dim)' }}>&amp;</span>
                    <span className="font-medium" style={{ color: 'var(--accent)' }}>@{conv.userTwo}</span>
                  </div>
                </td>
                <td className={`${tdTw} whitespace-nowrap`} style={{ color: 'var(--text-muted)' }}>
                  {format(new Date(conv.created_at), 'MMM d, yyyy')}
                </td>
                <td className={`${tdTw} whitespace-nowrap`} style={{ color: 'var(--text-muted)' }}>
                  {format(new Date(conv.updated_at), 'MMM d, yy h:mm a')}
                </td>
              </tr>
            ))}
            {conversations.length === 0 && (
              <tr>
                <td colSpan="4" className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No conversations created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
