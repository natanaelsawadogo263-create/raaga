export type OrderRow = {
  id: string;
  client: string;
  boutique: string;
  amount: string;
  status: string;
};

export type DriverRequest = {
  id: string;
  name: string;
  city: string;
};

export type LowStockProduct = {
  name: string;
  boutique: string;
  stock: number;
};

export const statCards = [
  { title: "Commandes du jour", value: "128", delta: "18%", href: "/admin/commandes" as const },
  { title: "Produits actifs", value: "1 245", delta: "12%", href: "/admin/produits" as const },
  { title: "Livreurs approuvés", value: "312", delta: "7%", href: "/admin/livreurs" as const },
  { title: "Revenus du jour", value: "1 245 000 FCFA", delta: "22%", href: "/admin/statistiques" as const },
];

export const orderRows: OrderRow[] = [
  { id: "RAA-8421", client: "Aminata Traoré", boutique: "Boutique Yêwê", amount: "45 000 FCFA", status: "En attente" },
  { id: "RAA-8420", client: "Issa Sanou", boutique: "Faso Market", amount: "15 500 FCFA", status: "En cours" },
  { id: "RAA-8419", client: "Fatoumata Diallo", boutique: "La Maison Bio", amount: "42 000 FCFA", status: "Livrée" },
  { id: "RAA-8418", client: "Boubacar Kaboré", boutique: "Tech Store BF", amount: "65 000 FCFA", status: "Annulée" },
  { id: "RAA-8417", client: "Seydou Iboudo", boutique: "Boutique Faso Style", amount: "22 000 FCFA", status: "En cours" },
];

export const initialDriverRequests: DriverRequest[] = [
  { id: "d1", name: "Moussa Ouédraogo", city: "Ouagadougou" },
  { id: "d2", name: "Adam Zongo", city: "Bobo-Dioulasso" },
  { id: "d3", name: "Salif Compaoré", city: "Koudougou" },
  { id: "d4", name: "Hamidou Traoré", city: "Ouahigouya" },
];

export const recentActivity = [
  "Nouvelle commande #RAA-8421 par Aminata Traoré",
  "Nouvel livreur inscrit Moussa Ouédraogo",
  "Nouveau produit ajouté Riz local 5 kg",
  "Nouvelle boutique inscrite Boutique Faso Style",
  "Commande #RAA-8415 livrée par Boubacar Kaboré",
];

export const lowStockProducts: LowStockProduct[] = [
  { name: "Riz local 5 kg", boutique: "Faso Market", stock: 8 },
  { name: "Huile de palme 1 L", boutique: "La Maison Bio", stock: 12 },
  { name: "Savon neem 250 g", boutique: "Natra & Soin", stock: 15 },
  { name: "Mil local 1 kg", boutique: "Boutique Nafissa", stock: 20 },
];
