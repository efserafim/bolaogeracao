"use client";

import Link from "next/link";
import { CollapsibleDaySection } from "./CollapsibleDaySection";
import { StatusBadge } from "./PageHeader";
import { TeamFlag } from "./TeamFlag";
import { MatchVenue } from "./MatchVenue";
import { formatMatchMeta, formatTime } from "@/lib/format";

export type JogosDayMatch = {
  id: string;
  kickoff: string;
  stage: string | null;
  groupName: string | null;
  competition: string | null;
  venue: string | null;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string | null;
  awayCrest: string | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  started: boolean;
  prediction: {
    homeScore: number;
    awayScore: number;
    scored: boolean;
    points: number | null;
  } | null;
};

export type JogosDay = {
  key: string;
  label: string;
  matches: JogosDayMatch[];
};

export function JogosByDay({ days }: { days: JogosDay[] }) {
  return (
    <div className="space-y-10">
      {days.map((day) => (
        <CollapsibleDaySection
          key={day.key}
          dayKey={day.key}
          label={day.label}
          matchCount={day.matches.length}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {day.matches.map((m) => (
              <div key={m.id} className="card p-5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {formatMatchMeta(m.stage, m.groupName, m.competition)}
                  </span>
                  <StatusBadge status={m.status} />
                </div>

                {m.venue && (
                  <div className="mt-2">
                    <MatchVenue venue={m.venue} />
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <TeamFlag name={m.homeTeam} crest={m.homeCrest} />
                  <div className="flex min-w-[64px] items-center justify-center">
                    {m.status === "FINISHED" || m.status === "LIVE" ? (
                      <span className="font-display text-xl font-extrabold text-slate-900">
                        {m.homeScore ?? 0}{" "}
                        <span className="text-slate-300">×</span>{" "}
                        {m.awayScore ?? 0}
                      </span>
                    ) : (
                      <span className="text-slate-300">×</span>
                    )}
                  </div>
                  <TeamFlag
                    name={m.awayTeam}
                    crest={m.awayCrest}
                    align="right"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="font-medium text-slate-600">
                    {formatTime(m.kickoff)}
                  </span>
                  {m.prediction ? (
                    <span className="badge bg-brand-50 text-brand-700">
                      Seu palpite: {m.prediction.homeScore}×
                      {m.prediction.awayScore}
                      {m.prediction.scored &&
                        m.prediction.points !== null && (
                          <span className="ml-1 font-bold">
                            (+{m.prediction.points})
                          </span>
                        )}
                    </span>
                  ) : m.started ? (
                    <span className="text-xs text-slate-400">
                      Palpites encerrados
                    </span>
                  ) : (
                    <Link
                      href="/palpites"
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Palpitar →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleDaySection>
      ))}
    </div>
  );
}
