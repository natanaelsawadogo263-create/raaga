"use client";

import { createContext, useContext, useMemo, useState } from "react";

type AdminUiContextValue = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
};

const AdminUiContext = createContext<AdminUiContextValue | null>(null);

export function AdminUiProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const value = useMemo(() => ({ searchQuery, setSearchQuery }), [searchQuery]);
  return <AdminUiContext.Provider value={value}>{children}</AdminUiContext.Provider>;
}

export function useAdminUi() {
  const ctx = useContext(AdminUiContext);
  if (!ctx) {
    throw new Error("useAdminUi doit être utilisé dans AdminUiProvider");
  }
  return ctx;
}
