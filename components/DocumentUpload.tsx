"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { useHomeReady } from "@/components/HomeReadyProvider";
import { documentKinds } from "@/constants/documents";
import type { DocumentKind } from "@/lib/types";

export function DocumentUpload({ onSummarize }: { onSummarize?: (name: string, kind: DocumentKind) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { addDocument } = useHomeReady();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [kind, setKind] = useState<DocumentKind>("General");

  async function upload(file: File) {
    setBusy(true);
    setStatus(null);
    setWarnings([]);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setStatus(payload.error ?? "Upload failed.");
      return;
    }

    const document = {
      id: crypto.randomUUID(),
      name: payload.name as string,
      type: payload.type as string,
      kind,
      size: payload.size as number,
      text: payload.text as string,
      warnings: Array.isArray(payload.warnings) ? payload.warnings : [],
      createdAt: new Date().toISOString()
    };
    await addDocument(document);
    setWarnings(Array.isArray(payload.warnings) ? payload.warnings : []);
    setStatus("Document added. Kimi can use the redacted text now.");
    onSummarize?.(document.name, kind);
  }

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) void upload(file);
      }}
      className="rounded-md border border-dashed border-gold/70 bg-gold/10 p-4"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-semibold text-navy/65 dark:text-white/65">Review as</span>
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value as DocumentKind)}
          className="w-full rounded-md border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold dark:border-white/15 dark:bg-navy"
        >
          {documentKinds.map((documentKind) => (
            <option key={documentKind} value={documentKind}>
              {documentKind}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-navy"
      >
        <UploadCloud className="h-4 w-4" />
        {busy ? "Reviewing..." : "Upload document"}
      </button>
      <p className="mt-2 text-xs text-navy/65 dark:text-white/65">PDF, DOCX, or image up to 10 MB. Drag and drop works too.</p>
      {status && <p className="mt-2 text-xs font-medium text-navy dark:text-white">{status}</p>}
      {warnings.length > 0 && (
        <div className="mt-2 rounded-md border border-gold/50 bg-white/70 p-2 text-xs text-navy/70 dark:bg-white/10 dark:text-white/70">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}
    </div>
  );
}
