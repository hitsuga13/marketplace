-- Purpose: Store app local IDs separately so Supabase sync does not fail on foreign key order/timing.

alter table public.products
  add column if not exists seller_local_id text;

alter table public.orders
  add column if not exists buyer_local_id text,
  add column if not exists product_local_id text;

alter table public.chat_messages
  add column if not exists buyer_local_id text,
  add column if not exists product_local_id text;

alter table public.products
  drop constraint if exists products_seller_id_fkey;

alter table public.orders
  drop constraint if exists orders_buyer_id_fkey,
  drop constraint if exists orders_product_id_fkey;

alter table public.chat_messages
  drop constraint if exists chat_messages_buyer_id_fkey,
  drop constraint if exists chat_messages_product_id_fkey;
