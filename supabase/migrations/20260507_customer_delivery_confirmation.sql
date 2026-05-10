-- Allow customers to confirm or flag their own delivered orders

create policy "orders: customer confirm delivery"
on public.orders
for update
using (
  customer_id = auth.uid()
  and order_status in ('secret_validated', 'delivery_declared')
)
with check (
  customer_id = auth.uid()
  and order_status in ('confirmed_by_customer', 'delivered', 'problematic')
);
