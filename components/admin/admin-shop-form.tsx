import Link from "next/link";
import { createShopAction, deleteShopAction, updateShopAction } from "@/app/admin/actions/shops";
import type { AdminShopListRow } from "@/lib/admin/data";
import type { Database } from "@/lib/supabase/database.types";

type ShopStatus = Database["public"]["Tables"]["shops"]["Row"]["status"];

const STATUSES_EDIT: { value: ShopStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "En attente" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspendue" },
];

function fieldClass() {
  return "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20";
}

function labelClass() {
  return "block text-xs font-bold text-slate-700";
}

function splitManagerName(raw: string | null | undefined): { first: string; last: string } {
  const m = (raw ?? "").trim();
  if (!m) return { first: "", last: "" };
  const i = m.indexOf(" ");
  if (i === -1) return { first: m, last: "" };
  return { first: m.slice(0, i).trim(), last: m.slice(i + 1).trim() };
}

export function AdminShopForm({
  mode,
  shop,
  flash,
}: {
  mode: "create" | "edit";
  shop?: AdminShopListRow;
  flash?: { error?: string };
}) {
  const isEdit = mode === "edit" && shop;
  const owner = isEdit ? splitManagerName(shop.manager_name) : { first: "", last: "" };

  return (
    <div className="space-y-6">
      {flash?.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{flash.error}</div>
      ) : null}

      <form
        action={isEdit ? updateShopAction : createShopAction}
        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
      >
        {isEdit ? <input type="hidden" name="id" value={shop.id} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="name">
              Nom de la boutique
            </label>
            <input id="name" name="name" required className={fieldClass()} defaultValue={shop?.name ?? ""} />
          </div>

          <div>
            <label className={labelClass()} htmlFor="owner_first_name">
              Prénom du propriétaire
            </label>
            <input
              id="owner_first_name"
              name="owner_first_name"
              required
              className={fieldClass()}
              defaultValue={owner.first}
            />
          </div>
          <div>
            <label className={labelClass()} htmlFor="owner_last_name">
              Nom du propriétaire
            </label>
            <input
              id="owner_last_name"
              name="owner_last_name"
              required
              className={fieldClass()}
              defaultValue={owner.last}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="phone">
              Téléphone
            </label>
            <input id="phone" name="phone" required className={fieldClass()} placeholder="+226 …" defaultValue={shop?.phone ?? ""} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="address">
              Adresse de la boutique
            </label>
            <textarea
              id="address"
              name="address"
              required
              rows={3}
              className={fieldClass()}
              defaultValue={shop?.address ?? ""}
              placeholder="Rue, quartier, point de repère…"
            />
          </div>

          {isEdit ? (
            <div className="sm:col-span-2">
              <label className={labelClass()} htmlFor="status">
                Statut (administration)
              </label>
              <select id="status" name="status" className={fieldClass()} defaultValue={shop.status}>
                {STATUSES_EDIT.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-xl bg-[#FF7A00] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#e66e00]"
          >
            {isEdit ? "Enregistrer" : "Créer la boutique"}
          </button>
          <Link
            href="/admin/boutiques"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>

      {isEdit ? (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-5 shadow-sm">
          <form action={deleteShopAction}>
            <input type="hidden" name="id" value={shop.id} />
            <button
              type="submit"
              className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
            >
              Supprimer la boutique
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
