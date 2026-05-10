import type { MetadataRoute } from "next";

/**
 * `app/robots.ts` est une convention Next.js 16 : Next génère
 * automatiquement `/robots.txt` à partir de cet objet.
 *
 * On bloque les zones authentifiées (admin / livreur / espaces personnels)
 * pour éviter qu'elles soient indexées, sans empêcher l'exploration du
 * site public ou des fiches produit.
 */
function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return vercel.startsWith("http") ? vercel.replace(/\/+$/, "") : `https://${vercel}`;
  return "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin",
          "/admin/",
          "/livreur",
          "/livreur/",
          "/mes-commandes",
          "/suivi",
          "/panier",
          "/commande",
          "/connexion",
          "/auth/",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
