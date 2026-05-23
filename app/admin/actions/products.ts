"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_PRODUCT_IMAGES } from "@/lib/admin/product-images";
import { uploadImageToMediaFolder } from "@/lib/admin/media-upload";
import { requireRole } from "@/lib/auth-guards";
import type { Database } from "@/lib/supabase/database.types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseIntSafe(v: string, fallback: number) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseOptionalCompareAt(formData: FormData, price_cfa: number): number | null {
  const raw = String(formData.get("compare_at_price_cfa") ?? "").trim();
  if (!raw) {
    return null;
  }
  const n = parseIntSafe(raw, -1);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  if (n <= price_cfa) {
    return null;
  }
  return n;
}

function parseVariantOptions(raw: string): Record<string, string[]> {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const out: Record<string, string[]> = {};

  for (const line of lines) {
    const sep = line.indexOf(":");
    if (sep <= 0) {
      continue;
    }
    const key = line.slice(0, sep).trim();
    const valuesRaw = line.slice(sep + 1).trim();
    if (!key || !valuesRaw) {
      continue;
    }
    const values = valuesRaw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (!values.length) {
      continue;
    }
    const uniqueValues = [...new Set(values)];
    out[key] = uniqueValues;
  }
  return out;
}

type ProductStatus = Database["public"]["Tables"]["products"]["Row"]["status"];

const PRODUCT_STATUSES: ProductStatus[] = [
  "normal",
  "promotion",
  "nouveaute",
  "best_seller",
  "rupture",
];

function parseStatus(v: string): ProductStatus {
  return PRODUCT_STATUSES.includes(v as ProductStatus) ? (v as ProductStatus) : "normal";
}

async function cityFromShop(supabase: SupabaseClient<Database>, shopId: string): Promise<string> {
  const { data } = await supabase.from("shops").select("city").eq("id", shopId).maybeSingle();
  return (data?.city ?? "").trim();
}

async function categoryNameFromId(
  supabase: SupabaseClient<Database>,
  categoryId: string,
): Promise<string> {
  const { data } = await supabase.from("categories").select("name").eq("id", categoryId).maybeSingle();
  return (data?.name ?? "").trim();
}

async function productImageCount(supabase: SupabaseClient<Database>, productId: string): Promise<number> {
  const { count, error } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  if (error) {
    return 0;
  }
  return count ?? 0;
}

async function nextProductImageSortOrder(supabase: SupabaseClient<Database>, productId: string): Promise<number> {
  const { data } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.sort_order ?? -1) + 1;
}

export async function createProductAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);

  const shop_id = String(formData.get("shop_id") ?? "").trim();
  const category_id = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price_cfa = parseIntSafe(String(formData.get("price_cfa") ?? "0"), 0);
  const compare_at_price_cfa = parseOptionalCompareAt(formData, price_cfa);
  const stock_quantity = parseIntSafe(String(formData.get("stock_quantity") ?? "0"), 0);
  const low_stock_threshold = parseIntSafe(String(formData.get("low_stock_threshold") ?? "5"), 5);
  const status = parseStatus(String(formData.get("status") ?? "normal"));
  const is_active = formData.get("is_active") === "on";
  const is_heavy = formData.get("is_heavy") === "on";
  const image_urls_raw = String(formData.get("image_urls") ?? "").trim();
  const variant_options = parseVariantOptions(String(formData.get("variant_options") ?? ""));

  if (!UUID_RE.test(shop_id) || !UUID_RE.test(category_id) || !name || !description) {
    redirect("/admin/produits/nouveau?error=champs");
  }

  if (price_cfa < 0 || stock_quantity < 0 || low_stock_threshold < 0) {
    redirect("/admin/produits/nouveau?error=nombres");
  }

  const city = await cityFromShop(supabase, shop_id);
  const category = await categoryNameFromId(supabase, category_id);

  const { data: inserted, error } = await supabase
    .from("products")
    .insert({
      shop_id,
      category_id,
      name,
      description,
      category,
      city,
      price_cfa,
      compare_at_price_cfa,
      variant_options,
      stock_quantity,
      low_stock_threshold,
      status,
      is_active,
      is_heavy,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    redirect(`/admin/produits/nouveau?error=${encodeURIComponent(error?.message ?? "insert")}`);
  }

  const urlLines = image_urls_raw
    .split(/\r?\n/)
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, MAX_PRODUCT_IMAGES);

  const allFiles = formData
    .getAll("product_images_files")
    .filter((x): x is File => x instanceof File && x.size > 0);
  const files = allFiles.slice(0, Math.max(0, MAX_PRODUCT_IMAGES - urlLines.length));

  const imageRows: { product_id: string; image_url: string; is_primary: boolean; sort_order: number }[] = urlLines.map(
    (image_url, i) => ({
      product_id: inserted.id,
      image_url,
      is_primary: false,
      sort_order: i,
    }),
  );

  let sortBase = imageRows.length;
  for (let i = 0; i < files.length; i++) {
    const up = await uploadImageToMediaFolder(
      supabase,
      `products/${inserted.id}`,
      files[i],
      `upload-${sortBase + i}.jpg`,
    );
    if ("error" in up) {
      redirect(`/admin/produits/nouveau?error=${encodeURIComponent(up.error)}`);
    }
    imageRows.push({
      product_id: inserted.id,
      image_url: up.publicUrl,
      is_primary: false,
      sort_order: sortBase + i,
    });
  }

  if (imageRows.length > 0) {
    imageRows[0]!.is_primary = true;
    const { error: imgErr } = await supabase.from("product_images").insert(imageRows);
    if (imgErr) {
      await supabase.from("products").delete().eq("id", inserted.id);
      redirect(`/admin/produits/nouveau?error=${encodeURIComponent(imgErr.message)}`);
    }
  }

  revalidatePath("/admin/produits");
  revalidatePath("/produits");
  revalidatePath("/promo");
  redirect(`/admin/produits/${inserted.id}?ok=created`);
}

export async function updateProductAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);

  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) {
    redirect("/admin/produits?error=id");
  }

  const shop_id = String(formData.get("shop_id") ?? "").trim();
  const category_id = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price_cfa = parseIntSafe(String(formData.get("price_cfa") ?? "0"), 0);
  const compare_at_price_cfa = parseOptionalCompareAt(formData, price_cfa);
  const stock_quantity = parseIntSafe(String(formData.get("stock_quantity") ?? "0"), 0);
  const low_stock_threshold = parseIntSafe(String(formData.get("low_stock_threshold") ?? "5"), 5);
  const status = parseStatus(String(formData.get("status") ?? "normal"));
  const is_active = formData.get("is_active") === "on";
  const is_heavy = formData.get("is_heavy") === "on";
  const variant_options = parseVariantOptions(String(formData.get("variant_options") ?? ""));

  if (!UUID_RE.test(shop_id) || !UUID_RE.test(category_id) || !name || !description) {
    redirect(`/admin/produits/${id}?error=champs`);
  }

  if (price_cfa < 0 || stock_quantity < 0 || low_stock_threshold < 0) {
    redirect(`/admin/produits/${id}?error=nombres`);
  }

  const city = await cityFromShop(supabase, shop_id);
  const category = await categoryNameFromId(supabase, category_id);

  const { error } = await supabase
    .from("products")
    .update({
      shop_id,
      category_id,
      name,
      description,
      category,
      city,
      price_cfa,
      compare_at_price_cfa,
      variant_options,
      stock_quantity,
      low_stock_threshold,
      status,
      is_active,
      is_heavy,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/produits/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/produits");
  revalidatePath(`/admin/produits/${id}`);
  revalidatePath("/produits");
  revalidatePath(`/produits/${id}`);
  revalidatePath("/promo");
  redirect(`/admin/produits/${id}?ok=updated`);
}

export async function deleteProductAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) {
    redirect("/admin/produits?error=id");
  }

  const { count, error: cErr } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);

  if (cErr) {
    redirect(`/admin/produits/${id}?error=${encodeURIComponent(cErr.message)}`);
  }

  if (count && count > 0) {
    const { error } = await supabase.from("products").update({ is_active: false, status: "rupture" }).eq("id", id);
    if (error) {
      redirect(`/admin/produits/${id}?error=${encodeURIComponent(error.message)}`);
    }
    revalidatePath("/admin/produits");
    revalidatePath("/produits");
    redirect(`/admin/produits/${id}?ok=desactive`);
  }

  const { error: delImg } = await supabase.from("product_images").delete().eq("product_id", id);
  if (delImg) {
    redirect(`/admin/produits/${id}?error=${encodeURIComponent(delImg.message)}`);
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    redirect(`/admin/produits/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/produits");
  revalidatePath("/produits");
  redirect("/admin/produits?ok=supprime");
}

export async function addProductImageAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const product_id = String(formData.get("product_id") ?? "").trim();
  const image_url = String(formData.get("image_url") ?? "").trim();
  const is_primary = String(formData.get("is_primary") ?? "") === "on";

  if (!UUID_RE.test(product_id) || !image_url) {
    redirect(`/admin/produits/${product_id}?error=image`);
  }

  const existing = await productImageCount(supabase, product_id);
  if (existing >= MAX_PRODUCT_IMAGES) {
    redirect(`/admin/produits/${product_id}?error=${encodeURIComponent(`Maximum ${MAX_PRODUCT_IMAGES} photos par produit.`)}`);
  }

  if (is_primary) {
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", product_id);
  }

  const sort_order = await nextProductImageSortOrder(supabase, product_id);

  const { error } = await supabase.from("product_images").insert({
    product_id,
    image_url,
    is_primary,
    sort_order,
  });

  if (error) {
    redirect(`/admin/produits/${product_id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/produits/${product_id}`);
  revalidatePath("/produits");
  revalidatePath(`/produits/${product_id}`);
  redirect(`/admin/produits/${product_id}?ok=image`);
}

export async function addProductImageFilesAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const product_id = String(formData.get("product_id") ?? "").trim();
  const set_primary = formData.get("set_primary") === "on";

  if (!UUID_RE.test(product_id)) {
    redirect("/admin/produits?error=id");
  }

  const files = formData.getAll("files").filter((x): x is File => x instanceof File && x.size > 0);
  if (files.length === 0) {
    redirect(`/admin/produits/${product_id}?error=image`);
  }

  const existing = await productImageCount(supabase, product_id);
  if (existing >= MAX_PRODUCT_IMAGES) {
    redirect(`/admin/produits/${product_id}?error=${encodeURIComponent(`Maximum ${MAX_PRODUCT_IMAGES} photos par produit.`)}`);
  }

  const remaining = MAX_PRODUCT_IMAGES - existing;
  const cappedFiles = files.slice(0, remaining);
  if (cappedFiles.length === 0) {
    redirect(`/admin/produits/${product_id}?error=image`);
  }

  let sortOrder = await nextProductImageSortOrder(supabase, product_id);

  for (let i = 0; i < cappedFiles.length; i++) {
    const up = await uploadImageToMediaFolder(
      supabase,
      `products/${product_id}`,
      cappedFiles[i],
      `up-${Date.now()}-${i}.jpg`,
    );
    if ("error" in up) {
      redirect(`/admin/produits/${product_id}?error=${encodeURIComponent(up.error)}`);
    }

    const isFirstNew = i === 0;
    const is_primary =
      (existing === 0 && isFirstNew) || (set_primary && isFirstNew && existing > 0);

    if (is_primary) {
      await supabase.from("product_images").update({ is_primary: false }).eq("product_id", product_id);
    }

    const { error } = await supabase.from("product_images").insert({
      product_id,
      image_url: up.publicUrl,
      is_primary,
      sort_order: sortOrder++,
    });

    if (error) {
      redirect(`/admin/produits/${product_id}?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath(`/admin/produits/${product_id}`);
  revalidatePath("/produits");
  revalidatePath(`/produits/${product_id}`);
  redirect(`/admin/produits/${product_id}?ok=image`);
}

export async function deleteProductImageAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const id = String(formData.get("id") ?? "").trim();
  const product_id = String(formData.get("product_id") ?? "").trim();

  if (!UUID_RE.test(id) || !UUID_RE.test(product_id)) {
    redirect("/admin/produits?error=id");
  }

  const { error } = await supabase.from("product_images").delete().eq("id", id);
  if (error) {
    redirect(`/admin/produits/${product_id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/produits/${product_id}`);
  revalidatePath("/produits");
  revalidatePath(`/produits/${product_id}`);
  redirect(`/admin/produits/${product_id}?ok=image_del`);
}

export async function setPrimaryProductImageAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const id = String(formData.get("id") ?? "").trim();
  const product_id = String(formData.get("product_id") ?? "").trim();

  if (!UUID_RE.test(id) || !UUID_RE.test(product_id)) {
    redirect("/admin/produits?error=id");
  }

  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", product_id);
  const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", id);

  if (error) {
    redirect(`/admin/produits/${product_id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/produits/${product_id}`);
  revalidatePath("/produits");
  revalidatePath(`/produits/${product_id}`);
  redirect(`/admin/produits/${product_id}?ok=image_primary`);
}
