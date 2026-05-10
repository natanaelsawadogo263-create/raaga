"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Limite les redirections après action (évite open redirect). */
function safeReturnPath(raw: string): string {
  const t = (raw || "").trim() || "/admin/livreurs";
  if (t === "/admin" || t === "/admin/livreurs") {
    return t;
  }
  if (t.startsWith("/admin/livreurs/")) {
    const rest = t.slice("/admin/livreurs/".length);
    if (UUID_RE.test(rest)) {
      return t;
    }
  }
  return "/admin/livreurs";
}

/** Tente de récupérer le client service-role, sans rediriger si absent. */
function tryAdminClient(): ReturnType<typeof getSupabaseAdminClient> | null {
  try {
    return getSupabaseAdminClient();
  } catch {
    return null;
  }
}

/**
 * Approuver / refuser une demande livreur **encore en attente**.
 * Conservée pour compatibilité ; pour changer l'état d'un livreur déjà
 * approuvé/refusé, utilisez `setDriverReviewStatusAction`.
 */
export async function reviewPendingDriverAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const user_id = String(formData.get("user_id") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  const returnPath = safeReturnPath(String(formData.get("return_path") ?? "/admin/livreurs"));

  if (!UUID_RE.test(user_id)) {
    redirect(`${returnPath}?error=id`);
  }
  const nextStatus = decision === "approved" ? "approved" : decision === "rejected" ? "rejected" : null;
  if (!nextStatus) {
    redirect(`${returnPath}?error=id`);
  }

  const { error } = await supabase
    .from("driver_profiles")
    .update({ review_status: nextStatus })
    .eq("user_id", user_id)
    .eq("review_status", "pending");

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/livreurs");
  revalidatePath(`/admin/livreurs/${user_id}`);
  const ok = nextStatus === "approved" ? "driver_approved" : "driver_rejected";
  redirect(`${returnPath}?ok=${ok}`);
}

/**
 * Permet de basculer un livreur entre les statuts pending / approved / rejected
 * quel que soit son état courant (admin keut revenir en arrière).
 */
export async function setDriverReviewStatusAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const user_id = String(formData.get("user_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const returnPath = safeReturnPath(String(formData.get("return_path") ?? "/admin/livreurs"));

  if (!UUID_RE.test(user_id)) {
    redirect(`${returnPath}?error=id`);
  }
  if (status !== "pending" && status !== "approved" && status !== "rejected") {
    redirect(`${returnPath}?error=id`);
  }

  const update: { review_status: typeof status; is_available?: boolean } = { review_status: status };
  if (status !== "approved") {
    update.is_available = false;
  }

  const { error } = await supabase.from("driver_profiles").update(update).eq("user_id", user_id);

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/livreurs");
  revalidatePath(`/admin/livreurs/${user_id}`);

  const ok =
    status === "approved" ? "driver_approved" : status === "rejected" ? "driver_rejected" : "driver_reset";
  redirect(`${returnPath}?ok=${ok}`);
}

export async function setDriverAvailableAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const user_id = String(formData.get("user_id") ?? "").trim();
  const is_available = String(formData.get("is_available") ?? "") === "true";
  const returnPath = safeReturnPath(String(formData.get("return_path") ?? "/admin/livreurs"));

  if (!UUID_RE.test(user_id)) {
    redirect(`${returnPath}?error=id`);
  }

  const { error } = await supabase
    .from("driver_profiles")
    .update({ is_available })
    .eq("user_id", user_id)
    .eq("review_status", "approved");

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/livreurs");
  revalidatePath(`/admin/livreurs/${user_id}`);
  redirect(`${returnPath}?ok=driver_disponibilite`);
}

/** Active / désactive le profil utilisateur lié au livreur (bloque la connexion fonctionnelle). */
export async function setDriverActiveAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const user_id = String(formData.get("user_id") ?? "").trim();
  const is_active = String(formData.get("is_active") ?? "") === "true";
  const returnPath = safeReturnPath(String(formData.get("return_path") ?? "/admin/livreurs"));

  if (!UUID_RE.test(user_id)) {
    redirect(`${returnPath}?error=id`);
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ is_active })
    .eq("id", user_id)
    .eq("role", "driver");

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  if (!is_active) {
    await supabase.from("driver_profiles").update({ is_available: false }).eq("user_id", user_id);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/livreurs");
  revalidatePath(`/admin/livreurs/${user_id}`);
  redirect(`${returnPath}?ok=${is_active ? "driver_reactive" : "driver_desactive"}`);
}

/**
 * Supprime définitivement le compte livreur (auth + profils via cascade).
 * Refuse la suppression s'il a des commandes en cours (driver_id encore lié à
 * une commande non terminée).
 */
export async function deleteDriverAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const user_id = String(formData.get("user_id") ?? "").trim();

  if (!UUID_RE.test(user_id)) {
    redirect("/admin/livreurs?error=id");
  }

  /**
   * Une course en `secret_validated` est considérée comme terminée côté livreur
   * (elle apparaît déjà dans son historique), donc elle ne bloque pas la suppression.
   */
  const { count: activeOrdersCount, error: cErr } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("driver_id", user_id)
    .in("order_status", [
      "accepted_by_driver",
      "picked_up",
      "in_delivery",
      "delivery_declared",
    ]);

  if (cErr) {
    redirect(`/admin/livreurs?error=${encodeURIComponent(cErr.message)}`);
  }
  if (activeOrdersCount && activeOrdersCount > 0) {
    redirect("/admin/livreurs?error=driver_courses_actives");
  }

  /**
   * Chemin idéal : si on a la clé service-role on l'utilise directement
   * (un seul appel SDK). Sinon, on appelle la RPC `admin_delete_user` qui est
   * `SECURITY DEFINER` et supprime `auth.users` malgré tout — en vérifiant
   * en interne que l'appelant est bien admin. Dans les deux cas, la cascade
   * SQL nettoie `user_profiles`, `driver_profiles`, `wallet_transactions`,
   * `notifications`, `support_tickets`, etc.
   */
  const admin = tryAdminClient();
  if (admin) {
    const { error } = await admin.auth.admin.deleteUser(user_id);
    if (error) {
      redirect(`/admin/livreurs?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await supabase.rpc("admin_delete_user", { target_user_id: user_id });
    if (error) {
      redirect(`/admin/livreurs?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/livreurs");
  redirect("/admin/livreurs");
}
