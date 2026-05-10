import Link from "next/link";
import type { ReactNode } from "react";

type HomeSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
  extra?: ReactNode;
};

export function HomeSectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  extra,
}: HomeSectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${isCenter ? "items-center text-center sm:flex-col sm:items-center" : ""}`}
    >
      <div className={isCenter ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      <div className={`flex shrink-0 flex-wrap items-center gap-2 ${isCenter ? "justify-center" : ""}`}>
        {extra}
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-brand-contrast shadow-md shadow-orange-500/25 transition hover:brightness-105"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
