-- Produits « poids lourd » + discussions commande (client ↔ admin)

alter table public.products
  add column if not exists is_heavy boolean not null default false;

comment on column public.products.is_heavy is
  'Produit poids lourd : livraison standard désactivée, discussion post-commande avec l’admin.';

alter table public.orders
  add column if not exists has_heavy_items boolean not null default false;

comment on column public.orders.has_heavy_items is
  'Commande contenant au moins un produit poids lourd.';

-- Discussion liée à une commande (créée automatiquement si has_heavy_items)
create table if not exists public.order_discussions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.order_discussion_messages (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.order_discussions (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  sender_role text not null check (sender_role in ('customer', 'admin')),
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists order_discussion_messages_discussion_created_idx
  on public.order_discussion_messages (discussion_id, created_at);

alter table public.order_discussions enable row level security;
alter table public.order_discussion_messages enable row level security;

-- Création auto de la discussion pour les commandes poids lourd
create or replace function public.orders_create_heavy_discussion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.has_heavy_items then
    insert into public.order_discussions (order_id)
    values (new.id)
    on conflict (order_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_create_heavy_discussion_trg on public.orders;
create trigger orders_create_heavy_discussion_trg
  after insert on public.orders
  for each row
  execute function public.orders_create_heavy_discussion();

-- Les livreurs ne voient pas les commandes poids lourd en attente
drop policy if exists "orders: driver reads awaiting" on public.orders;
create policy "orders: driver reads awaiting"
  on public.orders
  for select
  using (
    order_status = 'awaiting_driver'
    and driver_id is null
    and has_heavy_items = false
    and exists (
      select 1
      from public.driver_profiles dp
      where dp.user_id = auth.uid()
        and dp.review_status = 'approved'
        and dp.is_available = true
    )
  );

drop policy if exists "orders: driver accept unassigned" on public.orders;
create policy "orders: driver accept unassigned"
  on public.orders
  for update
  using (
    order_status = 'awaiting_driver'
    and driver_id is null
    and has_heavy_items = false
    and exists (
      select 1
      from public.driver_profiles dp
      where dp.user_id = auth.uid()
        and dp.review_status = 'approved'
        and dp.is_available = true
    )
  )
  with check (
    driver_id = auth.uid()
    and order_status in (
      'accepted_by_driver',
      'picked_up',
      'in_delivery',
      'delivery_declared',
      'secret_validated',
      'delivered',
      'problematic'
    )
  );

drop policy if exists "order_items: driver reads awaiting" on public.order_items;
create policy "order_items: driver reads awaiting"
  on public.order_items
  for select
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.order_status = 'awaiting_driver'
        and o.driver_id is null
        and o.has_heavy_items = false
    )
    and exists (
      select 1
      from public.driver_profiles dp
      where dp.user_id = auth.uid()
        and dp.review_status = 'approved'
        and dp.is_available = true
    )
  );

-- Discussions : lecture
create policy "order_discussions: customer read own"
  on public.order_discussions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_discussions.order_id
        and o.customer_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

-- Messages : lecture
create policy "order_discussion_messages: participants read"
  on public.order_discussion_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.order_discussions d
      join public.orders o on o.id = d.order_id
      where d.id = order_discussion_messages.discussion_id
        and (o.customer_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- Messages : envoi (client sur sa commande, admin sur toute discussion)
create policy "order_discussion_messages: customer insert"
  on public.order_discussion_messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and sender_role = 'customer'
    and exists (
      select 1
      from public.order_discussions d
      join public.orders o on o.id = d.order_id
      where d.id = order_discussion_messages.discussion_id
        and o.customer_id = auth.uid()
        and o.has_heavy_items = true
    )
  );

create policy "order_discussion_messages: admin insert"
  on public.order_discussion_messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and sender_role = 'admin'
    and public.is_admin(auth.uid())
    and exists (
      select 1
      from public.order_discussions d
      join public.orders o on o.id = d.order_id
      where d.id = order_discussion_messages.discussion_id
        and o.has_heavy_items = true
    )
  );
