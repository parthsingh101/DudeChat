-- 1. Create the storage bucket for avatars if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Setup access policies for the avatars bucket
-- Allow public access to read avatars
create policy "Avatar images are publicly accessible."
on storage.objects for select
using (bucket_id = 'avatars');

-- Allow users to upload their own avatars
create policy "Users can upload their own avatars."
on storage.objects for insert
with check (
  bucket_id = 'avatars' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatars
create policy "Users can update their own avatars."
on storage.objects for update
using (
  bucket_id = 'avatars' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
create policy "Users can delete their own avatars."
on storage.objects for delete
using (
  bucket_id = 'avatars' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Create a secure function to allow users to delete their own account
-- Supabase auth.users can only be deleted by service_role, so we need a security definer function
create or replace function public.delete_user()
returns void
language plpgsql security definer set search_path = public
as $$
declare
  user_id uuid;
begin
  user_id := auth.uid();
  
  if user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete from auth.users (this will cascade to profiles due to the foreign key we setup in 01_init)
  delete from auth.users where id = user_id;
end;
$$;
