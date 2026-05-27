"use client";

import { CheckCircle2 } from "lucide-react";
import { checklistSections } from "@/constants/checklist";
import { useHomeReady } from "@/components/HomeReadyProvider";

export function Checklist() {
  const { checklist, setChecklistItem } = useHomeReady();
  const allItems = checklistSections.flatMap((section) =>
    section.items.map((item) => `${section.phase}:${item}`)
  );
  const completed = allItems.filter((id) => checklist[id]).length;
  const percentage = Math.round((completed / allItems.length) * 100);

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-navy/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-serif text-3xl">Your path to closing</h2>
            <p className="text-sm text-navy/60 dark:text-white/60">Progress saves to your account when signed in, or this browser in guest mode.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-navy dark:text-white">
            <CheckCircle2 className="h-5 w-5 text-gold" />
            {completed} of {allItems.length} complete
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-navy/10 dark:bg-white/10">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${percentage}%` }} />
        </div>
        <div className="mt-2 text-right text-sm font-bold">{percentage}%</div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {checklistSections.map((section) => (
          <section key={section.phase} className="rounded-md border border-navy/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-4 font-serif text-2xl">{section.phase}</h3>
            <div className="space-y-3">
              {section.items.map((item) => {
                const id = `${section.phase}:${item}`;
                return (
                  <label key={id} className="flex cursor-pointer items-start gap-3 rounded-md border border-navy/10 p-3 transition hover:border-gold dark:border-white/10">
                    <input
                      type="checkbox"
                      checked={Boolean(checklist[id])}
                      onChange={(event) => void setChecklistItem(id, event.target.checked)}
                      className="mt-1 h-4 w-4 accent-gold"
                    />
                    <span className="text-sm leading-6">{item}</span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
