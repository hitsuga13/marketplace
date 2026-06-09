-- Purpose: Default login accounts for a fresh UPNM Campus Marketplace Supabase project.
-- Run this after schema.sql in the Supabase SQL Editor.

insert into public.users
  (local_id, name, email, phone, password, role, recovery_code, active)
values
  ('1', 'Aiman Buyer', 'buyer@upnm.test', '', '123456', 'buyer', 'BUYER-2026', true),
  ('2', 'Campus Kitchen', 'seller@upnm.test', '', '123456', 'seller', 'SELLER-2026', true),
  ('4', 'Takoyaki King', 'takoyaki@upnm.test', '', '123456', 'seller', 'TAKO-2026', true),
  ('5', 'WorldStar Cafe', 'worldstar@upnm.test', '', '123456', 'seller', 'WORLD-2026', true),
  ('6', 'Campus Thrift & Services', 'thriftservices@upnm.test', '', '123456', 'seller', 'THRIFT-2026', true),
  ('3', 'Admin UPNM', 'admin@upnm.test', '', '123456', 'admin', 'ADMIN-2026', true)
on conflict (email) do update set
  local_id = excluded.local_id,
  name = excluded.name,
  phone = excluded.phone,
  password = excluded.password,
  role = excluded.role,
  recovery_code = excluded.recovery_code,
  active = excluded.active,
  updated_at = now();
