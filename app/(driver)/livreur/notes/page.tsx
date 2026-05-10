import { Star } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function LivreurNotesPage() {
  const { supabase, user } = await requireRole(["driver"]);

  const { data: driverProfile } = await supabase
    .from("driver_profiles")
    .select("average_rating")
    .eq("user_id", user.id)
    .maybeSingle();

  const rating = driverProfile?.average_rating ?? null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-amber-700">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
          Note moyenne
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-4xl font-black tabular-nums text-slate-900">
            {rating != null ? Number(rating).toFixed(1) : "—"}
          </p>
          <p className="text-sm font-bold text-slate-500">/ 5</p>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          {rating != null
            ? "Basée sur les retours clients sur vos livraisons."
            : "Vos premières évaluations apparaîtront après vos premières livraisons."}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-slate-900">Conseils pour rester top</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
          <li>Soyez ponctuel : confirmez chaque étape dans l&apos;ordre.</li>
          <li>Communiquez avec le client en cas de retard.</li>
          <li>Vérifiez le contenu du colis à la boutique avant de partir.</li>
          <li>Présentez vos livraisons avec sourire — un détail qui fait la différence.</li>
        </ul>
      </div>
    </div>
  );
}
