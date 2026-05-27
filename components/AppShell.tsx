"use client";

import { usePathname } from "next/navigation";
import { Calculator, CheckSquare, Home, MessageSquareText, Moon, Sun, BookOpen } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { PhaseTracker } from "@/components/PhaseTracker";
import { useHomeReady } from "@/components/HomeReadyProvider";

const titles: Record<string, string> = {
  "/chat": "Ask HomeReady AI",
  "/checklist": "Buyer Checklist",
  "/glossary": "Plain English Glossary",
  "/calculator": "Affordability Calculator"
};

const mobileItems = [
  { href: "/chat", label: "Chat", icon: MessageSquareText },
  { href: "/checklist", label: "List", icon: CheckSquare },
  { href: "/glossary", label: "Terms", icon: BookOpen },
  { href: "/calculator", label: "Calc", icon: Calculator }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { darkMode, setDarkMode } = useHomeReady();

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-[#f7f5ef] text-ink dark:bg-[#07111f] dark:text-white">
        <div className="mx-auto flex min-h-screen max-w-[1500px]">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
            <header className="sticky top-0 z-20 border-b border-navy/10 bg-[#f7f5ef]/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#07111f]/90 md:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                    <Home className="h-4 w-4" />
                    THDA Great Choice
                  </div>
                  <h1 className="font-serif text-3xl leading-tight md:text-4xl">
                    {titles[pathname] ?? "HomeReady AI"}
                  </h1>
                </div>
                <button
                  type="button"
                  aria-label="Toggle dark mode"
                  onClick={() => setDarkMode(!darkMode)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-navy/15 bg-white text-navy shadow-sm transition hover:border-gold dark:border-white/15 dark:bg-white/10 dark:text-white"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-4">
                <PhaseTracker />
              </div>
            </header>
            <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
          </div>
        </div>
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-navy/10 bg-white dark:border-white/10 dark:bg-[#0a1628] md:hidden">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-2 py-3 text-xs font-semibold ${
                  active ? "text-gold" : "text-navy/65 dark:text-white/70"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
