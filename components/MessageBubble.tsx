import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessageBubble({
  role,
  content
}: {
  role: "user" | "assistant" | "system" | "data";
  content: string;
}) {
  const assistant = role === "assistant";
  return (
    <div className={cn("flex gap-3", assistant ? "justify-start" : "justify-end")}>
      {assistant && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-navy text-gold dark:bg-white dark:text-navy">
          <Bot className="h-5 w-5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78ch] whitespace-pre-wrap rounded-md px-4 py-3 text-sm leading-6 shadow-sm",
          assistant
            ? "border border-navy/10 bg-white text-ink dark:border-white/10 dark:bg-white/10 dark:text-white"
            : "bg-navy text-white dark:bg-gold dark:text-navy"
        )}
      >
        {content}
      </div>
      {!assistant && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-gold text-navy">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
