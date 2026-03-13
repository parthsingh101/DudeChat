import { getMessages, getConversations } from '@/lib/actions/chat'
import { ChatBox } from '@/components/chat/ChatBox'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Conversation - DudeChat' }

export default async function ConversationPage(props) {
  // Extract params async in Next.js 15
  let conversationId = ''
  try {
    const params = await props.params
    conversationId = params?.conversationId
  } catch (e) {
    return redirect('/chat')
  }

  if (!conversationId) redirect('/chat')

  // We need current user to pass to ChatBox
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const initialMessages = await getMessages(conversationId)
  
  // Find other user from conversations list for header
  const conversations = await getConversations()
  const conversation = conversations.find(c => c.id === conversationId)
  
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        Conversation not found or access denied.
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-slate-950 min-w-0">
      <ChatBox 
        initialMessages={initialMessages} 
        conversationId={conversationId} 
        currentUser={user}
        otherUser={conversation.otherUser}
      />
    </main>
  )
}
