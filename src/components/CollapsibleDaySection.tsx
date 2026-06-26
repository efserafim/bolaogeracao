"use client";

import { useState, type ReactNode } from "react";
import { isTodayOrFutureDay } from "@/lib/format";

type CollapsibleDaySectionProps = {
  dayKey: string;
  label: string;
  matchCount: number;
  children: ReactNode;
  headingLevel?: "h2" | "h3";
  headingClassName?: string;
  defaultExpanded?: boolean;
};

export function CollapsibleDaySection({
  dayKey,
  label,
  matchCount,
  children,
  headingLevel = "h2",
  headingClassName = "font-display text-xl font-bold text-brand-900",
  defaultExpanded,
}: CollapsibleDaySectionProps) {
  const [expanded, setExpanded] = useState(
    defaultExpanded ?? isTodayOrFutureDay(dayKey)
  );
  const Heading = headingLevel;

  return (
    <section>
      <Heading className="mb-4">
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className={`flex w-full items-center gap-3 text-left ${headingClassName}`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm transition-transform ${
              expanded
                ? "rotate-90 bg-brand-100 text-brand-700"
                : "bg-slate-100 text-slate-500"
            }`}
            aria-hidden
          >
            ›
          </span>
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500" />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <span className="shrink-0 text-sm font-normal text-slate-400">
            ({matchCount} {matchCount === 1 ? "jogo" : "jogos"})
          </span>
        </button>
      </Heading>
      {expanded && children}
    </section>
  );
}
