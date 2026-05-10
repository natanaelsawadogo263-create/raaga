import Link from "next/link";

export function AdminPlaceholder({
  title,
  description,
  backHref = "/admin",
}: {
  title: string;
  description?: string;
  backHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-lg font-black text-slate-900 sm:text-xl">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>
      ) : null}
      <Link
        href={backHref}
        className="mt-6 inline-flex rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e66e00]"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
