'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return { supabase, user }
}

export async function getConversations() {
  const { supabase, user } = await getUser()

  // 1. Get all connections involving the user
  const { data: connections, error: connErr } = await supabase
    .from('connections')
    .select('*')
    .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)

  if (connErr || !connections?.length) return []

  const connectionIds = connections.map(c => c.id)

  // 2. Get conversations for these connections
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, messages(content, created_at, sender_id, is_read)')
    .in('connection_id', connectionIds)
    .order('updated_at', { ascending: false })

  // 3. Get all the other user's profiles
  const otherUserIds = connections.map(c => c.user_one_id === user.id ? c.user_two_id : c.user_one_id)
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url')
    .in('id', otherUserIds)

  const profilesDict = {}
  profiles?.forEach(p => { profilesDict[p.id] = p })

  // Map everything together
  const enriched = conversations?.map(conv => {
    // Find who the other user is based on the connection
    const conn = connections.find(c => c.id === conv.connection_id)
    const otherUserId = conn?.user_one_id === user.id ? conn.user_two_id : conn?.user_one_id
    const otherUser = profilesDict[otherUserId]
    
    // Sort nested messages to get the last one
    const sortedMessages = conv.messages?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []
    const lastMessage = sortedMessages.length > 0 ? sortedMessages[0] : null
    
    // Count unread messages (messages NOT from current user that are unread)
    const unreadCount = conv.messages?.filter(m => m.sender_id !== user.id && !m.is_read).length || 0

    return {
      id: conv.id,
      updated_at: conv.updated_at,
      otherUser,
      lastMessage,
      unreadCount
    }
  }) || []

  // Ensure they are strictly ordered by updated_at descending
  return enriched.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
}

export async function getMessages(conversationId) {
  const { supabase, user } = await getUser()
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Fetch msgs error:', error)
    return []
  }
  return messages || []
}

export async function sendMessage(conversationId, content, messageId) {
  if (!content || !content.trim()) return { error: 'Empty message' }

  const { supabase, user } = await getUser()

  // 1. Insert message
  const insertData = {
    conversation_id: conversationId,
    sender_id: user.id,
    content: content.trim()
  };
  
  if (messageId) {
    insertData.id = messageId;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Send message error:', error)
    return { error: 'Could not send message' }
  }

  // 2. Update conversation updated_at for ordering
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  revalidatePath(`/chat/${conversationId}`)
  revalidatePath('/chat')

  return { success: true, message: data }
}

export async function markConversationAsRead(conversationId) {
  try {
    const { supabase, user } = await getUser()

    // Mark all messages in this conversation NOT sent by the current user as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    revalidatePath('/chat')
  } catch (err) {
    // Non-critical — silently ignore errors
    console.error('markConversationAsRead error:', err.message)
  }
}
