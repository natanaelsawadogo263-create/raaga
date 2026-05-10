-- Permet à l'admin de supprimer une ligne `user_profiles` (cascade vers
-- `driver_profiles`, `wallet_transactions`, `notifications`, `support_tickets`,
-- etc.). Utilisé en fallback côté serveur quand la clé service-role n'est pas
-- configurée : le compte Auth (`auth.users`) reste alors orphelin et doit être
-- nettoyé manuellement depuis le dashboard Supabase, mais le livreur perd
-- immédiatement tout accès à l'application puisque `requireRole` échoue.

drop policy if exists "profiles: admin delete" on public.user_profiles;

create policy "profiles: admin delete"
on public.user_profiles
for delete
using (public.is_admin(auth.uid()));
