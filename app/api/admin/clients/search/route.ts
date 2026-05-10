import { NextResponse } from "next/server";
import { searchAdminCustomers } from "@/lib/admin/data";
import { tryGetSupabaseServerClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  const supabase = await tryGetSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: prof, error: profErr } = await supabase.from("user_profiles").select("role").eq("id", user.id).maybeSingle();
  if (profErr || !prof || (prof.role !== "admin" && prof.role !== "super_admin")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json({ customers: [] });
  }
  if (q.length < 2 && !UUID_RE.test(q)) {
    return NextResponse.json({ customers: [] });
  }

  const { customers, error } = await searchAdminCustomers(supabase, q);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ customers });
}
