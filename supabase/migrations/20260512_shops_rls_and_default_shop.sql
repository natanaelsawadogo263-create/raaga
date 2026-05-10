-- Boutiques : RLS (lecture catalogue + admin complet) + une ligne par défaut si la table est vide.
-- Sans politique SELECT, une RLS activée manuellement sur `shops` renvoie 0 ligne (liste déroulante vide).

alter table public.shops enable row level security;

drop policy if exists "shops: public read active" on public.shops;
drop policy if exists "shops: admin all" on public.shops;

-- Visiteurs / clients : voir les boutiques actives (ex. futures fiches partenaires).
create policy "shops: public read active"
on public.shops
for select
using (status = 'active');

-- Admins : toutes les boutiques, création / mise à jour / suppression.
create policy "shops: admin all"
on public.shops
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Première boutique pour pouvoir créer des produits tout de suite (idempotent).
insert into public.shops (name, city, district, sector, address, phone, description, status)
select
  'Boutique Raaga (défaut)',
  'Ouagadougou',
  'Centre',
  'Secteur à préciser',
  'Adresse à compléter dans l''admin ou le SQL',
  '+22600000000',
  'Créée automatiquement : modifiez les coordonnées ou ajoutez d’autres boutiques.',
  'active'
where not exists (select 1 from public.shops limit 1);
