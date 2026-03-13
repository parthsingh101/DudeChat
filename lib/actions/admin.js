'use server'

import { createClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isAuthorized: false, supabase: null }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') return { isAuthorized: false, supabase: null }
  return { isAuthorized: true, supabase }
}

export async function getAdminStats() {
  const { isAuthorized, supabase } = await checkAdmin()
  if (!isAuthorized) return null

  const [
    { count: usersCount }, 
    { count: requestsCount }, 
    { count: connectionsCount }, 
    { count: convsCount }, 
    { count: msgsCount },
    { count: pendingReqsCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('connection_requests').select('*', { count: 'exact', head: true }),
    supabase.from('connections').select('*', { count: 'exact', head: true }),
    supabase.from('conversations').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('connection_requests').select('*', { count: 'exact', head: true }).eq('status', 'PENDING')
  ])

  return {
    users: usersCount || 0,
    requests: requestsCount || 0,
    pendingRequests: pendingReqsCount || 0,
    connections: connectionsCount || 0,
    conversations: convsCount || 0,
    messages: msgsCount || 0
  }
}

export async function getAdminUsers() {
  const { isAuthorized, supabase } = await checkAdmin()
  if (!isAuthorized) return []
  
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function getAdminRequests() {
  const { isAuthorized, supabase } = await checkAdmin()
  if (!isAuthorized) return []
  
  const { data } = await supabase
    .from('connection_requests')
    .select('*, sender:sender_id(username), receiver:receiver_id(username)')
    .order('created_at', { ascending: false })
  return data || []
}

export async function getAdminConversations() {
  const { isAuthorized, supabase } = await checkAdmin()
  if (!isAuthorized) return []
  
  const { data } = await supabase
    .from('conversations')
    .select('*, connections(user_one_id, user_two_id)')
    .order('updated_at', { ascending: false })

  if (!data?.length) return []

  // Gather profiles to label connections
  const { data: profiles } = await supabase.from('profiles').select('id, username')
  const profMap = {}
  profiles?.forEach(p => { profMap[p.id] = p.username })

  return data.map(conv => ({
    ...conv,
    userOne: profMap[conv.connections?.user_one_id] || 'Unknown',
    userTwo: profMap[conv.connections?.user_two_id] || 'Unknown'
  }))
}

export async function getAdminMessages() {
  const { isAuthorized, supabase } = await checkAdmin()
  if (!isAuthorized) return []
  
  const { data } = await supabase
    .from('messages')
    .select('*, sender:sender_id(username)')
    .order('created_at', { ascending: false })
    .limit(100)
    
  return data || []
}

export async function updateUserRole(userId, newRole) {
  const { isAuthorized, supabase } = await checkAdmin()
  if (!isAuthorized) return { error: 'Unauthorized' }
  if (!['ADMIN', 'USER'].includes(newRole)) return { error: 'Invalid role' }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) return { error: error.message }
  return { success: true }
}
