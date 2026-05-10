-- Quand le nom d'une catégorie change, mettre à jour le champ dénormalisé products.category (affichage admin / catalogue).

create or replace function public.sync_products_category_on_category_rename()
returns trigger
language plpgsql
as $$
begin
  if new.name is distinct from old.name then
    update public.products
    set category = new.name
    where category_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_categories_sync_product_names on public.categories;
create trigger trg_categories_sync_product_names
after update of name on public.categories
for each row execute function public.sync_products_category_on_category_rename();
