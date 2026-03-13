import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Auto-recover missing profiles
  if (!profile) {
    const defaultUsername = `user_${user.id.substring(0, 6)}`
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: 'User',
        username: user.email?.split('@')[0] || defaultUsername,
        role: user.email?.includes('admin') ? 'ADMIN' : 'USER'
      })
      .select()
      .single()
      
    profile = newProfile
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar profile={profile} />
      <main className="flex-1 flex overflow-hidden" style={{ borderTop: '1px solid var(--border)' }}>
        {children}
      </main>
    </div>
  )
}
