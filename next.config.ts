import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Anciens liens / favoris vers la page « Télécharger » supprimée. */
  async redirects() {
    return [{ source: "/telecharger", destination: "/", permanent: true }];
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
