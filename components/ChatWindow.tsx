"use client";

import { useChat } from "ai/react";
import { Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DocumentUpload } from "@/components/DocumentUpload";
import { MessageBubble } from "@/components/MessageBubble";
import { useHomeReady } from "@/components/HomeReadyProvider";
import { documentReviewInstructions } from "@/constants/documents";
import type { DocumentKind } from "@/lib/types";

const quickReplies = [
  "Am I better off with Great Choice Plus amortizing or deferred assistance?",
  "What should I ask a THDA-approved lender before pre-approval?",
  "Review the biggest risks I should watch for before closing."
];

const aiEnabled = process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED === "true";

export function ChatWindow() {
  const { phase, documents, saveConversation, clearPrivacyData } = useHomeReady();
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const { messages, input, handleInputChange, handleSubmit, append, isLoading, setMessages } = useChat({
    body: {
      phase,
      documents
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: aiEnabled
          ? "Welcome to HomeReady AI. Tell me where you are in the homebuying process, or upload a document and I’ll help you make sense of it."
          : "Welcome to HomeReady AI. AI review is turned off for now so your documents stay inside the app while we finish the privacy setup."
      }
    ],
    onFinish: () => {}
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("homeready.messages");
    if (saved) setMessages(JSON.parse(saved));
  }, [setMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      void saveConversation(messages);
    }
  }, [messages, saveConversation]);

  const latestDocument = documents[0]?.name;
  const helperText = useMemo(() => {
    if (latestDocument) return `Document context active: ${latestDocument}`;
    return `Current phase context: ${phase}`;
  }, [latestDocument, phase]);

  function sendQuickReply(prompt: string) {
    if (!aiEnabled) return;
    setShowQuickReplies(false);
    void append({ role: "user", content: prompt });
  }

  function summarizeDocument(name: string, kind: DocumentKind) {
    if (!aiEnabled) return;
    setShowQuickReplies(false);
    void append({
      role: "user",
      content: `Please review ${name} as a ${kind}. ${documentReviewInstructions[kind]} End with: key risks, questions for my lender, questions for my agent, and next steps.`
    });
  }

  function clearChat() {
    setMessages([]);
    setShowQuickReplies(true);
    void clearPrivacyData("chat");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex min-h-[68vh] flex-col rounded-md border border-navy/10 bg-white shadow-soft dark:border-white/10 dark:bg-white/5">
        <div className="border-b border-navy/10 px-4 py-3 dark:border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-navy dark:text-white">{helperText}</div>
              <p className="text-xs text-navy/55 dark:text-white/55">
                {aiEnabled
                  ? "AI answers update when your phase or uploaded documents change."
                  : "Privacy mode is on. Uploads, checklist progress, and saved data work without sending documents to an AI provider."}
              </p>
            </div>
            <button
              type="button"
              onClick={clearChat}
              className="flex shrink-0 items-center gap-2 rounded-md border border-navy/15 px-3 py-2 text-xs font-semibold text-navy/65 transition hover:border-gold dark:border-white/15 dark:text-white/70"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} content={message.content} />
          ))}
          {isLoading && <MessageBubble role="assistant" content="Thinking through the details..." />}
        </div>
        {showQuickReplies && aiEnabled && (
          <div className="flex flex-wrap gap-2 border-t border-navy/10 px-4 py-3 dark:border-white/10">
            {quickReplies.map((reply) => (
              <button key={reply} onClick={() => sendQuickReply(reply)} className="rounded-md border border-navy/15 bg-[#f7f5ef] px-3 py-2 text-left text-xs font-semibold text-navy transition hover:border-gold dark:border-white/15 dark:bg-white/10 dark:text-white">
                {reply}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(event) => {
            setShowQuickReplies(false);
            if (aiEnabled) handleSubmit(event);
            else event.preventDefault();
          }}
          className="flex gap-2 border-t border-navy/10 p-4 dark:border-white/10"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={
              aiEnabled
                ? "Ask about pre-approval, DTI, inspections, closing disclosures..."
                : "AI chat is off while privacy mode is active."
            }
            disabled={!aiEnabled}
            className="min-w-0 flex-1 rounded-md border border-navy/15 bg-white px-4 py-3 text-sm outline-none focus:border-gold dark:border-white/15 dark:bg-navy"
          />
          <button type="submit" disabled={!aiEnabled || isLoading || !input.trim()} aria-label="Send message" className="grid h-12 w-12 place-items-center rounded-md bg-navy text-white disabled:opacity-50 dark:bg-gold dark:text-navy">
            <Send className="h-5 w-5" />
          </button>
        </form>
      </section>
      <aside className="space-y-4">
        <div className="rounded-md border border-navy/10 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/5">
          <h2 className="font-serif text-2xl">Document review</h2>
          <p className="mb-3 text-sm text-navy/60 dark:text-white/60">
            Upload a disclosure, pre-approval letter, estimate, or contract draft. AI summaries stay off until privacy mode is disabled.
          </p>
          <DocumentUpload onSummarize={summarizeDocument} />
        </div>
        <div className="rounded-md border border-navy/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <h2 className="font-serif text-2xl">AI status</h2>
          <p className="text-sm leading-6 text-navy/70 dark:text-white/70">
            {aiEnabled
              ? "AI is enabled through the server route. Documents are redacted before context is sent."
              : "AI is disabled by default. We can add it later behind explicit consent, redaction, audit logs, and server-only API keys."}
          </p>
        </div>
        <div className="rounded-md border border-navy/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <h2 className="font-serif text-2xl">THDA reminder</h2>
          <p className="text-sm leading-6 text-navy/70 dark:text-white/70">
            Great Choice Plus can help with upfront costs, but repayment rules matter if you sell or refinance before the assistance is forgiven or paid off.
          </p>
        </div>
      </aside>
    </div>
  );
}
