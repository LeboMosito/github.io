"use client";

import type { BuyerPhase } from "@/lib/types";
import { useHomeReady } from "@/components/HomeReadyProvider";

const phases: BuyerPhase[] = ["Prep", "Pre-Approval", "Search", "Closing"];

export function PhaseTracker() {
  const { phase, setPhase } = useHomeReady();
  const activeIndex = phases.indexOf(phase);

  return (
    <div className="grid grid-cols-4 overflow-hidden rounded-md border border-navy/10 bg-white dark:border-white/10 dark:bg-white/5">
      {phases.map((item, index) => {
        const active = item === phase;
        const complete = index < activeIndex;
        return (
          <button
            type="button"
            key={item}
            onClick={() => setPhase(item)}
            className={`min-w-0 border-r border-navy/10 px-2 py-3 text-center text-xs font-bold transition last:border-r-0 dark:border-white/10 sm:text-sm ${
              active
                ? "bg-navy text-white dark:bg-white dark:text-navy"
                : complete
                  ? "bg-gold/15 text-navy dark:text-white"
                  : "text-navy/60 hover:bg-navy/5 dark:text-white/60 dark:hover:bg-white/10"
            }`}
          >
            <span className="block truncate">{item}</span>
          </button>
        );
      })}
    </div>
  );
}
