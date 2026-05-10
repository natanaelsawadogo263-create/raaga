# Raaga

Raaga est une application e-commerce/livraison mobile-first construite avec Next.js et Supabase.

## Demarrage

1) Installer les dependances:

```bash
npm install
```

2) Configurer les variables d'environnement:

```bash
cp .env.example .env.local
```

Puis renseigner les valeurs Supabase dans `.env.local`.

3) Lancer le serveur:

```bash
npm run dev
```

## Socle Supabase

- Migration SQL initiale: `supabase/migrations/20260506_initial_raaga.sql`
- Migration complementaire auth/RLS: `supabase/migrations/20260506_auth_and_rls_fixes.sql`
- Migration policies livreur: `supabase/migrations/20260506_driver_task_policies.sql`
- Migration confirmation client livraison: `supabase/migrations/20260507_customer_delivery_confirmation.sql`
- Client navigateur: `lib/supabase/client.ts`
- Client serveur: `lib/supabase/server.ts`
- Types DB (MVP): `lib/supabase/database.types.ts`
- Server actions: `app/actions.ts` (auth, favoris, panier, commande)
- Flux livreur connecte: `app/livreur/*` (taches, en-cours, disponibilite)

### Ce que couvre la migration

- Profils utilisateurs et roles (`customer`, `driver`, `admin`, `super_admin`)
- Validation livreur et documents KYC
- Boutiques, produits, images produit
- Favoris, panier persistant
- Commandes, articles de commande, code secret livraison
- Notifications, tickets support, logs d'activite
- RLS de base pour securiser les acces par role

## Commandes utiles

```bash
npm run lint
npm run build
```

## Deploiement

Hebergement recommande: Vercel pour le frontend, Supabase pour backend/auth/database/storage.
