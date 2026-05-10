alter table public.products
add column if not exists variant_options jsonb not null default '{}'::jsonb;

comment on column public.products.variant_options is
  'Options configurables du produit (ex: {"Taille":["S","M"],"Couleur":["Rouge","Noir"]}).';
