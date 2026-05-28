import Link from "next/link";
import { AlertTriangle, Check } from "lucide-react";
import {
  addOrderItemAdminAction,
  updateOrderCoreAction,
  updateOrderItemAdminAction,
} from "@/app/admin/actions/orders";
import { AdminOrderDeleteForm } from "@/components/admin/admin-order-delete-form";
import { AdminOrderItemRemoveForm } from "@/components/admin/admin-order-item-remove-form";
import type { AdminOrderDetail, AdminProductPickerItem } from "@/lib/admin/data";
import { formatCFA, formatOrderDate } from "@/lib/admin/format";
import { orderStatusLabel, paymentMethodLabel } from "@/lib/admin/order-labels";
import { adminCrudIconBtn } from "@/components/admin/admin-crud-icon-classes";
import { OrderDiscussionPanel } from "@/components/order-discussion-panel";
import { HEAVY_DELIVERY_MESSAGE } from "@/lib/heavy-product";
import type { OrderDiscussionData } from "@/lib/order-discussion";

function fieldClass() {
  return "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20";
}

function labelClass() {
  return "block text-xs font-bold text-slate-700";
}

function statusBadgeClass(status: AdminOrderDetail["order"]["order_status"]) {
  if (status === "delivered" || status === "confirmed_by_customer") return "bg-emerald-100 text-emerald-800";
  if (status === "cancelled") return "bg-rose-100 text-rose-800";
  if (status === "problematic") return "bg-amber-100 text-amber-800";
  return "bg-sky-100 text-sky-800";
}

export function AdminOrderManage({
  detail,
  products,
  flash,
  discussion,
  adminUserId,
}: {
  detail: AdminOrderDetail;
  products: AdminProductPickerItem[];
  flash?: { ok?: string; error?: string };
  discussion?: OrderDiscussionData | null;
  adminUserId: string;
}) {
  const { order, customer, driver, items } = detail;

  return (
    <div className="space-y-6">
      {flash?.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{flash.error}</div>
      ) : null}
      {flash?.ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{flash.ok}</div>
      ) : null}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <p className="text-xs text-slate-500">Créée le {formatOrderDate(order.created_at)}</p>
        <p className="mt-1 font-mono text-lg font-black tabular-nums text-[#FF7A00]">{order.reference}</p>
        <p className="mt-0.5 font-mono text-[10px] text-slate-400 break-all">ID technique · {order.id}</p>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold text-slate-500">Client</p>
            <p className="font-semibold text-slate-900">
              {customer ? `${customer.first_name} ${customer.last_name}` : "—"}
            </p>
            {customer ? (
              <p className="text-xs text-slate-600">
                {customer.phone} · {customer.city}
              </p>
            ) : null}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Livreur</p>
            <p className="font-semibold text-slate-900">
              {driver ? `${driver.first_name} ${driver.last_name}` : "En attente de livreur"}
            </p>
            {driver ? <p className="text-xs text-slate-600">{driver.phone}</p> : null}
          </div>
        </div>
        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold text-slate-500">Statut</p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-1 text-[11px] font-bold ${statusBadgeClass(order.order_status)}`}
            >
              {orderStatusLabel(order.order_status)}
            </span>
            <p className="mt-1 text-[11px] text-slate-500">
              Mis à jour automatiquement selon les actions du livreur et du client.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Délai estimé (minutes)</p>
            <p className="font-semibold text-slate-900">
              {order.estimated_delivery_min != null && order.estimated_delivery_max != null
                ? `${order.estimated_delivery_min} – ${order.estimated_delivery_max}`
                : "—"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-bold text-slate-500">Code secret validé par le livreur</p>
            <p className="font-semibold text-slate-900">{order.delivery_secret_validated ? "Oui" : "Non"}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm">
          <div>
            <span className="text-slate-500">Sous-total</span>
            <p className="font-bold">{formatCFA(order.subtotal_cfa)}</p>
          </div>
          <div>
            <span className="text-slate-500">Livraison</span>
            <p className="font-bold">{formatCFA(order.delivery_fee_cfa)}</p>
          </div>
          <div>
            <span className="text-slate-500">Remise</span>
            <p className="font-bold">{formatCFA(order.discount_cfa)}</p>
          </div>
          <div>
            <span className="text-slate-500">Total</span>
            <p className="text-lg font-black text-[#FF7A00]">{formatCFA(order.total_cfa)}</p>
          </div>
        </div>
      </div>

      <form action={updateOrderCoreAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-bold text-slate-900">Montants & adresse</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Le statut de la commande, l&apos;assignation du livreur et la validation du code à 4 chiffres sont gérés dans
          l&apos;application livreur et côté client. Vous pouvez ici ajuster frais, remise et adresse pour le support.
        </p>
        <input type="hidden" name="order_id" value={order.id} />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className={labelClass()}>Paiement</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{paymentMethodLabel(order.payment_method)}</p>
            <p className="mt-1 text-[11px] text-slate-500">Toutes les commandes sont réglées en espèces à la livraison.</p>
          </div>
          <div>
            <label className={labelClass()} htmlFor="delivery_fee_cfa">
              Frais livraison (FCFA)
            </label>
            <input
              id="delivery_fee_cfa"
              name="delivery_fee_cfa"
              type="number"
              min={0}
              className={fieldClass()}
              defaultValue={order.delivery_fee_cfa}
            />
          </div>
          <div>
            <label className={labelClass()} htmlFor="discount_cfa">
              Remise (FCFA)
            </label>
            <input
              id="discount_cfa"
              name="discount_cfa"
              type="number"
              min={0}
              className={fieldClass()}
              defaultValue={order.discount_cfa}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="delivery_address">
              Adresse de livraison
            </label>
            <input
              id="delivery_address"
              name="delivery_address"
              required
              className={fieldClass()}
              defaultValue={order.delivery_address}
            />
          </div>
          <div>
            <label className={labelClass()} htmlFor="city">
              Ville
            </label>
            <input id="city" name="city" required className={fieldClass()} defaultValue={order.city} />
          </div>
          <div>
            <label className={labelClass()} htmlFor="district">
              District
            </label>
            <input id="district" name="district" required className={fieldClass()} defaultValue={order.district} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass()} htmlFor="sector">
              Secteur
            </label>
            <input id="sector" name="sector" required className={fieldClass()} defaultValue={order.sector} />
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p>
            <span className="font-bold">Code remise client → livreur</span> :{" "}
            <span className="font-mono font-bold text-slate-900">{order.delivery_secret_code}</span>
            <span className="text-slate-500"> (4 chiffres)</span>
          </p>
        </div>

        <button
          type="submit"
          className="mt-6 rounded-xl bg-[#FF7A00] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#e66e00]"
        >
          Enregistrer
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-bold text-slate-900">Articles</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-2">Produit</th>
                <th>Boutique</th>
                <th>Prix unit.</th>
                <th>Qté</th>
                <th>Total</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="py-2 font-semibold text-slate-900">{it.product_name ?? it.product_id}</td>
                  <td>{it.shop_name ?? "—"}</td>
                  <td>{formatCFA(it.unit_price_cfa)}</td>
                  <td>
                    <form action={updateOrderItemAdminAction} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={it.id} />
                      <input type="hidden" name="order_id" value={order.id} />
                      <input
                        name="quantity"
                        type="number"
                        min={1}
                        defaultValue={it.quantity}
                        className="w-16 rounded-lg border border-slate-200 px-2 py-1"
                      />
                      <button type="submit" className={adminCrudIconBtn} aria-label="Mettre à jour la quantité">
                        <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </button>
                    </form>
                  </td>
                  <td className="font-bold">{formatCFA(it.total_price_cfa)}</td>
                  <td className="text-right">
                    <AdminOrderItemRemoveForm
                      itemId={it.id}
                      orderId={order.id}
                      productLabel={it.product_name ?? it.product_id ?? "Article"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={addOrderItemAdminAction} className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
          <input type="hidden" name="order_id" value={order.id} />
          <div className="min-w-0 flex-1">
            <label className={labelClass()} htmlFor="product_id">
              Ajouter un produit
            </label>
            <select id="product_id" name="product_id" required className={fieldClass()}>
              <option value="">— Choisir —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCFA(p.price_cfa)} ({p.shop_name ?? "boutique"}) · stock {p.stock_quantity}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className={labelClass()} htmlFor="quantity_new">
              Qté
            </label>
            <input
              id="quantity_new"
              name="quantity"
              type="number"
              min={1}
              defaultValue={1}
              className={fieldClass()}
            />
          </div>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
            Ajouter
          </button>
        </form>
      </div>

      {order.has_heavy_items ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-bold">Commande poids lourd</p>
          <p className="mt-1 text-xs leading-relaxed">{HEAVY_DELIVERY_MESSAGE}</p>
        </div>
      ) : null}

      {discussion ? (
        <OrderDiscussionPanel
          discussionId={discussion.discussionId}
          messages={discussion.messages}
          viewerUserId={adminUserId}
          returnTo={`/admin/commandes/${order.id}`}
          variant="admin"
          title={
            order.has_heavy_items
              ? "Discussion avec le client"
              : order.driver_id
                ? "Discussion client ↔ livreur"
                : "Discussion commande"
          }
          hint={
            order.has_heavy_items
              ? "Répondez au client pour la livraison ou le retrait spécial."
              : "Suivi des échanges entre le client et le livreur assigné. Vous pouvez intervenir si besoin."
          }
          placeholder="Message à destination du client ou en complément du livreur…"
        />
      ) : (
        <p className="text-sm text-slate-600">
          Discussion indisponible — appliquez la migration Supabase des discussions commande.
        </p>
      )}

      <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 ring-1 ring-rose-200">
            <AlertTriangle className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-rose-900">Zone dangereuse</h2>
            <p className="mt-1 text-xs text-rose-800/90">
              Suppression irréversible de la commande{" "}
              <span className="font-mono font-bold" translate="no">
                #{order.reference}
              </span>
              . Toutes ses lignes seront effacées en cascade. Cliquez sur le bouton ci-dessous
              uniquement si vous en êtes sûr.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <AdminOrderDeleteForm orderId={order.id} />
        </div>
      </div>

      <Link href="/admin/commandes" className="inline-block text-sm font-bold text-[#FF7A00] hover:underline">
        ← Retour aux commandes
      </Link>
    </div>
  );
}
