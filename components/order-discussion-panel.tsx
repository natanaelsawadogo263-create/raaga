import { MessageSquare } from "lucide-react";
import { sendOrderDiscussionMessageAction } from "@/app/actions/order-discussion";
import {
  formatDiscussionMessageDate,
  formatMessageSenderLabel,
  type OrderDiscussionMessage,
} from "@/lib/order-discussion";
import { btnPrimaryClass, textareaClass } from "@/components/raaga/page-shell";

type OrderDiscussionPanelProps = {
  discussionId: string;
  messages: OrderDiscussionMessage[];
  returnTo: string;
  viewerUserId: string;
  title?: string;
  hint?: string;
  emptyHint?: string;
  placeholder?: string;
  /** Afficher le formulaire d’envoi (ex. livreur uniquement si course assignée) */
  canSend?: boolean;
  variant?: "customer" | "driver" | "admin";
};

export function OrderDiscussionPanel({
  discussionId,
  messages,
  returnTo,
  viewerUserId,
  title = "Discussion",
  hint,
  emptyHint = "Aucun message pour l’instant. Envoyez le premier message.",
  placeholder = "Votre message…",
  canSend = true,
  variant = "customer",
}: OrderDiscussionPanelProps) {
  const borderClass =
    variant === "driver"
      ? "border-slate-200/80 bg-white"
      : variant === "admin"
        ? "border-slate-200/80 bg-slate-50/50"
        : "border-amber-200/70 bg-amber-50/40";

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${borderClass}`}>
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            variant === "driver" ? "bg-orange-100 text-[#FF7A00]" : "bg-amber-100 text-amber-800"
          }`}
        >
          <MessageSquare className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-foreground">{title}</h2>
          {hint ? (
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{hint}</p>
          ) : null}
        </div>
      </div>

      <div
        className="mt-4 max-h-56 space-y-3 overflow-y-auto rounded-xl border border-border/60 bg-white/90 p-3 sm:max-h-64"
        aria-live="polite"
        aria-label="Historique des messages"
      >
        {messages.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">{emptyHint}</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === viewerUserId;
            return (
              <div
                key={msg.id}
                className={`motion-safe:animate-fade-up flex flex-col ${isOwn ? "items-end" : "items-start"}`}
              >
                <p className="mb-0.5 text-[10px] font-semibold text-muted-foreground">
                  {formatMessageSenderLabel(msg, viewerUserId)} · {formatDiscussionMessageDate(msg.created_at)}
                </p>
                <p
                  className={`max-w-[92%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    isOwn
                      ? variant === "driver"
                        ? "bg-[#FF7A00] text-white shadow-sm"
                        : "bg-brand text-brand-contrast shadow-sm"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {msg.body}
                </p>
              </div>
            );
          })
        )}
      </div>

      {canSend ? (
        <form action={sendOrderDiscussionMessageAction} className="mt-4 space-y-2">
          <input type="hidden" name="discussion_id" value={discussionId} />
          <input type="hidden" name="return_to" value={returnTo} />
          <label htmlFor={`discussion-body-${discussionId}`} className="sr-only">
            Votre message
          </label>
          <textarea
            id={`discussion-body-${discussionId}`}
            name="body"
            required
            rows={3}
            maxLength={4000}
            placeholder={placeholder}
            className={textareaClass}
          />
          <button type="submit" className={`${btnPrimaryClass} w-full sm:w-auto`}>
            Envoyer
          </button>
        </form>
      ) : null}
    </div>
  );
}
