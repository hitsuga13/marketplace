-- Purpose: Store manual payment gateway metadata with each order.

alter table public.orders
  add column if not exists payment_method text default 'manual_qr',
  add column if not exists payment_reference text default '',
  add column if not exists payment_status text not null default 'Pending Seller Verification';
