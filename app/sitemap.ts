import type { MetadataRoute } from "next";

/**
 * `app/sitemap.ts` est une convention Next.js 16 : Next génère
 * automatiquement `/sitemap.xml`. On y déclare uniquement les routes
 * publiques que l'on veut voir indexer (les routes admin / livreur /
 * compte privé sont déjà exclues côté `robots.txt`).
 *
 * Pour étendre avec des fiches produits dynamiques, il suffira d'ajouter
 * une requête Supabase qui pousse les `/produits/{id}` dans le tableau.
 */
function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return vercel.startsWith("http") ? vercel.replace(/\/+$/, "") : `https://${vercel}`;
  return "http://localhost:3000";
}

const PUBLIC_ROUTES: { path: string; priority: number; changefreq: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changefreq: "daily" },
  { path: "/produits", priority: 0.95, changefreq: "daily" },
  { path: "/promo", priority: 0.85, changefreq: "daily" },
  { path: "/a-propos", priority: 0.6, changefreq: "monthly" },
  { path: "/contact", priority: 0.5, changefreq: "monthly" },
  { path: "/aide", priority: 0.4, changefreq: "monthly" },
  { path: "/faq", priority: 0.4, changefreq: "monthly" },
  { path: "/inscription-client", priority: 0.5, changefreq: "monthly" },
  { path: "/inscription-livreur", priority: 0.5, changefreq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return PUBLIC_ROUTES.map(({ path, priority, changefreq }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: changefreq,
    priority,
  }));
}
