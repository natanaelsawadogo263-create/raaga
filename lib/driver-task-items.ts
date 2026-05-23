import type { SupabaseClient } from "@supabase/supabase-js";
import type { DriverTaskPackageLine } from "@/components/livreur/driver-task-package-images";
import { pickPrimaryImage, type ProductImageRow } from "@/lib/catalog-products";
import { resolveProductImageUrl } from "@/lib/product-image-url";
import type { Database } from "@/lib/supabase/database.types";

function pickOne<T>(raw: T | T[] | null): T | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

export type DriverTaskItemRow = {
  order_id: string;
  quantity: number;
  product_id: string;
  products: { name: string } | { name: string }[] | null;
  shops: { name: string; city: string } | { name: string; city: string }[] | null;
};

/** Images produit par product_id (requête directe, fiable pour le rôle livreur). */
async function fetchPrimaryImageByProductId(
  supabase: SupabaseClient<Database>,
  productIds: string[],
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  if (!productIds.length) {
    return map;
  }

  const { data: imgRows, error } = await supabase
    .from("product_images")
    .select("product_id, image_url, is_primary, sort_order")
    .in("product_id", productIds);

  if (error) {
    console.error("[driver-task] lecture product_images:", error.message);
    return map;
  }

  const grouped = new Map<string, ProductImageRow[]>();
  for (const row of imgRows ?? []) {
    const arr = grouped.get(row.product_id) ?? [];
    arr.push({
      image_url: row.image_url,
      is_primary: row.is_primary,
      sort_order: row.sort_order,
    });
    grouped.set(row.product_id, arr);
  }

  for (const pid of productIds) {
    const raw = pickPrimaryImage(grouped.get(pid) ?? null);
    map.set(pid, resolveProductImageUrl(raw));
  }

  return map;
}

export async function fetchDriverTaskItemsByOrderIds(
  supabase: SupabaseClient<Database>,
  orderIds: string[],
): Promise<{
  itemsByOrder: Map<string, DriverTaskItemRow[]>;
  packageLinesByOrder: Map<string, DriverTaskPackageLine[]>;
}> {
  const itemsByOrder = new Map<string, DriverTaskItemRow[]>();
  const packageLinesByOrder = new Map<string, DriverTaskPackageLine[]>();

  if (!orderIds.length) {
    return { itemsByOrder, packageLinesByOrder };
  }

  const { data: items, error } = await supabase
    .from("order_items")
    .select("order_id, quantity, product_id, products ( name ), shops ( name, city )")
    .in("order_id", orderIds);

  if (error) {
    console.error("[driver-task] lecture order_items:", error.message);
    return { itemsByOrder, packageLinesByOrder };
  }

  const rows = (items ?? []) as unknown as DriverTaskItemRow[];
  const productIds = [...new Set(rows.map((r) => r.product_id))];
  const imageByProduct = await fetchPrimaryImageByProductId(supabase, productIds);

  for (const row of rows) {
    const itemList = itemsByOrder.get(row.order_id) ?? [];
    itemList.push(row);
    itemsByOrder.set(row.order_id, itemList);

    const p = pickOne(row.products);
    const lines = packageLinesByOrder.get(row.order_id) ?? [];
    lines.push({
      key: `${row.order_id}-${row.product_id}`,
      name: p?.name?.trim() || "Article",
      quantity: row.quantity,
      imageUrl: imageByProduct.get(row.product_id) ?? null,
    });
    packageLinesByOrder.set(row.order_id, lines);
  }

  return { itemsByOrder, packageLinesByOrder };
}
