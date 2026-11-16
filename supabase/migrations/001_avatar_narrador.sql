create extension if not exists pgcrypto;


-- ===================================================================
-- BOOKS
-- ===================================================================

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  slug text not null unique,

  title text not null,

  file_name text not null,

  mime_type text not null,

  size_bytes bigint not null default 0,

  storage_path text not null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


alter table public.books
enable row level security;


drop policy if exists
"books_select_own"
on public.books;


create policy
"books_select_own"
on public.books
for select
using (
  auth.uid() = user_id
);


drop policy if exists
"books_insert_own"
on public.books;


create policy
"books_insert_own"
on public.books
for insert
with check (
  auth.uid() = user_id
);


drop policy if exists
"books_update_own"
on public.books;


create policy
"books_update_own"
on public.books
for update
using (
  auth.uid() = user_id
);


drop policy if exists
"books_delete_own"
on public.books;


create policy
"books_delete_own"
on public.books
for delete
using (
  auth.uid() = user_id
);


-- ===================================================================
-- NARRATION JOBS
-- ===================================================================

create table if not exists public.narration_jobs (
  id uuid primary key
    default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  book_id uuid not null
    references public.books(id)
    on delete cascade,

  voice text,

  avatar text,

  narration_mode text,

  status text not null
    default 'queued'
    check (
      status in (
        'queued',
        'processing',
        'completed',
        'failed'
      )
    ),

  output_url text,

  error_message text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


alter table public.narration_jobs
enable row level security;


drop policy if exists
"jobs_select_own"
on public.narration_jobs;


create policy
"jobs_select_own"
on public.narration_jobs
for select
using (
  auth.uid() = user_id
);


drop policy if exists
"jobs_insert_own"
on public.narration_jobs;


create policy
"jobs_insert_own"
on public.narration_jobs
for insert
with check (
  auth.uid() = user_id
);


drop policy if exists
"jobs_update_own"
on public.narration_jobs;


create policy
"jobs_update_own"
on public.narration_jobs
for update
using (
  auth.uid() = user_id
);


-- ===================================================================
-- STORAGE BUCKET
-- ===================================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'books',
  'books',
  false
)
on conflict (id)
do nothing;


-- ===================================================================
-- STORAGE POLICIES
-- ===================================================================

drop policy if exists
"books_storage_select"
on storage.objects;


create policy
"books_storage_select"
on storage.objects
for select
using (
  bucket_id = 'books'
  and
  split_part(name, '/', 1)
    = auth.uid()::text
);


drop policy if exists
"books_storage_insert"
on storage.objects;


create policy
"books_storage_insert"
on storage.objects
for insert
with check (
  bucket_id = 'books'
  and
  split_part(name, '/', 1)
    = auth.uid()::text
);


drop policy if exists
"books_storage_delete"
on storage.objects;


create policy
"books_storage_delete"
on storage.objects
for delete
using (
  bucket_id = 'books'
  and
  split_part(name, '/', 1)
    = auth.uid()::text
);