-- RPC permettant à un administrateur de supprimer complètement un compte
-- (auth.users + cascade vers user_profiles, driver_profiles, etc.) SANS avoir
-- besoin de SUPABASE_SERVICE_ROLE_KEY côté application.
--
-- La fonction est `SECURITY DEFINER` : elle s'exécute avec les droits de son
-- owner (postgres), ce qui permet le DELETE sur `auth.users`. Une garde
-- interne refuse l'appel si l'appelant n'est pas admin et empêche la
-- suppression d'un autre admin / super_admin par ce biais.

create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_role public.app_role;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'admin_delete_user: only admins can call this function';
  end if;

  if target_user_id is null then
    raise exception 'admin_delete_user: target_user_id is null';
  end if;

  select role into target_role from public.user_profiles where id = target_user_id;

  -- Verrou de sécurité : on n'autorise pas la suppression d'un admin / super_admin
  -- via ce chemin (réservé à la suppression de comptes opérationnels).
  if target_role in ('admin', 'super_admin') then
    raise exception 'admin_delete_user: cannot delete an admin account via this function';
  end if;

  -- DELETE en cascade : auth.users -> user_profiles -> driver_profiles, etc.
  delete from auth.users where id = target_user_id;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;
