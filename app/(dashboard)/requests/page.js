import { getUserRequests } from '@/lib/actions/connections'
import { RequestCard } from '@/components/RequestCard'

export const metadata = {
  title: 'Requests - DudeChat'
}

export default async function RequestsPage() {
  const { incoming, outgoing } = await getUserRequests()

  return (
    <div className="flex-1 flex flex-col pt-8 px-4 sm:px-8 max-w-3xl mx-auto w-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text)', letterSpacing: '0.15em' }}>
          Connection Requests
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Manage your pending incoming and outgoing requests.
        </p>
      </div>

      <div className="space-y-8 pb-12">
        <section>
          <h3
            className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 flex items-center gap-2"
            style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', letterSpacing: '0.12em' }}
          >
            Incoming
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--border-2)' }}
            >
              {incoming.length}
            </span>
          </h3>
          {incoming.length === 0 ? (
            <div
              className="text-sm py-5 px-4 rounded-xl"
              style={{ color: 'var(--text-dim)', background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              No incoming connection requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {incoming.map(req => (
                <RequestCard key={req.id} request={req} type="incoming" />
              ))}
            </div>
          )}
        </section>

        <section>
          <h3
            className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 flex items-center gap-2"
            style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', letterSpacing: '0.12em' }}
          >
            Outgoing
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--border-2)' }}
            >
              {outgoing.length}
            </span>
          </h3>
          {outgoing.length === 0 ? (
            <div
              className="text-sm py-5 px-4 rounded-xl"
              style={{ color: 'var(--text-dim)', background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              No outgoing connection requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {outgoing.map(req => (
                <RequestCard key={req.id} request={req} type="outgoing" />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
