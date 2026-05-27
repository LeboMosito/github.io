"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { glossaryTerms } from "@/constants/glossary";

export function Glossary() {
  const [query, setQuery] = useState("");
  const terms = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return glossaryTerms;
    return glossaryTerms.filter(([term, definition]) =>
      `${term} ${definition}`.toLowerCase().includes(normalized)
    );
  }, [query]);

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-navy/10 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/5">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-navy/45 dark:text-white/45" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search terms like escrow, appraisal, DTI..."
            className="w-full rounded-md border border-navy/15 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-gold dark:border-white/15 dark:bg-navy"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {terms.map(([term, definition]) => (
          <article key={term} className="rounded-md border border-navy/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <h2 className="font-serif text-2xl text-navy dark:text-white">{term}</h2>
            <p className="mt-2 text-sm leading-6 text-navy/70 dark:text-white/70">{definition}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
