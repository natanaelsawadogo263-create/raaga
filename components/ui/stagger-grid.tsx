import type { ReactNode } from "react";

type StaggerGridProps = {
  children: ReactNode;
  className?: string;
  /** Délai de base entre chaque enfant (ms). */
  staggerMs?: number;
  as?: "div" | "ul";
};

/**
 * Grille avec apparition décalée (CSS uniquement, respecte prefers-reduced-motion).
 */
export function StaggerGrid({ children, className = "", staggerMs = 45, as: Tag = "div" }: StaggerGridProps) {
  const items = Array.isArray(children) ? children : [children];

  const ItemTag = Tag === "ul" ? "li" : "div";
  const itemClass =
    Tag === "ul"
      ? "motion-safe:animate-fade-up motion-safe:opacity-0 motion-safe:[animation-fill-mode:forwards] list-none"
      : "motion-safe:animate-fade-up motion-safe:opacity-0 motion-safe:[animation-fill-mode:forwards]";

  return (
    <Tag className={className}>
      {items.map((child, i) => (
        <ItemTag
          key={i}
          className={itemClass}
          style={{ animationDelay: `${Math.min(i, 15) * staggerMs}ms` }}
        >
          {child}
        </ItemTag>
      ))}
    </Tag>
  );
}
