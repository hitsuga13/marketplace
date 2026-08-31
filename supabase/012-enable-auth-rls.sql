-- Purpose: Enable Supabase Auth-backed row level security without breaking the
-- public marketplace catalog.

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.chat_messages enable row level security;
alter table public.profiles enable row level security;
alter table public.reviews enable row level security;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.users
  where auth_id = auth.uid()
  limit 1
$$;

create or replace function public.current_app_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'admin', false)
$$;

drop policy if exists users_public_read_active on public.users;
create policy users_public_read_active on public.users
for select
using (active = true);

drop policy if exists users_owner_update on public.users;
create policy users_owner_update on public.users
for update
using (auth_id = auth.uid())
with check (
  auth_id = auth.uid()
  and role = public.current_app_role()
);

drop policy if exists users_admin_all on public.users;
create policy users_admin_all on public.users
for all
using (public.current_app_user_is_admin())
with check (public.current_app_user_is_admin());

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

drop policy if exists products_seller_insert_own on public.products;
create policy products_seller_insert_own on public.products
for insert
with check (
  exists (
    select 1
    from public.users seller_user
    where seller_user.auth_id = auth.uid()
      and seller_user.role = 'seller'
      and seller_user.active = true
      and (
        seller_user.id = products.seller_id
        or seller_user.local_id = products.seller_local_id
      )
  )
);

drop policy if exists products_seller_update_own on public.products;
create policy products_seller_update_own on public.products
for update
using (
  exists (
    select 1
    from public.users seller_user
    where seller_user.auth_id = auth.uid()
      and seller_user.role = 'seller'
      and (
        seller_user.id = products.seller_id
        or seller_user.local_id = products.seller_local_id
      )
  )
)
with check (
  exists (
    select 1
    from public.users seller_user
    where seller_user.auth_id = auth.uid()
      and seller_user.role = 'seller'
      and seller_user.active = true
      and (
        seller_user.id = products.seller_id
        or seller_user.local_id = products.seller_local_id
      )
  )
);

drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products
for all
using (public.current_app_user_is_admin())
with check (public.current_app_user_is_admin());

drop policy if exists orders_participant_read on public.orders;
create policy orders_participant_read on public.orders
for select
using (
  exists (
    select 1
    from public.users app_user
    where app_user.auth_id = auth.uid()
      and (
        app_user.role = 'admin'
        or app_user.id = orders.buyer_id
        or app_user.local_id = orders.buyer_local_id
        or (
          app_user.role = 'seller'
          and exists (
            select 1
            from public.products ordered_product
            where ordered_product.id = orders.product_id
              or ordered_product.local_id = orders.product_local_id
              or ordered_product.name = orders.product_name
          )
          and exists (
            select 1
            from public.products seller_product
            where (seller_product.id = orders.product_id or seller_product.local_id = orders.product_local_id)
              and (
                seller_product.seller_id = app_user.id
                or seller_product.seller_local_id = app_user.local_id
                or lower(seller_product.vendor) = lower(app_user.name)
              )
          )
        )
      )
  )
);

drop policy if exists orders_buyer_insert_own on public.orders;
create policy orders_buyer_insert_own on public.orders
for insert
with check (
  exists (
    select 1
    from public.users buyer_user
    where buyer_user.auth_id = auth.uid()
      and buyer_user.role = 'buyer'
      and buyer_user.active = true
      and (buyer_user.id = orders.buyer_id or buyer_user.local_id = orders.buyer_local_id)
  )
);

drop policy if exists orders_participant_update on public.orders;
create policy orders_participant_update on public.orders
for update
using (
  exists (
    select 1
    from public.users app_user
    where app_user.auth_id = auth.uid()
      and (
        app_user.role = 'admin'
        or app_user.id = orders.buyer_id
        or app_user.local_id = orders.buyer_local_id
        or lower(app_user.name) = lower(orders.vendor)
      )
  )
)
with check (
  exists (
    select 1
    from public.users app_user
    where app_user.auth_id = auth.uid()
      and (
        app_user.role = 'admin'
        or app_user.id = orders.buyer_id
        or app_user.local_id = orders.buyer_local_id
        or lower(app_user.name) = lower(orders.vendor)
      )
  )
);

drop policy if exists chat_participant_read on public.chat_messages;
create policy chat_participant_read on public.chat_messages
for select
using (
  exists (
    select 1
    from public.users app_user
    where app_user.auth_id = auth.uid()
      and (
        app_user.role = 'admin'
        or app_user.id = chat_messages.buyer_id
        or app_user.local_id = chat_messages.buyer_local_id
        or lower(app_user.name) = lower(chat_messages.seller_name)
      )
  )
);

drop policy if exists chat_participant_insert on public.chat_messages;
create policy chat_participant_insert on public.chat_messages
for insert
with check (
  exists (
    select 1
    from public.users app_user
    where app_user.auth_id = auth.uid()
      and app_user.active = true
      and (
        (chat_messages.sender_role = 'buyer' and (app_user.id = chat_messages.buyer_id or app_user.local_id = chat_messages.buyer_local_id))
        or (chat_messages.sender_role = 'seller' and lower(app_user.name) = lower(chat_messages.seller_name))
      )
  )
);

drop policy if exists chat_participant_update on public.chat_messages;
create policy chat_participant_update on public.chat_messages
for update
using (
  exists (
    select 1
    from public.users app_user
    where app_user.auth_id = auth.uid()
      and (
        app_user.role = 'admin'
        or app_user.id = chat_messages.buyer_id
        or app_user.local_id = chat_messages.buyer_local_id
        or lower(app_user.name) = lower(chat_messages.seller_name)
      )
  )
)
with check (
  exists (
    select 1
    from public.users app_user
    where app_user.auth_id = auth.uid()
      and (
        app_user.role = 'admin'
        or app_user.id = chat_messages.buyer_id
        or app_user.local_id = chat_messages.buyer_local_id
        or lower(app_user.name) = lower(chat_messages.seller_name)
      )
  )
);

drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
for select
using (true);

drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update on public.profiles
for update
using (
  exists (
    select 1
    from public.users app_user
    where app_user.auth_id = auth.uid()
      and app_user.id = profiles.id
  )
)
with check (
  exists (
    select 1
    from public.users app_user
    where app_user.auth_id = auth.uid()
      and app_user.id = profiles.id
  )
);

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
for all
using (public.current_app_user_is_admin())
with check (public.current_app_user_is_admin());

drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews
for select
using (true);

drop policy if exists reviews_authenticated_insert on public.reviews;
create policy reviews_authenticated_insert on public.reviews
for insert
with check (auth.role() = 'authenticated');

drop policy if exists reviews_admin_all on public.reviews;
create policy reviews_admin_all on public.reviews
for all
using (public.current_app_user_is_admin())
with check (public.current_app_user_is_admin());

notify pgrst, 'reload schema';
