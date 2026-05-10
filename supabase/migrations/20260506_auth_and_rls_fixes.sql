-- Complements for auth/profile bootstrap + missing insert policies

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    id,
    role,
    first_name,
    last_name,
    phone,
    city,
    district,
    sector
  )
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'customer'),
    coalesce(new.raw_user_meta_data ->> 'first_name', 'Utilisateur'),
    coalesce(new.raw_user_meta_data ->> 'last_name', 'Raaga'),
    coalesce(new.raw_user_meta_data ->> 'phone', 'N/A'),
    coalesce(new.raw_user_meta_data ->> 'city', 'Ouagadougou'),
    coalesce(new.raw_user_meta_data ->> 'district', 'N/A'),
    coalesce(new.raw_user_meta_data ->> 'sector', 'N/A')
  )
  on conflict (id) do nothing;

  if coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'customer') = 'driver' then
    insert into public.driver_profiles (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create policy "profiles: self insert"
on public.user_profiles
for insert
with check (id = auth.uid() or public.is_admin(auth.uid()));

create policy "drivers: self insert"
on public.driver_profiles
for insert
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "notifications: admin insert"
on public.notifications
for insert
with check (public.is_admin(auth.uid()));

create policy "tickets: owner insert"
on public.support_tickets
for insert
with check (user_id = auth.uid() or public.is_admin(auth.uid()));
