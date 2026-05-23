import { NextResponse } from "next/server";
import type { CartApiLine, CartApiResponse } from "@/app/api/cart/route";
import { pickPrimaryImage } from "@/lib/catalog-products";
import { cartHasHeavyProduct, computeCartDelivery } from "@/lib/heavy-product";
import { tryGetSupabaseServerClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type BodyLine = { product_id?: string; quantity?: number };

export async function POST(req: Request) {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "configuration" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("lines" in body)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const rawLines = (body as { lines: unknown }).lines;
  if (!Array.isArray(rawLines)) {
    return NextResponse.json({ error: "invalid_lines" }, { status: 400 });
  }

  const lines: { product_id: string; quantity: number }[] = [];
  for (const row of rawLines as BodyLine[]) {
    const product_id = String(row?.product_id ?? "");
    const quantity = Number(row?.quantity);
    if (!UUID_RE.test(product_id) || !Number.isFinite(quantity) || quantity <= 0) {
      continue;
    }
    lines.push({ product_id, quantity: Math.min(Math.floor(quantity), 999) });
  }

  if (!lines.length) {
    const empty: CartApiResponse = { items: [], subtotal: 0, deliveryFee: 0, total: 0, guest: true };
    return NextResponse.json(empty);
  }

  const productIds = [...new Set(lines.map((l) => l.product_id))];
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price_cfa, city, stock_quantity, is_heavy, product_images ( image_url, is_primary, sort_order )")
    .in("id", productIds)
    .eq("is_active", true);

  if (error) {
    return NextResponse.json({ error: "fetch" }, { status: 500 });
  }

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const items: CartApiLine[] = [];
  for (const line of lines) {
    const product = productMap.get(line.product_id);
    if (!product) {
      continue;
    }
    const lineTotal = line.quantity * product.price_cfa;
    const imgs = product.product_images as unknown as
      | { image_url: string; is_primary: boolean; sort_order: number }[]
      | null
      | undefined;
    items.push({
      id: `guest:${line.product_id}`,
      product_id: line.product_id,
      quantity: line.quantity,
      name: product.name,
      price_cfa: product.price_cfa,
      city: product.city,
      stock_quantity: product.stock_quantity,
      image_url: pickPrimaryImage(imgs),
      lineTotal,
    });
  }

  const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0);
  const hasHeavyItems = cartHasHeavyProduct(products ?? []);
  const delivery = computeCartDelivery(hasHeavyItems, items.length);
  const total = subtotal + delivery.deliveryFeeCfa;
  const response: CartApiResponse = {
    items,
    subtotal,
    deliveryFee: delivery.deliveryFeeCfa,
    deliveryLabel: delivery.deliveryLabel,
    total,
    guest: true,
  };
  return NextResponse.json(response);
}
