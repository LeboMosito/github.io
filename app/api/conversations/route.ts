import { requireUser } from "@/lib/api";

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id, messages } = (await req.json()) as { id?: string; messages?: unknown[] };

  if (!id || !Array.isArray(messages)) {
    return Response.json({ error: "Invalid conversation payload." }, { status: 400 });
  }

  const { error } = await auth.supabase.from("conversations").upsert({
    id,
    user_id: auth.user.id,
    title: "HomeReady AI conversation",
    messages,
    last_accessed_at: new Date().toISOString(),
    retention_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = (await req.json()) as { id?: string };

  if (!id) {
    return Response.json({ error: "Conversation id is required." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("conversations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
