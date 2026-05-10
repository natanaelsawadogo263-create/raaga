import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export async function recalculateOrderTotals(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<{ error: string | null }> {
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("total_price_cfa")
    .eq("order_id", orderId);

  if (itemsError) {
    return { error: itemsError.message };
  }

  const subtotal = (items ?? []).reduce((sum, row) => sum + row.total_price_cfa, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("delivery_fee_cfa, discount_cfa")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    return { error: orderError.message };
  }
  if (!order) {
    return { error: "Commande introuvable." };
  }

  const total = Math.max(0, subtotal + order.delivery_fee_cfa - order.discount_cfa);

  const { error: updateError } = await supabase
    .from("orders")
    .update({ subtotal_cfa: subtotal, total_cfa: total })
    .eq("id", orderId);

  return { error: updateError?.message ?? null };
}
