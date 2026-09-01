-- Purpose: Let sellers delete their own products under RLS.

drop policy if exists products_seller_delete_own on public.products;
create policy products_seller_delete_own on public.products
for delete
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
