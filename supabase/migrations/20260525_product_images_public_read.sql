-- Lecture des images produit pour le catalogue public et l’aperçu livreur (colis avant acceptation).

alter table public.product_images enable row level security;

drop policy if exists "product_images: read active product" on public.product_images;
create policy "product_images: read active product"
  on public.product_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_images.product_id
        and p.is_active = true
    )
  );

drop policy if exists "product_images: admin all" on public.product_images;
create policy "product_images: admin all"
  on public.product_images
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "product_images: shop owner own product" on public.product_images;
create policy "product_images: shop owner own product"
  on public.product_images
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.products p
      join public.shops s on s.id = p.shop_id
      where p.id = product_images.product_id
        and s.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.products p
      join public.shops s on s.id = p.shop_id
      where p.id = product_images.product_id
        and s.owner_user_id = auth.uid()
    )
  );
