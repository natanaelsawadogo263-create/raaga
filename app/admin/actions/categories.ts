"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { uploadImageToMediaFolder, removeMediaObjectIfInBucket } from "@/lib/admin/media-upload";
import type { Database } from "@/lib/supabase/database.types";
import { slugifyLabel } from "@/lib/slug";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseIntSafe(v: string, fallback: number) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

async function uniqueSlug(
  supabase: SupabaseClient<Database>,
  base: string,
  excludeId?: string,
): Promise<string> {
  let s = base.slice(0, 80) || "categorie";
  for (let i = 0; i < 30; i++) {
    let q = supabase.from("categories").select("id").eq("slug", s);
    if (excludeId) {
      q = q.neq("id", excludeId);
    }
    const { data: row } = await q.maybeSingle();
    if (!row) return s;
    s = `${base}-${i + 2}`.slice(0, 96);
  }
  return `${base}-${Date.now()}`.slice(0, 96);
}

export async function createCategoryAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);

  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sort_order = parseIntSafe(String(formData.get("sort_order") ?? "0"), 0);
  const is_active = formData.get("is_active") === "on";
  const file = formData.get("cover");

  if (!name) {
    redirect("/admin/categories/nouveau?error=champs");
  }

  const baseSlug = slugRaw ? slugifyLabel(slugRaw) : slugifyLabel(name);
  const slug = await uniqueSlug(supabase, baseSlug);

  const folderId = crypto.randomUUID();
  let image_url: string | null = null;

  if (file instanceof File && file.size > 0) {
    const up = await uploadImageToMediaFolder(supabase, `categories/${folderId}`, file, "cover.jpg");
    if ("error" in up) {
      redirect(`/admin/categories/nouveau?error=${encodeURIComponent(up.error)}`);
    }
    image_url = up.publicUrl;
  }

  const { data: inserted, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      description,
      sort_order,
      is_active,
      image_url,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    redirect(`/admin/categories/nouveau?error=${encodeURIComponent(error?.message ?? "insert")}`);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/produits");
  revalidatePath("/admin/produits");
  redirect(`/admin/categories/${inserted.id}?ok=cat_created`);
}

export async function updateCategoryAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);

  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) {
    redirect("/admin/categories?error=id");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sort_order = parseIntSafe(String(formData.get("sort_order") ?? "0"), 0);
  const is_active = formData.get("is_active") === "on";
  const remove_image = formData.get("remove_image") === "on";
  const file = formData.get("cover");

  if (!name) {
    redirect(`/admin/categories/${id}?error=champs`);
  }

  const { data: existing } = await supabase.from("categories").select("image_url").eq("id", id).maybeSingle();

  const baseSlug = slugRaw ? slugifyLabel(slugRaw) : slugifyLabel(name);
  const slug = await uniqueSlug(supabase, baseSlug, id);

  let image_url: string | null | undefined = undefined;

  if (remove_image) {
    await removeMediaObjectIfInBucket(supabase, existing?.image_url ?? null);
    image_url = null;
  }

  if (file instanceof File && file.size > 0) {
    await removeMediaObjectIfInBucket(supabase, existing?.image_url ?? null);
    const up = await uploadImageToMediaFolder(supabase, `categories/${id}`, file, "cover.jpg");
    if ("error" in up) {
      redirect(`/admin/categories/${id}?error=${encodeURIComponent(up.error)}`);
    }
    image_url = up.publicUrl;
  }

  const patch: Database["public"]["Tables"]["categories"]["Update"] = {
    name,
    slug,
    description,
    sort_order,
    is_active,
    ...(image_url !== undefined ? { image_url } : {}),
  };

  const { error } = await supabase.from("categories").update(patch).eq("id", id);

  if (error) {
    redirect(`/admin/categories/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/");
  revalidatePath("/produits");
  revalidatePath("/admin/produits");
  redirect(`/admin/categories/${id}?ok=cat_updated`);
}

export async function deleteCategoryAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) {
    redirect("/admin/categories?error=id");
  }

  const { data: autres } = await supabase.from("categories").select("id").eq("slug", "autres").maybeSingle();
  if (!autres || autres.id === id) {
    redirect(`/admin/categories/${id}?error=refus`);
  }

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    const { error: reErr } = await supabase.from("products").update({ category_id: autres.id }).eq("category_id", id);
    if (reErr) {
      redirect(`/admin/categories/${id}?error=${encodeURIComponent(reErr.message)}`);
    }
  }

  const { data: row } = await supabase.from("categories").select("image_url").eq("id", id).maybeSingle();
  await removeMediaObjectIfInBucket(supabase, row?.image_url ?? null);

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    redirect(`/admin/categories/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/produits");
  revalidatePath("/admin/produits");
  redirect("/admin/categories?ok=cat_supprime");
}
