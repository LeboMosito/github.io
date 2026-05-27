import { requireUser } from "@/lib/api";

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id, checked } = (await req.json()) as { id?: string; checked?: boolean };

  if (!id || typeof checked !== "boolean") {
    return Response.json({ error: "Invalid checklist payload." }, { status: 400 });
  }

  const { error } = await auth.supabase.from("checklist_items").upsert({
    user_id: auth.user.id,
    item_id: id,
    checked
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
