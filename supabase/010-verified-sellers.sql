-- Purpose: Show a blue verification mark for seller accounts.

alter table public.users
  add column if not exists verified_seller boolean not null default false;

update public.users
set verified_seller = true
where role = 'seller';
