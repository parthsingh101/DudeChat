import { getAdminStats } from '@/lib/actions/admin'
import { Users, UserPlus, CheckCircle2, MessageSquare, MessagesSquare, Activity } from 'lucide-react'

export const metadata = { title: 'Admin Dashboard - DudeChat' }

export default async function AdminPage() {
  const stats = await getAdminStats()

  if (!stats) return (
    <div className="p-8 text-sm" style={{ color: 'var(--text-muted)' }}>Access Denied</div>
  )

  const statCards = [
    { title: 'Total Users',      value: stats.users,           icon: Users },
    { title: 'Total Requests',   value: stats.requests,        icon: UserPlus },
    { title: 'Pending Requests', value: stats.pendingRequests, icon: Activity },
    { title: 'Connections',      value: stats.connections,     icon: CheckCircle2 },
    { title: 'Conversations',    value: stats.conversations,   icon: MessageSquare },
    { title: 'Total Messages',   value: stats.messages,        icon: MessagesSquare },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1
          className="text-xl font-bold uppercase tracking-widest"
          style={{ color: 'var(--text)', letterSpacing: '0.15em' }}
        >
          Platform Overview
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Live statistics and monitoring.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="rounded-xl p-5 flex items-center justify-between"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                {s.title}
              </p>
              <h3 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                {s.value.toLocaleString()}
              </h3>
            </div>
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--border-2)' }}
            >
              <s.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
