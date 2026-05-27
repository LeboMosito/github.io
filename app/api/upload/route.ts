import { extractTextFromFile } from "@/lib/parsers";
import { getClientId, rateLimit } from "@/lib/rate-limit";
import { redactSensitiveText, sanitizeDocumentName, validateUploadFile } from "@/lib/security";

export async function POST(req: Request) {
  const uploadLimit = rateLimit({
    key: `upload:${getClientId(req)}`,
    limit: 10,
    windowMs: 10 * 60 * 1000
  });

  if (!uploadLimit.allowed) {
    return Response.json(
      { error: "Too many uploads. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file was uploaded." }, { status: 400 });
  }

  const validationError = validateUploadFile(file);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  try {
    const text = await extractTextFromFile(file);
    const { redactedText, warnings } = redactSensitiveText(text);

    return Response.json({
      name: sanitizeDocumentName(file.name),
      type: file.type || "application/octet-stream",
      size: file.size,
      text: redactedText,
      warnings
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not parse this document.";
    return Response.json({ error: message }, { status: 400 });
  }
}
