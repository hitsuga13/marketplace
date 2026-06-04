-- Purpose: Keep chat sync reliable when app product IDs are local strings instead of Supabase numeric IDs.

alter table public.chat_messages
  drop constraint if exists chat_messages_product_id_fkey;
