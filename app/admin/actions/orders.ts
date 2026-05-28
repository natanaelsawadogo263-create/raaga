"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { recalculateOrderTotals } from "@/lib/admin/order-totals";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseIntSafe(v: string, fallback: number) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

type PaymentMethod = Database["public"]["Tables"]["orders"]["Row"]["payment_method"];

/** Toute commande est en paiement à la livraison ; on ne lit plus le formulaire. */
function orderPaymentMethod(): PaymentMethod {
  return "cod";
}

export async function updateOrderCoreAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const order_id = String(formData.get("order_id") ?? "").trim();
  if (!UUID_RE.test(order_id)) {
    redirect("/admin/commandes?error=id");
  }

  const payment_method = orderPaymentMethod();
  const delivery_fee_cfa = Math.max(0, parseIntSafe(String(formData.get("delivery_fee_cfa") ?? "0"), 0));
  const discount_cfa = Math.max(0, parseIntSafe(String(formData.get("discount_cfa") ?? "0"), 0));
  const city = String(formData.get("city") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const sector = String(formData.get("sector") ?? "").trim();
  const delivery_address = String(formData.get("delivery_address") ?? "").trim();

  if (!city || !district || !sector || !delivery_address) {
    redirect(`/admin/commandes/${order_id}?error=adresse`);
  }

  const { error } = await supabase
    .from("orders")
    .update({
      payment_method,
      delivery_fee_cfa,
      discount_cfa,
      city,
      district,
      sector,
      delivery_address,
    })
    .eq("id", order_id);

  if (error) {
    redirect(`/admin/commandes/${order_id}?error=${encodeURIComponent(error.message)}`);
  }

  const { error: totErr } = await recalculateOrderTotals(supabase, order_id);
  if (totErr) {
    redirect(`/admin/commandes/${order_id}?error=${encodeURIComponent(totErr)}`);
  }

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${order_id}`);
  revalidatePath("/mes-commandes");
  redirect(`/admin/commandes/${order_id}?ok=maj`);
}

export async function addOrderItemAdminAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const order_id = String(formData.get("order_id") ?? "").trim();
  const product_id = String(formData.get("product_id") ?? "").trim();
  const quantity = Math.max(1, parseIntSafe(String(formData.get("quantity") ?? "1"), 1));

  if (!UUID_RE.test(order_id) || !UUID_RE.test(product_id)) {
    redirect(`/admin/commandes/${order_id}?error=article`);
  }

  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, name, price_cfa, shop_id")
    .eq("id", product_id)
    .maybeSingle();

  if (pErr || !product) {
    redirect(`/admin/commandes/${order_id}?error=produit`);
  }

  const unit_price_cfa = product.price_cfa;
  const total_price_cfa = quantity * unit_price_cfa;

  const { error } = await supabase.from("order_items").insert({
    order_id,
    product_id,
    product_name: product.name,
    shop_id: product.shop_id,
    quantity,
    unit_price_cfa,
    total_price_cfa,
  });

  if (error) {
    redirect(`/admin/commandes/${order_id}?error=${encodeURIComponent(error.message)}`);
  }

  const { error: totErr } = await recalculateOrderTotals(supabase, order_id);
  if (totErr) {
    redirect(`/admin/commandes/${order_id}?error=${encodeURIComponent(totErr)}`);
  }

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${order_id}`);
  redirect(`/admin/commandes/${order_id}?ok=article`);
}

export async function updateOrderItemAdminAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const id = String(formData.get("id") ?? "").trim();
  const order_id = String(formData.get("order_id") ?? "").trim();
  const quantity = Math.max(1, parseIntSafe(String(formData.get("quantity") ?? "1"), 1));

  if (!UUID_RE.test(id) || !UUID_RE.test(order_id)) {
    redirect("/admin/commandes?error=id");
  }

  const { data: row, error: gErr } = await supabase
    .from("order_items")
    .select("unit_price_cfa")
    .eq("id", id)
    .maybeSingle();

  if (gErr || !row) {
    redirect(`/admin/commandes/${order_id}?error=ligne`);
  }

  const total_price_cfa = quantity * row.unit_price_cfa;

  const { error } = await supabase
    .from("order_items")
    .update({ quantity, total_price_cfa })
    .eq("id", id);

  if (error) {
    redirect(`/admin/commandes/${order_id}?error=${encodeURIComponent(error.message)}`);
  }

  const { error: totErr } = await recalculateOrderTotals(supabase, order_id);
  if (totErr) {
    redirect(`/admin/commandes/${order_id}?error=${encodeURIComponent(totErr)}`);
  }

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${order_id}`);
  redirect(`/admin/commandes/${order_id}?ok=ligne`);
}

export async function removeOrderItemAdminAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const id = String(formData.get("id") ?? "").trim();
  const order_id = String(formData.get("order_id") ?? "").trim();

  if (!UUID_RE.test(id) || !UUID_RE.test(order_id)) {
    redirect("/admin/commandes?error=id");
  }

  const { error } = await supabase.from("order_items").delete().eq("id", id);
  if (error) {
    redirect(`/admin/commandes/${order_id}?error=${encodeURIComponent(error.message)}`);
  }

  const { error: totErr } = await recalculateOrderTotals(supabase, order_id);
  if (totErr) {
    redirect(`/admin/commandes/${order_id}?error=${encodeURIComponent(totErr)}`);
  }

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${order_id}`);
  redirect(`/admin/commandes/${order_id}?ok=ligne_suppr`);
}

export async function deleteOrderAdminAction(formData: FormData) {
  /**
   * `requireRole` garde la porte côté application.
   *
   * Idéalement on supprime avec le client service-role (bypass RLS). En local,
   * `SUPABASE_SERVICE_ROLE_KEY` est souvent absent : on retombe alors sur le
   * client session admin, couvert par la policy RLS `orders: admin delete`.
   *
   * FK : `order_items` CASCADE, `wallet_transactions` / `support_tickets` SET NULL.
   */
  const { supabase: sessionClient } = await requireRole(["admin", "super_admin"]);

  const order_id = String(formData.get("order_id") ?? "").trim();
  if (!UUID_RE.test(order_id)) {
    redirect("/admin/commandes?error=id");
  }

  const confirm = String(formData.get("confirm_text") ?? "").trim();
  if (confirm !== "SUPPRIMER") {
    redirect(`/admin/commandes/${order_id}?error=confirm`);
  }

  let db: SupabaseClient<Database>;
  try {
    db = getSupabaseAdminClient();
  } catch {
    db = sessionClient;
  }

  const { data, error } = await db
    .from("orders")
    .delete()
    .eq("id", order_id)
    .select("id");

  if (error) {
    redirect(`/admin/commandes/${order_id}?error=${encodeURIComponent(error.message)}`);
  }

  if (!data || data.length === 0) {
    const { data: still } = await db.from("orders").select("id").eq("id", order_id).maybeSingle();
    if (still) {
      redirect(
        `/admin/commandes/${order_id}?error=${encodeURIComponent(
          "La commande n'a pas pu être supprimée (vérifiez les droits ou la configuration Supabase).",
        )}`,
      );
    }
    redirect("/admin/commandes?error=order_already_gone");
  }

  revalidatePath("/admin/commandes");
  revalidatePath("/mes-commandes");
  redirect("/admin/commandes?ok=supprimee");
}
