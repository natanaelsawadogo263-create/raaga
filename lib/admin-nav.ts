import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ClipboardList,
  LayoutGrid,
  Package,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Store,
  Tags,
  Truck,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

export const adminNavItems: AdminNavItem[] = [
  { icon: LayoutGrid, label: "Tableau de bord", href: "/admin" },
  { icon: ClipboardList, label: "Commandes", href: "/admin/commandes" },
  { icon: Package, label: "Produits", href: "/admin/produits" },
  { icon: Tags, label: "Catégories", href: "/admin/categories" },
  { icon: Store, label: "Boutiques", href: "/admin/boutiques" },
  { icon: Truck, label: "Livreurs", href: "/admin/livreurs" },
  { icon: Users, label: "Clients", href: "/admin/clients" },
  { icon: ShieldAlert, label: "Réclamations", href: "/admin/reclamations" },
  { icon: AlertTriangle, label: "Statistiques", href: "/admin/statistiques" },
  { icon: Settings, label: "Paramètres", href: "/admin/parametres" },
];

export { ShoppingBag };
