"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DiscussionSenderRole, OrderDiscussionMessage } from "@/lib/order-discussion";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function resolveSenderRole(profileRole: string | undefined): DiscussionSenderRole | null {
  if (profileRole === "admin" || profileRole === "super_admin") {
    return "admin";
  }
  if (profileRole === "driver") {
    return "driver";
  }
  if (profileRole === "customer") {
    return "customer";
  }
  return null;
}

/** Rafraîchissement des messages (polling côté client). */
export async function refreshOrderDiscussionMessagesAction(
  discussionId: string,
): Promise<OrderDiscussionMessage[]> {
  if (!UUID_RE.test(discussionId)) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user?.id) {
    return [];
  }

  const { data: messages, error } = await supabase
    .from("order_discussion_messages")
    .select("id, body, sender_role, sender_id, created_at")
    .eq("discussion_id", discussionId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return (messages ?? []) as OrderDiscussionMessage[];
}

export async function sendOrderDiscussionMessageAction(formData: FormData) {
  const discussionId = String(formData.get("discussion_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const returnTo = String(formData.get("return_to") ?? "").trim();

  if (!UUID_RE.test(discussionId) || !body || body.length > 4000) {
    throw new Error("Message invalide.");
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) {
    redirect("/connexion");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const sender_role = resolveSenderRole(profile?.role);
  if (!sender_role) {
    throw new Error("Accès refusé.");
  }

  const { data: discussion } = await supabase
    .from("order_discussions")
    .select("id, order_id")
    .eq("id", discussionId)
    .maybeSingle();

  if (!discussion) {
    throw new Error("Discussion introuvable.");
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_id, driver_id")
    .eq("id", discussion.order_id)
    .maybeSingle();

  if (!order) {
    throw new Error("Commande introuvable.");
  }

  if (sender_role === "customer" && order.customer_id !== userId) {
    throw new Error("Accès refusé.");
  }
  if (sender_role === "driver" && order.driver_id !== userId) {
    throw new Error("Accès refusé — commande non assignée.");
  }

  const { error } = await supabase.from("order_discussion_messages").insert({
    discussion_id: discussionId,
    sender_id: userId,
    sender_role,
    body,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/suivi");
  revalidatePath(`/admin/commandes/${order.id}`);
  revalidatePath("/livreur/en-cours");

  if (returnTo.startsWith("/") && !returnTo.startsWith("//") && !returnTo.includes("://")) {
    redirect(returnTo);
  }
  if (sender_role === "driver") {
    redirect("/livreur/en-cours");
  }
  if (sender_role === "admin") {
    redirect(`/admin/commandes/${order.id}`);
  }
  redirect("/suivi");
}
