import type { LucideIcon } from "lucide-react";
import {
  Bike,
  ClipboardList,
  History,
  LayoutGrid,
  Star,
  User,
  Wallet,
} from "lucide-react";

export type LivreurNavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

export const livreurNavItems: LivreurNavItem[] = [
  { icon: LayoutGrid, label: "Tableau de bord", href: "/livreur" },
  { icon: ClipboardList, label: "Tâches disponibles", href: "/livreur/taches" },
  { icon: Bike, label: "Course en cours", href: "/livreur/en-cours" },
  { icon: History, label: "Historique", href: "/livreur/historique" },
  { icon: Wallet, label: "Portefeuille", href: "/livreur/portefeuille" },
  { icon: Star, label: "Mes notes", href: "/livreur/notes" },
  { icon: User, label: "Profil", href: "/livreur/profil" },
];
