-- Catalogue public : lecture explicite des produits actifs pour anon / clients connectés.
-- Même pattern que product_images (20260525) et shops (20260512).

grant select on public.products to anon, authenticated;

drop policy if exists "products: public read active" on public.products;
create policy "products: public read active"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

-- Admins : lire aussi les produits inactifs (aperçu admin / debug catalogue).
drop policy if exists "products: admin read all" on public.products;
create policy "products: admin read all"
  on public.products
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Écriture admin : insert / update / delete uniquement (évite le FOR ALL ambigu).
drop policy if exists "products: admin write" on public.products;

drop policy if exists "products: admin insert" on public.products;
create policy "products: admin insert"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

drop policy if exists "products: admin update" on public.products;
create policy "products: admin update"
  on public.products
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "products: admin delete" on public.products;
create policy "products: admin delete"
  on public.products
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));
