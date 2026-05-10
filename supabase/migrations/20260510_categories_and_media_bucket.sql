-- Catégories (CRUD admin) + liaison produits + bucket Storage public "media"

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text not null default '',
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_key unique (name),
  constraint categories_slug_key unique (slug)
);

drop trigger if exists trg_categories_updated on public.categories;
create trigger trg_categories_updated before update on public.categories
for each row execute function public.handle_updated_at();

alter table public.products add column if not exists category_id uuid references public.categories(id) on delete restrict;

-- Catégorie par défaut
insert into public.categories (name, slug, description, sort_order)
values ('Autres', 'autres', 'Rayon par défaut', 999)
on conflict (slug) do nothing;

-- Une ligne par nom de catégorie déjà utilisée sur les produits
insert into public.categories (name, slug, sort_order)
select distinct on (lower(trim(p.category)))
  trim(p.category),
  'cat-' || substr(md5(lower(trim(p.category))), 1, 16),
  10
from public.products p
where trim(p.category) is not null
  and trim(p.category) != ''
on conflict (name) do nothing;

-- Rattachement des produits
update public.products p
set category_id = c.id
from public.categories c
where lower(trim(p.category)) = lower(trim(c.name))
  and p.category_id is null;

update public.products
set category_id = (select id from public.categories where slug = 'autres' limit 1)
where category_id is null;

alter table public.products alter column category_id set not null;

create or replace function public.sync_product_category_name()
returns trigger
language plpgsql
as $$
begin
  if new.category_id is not null then
    select c.name into strict new.category
    from public.categories c
    where c.id = new.category_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_products_category_sync on public.products;
create trigger trg_products_category_sync
before insert or update on public.products
for each row execute function public.sync_product_category_name();

alter table public.categories enable row level security;

create policy "categories: public read active"
on public.categories
for select
using (is_active = true or public.is_admin(auth.uid()));

create policy "categories: admin write"
on public.categories
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Storage bucket (public read, admin write)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "media: public read"
on storage.objects
for select
using (bucket_id = 'media');

create policy "media: admin insert"
on storage.objects
for insert to authenticated
with check (bucket_id = 'media' and public.is_admin(auth.uid()));

create policy "media: admin update"
on storage.objects
for update to authenticated
using (bucket_id = 'media' and public.is_admin(auth.uid()))
with check (bucket_id = 'media' and public.is_admin(auth.uid()));

create policy "media: admin delete"
on storage.objects
for delete to authenticated
using (bucket_id = 'media' and public.is_admin(auth.uid()));
