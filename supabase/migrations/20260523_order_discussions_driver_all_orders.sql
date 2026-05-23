-- Discussions commande : toutes les commandes, participants client / livreur / admin

alter table public.order_discussion_messages
  drop constraint if exists order_discussion_messages_sender_role_check;

alter table public.order_discussion_messages
  add constraint order_discussion_messages_sender_role_check
  check (sender_role in ('customer', 'admin', 'driver'));

-- Discussion créée pour chaque nouvelle commande
create or replace function public.orders_create_order_discussion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.order_discussions (order_id)
  values (new.id)
  on conflict (order_id) do nothing;
  return new;
end;
$$;

drop trigger if exists orders_create_heavy_discussion_trg on public.orders;
drop trigger if exists orders_create_order_discussion_trg on public.orders;
create trigger orders_create_order_discussion_trg
  after insert on public.orders
  for each row
  execute function public.orders_create_order_discussion();

-- Rétroactif : discussions manquantes sur commandes existantes
insert into public.order_discussions (order_id)
select o.id
from public.orders o
where not exists (
  select 1 from public.order_discussions d where d.order_id = o.id
);

-- Lecture discussions
drop policy if exists "order_discussions: customer read own" on public.order_discussions;
drop policy if exists "order_discussions: participants read" on public.order_discussions;
create policy "order_discussions: participants read"
  on public.order_discussions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_discussions.order_id
        and (
          o.customer_id = auth.uid()
          or o.driver_id = auth.uid()
          or public.is_admin(auth.uid())
        )
    )
  );

-- Lecture messages
drop policy if exists "order_discussion_messages: participants read" on public.order_discussion_messages;
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
        and (
          o.customer_id = auth.uid()
          or o.driver_id = auth.uid()
          or public.is_admin(auth.uid())
        )
    )
  );

-- Envoi client
drop policy if exists "order_discussion_messages: customer insert" on public.order_discussion_messages;
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
    )
  );

-- Envoi admin (toutes commandes, ex. poids lourd sans livreur)
drop policy if exists "order_discussion_messages: admin insert" on public.order_discussion_messages;
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
    )
  );

-- Envoi livreur (commande qui lui est assignée)
drop policy if exists "order_discussion_messages: driver insert" on public.order_discussion_messages;
create policy "order_discussion_messages: driver insert"
  on public.order_discussion_messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and sender_role = 'driver'
    and exists (
      select 1
      from public.order_discussions d
      join public.orders o on o.id = d.order_id
      where d.id = order_discussion_messages.discussion_id
        and o.driver_id = auth.uid()
        and exists (
          select 1
          from public.driver_profiles dp
          where dp.user_id = auth.uid()
            and dp.review_status = 'approved'
        )
    )
  );
