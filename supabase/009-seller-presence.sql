-- Purpose: Track seller online, idle, and offline presence for chat.

alter table public.users
  add column if not exists presence_status text not null default 'offline'
    check (presence_status in ('online', 'idle', 'offline')),
  add column if not exists last_seen_at timestamptz;

create index if not exists users_role_presence_idx
  on public.users (role, presence_status, last_seen_at);
