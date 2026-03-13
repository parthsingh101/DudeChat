import { searchUsers } from '@/lib/actions/connections'
import { UserCard } from '@/components/UserCard'
import { Search } from 'lucide-react'

export const metadata = {
  title: 'Search - DudeChat'
}

export default async function SearchPage(props) {
  let q = ''
  try {
    const searchParams = await props.searchParams
    q = searchParams?.q || ''
  } catch (e) {}
  
  const users = q.length >= 3 ? await searchUsers(q) : []

  return (
    <div className="flex-1 flex flex-col pt-8 px-4 sm:px-8 max-w-3xl mx-auto w-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text)', letterSpacing: '0.15em' }}>
          Search Users
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Find people by username and send a connection request.
        </p>
      </div>

      <form className="mb-8 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4" style={{ color: 'var(--text-dim)' }} />
        </div>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search at least 3 characters..."
          className="w-full rounded-xl pl-11 pr-28 py-3.5 text-sm outline-none transition"
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border-2)',
            color: 'var(--text)',
          }}
        />
        <button
          type="submit"
          className="absolute inset-y-2 right-2 px-5 rounded-lg text-sm font-semibold transition tracking-wide"
          style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 0 14px var(--accent-glow)' }}
        >
          Search
        </button>
      </form>

      {q.length > 0 && q.length < 3 && (
        <div
          className="text-sm text-center py-6 px-4 rounded-xl"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          Enter at least 3 characters to search.
        </div>
      )}

      {q.length >= 3 && (
        <div className="space-y-3 pb-12">
          {users.length === 0 ? (
            <div
              className="text-center py-12 rounded-xl text-sm"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              No users found matching "{q}".
            </div>
          ) : (
            users.map(user => (
              <UserCard key={user.id} user={user} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
