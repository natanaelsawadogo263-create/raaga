import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * URL canonique du site, utilisée pour résoudre les chemins relatifs
 * (manifest, OpenGraph, sitemap…). Priorité :
 *   1. NEXT_PUBLIC_SITE_URL (défini explicitement, ex: https://raaga.bf)
 *   2. VERCEL_URL injecté automatiquement sur les déploiements Vercel
 *   3. Fallback localhost en développement
 */
function resolveMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return new URL(vercel.startsWith("http") ? vercel : `https://${vercel}`);
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: "Raaga | E-commerce et livraison locale",
  description:
    "Raaga est une plateforme e-commerce mobile-first adaptee au Burkina Faso pour commander, payer et suivre vos livraisons.",
  manifest: "/manifest.webmanifest",
  applicationName: "Raaga",
  appleWebApp: {
    capable: true,
    title: "Raaga",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/icons/icon-192.png"],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#FF7A00",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
