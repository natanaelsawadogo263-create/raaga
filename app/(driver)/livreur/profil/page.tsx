import Image from "next/image";
import { Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function LivreurProfilPage() {
  const { supabase, user } = await requireRole(["driver"]);

  const [{ data: profile }, { data: driverProfile }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("first_name, last_name, phone, city, district, sector, avatar_url, is_active")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("driver_profiles")
      .select("review_status, is_available, plate_photo_url")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const email = typeof user.email === "string" ? user.email : "";

  const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "Livreur";

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-2xl font-black text-[#FF7A00] ring-2 ring-orange-200/60">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <User className="h-9 w-9" strokeWidth={1.5} aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-black text-slate-900">{fullName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  driverProfile?.review_status === "approved"
                    ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                    : driverProfile?.review_status === "rejected"
                      ? "bg-rose-100 text-rose-800 ring-1 ring-rose-200"
                      : "bg-amber-100 text-amber-800 ring-1 ring-amber-200"
                }`}
              >
                <ShieldCheck className="h-3 w-3" aria-hidden />
                {driverProfile?.review_status === "approved"
                  ? "Approuvé"
                  : driverProfile?.review_status === "rejected"
                    ? "Refusé"
                    : "En attente"}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  driverProfile?.is_available
                    ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                    : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    driverProfile?.is_available ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {driverProfile?.is_available ? "Disponible" : "Hors ligne"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Contact</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2 text-slate-700">
              <Mail className="h-4 w-4 text-[#FF7A00]" aria-hidden />
              <span className="truncate">{email || "—"}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700">
              <Phone className="h-4 w-4 text-[#FF7A00]" aria-hidden />
              <span>{profile?.phone ?? "—"}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700">
              <MapPin className="h-4 w-4 text-[#FF7A00]" aria-hidden />
              <span className="truncate">
                {[profile?.city, profile?.district, profile?.sector].filter(Boolean).join(" · ") ||
                  "—"}
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Photo plaque</p>
          <p className="mt-2 text-xs text-slate-600">
            Votre photo de plaque est enregistrée lors de votre inscription. Pour la modifier,
            contactez l&apos;administration Raaga.
          </p>
          {driverProfile?.plate_photo_url ? (
            <div className="relative mt-3 aspect-video w-full max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <Image
                src={driverProfile.plate_photo_url}
                alt="Photo plaque véhicule"
                fill
                sizes="320px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <p className="mt-2 text-xs font-semibold text-slate-500">Aucune photo enregistrée.</p>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-slate-900">Modifier mes informations</p>
        <p className="mt-1 text-xs text-slate-500">
          La modification du profil livreur (numéro, photo, documents) sera bientôt disponible.
          En attendant, contactez l&apos;administration Raaga pour toute mise à jour.
        </p>
      </section>
    </div>
  );
}
