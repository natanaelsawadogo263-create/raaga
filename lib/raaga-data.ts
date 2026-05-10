export type ProductStatus = "normal" | "promotion" | "nouveaute" | "best-seller" | "rupture";

export type Product = {
  id: string;
  name: string;
  category: string;
  city: string;
  price: number;
  /** Prix avant promo (fallback démo si pas de Supabase). */
  compareAtPrice?: number;
  image: string;
  rating: number;
  status: ProductStatus;
};

/** Sections accueil : univers + illustration (Unsplash). */
export const categoryShowcases: {
  name: string;
  imageAlt: string;
  imageUrl: string;
}[] = [
  {
    name: "Chaussures",
    imageAlt: "Chaussures et baskets",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Vetements",
    imageAlt: "Vetements et mode",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Telephones",
    imageAlt: "Smartphone moderne",
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Cosmetiques",
    imageAlt: "Produits de beauté",
    imageUrl:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b87?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Electromenager",
    imageAlt: "Electromenager cuisine",
    imageUrl:
      "https://images.unsplash.com/photo-1578500494198-246f612d69b8?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Informatique",
    imageAlt: "Ordinateur portable",
    imageUrl:
      "https://images.unsplash.com/photo-1498049794561-8590fcf66b85?auto=format&fit=crop&w=800&q=80",
  },
];

/** @deprecated Utiliser categoryShowcases pour l’accueil. Garde compat si besoin. */
export const categories = categoryShowcases.map((c) => c.name);

export const featuredProducts: Product[] = [
  {
    id: "p1",
    name: "Sneakers Urbaines Flex",
    category: "Chaussures",
    city: "Ouagadougou",
    price: 16500,
    image: "/window.svg",
    rating: 4.8,
    status: "best-seller",
  },
  {
    id: "p2",
    name: "Robe Classique Kadi",
    category: "Vetements",
    city: "Bobo-Dioulasso",
    price: 12900,
    compareAtPrice: 18900,
    image: "/window.svg",
    rating: 4.5,
    status: "promotion",
  },
  {
    id: "p3",
    name: "Smartphone Neo 128Go",
    category: "Telephones",
    city: "Koudougou",
    price: 118000,
    image: "/window.svg",
    rating: 4.7,
    status: "nouveaute",
  },
  {
    id: "p4",
    name: "Mixeur Compact 3-en-1",
    category: "Electromenager",
    city: "Ouagadougou",
    price: 24900,
    image: "/window.svg",
    rating: 4.3,
    status: "normal",
  },
];

export const appHighlights = [
  {
    title: "Paiement à la livraison",
    description: "Vous payez en espèces lorsque le livreur vous remet votre commande.",
  },
  {
    title: "Livraison suivie",
    description: "Suivi de statut en temps reel du colis jusqu'a reception.",
  },
  {
    title: "Securite renforcee",
    description: "Comptes livreurs verifies et validation de livraison par code secret.",
  },
];

export const faqItems = [
  {
    question: "Comment passer une commande ?",
    answer:
      "Choisissez vos produits, ajoutez-les au panier, connectez-vous puis confirmez votre adresse de livraison. Le paiement se fait en espèces au livreur à la réception.",
  },
  {
    question: "Quels moyens de paiement sont disponibles ?",
    answer:
      "Toutes les commandes se règlent en espèces à la livraison, au moment où le livreur vous remet le colis.",
  },
  {
    question: "Comment devenir livreur Raaga ?",
    answer:
      "Remplissez le formulaire livreur, envoyez vos documents, validez votre email puis attendez l'approbation de l'administrateur.",
  },
];
