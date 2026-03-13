import { getConversations } from '@/lib/actions/chat'
import { ChatSidebar } from '@/components/chat/ChatSidebar'

export const metadata = { title: 'Chat - DudeChat' }

export default async function ChatLayout({ children }) {
  const conversations = await getConversations()

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      <ChatSidebar conversations={conversations} />
      {/* The children is either the empty state (chat/page.js) or active chat (chat/[id]/page.js) */}
      {children}
    </div>
  )
}
