'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return { supabase, user }
}

export async function searchUsers(query) {
  if (!query || query.trim().length < 3) return []
  
  const { supabase, user } = await getUser()
  const searchTerm = `%${query.trim()}%`

  // 1. Search profiles
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url')
    .ilike('username', searchTerm)
    .neq('id', user.id)
    .limit(20)

  if (profileErr) {
    console.error('Search error:', profileErr)
    return []
  }

  if (!profiles.length) return []

  const profileIds = profiles.map(p => p.id)

  // 2. Fetch statuses for these profiles
  const { data: requests } = await supabase
    .from('connection_requests')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .in('status', ['PENDING', 'ACCEPTED'])

  const { data: connections } = await supabase
    .from('connections')
    .select('*')
    .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)

  // Map status
  return profiles.map(profile => {
    let status = 'Not Connected'
    
    // Check connections
    const isConnected = connections?.some(c => c.user_one_id === profile.id || c.user_two_id === profile.id)
    if (isConnected) {
      status = 'Connected'
      return { ...profile, status }
    }

    // Check requests
    const sentReq = requests?.find(r => r.sender_id === user.id && r.receiver_id === profile.id && r.status === 'PENDING')
    if (sentReq) {
      status = 'Request Sent'
      return { ...profile, status }
    }

    const recReq = requests?.find(r => r.receiver_id === user.id && r.sender_id === profile.id && r.status === 'PENDING')
    if (recReq) {
      status = 'Request Received'
      return { ...profile, status }
    }

    return { ...profile, status }
  })
}

export async function sendConnectionRequest(receiverId) {
  const { supabase, user } = await getUser()

  const { error } = await supabase
    .from('connection_requests')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: 'PENDING'
    })

  if (error) {
    console.error('Send request error:', error)
    return { error: 'Could not send request' }
  }

  revalidatePath('/search')
  revalidatePath('/requests')
  return { success: true }
}

export async function acceptConnectionRequest(requestId) {
  const { supabase, user } = await getUser()

  // 1. Get the request
  const { data: request, error: reqErr } = await supabase
    .from('connection_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (reqErr || !request || request.receiver_id !== user.id) {
    return { error: 'Request not found' }
  }

  // 2. Update request status
  await supabase
    .from('connection_requests')
    .update({ status: 'ACCEPTED', responded_at: new Date().toISOString() })
    .eq('id', requestId)

  // 3. Create connection
  const { data: connection, error: connErr } = await supabase
    .from('connections')
    .insert({
      user_one_id: request.sender_id,
      user_two_id: request.receiver_id
    })
    .select()
    .single()

  if (connErr) return { error: 'Could not create connection' }

  // 4. Create conversation
  await supabase
    .from('conversations')
    .insert({
      connection_id: connection.id
    })

  revalidatePath('/requests')
  revalidatePath('/chat')
  return { success: true }
}

export async function rejectConnectionRequest(requestId) {
  const { supabase, user } = await getUser()

  await supabase
    .from('connection_requests')
    .update({ status: 'REJECTED', responded_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('receiver_id', user.id)

  revalidatePath('/requests')
  return { success: true }
}

export async function getUserRequests() {
  const { supabase, user } = await getUser()

  const { data: rawIncoming } = await supabase
    .from('connection_requests')
    .select('*')
    .eq('receiver_id', user.id)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })

  const { data: rawOutgoing } = await supabase
    .from('connection_requests')
    .select('*')
    .eq('sender_id', user.id)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })

  const incomingIds = rawIncoming?.map(r => r.sender_id) || []
  const outgoingIds = rawOutgoing?.map(r => r.receiver_id) || []
  const allIds = [...new Set([...incomingIds, ...outgoingIds])]

  let profilesDict = {}
  if (allIds.length > 0) {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', allIds)
    
    profilesData?.forEach(p => { profilesDict[p.id] = p })
  }

  const incoming = (rawIncoming || []).map(req => ({
    ...req,
    profile: profilesDict[req.sender_id]
  }))

  const outgoing = (rawOutgoing || []).map(req => ({
    ...req,
    profile: profilesDict[req.receiver_id]
  }))

  return { incoming, outgoing }
}
