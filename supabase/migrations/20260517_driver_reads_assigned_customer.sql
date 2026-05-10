-- Allow an approved driver to read the customer profile for the order they are assigned to.
-- Without this policy, drivers cannot see the customer's name / phone, which is required
-- to call the customer and collect the 4-digit secret code at delivery time.

drop policy if exists "profiles: driver reads assigned customer" on public.user_profiles;

create policy "profiles: driver reads assigned customer"
on public.user_profiles
for select
using (
  exists (
    select 1
    from public.orders o
    where o.driver_id = auth.uid()
      and o.customer_id = public.user_profiles.id
      and o.order_status in (
        'accepted_by_driver',
        'picked_up',
        'in_delivery',
        'delivery_declared',
        'secret_validated',
        'delivered',
        'problematic'
      )
  )
);
