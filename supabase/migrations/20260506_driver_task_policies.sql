-- Allow approved drivers to accept unassigned orders safely

create policy "orders: driver accept unassigned"
on public.orders
for update
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
)
with check (
  driver_id = auth.uid()
  and order_status in ('accepted_by_driver', 'picked_up', 'in_delivery', 'delivery_declared', 'secret_validated', 'delivered', 'problematic')
);
