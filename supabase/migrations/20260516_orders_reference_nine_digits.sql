-- Public order reference: exactly 9 digits, unique. Auto-generated on insert.

alter table public.orders add column if not exists reference text;

create or replace function public.orders_set_reference()
returns trigger
language plpgsql
as $$
declare
  cand text;
  attempts int := 0;
begin
  if new.reference is not null and btrim(new.reference) <> '' then
    return new;
  end if;
  loop
    cand := lpad((floor(random() * 900000000)::int + 100000000)::text, 9, '0');
    exit when not exists (select 1 from public.orders o where o.reference = cand);
    attempts := attempts + 1;
    if attempts > 120 then
      raise exception 'orders_set_reference: could not allocate unique reference';
    end if;
  end loop;
  new.reference := cand;
  return new;
end;
$$;

drop trigger if exists orders_set_reference_bi on public.orders;
create trigger orders_set_reference_bi
  before insert on public.orders
  for each row
  execute function public.orders_set_reference();

-- Backfill existing rows (idempotent: skip already set)
do $$
declare
  r record;
  cand text;
begin
  for r in select id from public.orders where reference is null or btrim(reference) = '' loop
    loop
      cand := lpad((floor(random() * 900000000)::int + 100000000)::text, 9, '0');
      exit when not exists (select 1 from public.orders o where o.reference = cand);
    end loop;
    update public.orders set reference = cand where id = r.id;
  end loop;
end $$;

alter table public.orders alter column reference set not null;

alter table public.orders drop constraint if exists orders_reference_digits_chk;
alter table public.orders add constraint orders_reference_digits_chk check (reference ~ '^[0-9]{9}$');

create unique index if not exists orders_reference_uidx on public.orders (reference);
