"use client";

import Link from "next/link";
import { Eye, Power, RotateCcw, ShieldCheck, ShieldX, Trash2 } from "lucide-react";
import {
  deleteDriverAction,
  setDriverActiveAction,
  setDriverReviewStatusAction,
} from "@/app/admin/actions/drivers";

type ReviewStatus = "pending" | "approved" | "rejected";

type Props = {
  userId: string;
  name: string;
  reviewStatus: ReviewStatus;
  profileIsActive: boolean;
  returnPath?: string;
  /** Cache le bouton "Voir fiche" (utile sur la page détail elle-même). */
  hideView?: boolean;
};

const baseBtn =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40";

const styleView = `${baseBtn} border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-200`;
const styleApprove = `${baseBtn} border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-emerald-200`;
const styleReject = `${baseBtn} border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 focus-visible:ring-rose-200`;
const styleReset = `${baseBtn} border-amber-200 text-amber-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 focus-visible:ring-amber-200`;
const stylePower = `${baseBtn} border-sky-200 text-sky-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 focus-visible:ring-sky-200`;
const styleDelete = `${baseBtn} border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 focus-visible:ring-rose-200`;

export function AdminDriverRowActions({
  userId,
  name,
  reviewStatus,
  profileIsActive,
  returnPath = "/admin/livreurs",
  hideView = false,
}: Props) {
  const canApprove = reviewStatus !== "approved";
  const canReject = reviewStatus !== "rejected";
  const canReset = reviewStatus !== "pending";

  return (
    <div className="flex shrink-0 flex-nowrap items-center justify-end gap-1.5">
      {hideView ? null : (
        <Link
          href={`/admin/livreurs/${userId}`}
          className={styleView}
          title="Voir la fiche"
          aria-label={`Voir la fiche de ${name}`}
        >
          <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
      )}

      {canApprove ? (
        <form action={setDriverReviewStatusAction}>
          <input type="hidden" name="user_id" value={userId} />
          <input type="hidden" name="status" value="approved" />
          <input type="hidden" name="return_path" value={returnPath} />
          <button
            type="submit"
            className={styleApprove}
            title="Approuver"
            aria-label={`Approuver ${name}`}
          >
            <ShieldCheck className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </form>
      ) : null}

      {canReject ? (
        <form action={setDriverReviewStatusAction}>
          <input type="hidden" name="user_id" value={userId} />
          <input type="hidden" name="status" value="rejected" />
          <input type="hidden" name="return_path" value={returnPath} />
          <button
            type="submit"
            className={styleReject}
            title="Refuser / suspendre"
            aria-label={`Refuser ${name}`}
          >
            <ShieldX className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </form>
      ) : null}

      {canReset ? (
        <form action={setDriverReviewStatusAction}>
          <input type="hidden" name="user_id" value={userId} />
          <input type="hidden" name="status" value="pending" />
          <input type="hidden" name="return_path" value={returnPath} />
          <button
            type="submit"
            className={styleReset}
            title="Remettre en attente"
            aria-label={`Remettre ${name} en attente`}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </form>
      ) : null}

      <form action={setDriverActiveAction}>
        <input type="hidden" name="user_id" value={userId} />
        <input type="hidden" name="is_active" value={profileIsActive ? "false" : "true"} />
        <input type="hidden" name="return_path" value={returnPath} />
        <button
          type="submit"
          className={stylePower}
          title={profileIsActive ? "Désactiver le compte" : "Réactiver le compte"}
          aria-label={profileIsActive ? `Désactiver ${name}` : `Réactiver ${name}`}
        >
          <Power
            className={`h-4 w-4 ${profileIsActive ? "" : "text-slate-400"}`}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </form>

      <form action={deleteDriverAction}>
        <input type="hidden" name="user_id" value={userId} />
        <button
          type="submit"
          className={styleDelete}
          title="Supprimer définitivement"
          aria-label={`Supprimer ${name}`}
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </form>
    </div>
  );
}
