"use client";

import { useCallback, useEffect, useState } from "react";
import { refreshOrderDiscussionMessagesAction } from "@/app/actions/order-discussion";
import { OrderDiscussionPanel } from "@/components/order-discussion-panel";
import type { OrderDiscussionMessage } from "@/lib/order-discussion";

type Props = {
  discussionId: string;
  initialMessages: OrderDiscussionMessage[];
  returnTo: string;
  viewerUserId: string;
  title?: string;
  hint?: string;
  emptyHint?: string;
  placeholder?: string;
  canSend?: boolean;
  variant?: "customer" | "driver" | "admin";
};

const POLL_MS = 5000;

/**
 * Discussion avec rafraîchissement automatique des nouveaux messages.
 */
export function OrderDiscussionLivePanel({
  discussionId,
  initialMessages,
  ...panelProps
}: Props) {
  const [messages, setMessages] = useState(initialMessages);

  const refresh = useCallback(async () => {
    const next = await refreshOrderDiscussionMessagesAction(discussionId);
    setMessages((prev) => {
      const prevLast = prev[prev.length - 1]?.id;
      const nextLast = next[next.length - 1]?.id;
      if (prev.length === next.length && prevLast === nextLast) {
        return prev;
      }
      return next;
    });
  }, [discussionId]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };
    const id = window.setInterval(tick, POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return (
    <OrderDiscussionPanel
      discussionId={discussionId}
      messages={messages}
      {...panelProps}
    />
  );
}
