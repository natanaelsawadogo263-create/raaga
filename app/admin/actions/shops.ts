"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import type { Database } from "@/lib/supabase/database.types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ShopStatus = Database["public"]["Tables"]["shops"]["Row"]["status"];

const SHOP_STATUSES: ShopStatus[] = ["active", "inactive", "suspended", "pending"];

function parseShopStatus(v: string): ShopStatus {
  return SHOP_STATUSES.includes(v as ShopStatus) ? (v as ShopStatus) : "active";
}

/** Champs ville/quartier/secteur non utilisés dans le formulaire simplifié ; la base exige NOT NULL. */
const PLACEHOLDER_LOCATION = "";

export async function createShopAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!name || !phone || !address) {
    redirect("/admin/boutiques/nouveau?error=champs");
  }

  const { error } = await supabase.from("shops").insert({
    name,
    manager_name: null,
    phone,
    address,
    city: PLACEHOLDER_LOCATION,
    district: PLACEHOLDER_LOCATION,
    sector: PLACEHOLDER_LOCATION,
    description: null,
    status: "active",
    owner_user_id: null,
  });

  if (error) {
    redirect(`/admin/boutiques/nouveau?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/boutiques");
  revalidatePath("/admin/produits/nouveau");
  revalidatePath("/admin/produits");
  redirect("/admin/boutiques");
}

export async function updateShopAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);

  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) {
    redirect("/admin/boutiques?error=id");
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const status = parseShopStatus(String(formData.get("status") ?? "active"));

  if (!name || !phone || !address) {
    redirect(`/admin/boutiques/${id}?error=champs`);
  }

  const { error } = await supabase
    .from("shops")
    .update({
      name,
      phone,
      address,
      status,
      owner_user_id: null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/boutiques/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/boutiques");
  revalidatePath(`/admin/boutiques/${id}`);
  revalidatePath("/admin/produits/nouveau");
  revalidatePath("/admin/produits");
  redirect(`/admin/boutiques/${id}`);
}

export async function deleteShopAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);

  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) {
    redirect("/admin/boutiques?error=id");
  }

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", id);

  if (count && count > 0) {
    redirect(`/admin/boutiques/${id}?error=boutique_produits`);
  }

  const { error } = await supabase.from("shops").delete().eq("id", id);
  if (error) {
    redirect(`/admin/boutiques/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/boutiques");
  revalidatePath("/admin/produits/nouveau");
  revalidatePath("/admin/produits");
  redirect("/admin/boutiques?ok=boutique_supprime");
}
