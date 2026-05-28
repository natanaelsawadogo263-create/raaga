-- Permettre la suppression définitive d'un produit par l'admin :
-- conserver l'historique des commandes (product_name) et détacher product_id (SET NULL).

alter table public.order_items
  add column if not exists product_name text;

update public.order_items oi
set product_name = p.name
from public.products p
where oi.product_id = p.id
  and (oi.product_name is null or btrim(oi.product_name) = '');

alter table public.order_items
  alter column product_id drop not null;

alter table public.order_items
  drop constraint if exists order_items_product_id_fkey;

alter table public.order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references public.products(id) on delete set null;

create or replace function public.order_items_snapshot_product_name()
returns trigger
language plpgsql
as $$
begin
  if (new.product_name is null or btrim(new.product_name) = '') and new.product_id is not null then
    select p.name into new.product_name
    from public.products p
    where p.id = new.product_id;
  end if;
  return new;
end;
$$;

drop trigger if exists order_items_snapshot_product_name on public.order_items;

create trigger order_items_snapshot_product_name
  before insert on public.order_items
  for each row
  execute function public.order_items_snapshot_product_name();
