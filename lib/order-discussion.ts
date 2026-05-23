import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type DiscussionSenderRole = "customer" | "admin" | "driver";

export type OrderDiscussionMessage = {
  id: string;
  body: string;
  sender_role: DiscussionSenderRole;
  sender_id: string;
  created_at: string;
};

export function formatMessageSenderLabel(msg: OrderDiscussionMessage, viewerUserId: string): string {
  if (msg.sender_id === viewerUserId) {
    return "Vous";
  }
  if (msg.sender_role === "admin") {
    return "Raaga";
  }
  if (msg.sender_role === "driver") {
    return "Livreur";
  }
  return "Client";
}

export type OrderDiscussionData = {
  discussionId: string;
  messages: OrderDiscussionMessage[];
};

export async function fetchOrderDiscussionByOrderId(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<OrderDiscussionData | null> {
  const { data: discussion, error: discError } = await supabase
    .from("order_discussions")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (discError || !discussion) {
    return null;
  }

  const { data: messages, error: msgError } = await supabase
    .from("order_discussion_messages")
    .select("id, body, sender_role, sender_id, created_at")
    .eq("discussion_id", discussion.id)
    .order("created_at", { ascending: true });

  if (msgError) {
    return null;
  }

  return {
    discussionId: discussion.id,
    messages: (messages ?? []) as OrderDiscussionMessage[],
  };
}

export function formatDiscussionMessageDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
