-- Synchronise products.category depuis categories.name à chaque INSERT/UPDATE produit.
-- Inclut la fonction pour rester idempotent si cette migration est jouée seule
-- (ex. 20260510 partiellement appliquée ou ordre différent).

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
