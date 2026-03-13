-- Add is_read column to messages to support unread indicators
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

-- Index for fast unread queries
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON public.messages(conversation_id, sender_id, is_read);
