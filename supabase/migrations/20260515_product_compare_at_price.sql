-- Prix catalogue avant promo (affichage barré). Le prix réellement facturé reste price_cfa.
alter table public.products
  add column if not exists compare_at_price_cfa integer null
  check (compare_at_price_cfa is null or compare_at_price_cfa >= 0);

comment on column public.products.compare_at_price_cfa is
  'Pour les produits en promo : prix de référence affiché barré (≥ price_cfa). Nullable.';
