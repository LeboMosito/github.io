import mammoth from "mammoth";
import pdf from "pdf-parse";

export async function extractTextFromFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type;
  const name = file.name.toLowerCase();

  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    const result = await pdf(buffer);
    return result.text.trim();
  }

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (mime.startsWith("image/")) {
    return "Image uploaded. OCR is not enabled in this local build, so ask the buyer to describe any important details visible in the image.";
  }

  throw new Error("Unsupported file type. Upload a PDF, DOCX, or image.");
}
