"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function adminClientOrRedirect(path: string): ReturnType<typeof getSupabaseAdminClient> {
  try {
    return getSupabaseAdminClient();
  } catch {
    redirect(`${path}?error=service_auth`);
  }
}

function parseBool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

export async function createCustomerAction(formData: FormData) {
  await requireRole(["admin", "super_admin"]);

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const sector = String(formData.get("sector") ?? "").trim();

  if (!first_name || !last_name || !phone || !city || !district || !sector || !email) {
    redirect("/admin/clients/nouveau?error=champs");
  }
  if (!email.includes("@")) {
    redirect("/admin/clients/nouveau?error=email");
  }
  if (!password || password.length < 8) {
    redirect("/admin/clients/nouveau?error=motdepasse");
  }

  const admin = adminClientOrRedirect("/admin/clients/nouveau");

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name,
      last_name,
      phone,
      city,
      district,
      sector,
      role: "customer",
    },
  });

  if (error) {
    redirect(`/admin/clients/nouveau?error=${encodeURIComponent(error.message)}`);
  }

  const uid = data.user?.id;
  if (!uid) {
    redirect("/admin/clients/nouveau?error=creation");
  }

  const { error: upErr } = await admin
    .from("user_profiles")
    .update({
      first_name,
      last_name,
      phone,
      city,
      district,
      sector,
      role: "customer",
      is_active: true,
    })
    .eq("id", uid)
    .eq("role", "customer");

  if (upErr) {
    redirect(`/admin/clients/nouveau?error=${encodeURIComponent(upErr.message)}`);
  }

  revalidatePath("/admin/clients");
  redirect(`/admin/clients?ok=client_created`);
}

export async function updateCustomerAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);

  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) {
    redirect("/admin/clients?error=id");
  }

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const sector = String(formData.get("sector") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const original_email = String(formData.get("original_email") ?? "").trim().toLowerCase();
  const newPassword = String(formData.get("new_password") ?? "");
  const is_active = parseBool(formData.get("is_active"));

  if (!first_name || !last_name || !phone || !city || !district || !sector) {
    redirect(`/admin/clients/${id}?error=champs`);
  }
  if (!email || !email.includes("@")) {
    redirect(`/admin/clients/${id}?error=email`);
  }
  if (newPassword.length > 0 && newPassword.length < 8) {
    redirect(`/admin/clients/${id}?error=motdepasse`);
  }

  const { error: pErr } = await supabase
    .from("user_profiles")
    .update({
      first_name,
      last_name,
      phone,
      city,
      district,
      sector,
      is_active,
      role: "customer",
    })
    .eq("id", id)
    .eq("role", "customer");

  if (pErr) {
    redirect(`/admin/clients/${id}?error=${encodeURIComponent(pErr.message)}`);
  }

  const emailChanged = email !== original_email;
  if (emailChanged || newPassword.length > 0) {
    const admin = adminClientOrRedirect(`/admin/clients/${id}`);
    const payload: { email?: string; password?: string } = {};
    if (emailChanged) {
      payload.email = email;
    }
    if (newPassword.length > 0) {
      payload.password = newPassword;
    }
    const { error: aErr } = await admin.auth.admin.updateUserById(id, payload);
    if (aErr) {
      redirect(`/admin/clients/${id}?error=${encodeURIComponent(aErr.message)}`);
    }
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  redirect(`/admin/clients/${id}?ok=client_updated`);
}

export async function deleteCustomerAction(formData: FormData) {
  const { supabase } = await requireRole(["admin", "super_admin"]);

  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) {
    redirect("/admin/clients?error=id");
  }

  const admin = adminClientOrRedirect("/admin/clients");
  const { count, error: cErr } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", id);

  if (cErr) {
    redirect(`/admin/clients?error=${encodeURIComponent(cErr.message)}`);
  }
  if (count && count > 0) {
    redirect("/admin/clients?error=client_commandes");
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    redirect(`/admin/clients?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/clients");
  redirect("/admin/clients?ok=client_deleted");
}
