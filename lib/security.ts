const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
]);

const allowedExtensions = [".pdf", ".docx", ".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

const sensitivePatterns = [
  {
    label: "possible Social Security number",
    pattern: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
    replacement: "[REDACTED_SSN]"
  },
  {
    label: "possible bank routing number",
    pattern: /\b\d{9}\b/g,
    replacement: "[REDACTED_9_DIGIT_NUMBER]"
  },
  {
    label: "possible long account number",
    pattern: /\b\d{12,19}\b/g,
    replacement: "[REDACTED_ACCOUNT_NUMBER]"
  }
];

export function validateUploadFile(file: File) {
  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension = allowedExtensions.some((extension) => lowerName.endsWith(extension));

  if (file.size > MAX_UPLOAD_BYTES) {
    return "File is too large. Upload files up to 10 MB for now.";
  }

  if (!hasAllowedExtension || (file.type && !allowedMimeTypes.has(file.type))) {
    return "Unsupported file type. Upload a PDF, DOCX, JPG, PNG, WEBP, HEIC, or HEIF file.";
  }

  return null;
}

export function redactSensitiveText(text: string) {
  const warnings: string[] = [];
  let redactedText = text;

  for (const item of sensitivePatterns) {
    if (item.pattern.test(redactedText)) {
      warnings.push(`Redacted ${item.label}.`);
      redactedText = redactedText.replace(item.pattern, item.replacement);
    }
    item.pattern.lastIndex = 0;
  }

  return {
    redactedText,
    warnings
  };
}

export function sanitizeDocumentName(name: string) {
  return name.replace(/[^\w.\- ()]/g, "").slice(0, 140) || "uploaded-document";
}
