-- Purpose: Add built-in AI moderation metadata to seller products.

alter table public.products
  add column if not exists moderation_status text not null default 'approved',
  add column if not exists moderation_decision text not null default 'auto_approved',
  add column if not exists moderation_reason text default '',
  add column if not exists moderation_confidence numeric(4, 3),
  add column if not exists moderation_categories jsonb not null default '[]'::jsonb,
  add column if not exists moderation_checked_at timestamptz,
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text default '';

alter table public.products
  drop constraint if exists products_moderation_status_check;

drop trigger if exists products_apply_moderation on public.products;

update public.products
set
  moderation_status = case when moderation_status = 'pending_review' then 'rejected' else moderation_status end,
  active = case when moderation_status = 'pending_review' then false else active end,
  moderation_reason = case
    when moderation_status = 'pending_review' then coalesce(nullif(moderation_reason, ''), 'AI rejected this product for admin final check.')
    else coalesce(moderation_reason, 'Existing product approved before moderation metadata was added.')
  end,
  moderation_decision = coalesce(moderation_decision, 'auto_approved'),
  moderation_categories = coalesce(moderation_categories, '[]'::jsonb)
where moderation_status is null
  or moderation_status = 'pending_review'
  or moderation_decision is null
  or moderation_categories is null;

create or replace function public.apply_product_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  product_text text;
begin
  if public.current_app_user_is_admin() then
    return new;
  end if;

  if new.moderation_checked_at is not null
    and new.moderation_decision not in ('auto_approved', 'flagged')
  then
    return new;
  end if;

  product_text := lower(
    concat_ws(
      ' ',
      coalesce(new.name, ''),
      coalesce(new.category, ''),
      coalesce(new.desc1, ''),
      coalesce(new.vendor, ''),
      coalesce(new.seller, '')
    )
  );

  if product_text ~ '(vape|pod|pods|e-cigarette|ecigarette|rokok|cigarette|tobacco|alcohol|arak|beer|wine|liquor|whisky|vodka|rum|drug|drugs|ganja|weed|marijuana|cannabis|pil kuda|ketum|weapon|knife|pisau|gun|pistol|taser|pepper spray|lucah|porn|sex|explicit|offensive)' then
    new.moderation_status := 'rejected';
    new.moderation_decision := 'flagged';
    new.moderation_reason := 'Potential prohibited item detected by built-in database moderation.';
    new.moderation_confidence := 0.920;
    new.moderation_checked_at := now();
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.review_note := '';
    new.active := false;
  else
    new.moderation_status := 'approved';
    new.moderation_decision := 'auto_approved';
    new.moderation_reason := 'No prohibited terms detected by built-in database moderation.';
    new.moderation_confidence := 0.810;
    new.moderation_checked_at := now();
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.review_note := '';
  end if;

  return new;
end;
$$;

create trigger products_apply_moderation
before insert or update of name, category, desc1, vendor, seller, moderation_status, moderation_decision
on public.products
for each row execute function public.apply_product_moderation();

alter table public.products
  add constraint products_moderation_status_check
  check (moderation_status in ('approved', 'rejected'));

drop policy if exists products_public_read_active on public.products;
create policy products_public_read_active on public.products
for select
using (
  active = true
  and moderation_status = 'approved'
  and exists (
    select 1
    from public.users seller_user
    where seller_user.role = 'seller'
      and seller_user.active = true
      and (
        seller_user.id = products.seller_id
        or seller_user.local_id = products.seller_local_id
        or lower(seller_user.name) = lower(coalesce(products.vendor, products.seller, ''))
      )
  )
);

drop policy if exists products_seller_read_own on public.products;
create policy products_seller_read_own on public.products
for select
using (
  exists (
    select 1
    from public.users seller_user
    where seller_user.auth_id = auth.uid()
      and seller_user.role = 'seller'
      and (
        seller_user.id = products.seller_id
        or seller_user.local_id = products.seller_local_id
        or lower(seller_user.name) = lower(coalesce(products.vendor, products.seller, ''))
      )
  )
);

notify pgrst, 'reload schema';
