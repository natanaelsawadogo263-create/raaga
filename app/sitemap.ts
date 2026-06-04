import type { MetadataRoute } from "next";
import { fetchSitemapProducts } from "@/lib/sitemap-products";
import { siteUrl } from "@/lib/site-url";

/** Régénération périodique (produits dynamiques). */
export const revalidate = 3600;

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changefreq: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
}[] = [
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changefreq }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: changefreq,
    priority,
  }));

  const products = await fetchSitemapProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/produits/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries];
}
