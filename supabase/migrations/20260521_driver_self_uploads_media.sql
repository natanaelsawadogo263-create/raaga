-- Permettre à un utilisateur authentifié d'uploader / mettre à jour / lire ses
-- propres pièces livreur dans `media/drivers/{auth.uid}/...`.
--
-- Contexte : la page d'inscription livreur envoie 3 fichiers (avatar + CNIB
-- recto/verso) via une Server Action. Sans la clé `SUPABASE_SERVICE_ROLE_KEY`
-- côté serveur, on retombe sur la session du livreur tout juste créé pour
-- l'upload. Les politiques admin existantes (`media: admin insert`, etc.)
-- bloquent ce cas. Cette migration ajoute des politiques scopées au dossier
-- de l'utilisateur lui-même, sans toucher aux politiques admin déjà en place.

-- Insert : un user authentifié peut écrire dans son propre dossier `drivers/{uid}/...`
drop policy if exists "media: driver self insert" on storage.objects;
create policy "media: driver self insert"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = 'drivers'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Update : idem, pour permettre l'upsert (`upload(..., { upsert: true })`).
drop policy if exists "media: driver self update" on storage.objects;
create policy "media: driver self update"
on storage.objects
for update to authenticated
using (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = 'drivers'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = 'drivers'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Le bucket `media` est déjà public en lecture (cf. politique
-- "media: public read"), aucune politique SELECT supplémentaire n'est
-- nécessaire pour exposer les avatars aux clients/livreurs.
