import { redirect } from "next/navigation";
import { tryGetSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type AppRole = Database["public"]["Tables"]["user_profiles"]["Row"]["role"];

export async function requireAuthenticatedUser() {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    redirect("/connexion?configuration=supabase");
  }
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/connexion");
  }

  return { supabase, user: data.user };
}

export async function requireRole(roles: AppRole[]) {
  const { supabase, user } = await requireAuthenticatedUser();

  const { data: profile, error } = await supabase.from("user_profiles").select("role").eq("id", user.id).single();
  if (error || !profile || !roles.includes(profile.role)) {
    redirect("/");
  }

  return { supabase, user, role: profile.role };
}
