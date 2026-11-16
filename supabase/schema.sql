create table if not exists public.profiles (
    id uuid primary key default gen_random_uuid(),
    email text unique,
    full_name text,
    role text not null default 'user',
    created_at timestamptz not null default now()
  );
  
  create table if not exists public.app_events (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid,
    event_type text not null,
    payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
  );
  
  alter table public.profiles enable row level security;
  alter table public.app_events enable row level security;
  
  create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);
  
  create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id);
  