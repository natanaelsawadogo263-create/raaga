/** URL canonique du site (sans slash final). */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return vercel.startsWith("http") ? vercel.replace(/\/+$/, "") : `https://${vercel}`;
  return "http://localhost:3000";
}

export function resolveMetadataBase(): URL {
  return new URL(`${siteUrl()}/`);
}
