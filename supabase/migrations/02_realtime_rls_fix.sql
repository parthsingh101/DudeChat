-- Fix for Realtime RLS evaluating joins in Postgres Changes
-- Supabase Realtime has limitations with complex joins in RLS policies, often returning false.
-- The recommended approach is to wrap the auth check in a security definer function.

create or replace function public.check_conversation_access(conv_id uuid)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.conversations cv
    join public.connections cn on cv.connection_id = cn.id
    where cv.id = conv_id and (cn.user_one_id = auth.uid() or cn.user_two_id = auth.uid())
  );
$$;

drop policy if exists "Enable access for conversation users" on public.messages;

create policy "Enable access for conversation users" on public.messages for select using (
  public.check_conversation_access(conversation_id)
);
