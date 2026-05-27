"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calculator, CheckSquare, FileText, Home, LogOut, MessageSquareText, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { DocumentUpload } from "@/components/DocumentUpload";
import { useHomeReady } from "@/components/HomeReadyProvider";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/chat", label: "AI Chat", icon: MessageSquareText },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/glossary", label: "Glossary", icon: BookOpen },
  { href: "/calculator", label: "Calculator", icon: Calculator }
];

export function Sidebar() {
  const pathname = usePathname();
  const { documents, userEmail, authMode, signIn, signUp, signOut, deleteDocument, clearPrivacyData } = useHomeReady();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(action: "signin" | "signup") {
    setMessage(null);
    const error = action === "signin" ? await signIn(email, password) : await signUp(email, password);
    setMessage(error ?? "You are signed in.");
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col border-r border-navy/10 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-[#0a1628]/90 md:flex">
      <div className="mb-7 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-navy text-gold dark:bg-white dark:text-navy">
          <Home className="h-6 w-6" />
        </div>
        <div>
          <div className="font-serif text-3xl leading-7 text-navy dark:text-white">HomeReady AI</div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/55 dark:text-white/55">Tennessee buyers</div>
        </div>
      </div>

      <nav className="space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition",
                active
                  ? "bg-navy text-white dark:bg-white dark:text-navy"
                  : "text-navy/75 hover:bg-navy/5 dark:text-white/75 dark:hover:bg-white/10"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-md border border-navy/10 bg-[#f7f5ef] p-4 dark:border-white/10 dark:bg-white/5">
        <div className="mb-3 flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-5 w-5 text-gold" />
          {authMode === "signed-in" ? "Signed in" : "Guest mode"}
        </div>
        {userEmail ? (
          <div className="space-y-3">
            <p className="break-all text-sm text-navy/70 dark:text-white/70">{userEmail}</p>
            <button onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-md border border-navy/15 py-2 text-sm font-semibold dark:border-white/15">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-md border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold dark:border-white/15 dark:bg-navy" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" className="w-full rounded-md border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold dark:border-white/15 dark:bg-navy" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => submit("signin")} className="rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-navy">Log in</button>
              <button onClick={() => submit("signup")} className="rounded-md border border-navy/15 px-3 py-2 text-sm font-semibold dark:border-white/15">Sign up</button>
            </div>
            {message && <p className="text-xs text-navy/60 dark:text-white/60">{message}</p>}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-md border border-navy/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <div className="mb-2 text-sm font-semibold">Privacy controls</div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => void clearPrivacyData("chat")}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-navy/15 px-3 py-2 text-xs font-semibold dark:border-white/15"
          >
            <Trash2 className="h-4 w-4" />
            Clear chat history
          </button>
          <button
            type="button"
            onClick={() => void clearPrivacyData(authMode === "signed-in" ? "documents" : "guest")}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-navy/15 px-3 py-2 text-xs font-semibold dark:border-white/15"
          >
            <Trash2 className="h-4 w-4" />
            {authMode === "signed-in" ? "Delete documents" : "Clear guest data"}
          </button>
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto">
        <DocumentUpload />
        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/50 dark:text-white/50">Documents</div>
          {documents.length === 0 ? (
            <p className="rounded-md border border-dashed border-navy/15 p-3 text-sm text-navy/55 dark:border-white/15 dark:text-white/55">
              Uploaded documents appear here.
            </p>
          ) : (
            documents.map((document) => (
              <div key={document.id} className="flex items-start gap-2 rounded-md border border-navy/10 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/5">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{document.name}</div>
                  <div className="text-xs font-medium text-gold">{document.kind ?? "General"}</div>
                  <div className="text-xs text-navy/50 dark:text-white/50">{new Date(document.createdAt).toLocaleDateString()}</div>
                  {document.retentionUntil && (
                    <div className="text-xs text-navy/50 dark:text-white/50">
                      Auto-delete after {new Date(document.retentionUntil).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Delete ${document.name}`}
                  onClick={() => void deleteDocument(document.id)}
                  className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-md text-navy/50 transition hover:bg-navy/5 hover:text-navy dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
