"use client";

import { useState } from "react";
import { TeamFlag } from "./TeamFlag";
import { MatchVenue } from "./MatchVenue";
import { CollapsibleDaySection } from "./CollapsibleDaySection";
import { dayKey, formatDay, formatMatchMeta, formatTime } from "@/lib/format";

export interface BoardMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string | null;
  awayCrest: string | null;
  kickoff: string;
  groupName: string | null;
  stage: string | null;
  venue: string | null;
  homeGuess: number | null;
  awayGuess: number | null;
  penaltyGuess: "HOME" | "AWAY" | null;
  locked?: boolean;
}

function Stepper({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="flex h-9 w-12 items-center justify-center rounded-lg bg-slate-100 font-display text-lg font-bold text-slate-600">
        {value}
      </span>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200"
        aria-label="menos"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        max={30}
        value={value}
        onChange={(e) =>
          onChange(Math.max(0, Math.min(30, Number(e.target.value) || 0)))
        }
        className="h-9 w-12 rounded-lg border border-slate-200 text-center font-display text-lg font-bold text-slate-900 focus:border-brand-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(30, value + 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200"
        aria-label="mais"
      >
        +
      </button>
    </div>
  );
}

function MatchRow({
  match,
  predictionsOpen,
}: {
  match: BoardMatch;
  predictionsOpen: boolean;
}) {
  const locked = match.locked ?? false;
  const [home, setHome] = useState(match.homeGuess ?? 0);
  const [away, setAway] = useState(match.awayGuess ?? 0);
  const [penaltyGuess, setPenaltyGuess] = useState<"HOME" | "AWAY" | null>(
    match.penaltyGuess
  );
  const [saved, setSaved] = useState(
    match.homeGuess !== null && match.awayGuess !== null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = !locked && predictionsOpen;

  async function save() {
    if (!canEdit) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: match.id,
        homeScore: home,
        awayScore: away,
        penaltyGuess,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Erro ao salvar.");
      return;
    }
    setSaved(true);
  }

  return (
    <div
      className={`card p-5 ${locked ? "opacity-90 ring-1 ring-slate-200" : ""}`}
    >
      <div className="flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span className="truncate">{formatMatchMeta(match.stage, match.groupName)}</span>
        <div className="flex shrink-0 items-center gap-2">
          {locked && (
            <span className="badge bg-slate-200 text-slate-600">Encerrado</span>
          )}
          <span>{formatTime(match.kickoff)}</span>
        </div>
      </div>

      {match.venue && (
        <div className="mt-2">
          <MatchVenue venue={match.venue} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <TeamFlag name={match.homeTeam} crest={match.homeCrest} />
          <Stepper
            value={home}
            onChange={(v) => {
              setHome(v);
              setSaved(false);
            }}
            disabled={!canEdit}
          />
        </div>
        <div className="text-center text-sm text-slate-300">×</div>
        <div className="flex items-center justify-between gap-3">
          <TeamFlag name={match.awayTeam} crest={match.awayCrest} />
          <Stepper
            value={away}
            onChange={(v) => {
              setAway(v);
              setSaved(false);
            }}
            disabled={!canEdit}
          />
        </div>
      </div>

      <div className="mt-4 hidden items-center gap-3 sm:flex">
        <TeamFlag name={match.homeTeam} crest={match.homeCrest} />
        <Stepper
          value={home}
          onChange={(v) => {
            setHome(v);
            setSaved(false);
          }}
          disabled={!canEdit}
        />
        <span className="text-slate-300">×</span>
        <Stepper
          value={away}
          onChange={(v) => {
            setAway(v);
            setSaved(false);
          }}
          disabled={!canEdit}
        />
        <TeamFlag name={match.awayTeam} crest={match.awayCrest} align="right" />
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Se for para os penaltis (+2 pts)
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          {[
            { value: "HOME" as const, label: match.homeTeam },
            { value: "AWAY" as const, label: match.awayTeam },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={!canEdit}
              onClick={() => {
                setPenaltyGuess(option.value);
                setSaved(false);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                penaltyGuess === option.value
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              } ${!canEdit ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        {locked ? (
          <span className="text-sm text-slate-500">
            {saved
              ? "Palpite registrado — não pode mais ser alterado"
              : "Palpites encerrados para este jogo"}
          </span>
        ) : error ? (
          <span className="text-sm text-red-600">{error}</span>
        ) : saved ? (
          <span className="badge bg-emerald-50 text-emerald-600">
            ✓ Palpite salvo
          </span>
        ) : (
          <span className="text-sm text-slate-400">Defina seu placar</span>
        )}
        {canEdit && (
          <button
            onClick={save}
            disabled={saving}
            className={`shrink-0 ${saved ? "btn-outline" : "btn-primary"} w-full sm:w-auto`}
          >
            {saving ? "Salvando..." : saved ? "Atualizar" : "Salvar palpite"}
          </button>
        )}
      </div>
    </div>
  );
}

function groupByDay(list: BoardMatch[]) {
  const map = new Map<string, BoardMatch[]>();
  for (const m of list) {
    const key = dayKey(m.kickoff);
    const group = map.get(key) ?? [];
    group.push(m);
    map.set(key, group);
  }
  return Array.from(map.entries()).map(([key, dayMatches]) => ({
    key,
    label: formatDay(dayMatches[0].kickoff),
    matches: dayMatches,
  }));
}

function DaySection({
  dayKey: key,
  label,
  matches,
  predictionsOpen,
}: {
  dayKey: string;
  label: string;
  matches: BoardMatch[];
  predictionsOpen: boolean;
}) {
  return (
    <CollapsibleDaySection
      dayKey={key}
      label={label}
      matchCount={matches.length}
      headingLevel="h3"
      headingClassName="font-display text-lg font-bold text-brand-900"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} predictionsOpen={predictionsOpen} />
        ))}
      </div>
    </CollapsibleDaySection>
  );
}

export function PredictionsBoard({
  matches,
  predictionsOpen = true,
}: {
  matches: BoardMatch[];
  predictionsOpen?: boolean;
}) {
  if (matches.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-500">
        Não há jogos abertos para palpite no momento. Volte mais tarde! ⚽
      </div>
    );
  }

  const open = matches.filter((m) => !m.locked);
  const closed = matches.filter((m) => m.locked);
  const openDays = groupByDay(open);
  const closedDays = groupByDay(closed);

  return (
    <div className="space-y-10">
      {openDays.map((day) => (
        <DaySection
          key={day.key}
          dayKey={day.key}
          label={day.label}
          matches={day.matches}
          predictionsOpen={predictionsOpen}
        />
      ))}

      {closedDays.length > 0 && (
        <div>
          <h2 className="mb-6 font-display text-lg font-bold text-slate-700">
            Jogos encerrados
          </h2>
          <div className="space-y-10">
            {closedDays.map((day) => (
              <DaySection
                key={day.key}
                dayKey={day.key}
                label={day.label}
                matches={day.matches}
                predictionsOpen={predictionsOpen}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
