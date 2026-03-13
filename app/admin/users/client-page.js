'use client'

import { useState, useTransition } from 'react'
import { updateUserRole } from '@/lib/actions/admin'
import { format } from 'date-fns'
import { ShieldAlert, User, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsersClient({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers)
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (userId, newRole) => {
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(`Role updated to ${newRole}`)
        setUsers(prev =>
          prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
        )
      }
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold uppercase tracking-widest" style={{ color: 'var(--text)', letterSpacing: '0.15em' }}>
          Manage Users
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {users.length} total user{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div
        className="rounded-xl overflow-hidden overflow-x-auto"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border-2)' }}>
              {['Full Name', 'Username', 'Email', 'Role', 'Joined'].map(h => (
                <th
                  key={h}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr
                key={u.id}
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0"
                      style={{ background: 'var(--accent)', color: 'white' }}
                    >
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (u.full_name || u.username)?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span style={{ color: 'var(--text)' }}>
                      {u.full_name || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>None</span>}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 font-medium" style={{ color: 'var(--text)' }}>
                  @{u.username}
                </td>
                <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>
                  {u.email}
                </td>
                <td className="px-5 py-3">
                  <RoleSelector
                    userId={u.id}
                    currentRole={u.role}
                    onChange={handleRoleChange}
                    disabled={isPending}
                  />
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--text-muted)' }}>
                  {format(new Date(u.created_at), 'MMM d, yyyy')}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RoleSelector({ userId, currentRole, onChange, disabled }) {
  const isAdmin = currentRole === 'ADMIN'

  return (
    <div className="relative inline-block">
      <select
        value={currentRole}
        onChange={(e) => onChange(userId, e.target.value)}
        disabled={disabled}
        className="appearance-none pl-7 pr-7 py-1 rounded-full text-xs font-semibold cursor-pointer transition focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        style={isAdmin ? {
          background: 'rgba(245,158,11,0.1)',
          color: '#f59e0b',
          border: '1px solid rgba(245,158,11,0.3)',
        } : {
          background: 'var(--bg-3)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-2)',
        }}
      >
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
        {isAdmin
          ? <ShieldAlert className="w-3 h-3" style={{ color: '#f59e0b' }} />
          : <User className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
        }
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-dim)' }} />
      </div>
    </div>
  )
}
