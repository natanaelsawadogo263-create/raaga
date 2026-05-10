-- Allow approved + available drivers to read pending orders (awaiting_driver, driver_id null)
-- so they can see the list of tasks in their dashboard before accepting one.
--
-- Policy "orders: customer and admin read" (in 20260506_initial_raaga.sql) only lets
-- a driver read orders he is already assigned to. We add a complementary SELECT policy
-- restricted to the "awaiting_driver" pool, gated on the driver being approved AND available.
--
-- This mirrors the existing UPDATE policy "orders: driver accept unassigned" in
-- 20260506_driver_task_policies.sql.

drop policy if exists "orders: driver reads awaiting" on public.orders;

create policy "orders: driver reads awaiting"
on public.orders
for select
using (
  order_status = 'awaiting_driver'
  and driver_id is null
  and exists (
    select 1
    from public.driver_profiles dp
    where dp.user_id = auth.uid()
      and dp.review_status = 'approved'
      and dp.is_available = true
  )
);

-- Drivers must also be able to read order_items + shops + products of those pending orders
-- so the dashboard can display the items list and the shop name to pick up from.
-- The existing "order_items: participants read" policy only matches customer/driver_id/admin.

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
  )
  and exists (
    select 1
    from public.driver_profiles dp
    where dp.user_id = auth.uid()
      and dp.review_status = 'approved'
      and dp.is_available = true
  )
);
