"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "./Avatar";
import { TeamFlag } from "./TeamFlag";
import { MatchVenue } from "./MatchVenue";
import { StatusBadge } from "./PageHeader";
import { dayKey, formatDay } from "@/lib/format";

type PredictionMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string | null;
  awayCrest: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  kickoff: string;
  venue: string | null;
};

type Prediction = {
  id: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  scored: boolean;
  match: PredictionMatch;
};

type UserPredictionsData = {
  user: { id: string; name: string };
  totalPoints: number;
  todayKey: string;
  predictions: Prediction[];
};

type Tab = "today" | "history";

function PredictionRow({ p }: { p: Prediction }) {
  const m = p.match;
  const finished = m.status === "FINISHED";

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
        </div>
        <div className="text-center">
          <p className="text-[11px] uppercase text-slate-400">Resultado</p>
          <p className="font-display font-bold text-slate-800">
            {finished ? `${m.homeScore}×${m.awayScore}` : "—"}
          </p>
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
