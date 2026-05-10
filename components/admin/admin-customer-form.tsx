"use client";

import Link from "next/link";
import { createCustomerAction, deleteCustomerAction, updateCustomerAction } from "@/app/admin/actions/customers";
import type { AdminCustomerRow } from "@/lib/admin/data";

function fieldClass() {
  return "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20";
}

function labelClass() {
  return "block text-xs font-bold text-slate-700";
}

export function AdminCustomerForm({
  mode,
  customer,
  flash,
}: {
  mode: "create" | "edit";
  customer?: AdminCustomerRow;
  flash?: { ok?: string; error?: string };
}) {
  const isEdit = mode === "edit" && customer;

  return (
    <div className="space-y-6">
      {flash?.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{flash.error}</div>
      ) : null}
      {flash?.ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{flash.ok}</div>
      ) : null}

      <form
        action={isEdit ? updateCustomerAction : createCustomerAction}
        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
      >
        {isEdit ? (
          <>
            <input type="hidden" name="id" value={customer.id} />
            <input type="hidden" name="original_email" value={customer.email ?? ""} />
          </>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass()}
              defaultValue={customer?.email ?? ""}
            />
          </div>

          {!isEdit ? (
            <div className="sm:col-span-2">
              <label className={labelClass()} htmlFor="password">
                Mot de passe (min. 8 caractères)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={fieldClass()}
              />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label className={labelClass()} htmlFor="new_password">
                Nouveau mot de passe (laisser vide pour ne pas changer)
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                className={fieldClass()}
              />
            </div>
          )}

          <div>
            <label className={labelClass()} htmlFor="first_name">
              Prénom
            </label>
            <input id="first_name" name="first_name" required className={fieldClass()} defaultValue={customer?.first_name ?? ""} />
          </div>
          <div>
            <label className={labelClass()} htmlFor="last_name">
              Nom
            </label>
            <input id="last_name" name="last_name" required className={fieldClass()} defaultValue={customer?.last_name ?? ""} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="phone">
              Téléphone
            </label>
            <input id="phone" name="phone" required className={fieldClass()} defaultValue={customer?.phone ?? ""} />
          </div>

          <div>
            <label className={labelClass()} htmlFor="city">
              Ville
            </label>
            <input id="city" name="city" required className={fieldClass()} defaultValue={customer?.city ?? ""} />
          </div>
          <div>
            <label className={labelClass()} htmlFor="district">
              Quartier
            </label>
            <input id="district" name="district" required className={fieldClass()} defaultValue={customer?.district ?? ""} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="sector">
              Secteur
            </label>
            <input id="sector" name="sector" required className={fieldClass()} defaultValue={customer?.sector ?? ""} />
          </div>

          {isEdit ? (
            <div className="flex items-end gap-2 pb-1 sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={customer.is_active}
                  className="h-4 w-4 rounded border-slate-300 text-[#FF7A00] focus:ring-[#FF7A00]"
                />
                Compte actif
              </label>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-xl bg-[#FF7A00] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#e66e00]"
          >
            {isEdit ? "Enregistrer" : "Créer le client"}
          </button>
          <Link
            href="/admin/clients"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>

      {isEdit ? (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-5 shadow-sm">
          <form
            action={deleteCustomerAction}
            onSubmit={(e) => {
              if (
                !confirm(
                  `Supprimer définitivement « ${customer.first_name} ${customer.last_name} » ?\n\nImpossible si le client a des commandes.`,
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={customer.id} />
            <button
              type="submit"
              className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
            >
              Supprimer le compte
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
