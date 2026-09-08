-- Purpose: Persist AI receipt pre-screening so buyers, sellers, and admins see one audit trail.
alter table public.orders
  add column if not exists receipt_verification_status text not null default 'unavailable',
  add column if not exists receipt_verification_decision text default 'manual_review_required',
  add column if not exists receipt_verification_reason text default '',
  add column if not exists receipt_verification_confidence numeric,
  add column if not exists receipt_verification_categories jsonb not null default '[]'::jsonb,
  add column if not exists receipt_verification_checked_at timestamptz;

alter table public.orders
  drop constraint if exists orders_receipt_verification_status_check;

alter table public.orders
  add constraint orders_receipt_verification_status_check
  check (receipt_verification_status in ('verified', 'suspicious', 'rejected', 'unavailable'));

notify pgrst, 'reload schema';
