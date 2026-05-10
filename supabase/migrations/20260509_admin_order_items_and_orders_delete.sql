-- Admin CRUD: order_items (admin + customer checkout), optional order delete for admin

create policy "order_items: admin all"
on public.order_items
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "order_items: customer insert own order"
on public.order_items
for insert
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.customer_id = auth.uid()
  )
);

create policy "orders: admin delete"
on public.orders
for delete
using (public.is_admin(auth.uid()));
