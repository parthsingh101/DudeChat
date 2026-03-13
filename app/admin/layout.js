import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    redirect('/chat') // Or a specialized 403 page
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar profile={profile} />
      <div className="flex flex-1 overflow-hidden" style={{ borderTop: '1px solid var(--border)' }}>
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
