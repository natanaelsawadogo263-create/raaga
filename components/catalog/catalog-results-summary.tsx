"use client";

import { useEffect, useState } from "react";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog-query";

type CatalogResultsSummaryProps = {
  totalFiltered: number;
  page: number;
};

export function CatalogResultsSummary({ totalFiltered, page }: CatalogResultsSummaryProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [totalFiltered, page]);

  if (totalFiltered === 0) {
    return null;
  }

  const from = (page - 1) * CATALOG_PAGE_SIZE + 1;
  const to = Math.min(page * CATALOG_PAGE_SIZE, totalFiltered);

  return (
    <p
      className={`mb-4 text-sm text-muted-foreground transition duration-300 motion-safe:animate-fade-in ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="font-bold text-foreground">{totalFiltered}</span> produit
      {totalFiltered > 1 ? "s" : ""}
      {totalFiltered > CATALOG_PAGE_SIZE ? (
        <>
          {" "}
          · affichés <span className="font-semibold text-foreground">{from}</span>–
          <span className="font-semibold text-foreground">{to}</span>
        </>
      ) : null}
    </p>
  );
}
