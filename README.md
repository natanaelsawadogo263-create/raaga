# Raaga

Application e-commerce et livraison locale, mobile-first, adaptée au Burkina Faso.
Stack : **Next.js 16 (App Router)** · **React 19** · **TypeScript** · **Tailwind CSS 4** · **Supabase** (Auth, Postgres, Storage, RLS).

## Sommaire

- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données Supabase](#base-de-données-supabase)
- [Architecture](#architecture)
- [Commandes utiles](#commandes-utiles)
- [Déploiement Vercel](#déploiement-vercel)

## Démarrage rapide

```bash
# 1. Installer les dépendances (Node ≥ 20)
npm install

# 2. Préparer les variables d'environnement
cp .env.example .env.local
#  → renseigner NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#    et idéalement SUPABASE_SERVICE_ROLE_KEY

# 3. Appliquer les migrations Supabase
#    (voir la section « Base de données Supabase » ci-dessous)

# 4. Lancer le serveur de développement
npm run dev
```

## Variables d'environnement

| Variable | Côté | Obligatoire | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + serveur | ✅ | URL du projet Supabase, ex `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + serveur | ✅ | Clé anonyme publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | serveur | ⚠️ recommandé | Service role — gestion admin (livreurs), uploads inscription livreur. Ne jamais l'exposer au client. |
| `NEXT_PUBLIC_SITE_URL` | client + serveur | optionnel | URL canonique en production (`https://raaga.bf` par exemple). Sert pour le sitemap, OpenGraph, e-mails. |
| `NEXT_PUBLIC_APK_DOWNLOAD_URL` | client | optionnel | Lien direct vers un APK Android hébergé. Laisser vide si seule la PWA est proposée. |
| `VERCEL_URL` | serveur | auto | Injecté automatiquement par Vercel — sert de fallback à `NEXT_PUBLIC_SITE_URL`. |

Tous les fichiers `.env*` sont git-ignorés : seul `.env.example` est versionné.

## Base de données Supabase

Les migrations SQL sont dans `supabase/migrations/`, dans l'ordre chronologique de leur préfixe.
Pour les appliquer (CLI Supabase) :

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Migrations notables :
- `20260506_initial_raaga.sql` — schéma initial complet (profiles, shops, products, orders, RLS).
- `20260516_orders_reference_nine_digits.sql` — référence commande 9 chiffres.
- `20260518_driver_reads_awaiting_orders.sql` — RLS pour la lecture livreur.
- `20260520_admin_delete_user_rpc.sql` — RPC `admin_delete_user` (suppression livreur sans service role).
- `20260521_driver_self_uploads_media.sql` — RLS Storage pour l'inscription livreur.

Bucket Storage requis : `media` (public en lecture, créé par `20260510_categories_and_media_bucket.sql`).

## Architecture

```
app/
  (site)/           → routes publiques + espace client
  (driver)/         → espace livreur (LivreurShell + sous-pages)
  admin/            → back-office
  api/              → routes API (panier, etc.)
  actions.ts        → server actions (auth, panier, commandes, inscription livreur)
  layout.tsx        → metadata, manifest, themeColor PWA
  robots.ts         → /robots.txt généré dynamiquement
  sitemap.ts        → /sitemap.xml généré dynamiquement
components/         → UI réutilisable
lib/
  supabase/         → clients (browser, server, admin)
  auth-guards.ts    → requireRole, requireAuthenticatedUser
public/
  manifest.webmanifest → PWA installable
  sw.js              → service worker (start_url precaching, network-first)
  icons/             → icônes PWA 192/512/maskable + apple-touch-icon
supabase/migrations/ → migrations SQL versionnées
```

## Commandes utiles

```bash
npm run dev         # serveur de développement (Turbopack)
npm run build       # build de production
npm run start       # serveur de production local
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit (vérification TypeScript stricte)
```

## Déploiement Vercel

### 1. Importer le projet

1. Aller sur https://vercel.com/new et **Import Git Repository**.
2. Sélectionner le repo `raaga`.
3. Vercel détecte automatiquement Next.js — laisser les paramètres par défaut.
4. **Build Command** : `next build` · **Install Command** : `npm install` · **Output** : `.next`.

### 2. Configurer les variables d'environnement

Project ▸ Settings ▸ Environment Variables. Ajouter (Preview + Production) :

```
NEXT_PUBLIC_SUPABASE_URL          = https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = <anon key>
SUPABASE_SERVICE_ROLE_KEY         = <service role key>     (Production uniquement)
NEXT_PUBLIC_SITE_URL              = https://raaga.bf       (Production)
```

Ne pas mettre `SUPABASE_SERVICE_ROLE_KEY` en Preview pour limiter le rayon d'exposition.

### 3. Configurer Supabase pour Vercel

Dans Supabase ▸ Authentication ▸ URL Configuration :
- **Site URL** : `https://raaga.bf` (ou votre domaine)
- **Redirect URLs** : ajouter
  - `https://raaga.bf/**`
  - `https://*.vercel.app/**` (pour les déploiements de preview)

Sans ça, l'authentification renvoie une erreur sur les liens magiques / changement de mot de passe.

### 4. Premier déploiement

```bash
git push origin main
```

Vercel construit automatiquement. La région est fixée à **Paris (`cdg1`)** dans `vercel.json` — c'est la plus proche du Burkina Faso parmi les régions Vercel, donc la latence la plus basse.

### 5. Ajouter votre domaine custom

Project ▸ Settings ▸ Domains ▸ Add `raaga.bf`. Suivre les instructions DNS.
Une fois le domaine actif, mettre à jour `NEXT_PUBLIC_SITE_URL` puis redéployer.

### Checklist post-déploiement

- [ ] `https://<domaine>/robots.txt` répond 200.
- [ ] `https://<domaine>/sitemap.xml` répond 200.
- [ ] `https://<domaine>/manifest.webmanifest` répond 200 avec `Content-Type: application/manifest+json`.
- [ ] Sur Chrome/Edge desktop, le bouton **Télécharger l'application** déclenche le prompt natif d'installation PWA.
- [ ] Connexion / inscription client fonctionnent.
- [ ] Inscription livreur : upload des 3 pièces (avatar + CNIB recto/verso) réussit.
- [ ] Admin peut approuver / supprimer un livreur.

### Mises à jour ultérieures

- Pour appliquer une nouvelle migration SQL : `npx supabase db push`.
- Pour publier une nouvelle version : `git push origin main` (Vercel rebuild).
- Pour invalider le cache CDN d'un asset : changer son chemin (les icônes sous `/icons/` sont mises en cache 1 an avec `immutable`).

## Licence

© Raaga — tous droits réservés. Code propriétaire.
