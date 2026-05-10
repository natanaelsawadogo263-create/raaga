-- Comptes boutiques : rôle shop_owner + propriétaire lié à user_profiles.

do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role' and n.nspname = 'public'
  ) and not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role' and n.nspname = 'public' and e.enumlabel = 'shop_owner'
  ) then
    alter type public.app_role add value 'shop_owner';
  end if;
end$$;

alter table public.shops
  add column if not exists owner_user_id uuid references public.user_profiles(id) on delete set null;

create unique index if not exists shops_owner_user_id_unique
  on public.shops (owner_user_id)
  where owner_user_id is not null;

-- Propriétaire : sa fiche boutique (en plus des politiques publiques / admin existantes).
drop policy if exists "shops: owner read own" on public.shops;
create policy "shops: owner read own"
on public.shops
for select
using (owner_user_id = auth.uid());

drop policy if exists "shops: owner update own" on public.shops;
create policy "shops: owner update own"
on public.shops
for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

-- Gestion du catalogue de sa boutique (complète la politique admin).
drop policy if exists "products: shop owner all own" on public.products;
create policy "products: shop owner all own"
on public.products
for all
using (
  exists (
    select 1 from public.shops s
    where s.id = products.shop_id and s.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.shops s
    where s.id = products.shop_id and s.owner_user_id = auth.uid()
  )
);
