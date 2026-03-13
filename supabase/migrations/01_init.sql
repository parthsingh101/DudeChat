-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade,
  full_name text,
  username text unique not null,
  email text,
  role text default 'USER',
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

alter table public.profiles enable row level security;

-- Admin check function (security definer bypasses RLS to prevent recursion)
create or replace function public.is_admin()
returns boolean
language sql security definer 
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'ADMIN');
$$;

-- RLS for profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
create policy "Admins can do all on profiles" on public.profiles for all using (public.is_admin());

-- Trigger for auth.users to create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.email,
    'USER'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Connection Requests
create table public.connection_requests (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  responded_at timestamp with time zone
);
create unique index unique_pending_request on public.connection_requests (sender_id, receiver_id) where status = 'PENDING';

alter table public.connection_requests enable row level security;
create policy "Users can view their own requests." on public.connection_requests for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can insert own requests." on public.connection_requests for insert with check (auth.uid() = sender_id);
create policy "Users can update received requests." on public.connection_requests for update using (auth.uid() = receiver_id or auth.uid() = sender_id);
create policy "Admins can do all on connection_requests" on public.connection_requests for all using (public.is_admin());

-- 3. Connections
create table public.connections (
  id uuid default uuid_generate_v4() primary key,
  user_one_id uuid references public.profiles(id) on delete cascade not null,
  user_two_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_one_id, user_two_id)
);

alter table public.connections enable row level security;
create policy "Users can view their connections." on public.connections for select using (auth.uid() = user_one_id or auth.uid() = user_two_id);
create policy "Users can insert connections." on public.connections for insert with check (auth.uid() = user_one_id or auth.uid() = user_two_id);
create policy "Admins can do all on connections" on public.connections for all using (public.is_admin());

-- 4. Conversations
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  connection_id uuid references public.connections(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.conversations enable row level security;
create policy "Enable access for connection users" on public.conversations for all using (
  exists (
    select 1 from public.connections c
    where c.id = connection_id and (c.user_one_id = auth.uid() or c.user_two_id = auth.uid())
  )
);
create policy "Admins can do all on conversations" on public.conversations for all using (public.is_admin());

-- 5. Messages
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  message_type text default 'TEXT',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.messages enable row level security;
create policy "Enable access for conversation users" on public.messages for select using (
  exists (
    select 1 from public.conversations cv
    join public.connections cn on cv.connection_id = cn.id
    where cv.id = conversation_id and (cn.user_one_id = auth.uid() or cn.user_two_id = auth.uid())
  )
);
create policy "Enable insert for conversation users" on public.messages for insert with check (
  auth.uid() = sender_id and
  exists (
    select 1 from public.conversations cv
    join public.connections cn on cv.connection_id = cn.id
    where cv.id = conversation_id and (cn.user_one_id = auth.uid() or cn.user_two_id = auth.uid())
  )
);
create policy "Admins can do all on messages" on public.messages for all using (public.is_admin());

-- Enable Realtime for Messages
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.connections;
alter publication supabase_realtime add table public.connection_requests;
alter publication supabase_realtime add table public.profiles;

