-- Purpose: Add stable local IDs so the existing Vue app can sync string IDs with Supabase numeric IDs.

alter table public.users
  add column if not exists local_id text unique;

alter table public.products
  add column if not exists local_id text unique;

alter table public.orders
  add column if not exists local_id text unique;

alter table public.chat_messages
  add column if not exists local_id text unique;

update public.users
set local_id = id::text
where local_id is null;
