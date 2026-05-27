import { requireUser } from "@/lib/api";
import type { StoredDocument } from "@/lib/types";

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const document = (await req.json()) as StoredDocument;

  if (!document.id || !document.name || !document.type || typeof document.text !== "string") {
    return Response.json({ error: "Invalid document payload." }, { status: 400 });
  }

  const { error } = await auth.supabase.from("documents").insert({
    id: document.id,
    user_id: auth.user.id,
    name: document.name,
    type: document.type,
    kind: document.kind ?? "General",
    size_bytes: document.size ?? 0,
    extracted_text: document.text,
    redaction_warnings: document.warnings ?? [],
    retention_until:
      document.retentionUntil ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
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
    return Response.json({ error: "Document id is required." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("documents")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
