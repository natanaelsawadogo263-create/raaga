import { NextResponse } from "next/server";
import { pickPrimaryImage } from "@/lib/catalog-products";
import { cartHasHeavyProduct, computeCartDelivery } from "@/lib/heavy-product";
import { tryGetSupabaseServerClient } from "@/lib/supabase/server";

export type CartApiLine = {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  price_cfa: number;
  city: string;
  /** Stock disponible (plafond quantité panier) */
  stock_quantity: number;
  /** Image principale du produit (storage ou URL distante), sinon null */
  image_url: string | null;
  lineTotal: number;
};

export type CartApiResponse = {
  items: CartApiLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** Message livraison poids lourd (remplace le montant affiché). */
  deliveryLabel?: string | null;
  /** Panier invité : enrichissement côté client via POST /api/cart/preview. */
  guest?: boolean;
};

export async function GET() {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "configuration" }, { status: 503 });
  }

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) {
    const guestBody: CartApiResponse = {
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      guest: true,
    };
    return NextResponse.json(guestBody);
  }

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "customer") {
    const guestBody: CartApiResponse = {
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      guest: true,
    };
    return NextResponse.json(guestBody);
  }

  const { data: cartRows } = await supabase.from("carts").select("id, product_id, quantity").eq("user_id", user.id);
  const cartItems = cartRows ?? [];

  const productIds = cartItems.map((item) => item.product_id);
  const { data: products } = productIds.length
    ? await supabase
        .from("products")
        .select("id, name, price_cfa, city, stock_quantity, is_heavy, product_images ( image_url, is_primary, sort_order )")
        .in("id", productIds)
    : { data: [] };

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const items: CartApiLine[] = cartItems
    .map((item) => {
      const product = productMap.get(item.product_id);
      if (!product) {
        return null;
      }
      const lineTotal = item.quantity * product.price_cfa;
      const imgs = product.product_images as unknown as
        | { image_url: string; is_primary: boolean; sort_order: number }[]
        | null
        | undefined;
      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        name: product.name,
        price_cfa: product.price_cfa,
        city: product.city,
        stock_quantity: product.stock_quantity,
        image_url: pickPrimaryImage(imgs),
        lineTotal,
      };
    })
    .filter((line): line is CartApiLine => line !== null);

  const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0);
  const hasHeavyItems = cartHasHeavyProduct(products ?? []);
  const delivery = computeCartDelivery(hasHeavyItems, items.length);
  const total = subtotal + delivery.deliveryFeeCfa;

  const body: CartApiResponse = {
    items,
    subtotal,
    deliveryFee: delivery.deliveryFeeCfa,
    deliveryLabel: delivery.deliveryLabel,
    total,
  };
  return NextResponse.json(body);
}
