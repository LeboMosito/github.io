export async function requireUser() {
  const { createRouteClient } = await import("@/lib/supabase-server");
  const supabase = createRouteClient();

  if (!supabase) {
    return { error: Response.json({ error: "Supabase is not configured." }, { status: 503 }) };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { error: Response.json({ error: "Sign in required." }, { status: 401 }) };
  }

  return { supabase, user: data.user };
}
