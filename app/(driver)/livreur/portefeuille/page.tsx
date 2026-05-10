import { Clock, Wallet } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";
import { formatCFA } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function LivreurPortefeuillePage() {
  const { supabase, user } = await requireRole(["driver"]);

  const { data: driverProfile } = await supabase
    .from("driver_profiles")
    .select("wallet_balance_cfa, wallet_pending_cfa")
    .eq("user_id", user.id)
    .maybeSingle();

  const available = driverProfile?.wallet_balance_cfa ?? 0;
  const pending = driverProfile?.wallet_pending_cfa ?? 0;
  const total = available + pending;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <Wallet className="h-4 w-4 text-slate-700" aria-hidden />
            Total
          </div>
          <p className="mt-2 text-2xl font-black tabular-nums text-slate-900">
            {formatCFA(total)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Tous gains confondus</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
            <Wallet className="h-4 w-4" aria-hidden />
            Disponibles
          </div>
          <p className="mt-2 text-2xl font-black tabular-nums text-emerald-700">
            {formatCFA(available)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700/80">Retrait possible</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-amber-700">
            <Clock className="h-4 w-4" aria-hidden />
            En attente
          </div>
          <p className="mt-2 text-2xl font-black tabular-nums text-amber-800">
            {formatCFA(pending)}
          </p>
          <p className="mt-1 text-[11px] text-amber-700/80">
            Sur courses non clôturées par le client
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-slate-900">Demande de retrait</p>
        <p className="mt-1 text-xs text-slate-500">
          Le retrait des gains sera bientôt disponible directement depuis votre espace livreur.
          En attendant, contactez l&apos;administration Raaga pour effectuer un retrait.
        </p>
        <button
          type="button"
          disabled
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#FF7A00]/60 px-4 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed"
        >
          Demander un retrait (bientôt)
        </button>
      </div>
    </div>
  );
}
