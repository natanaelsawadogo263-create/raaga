import type { AriaRole, ReactNode } from "react";
import Link from "next/link";

export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(ellipse_75%_55%_at_50%_-20%,rgba(249,115,22,0.12),transparent_58%)]"
      />
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  align = "start",
  size = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  /** `center` : titre et texte alignés au centre (pages auth, etc.) */
  align?: "start" | "center";
  /** `auth` : échelle plus douce et description lisible au centre */
  size?: "default" | "auth";
}) {
  const alignClass = align === "center" ? "mx-auto text-center" : "";
  const actionsClass =
    align === "center" ? "mt-6 flex flex-wrap items-center justify-center gap-3" : "mt-6 flex flex-wrap items-center gap-3";

  const titleClass =
    size === "auth"
      ? "mt-2 text-2xl font-black tracking-tight text-foreground sm:text-[1.75rem] sm:leading-snug"
      : "mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl";

  const descriptionClass =
    size === "auth" && align === "center"
      ? "mx-auto mt-3 max-w-[22rem] text-[15px] leading-relaxed text-muted-foreground sm:max-w-md"
      : "mt-3 text-base leading-relaxed text-muted-foreground";

  const headerMb = size === "auth" ? "mb-9 sm:mb-10" : "mb-8";

  return (
    <header className={`${headerMb} w-full max-w-2xl ${alignClass}`}>
      {eyebrow ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
      ) : null}
      <h1 className={titleClass}>{title}</h1>
      {description ? <p className={descriptionClass}>{description}</p> : null}
      {children ? <div className={actionsClass}>{children}</div> : null}
    </header>
  );
}

export function RaCard({
  children,
  className = "",
  padding = "p-5",
  role,
}: {
  children: ReactNode;
  className?: string;
  padding?: string;
  role?: AriaRole;
}) {
  return (
    <div
      role={role}
      className={`rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.04] backdrop-blur-sm ${padding} ${className}`}
    >
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20";

/** Quantité panier / lignes compactes — sans w-full pour éviter un champ qui s’étire sur toute la carte */
export const quantityInputClass =
  "box-border w-[4.25rem] max-w-[4.25rem] shrink-0 rounded-xl border border-border bg-card px-2 py-2 text-center text-sm tabular-nums text-foreground shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

/** Stepper +/- sur une ligne panier (invité ou connecté) */
export const cartQtyStepperWrapClass =
  "inline-flex shrink-0 items-center rounded-xl border border-border/90 bg-card p-0.5 shadow-sm ring-1 ring-black/[0.03]";
export const cartQtyStepperBtnClass =
  "flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-40";

/** Champs formulaires auth : zone tactile confortable, légèrement plus lisible */
export const authInputClass = `${inputClass} min-h-11 text-[15px] transition-shadow focus:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]`;

export const selectClass = inputClass;

export const textareaClass = `${inputClass} min-h-[108px] resize-y leading-relaxed`;

export const btnPrimaryClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-brand-contrast shadow-md shadow-orange-500/25 transition hover:brightness-105 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-55";

export const btnSecondaryClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-brand/40 hover:bg-orange-50/50 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-55";

export const btnDangerOutlineClass =
  "inline-flex min-h-10 items-center justify-center rounded-xl border border-red-200 bg-card px-4 text-xs font-semibold text-red-700 transition hover:bg-red-50 active:scale-[0.99]";

export const btnSmallClass =
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-semibold transition hover:border-brand/35 hover:bg-muted/80 disabled:pointer-events-none disabled:opacity-55";

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className = "",
  align = "start",
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  /** `center` : libellé et aide centrés ; saisie reste alignée à gauche (checkout, etc.) */
  align?: "start" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className={`block text-xs font-semibold text-foreground ${centered ? "text-center" : ""}`}
      >
        {label}
      </label>
      {centered ? <div className="text-left">{children}</div> : children}
      {hint ? (
        <p className={`text-xs text-muted-foreground ${centered ? "text-center" : ""}`}>{hint}</p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <RaCard className="flex flex-col items-stretch gap-4 py-10 sm:items-center sm:text-center" padding="p-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/15 to-amber-500/10 text-2xl font-black text-brand">
        ∅
      </div>
      <div className="max-w-md sm:mx-auto">
        <p className="text-lg font-bold text-foreground">{title}</p>
        {description ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className={`${btnPrimaryClass} sm:w-auto`}>
          {action.label}
        </Link>
      ) : null}
    </RaCard>
  );
}

export function AlertBanner({
  variant,
  title,
  children,
}: {
  variant: "info" | "warning" | "success";
  title?: string;
  children: ReactNode;
}) {
  const styles =
    variant === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : variant === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : "border-border bg-muted/60 text-foreground";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${styles}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}
