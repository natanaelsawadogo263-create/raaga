import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Anciens liens / favoris vers la page « Télécharger » supprimée. */
  async redirects() {
    return [{ source: "/telecharger", destination: "/", permanent: true }];
  },

  /**
   * En-têtes HTTP appliqués par Vercel devant le CDN.
   * - `/sw.js` ne DOIT pas être mis en cache : sinon les mises à jour du
   *   service worker ne se propagent jamais aux navigateurs déjà installés.
   * - `/manifest.webmanifest` peut être mis en cache 1h, mais doit servir le
   *   bon Content-Type (sinon Chrome refuse l'installation de la PWA).
   * - Les icônes générées sont fingerprintées par leur chemin, on peut les
   *   mettre en cache long.
   */
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
          { key: "Content-Type", value: "application/manifest+json; charset=utf-8" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      /** En-têtes de sécurité raisonnables, sans casser nos intégrations. */
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  /**
   * Les Server Actions sont limitées à 1 Mo de body par défaut. Sur la page
   * d'inscription livreur on envoie 3 photos (avatar + CNIB recto/verso),
   * chacune pouvant peser jusqu'à 5 Mo après validation côté client. On élargit
   * donc la limite à 16 Mo pour absorber confortablement les 3 fichiers.
   */
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
