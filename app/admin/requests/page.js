import { getAdminRequests } from '@/lib/actions/admin'
import { format } from 'date-fns'

export const metadata = { title: 'Requests Monitor - DudeChat' }

const thTw = "px-5 py-3 text-xs font-semibold uppercase tracking-widest"
const tdTw = "px-5 py-3 text-sm"

const statusStyle = {
  PENDING:  { background: 'rgba(245,158,11,0.1)',  color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
  ACCEPTED: { background: 'rgba(22,163,74,0.1)',   color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)' },
  REJECTED: { background: 'rgba(185,28,28,0.1)',   color: 'var(--accent)', border: '1px solid var(--border-2)' },
}

export default async function AdminRequestsPage() {
  const requests = await getAdminRequests()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold uppercase tracking-widest" style={{ color: 'var(--text)', letterSpacing: '0.15em' }}>
          Monitor Connection Requests
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {requests.length} total request{requests.length !== 1 ? 's' : ''} on the platform.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden overflow-x-auto" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}>
        <table className="w-full text-left">
          <thead>
            <tr style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border-2)' }}>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>ID</th>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>Sender</th>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>Receiver</th>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>Status</th>
              <th className={thTw} style={{ color: 'var(--text-muted)' }}>Sent At</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className={`${tdTw} font-mono text-xs`} style={{ color: 'var(--text-dim)' }}>
                  {req.id.split('-')[0]}…
                </td>
                <td className={`${tdTw} font-medium`} style={{ color: 'var(--text)' }}>
                  @{req.sender?.username || 'Unknown'}
                </td>
                <td className={`${tdTw} font-medium`} style={{ color: 'var(--text)' }}>
                  @{req.receiver?.username || 'Unknown'}
                </td>
                <td className={tdTw}>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
                    style={statusStyle[req.status] || { background: 'var(--bg-3)', color: 'var(--text-muted)' }}
                  >
                    {req.status}
                  </span>
                </td>
                <td className={`${tdTw} whitespace-nowrap`} style={{ color: 'var(--text-muted)' }}>
                  {format(new Date(req.created_at), 'MMM d, yy h:mm a')}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
