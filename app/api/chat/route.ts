import { createDataStreamResponse, formatDataStreamPart, type CoreMessage } from "ai";
import { buildSystemPrompt } from "@/lib/claude";
import { getClientId, rateLimit } from "@/lib/rate-limit";
import { redactSensitiveText } from "@/lib/security";
import type { BuyerPhase, StoredDocument } from "@/lib/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  const chatLimit = rateLimit({
    key: `chat:${getClientId(req)}`,
    limit: 30,
    windowMs: 60 * 1000
  });

  if (!chatLimit.allowed) {
    return new Response("Too many chat requests. Please wait a minute and try again.", {
      status: 429
    });
  }

  const {
    messages,
    phase = "Prep",
    documents = []
  }: {
    messages: CoreMessage[];
    phase?: BuyerPhase;
    documents?: StoredDocument[];
  } = await req.json();

  const validPhases: BuyerPhase[] = ["Prep", "Pre-Approval", "Search", "Closing"];
  const safePhase = validPhases.includes(phase) ? phase : "Prep";
  const safeDocuments = documents.slice(0, 5).map((document) => ({
    ...document,
    text: redactSensitiveText(document.text).redactedText
  }));

  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) {
    return new Response(
      "MOONSHOT_API_KEY is missing. Add it to .env.local to enable the Kimi assistant.",
      { status: 500 }
    );
  }

  const model = process.env.KIMI_MODEL ?? "kimi-k2.6";
  const allowedMessageRoles = new Set(["user", "assistant", "system"]);
  const kimiMessages = [
    { role: "system", content: buildSystemPrompt({ phase: safePhase, documents: safeDocuments }) },
    ...messages.map((message) => ({
      role: message.role,
      content: typeof message.content === "string" ? message.content : ""
    }))
  ].filter((message) => allowedMessageRoles.has(message.role) && message.content);

  return createDataStreamResponse({
    async execute(dataStream) {
      const response = await fetch("https://api.moonshot.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: kimiMessages,
          stream: true,
          temperature: 0.3,
          thinking: { type: "disabled" }
        })
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(errorText || `Kimi API request failed with ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;

          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            dataStream.write(formatDataStreamPart("text", delta));
          }
        }
      }

      dataStream.write(
        formatDataStreamPart("finish_message", {
          finishReason: "stop"
        })
      );
    },
    onError(error) {
      return error instanceof Error ? error.message : "Kimi API request failed.";
    }
  });
}
