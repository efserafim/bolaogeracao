"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "./Avatar";
import { TeamFlag } from "./TeamFlag";
import { MatchVenue } from "./MatchVenue";
import { StatusBadge } from "./PageHeader";
import { dayKey, formatDay } from "@/lib/format";
import { teamDisplayName } from "@/lib/teams";

type PredictionMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string | null;
  awayCrest: string | null;
  homeScore: number | null;
  awayScore: number | null;
  penaltyWinner: string | null;
  status: string;
  kickoff: string;
  venue: string | null;
};

type Prediction = {
  id: string;
  homeScore: number;
  awayScore: number;
  penaltyGuess: string | null;
  points: number | null;
  scored: boolean;
  match: PredictionMatch;
};

type UserPredictionsData = {
  viewerId: string;
  user: { id: string; name: string };
  totalPoints: number;
  todayKey: string;
  rules: { pointsExact: number; pointsResult: number; pointsGoalDiff: number };
  scoreBreakdown: {
    matchLabel: string;
    palpite: string;
    result: string;
    points: number;
    reason: string;
    kickoff: string;
  }[];
  predictions: Prediction[];
};

type Tab = "today" | "history";

function ScoreBreakdown({
  userName,
  totalPoints,
  breakdown,
}: {
  userName: string;
  totalPoints: number;
  breakdown: UserPredictionsData["scoreBreakdown"];
}) {
  const firstName = userName.split(" ")[0];
  const terms = breakdown.map((row) => row.points);
  const sum = terms.reduce((a, b) => a + b, 0);
  const formula =
    terms.length > 0
      ? `${terms.map((n) => (n > 0 ? `+${n}` : "0")).join(" ")} = ${sum}`
      : "0";

  return (
    <div className="mb-4 space-y-3">
      <div className="rounded-2xl border-2 border-dashed border-accent-400 bg-gradient-to-br from-accent-50 to-amber-50 p-4">
        <p className="font-display text-lg font-extrabold text-accent-700">
          👀 Veio olhar o quê, seu bobo?
        </p>
        <p className="mt-1 text-sm text-accent-900/80">
          Relaxa — {firstName} não é ladrão não. Olha a conta certinha aí embaixo.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Conta dos pontos
        </p>
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
          {breakdown.map((row) => (
            <li
              key={`${row.kickoff}-${row.matchLabel}`}
              className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">{row.matchLabel}</p>
                <p className="text-xs text-slate-500">
                  Palpite {row.palpite} · Resultado {row.result} · {row.reason}
                </p>
              </div>
              <span
                className={`shrink-0 font-display font-bold ${
                  row.points > 0 ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                +{row.points}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="break-all font-mono text-xs text-slate-600">{formula}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-base font-extrabold text-brand-800">
              Total: {totalPoints} pts
            </p>
            <p className="text-sm font-semibold text-brand-700">
              Eu não sou ladrão! 🫡
            </p>
          </div>
          {sum !== totalPoints && (
            <p className="mt-1 text-xs text-slate-400">
              * Jogos ainda não finalizados não entram nessa soma.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PredictionRow({ p }: { p: Prediction }) {
  const m = p.match;
  const finished = m.status === "FINISHED";
  const penaltyGuess =
    p.penaltyGuess === "HOME"
      ? teamDisplayName(m.homeTeam)
      : p.penaltyGuess === "AWAY"
        ? teamDisplayName(m.awayTeam)
        : null;
  const penaltyWinner =
    m.penaltyWinner === "HOME"
      ? teamDisplayName(m.homeTeam)
      : m.penaltyWinner === "AWAY"
        ? teamDisplayName(m.awayTeam)
        : null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <TeamFlag name={m.homeTeam} crest={m.homeCrest} />
          <span className="text-slate-300">×</span>
          <TeamFlag name={m.awayTeam} crest={m.awayCrest} align="right" />
        </div>
        {m.venue && (
          <div className="mt-2">
            <MatchVenue venue={m.venue} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-center">
          <p className="text-[11px] uppercase text-slate-400">Palpite</p>
          <p className="font-display font-bold text-slate-800">
            {p.homeScore}×{p.awayScore}
          </p>
          {penaltyGuess && (
            <p className="mt-1 text-[11px] text-slate-400">
              Pen.: {penaltyGuess}
            </p>
          )}
        </div>
        <div className="text-center">
          <p className="text-[11px] uppercase text-slate-400">Resultado</p>
          <p className="font-display font-bold text-slate-800">
            {finished ? `${m.homeScore}×${m.awayScore}` : "—"}
          </p>
          {finished && penaltyWinner && (
            <p className="mt-1 text-[11px] text-slate-400">
              Pen.: {penaltyWinner}
            </p>
          )}
        </div>
        <div className="min-w-[80px] text-center">
          {p.scored ? (
            <span
              className={`badge ${
                (p.points ?? 0) > 0
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              +{p.points} pts
            </span>
          ) : (
            <StatusBadge status={m.status} />
          )}
        </div>
      </div>
    </div>
  );
}

export function UserPredictionsModal({
  userId,
  userName,
  image,
  onClose,
}: {
  userId: string;
  userName: string;
  image?: string | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<UserPredictionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("today");

  useEffect(() => setMounted(true), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}/predictions`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erro ao carregar palpites");
      }
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar palpites");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const todayPredictions =
    data?.predictions.filter((p) => dayKey(p.match.kickoff) === data.todayKey) ??
    [];

  const todayLabel = todayPredictions[0]
    ? formatDay(todayPredictions[0].match.kickoff)
    : formatDay(new Date());

  const list = tab === "today" ? todayPredictions : (data?.predictions ?? []);
  const isSnooping = !!data && data.viewerId !== data.user.id;

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-predictions-title"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-brand-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar"
      />

      <div
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl animate-pop flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 bg-gradient-to-r from-brand-50 to-white px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <Avatar name={userName} image={image} userId={userId} size={52} />
            <div className="min-w-0 flex-1">
              <h2
                id="user-predictions-title"
                className="truncate font-display text-xl font-extrabold text-brand-900"
              >
                {userName}
              </h2>
              {data && (
                <p className="mt-0.5 text-sm text-slate-500">
                  <span className="font-display font-bold text-brand-700">
                    {data.totalPoints}
                  </span>{" "}
                  pontos no total
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Fechar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab("today")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                tab === "today"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Palpites de hoje
              {data && (
                <span className="ml-1.5 text-xs font-normal text-slate-400">
                  ({todayPredictions.length})
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab("history")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                tab === "history"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Histórico completo
              {data && (
                <span className="ml-1.5 text-xs font-normal text-slate-400">
                  ({data.predictions.length})
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              <p className="text-sm">Carregando palpites…</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-600">
              {error}
              <button
                type="button"
                onClick={load}
                className="mt-2 block w-full font-semibold text-red-700 hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && isSnooping && data.scoreBreakdown.length > 0 && (
            <ScoreBreakdown
              userName={userName}
              totalPoints={data.totalPoints}
              breakdown={data.scoreBreakdown}
            />
          )}

          {!loading && !error && isSnooping && data.scoreBreakdown.length === 0 && (
            <div className="mb-4 rounded-2xl border-2 border-dashed border-accent-400 bg-accent-50 p-4">
              <p className="font-display text-lg font-extrabold text-accent-700">
                👀 Veio olhar o quê, seu bobo?
              </p>
              <p className="mt-1 text-sm text-accent-900/80">
                {userName.split(" ")[0]} ainda não pontuou — calma que não tem o que espionar.
              </p>
            </div>
          )}

          {!loading && !error && list.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              {tab === "today"
                ? `${userName.split(" ")[0]} ainda não palpitou nos jogos de hoje.`
                : `${userName.split(" ")[0]} ainda não fez nenhum palpite.`}
            </div>
          )}

          {!loading && !error && list.length > 0 && (
            <div className="space-y-3">
              {tab === "today" && (
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {todayLabel}
                </p>
              )}
              {list.map((p) => (
                <PredictionRow key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
