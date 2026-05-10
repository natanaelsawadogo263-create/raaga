import type { Metadata } from "next";
import { LivreurShell } from "@/components/livreur/livreur-shell";
import { requireRole } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: {
    default: "Espace livreur",
    template: "%s | Raaga Livreur",
  },
};

export default async function LivreurLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireRole(["driver"]);

  const [profileRes, driverRes] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("driver_profiles")
      .select("review_status, is_available")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const driverProfile = driverRes.data;

  const fullName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Livreur"
    : "Livreur";
  const firstName = (profile?.first_name ?? "").trim() || "Livreur";

  /** Pas encore de table notifications côté app — liste vide jusqu’à branchement backend. */
  const notifications: { id: string; text: string; time: string }[] = [];

  return (
    <LivreurShell
      driverFullName={fullName}
      driverFirstName={firstName}
      avatarUrl={profile?.avatar_url ?? null}
      isAvailable={!!driverProfile?.is_available}
      approved={driverProfile?.review_status === "approved"}
      unreadNotifications={0}
      notifications={notifications}
    >
      {children}
    </LivreurShell>
  );
}
