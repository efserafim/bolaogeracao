"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatKickoff } from "@/lib/format";
import { getOpponent } from "@/lib/brazil-match";
import { teamAbbrev } from "@/lib/teams";
import { BrazilFlag } from "@/components/BrazilFlag";

export interface BrazilMatchInfo {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string | null;
  awayCrest: string | null;
  venue: string | null;
  kickoff: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function useCountdown(kickoff: string) {
  const [left, setLeft] = useState(() => calcLeft(kickoff));

  useEffect(() => {
    const tick = () => setLeft(calcLeft(kickoff));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [kickoff]);

  return left;
}

function calcLeft(kickoff: string) {
  const diff = new Date(kickoff).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: false };
}

function Fireworks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="firework-particle"
          style={{
            left: `${8 + ((i * 17) % 84)}%`,
            top: `${12 + ((i * 11) % 55)}%`,
            animationDelay: `${(i % 7) * 0.35}s`,
            background:
              i % 3 === 0 ? "#ffaf1f" : i % 3 === 1 ? "#22c55e" : "#ffffff",
          }}
        />
      ))}
      <span className="absolute left-[8%] top-2 text-lg opacity-80">🎆</span>
      <span className="absolute right-[10%] top-3 text-lg opacity-80">🎇</span>
      <span className="absolute bottom-2 left-[42%] text-base opacity-70">✨</span>
    </div>
  );
}

function CountdownBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[52px] flex-col items-center rounded-xl bg-black/25 px-2 py-1.5 backdrop-blur-sm">
      <span className="font-display text-xl font-extrabold leading-none text-white sm:text-2xl">
        {value}
      </span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-100/90">
        {label}
      </span>
    </div>
  );
}

function LiveBadge() {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-600/90 px-4 py-2 shadow-lg backdrop-blur-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
      </span>
      <span className="font-display text-sm font-extrabold uppercase tracking-wider text-white sm:text-base">
        Ao vivo
      </span>
    </div>
  );
}

export function BrazilCountdown({
  type,
  match,
}: {
  type: "upcoming" | "live";
  match: BrazilMatchInfo;
}) {
  const { opponent, brazilIsHome } = getOpponent(match.homeTeam, match.awayTeam);
  const left = useCountdown(match.kickoff);
  const urgent = !left.done && left.days === 0 && left.hours < 24;
  const isLive = type === "live" || (type === "upcoming" && left.done);

  return (
    <section className="relative overflow-hidden border-b border-green-700/30 bg-gradient-to-r from-green-700 via-green-600 to-yellow-500">
      <Fireworks />
      <div className="container-app relative z-10 flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
            <BrazilFlag className="h-5 w-7 sm:h-6 sm:w-8" />
            {isLive ? (
              <span className="animate-pulse">Brasil em campo agora!</span>
            ) : urgent ? (
              <span>É hoje! Vai ter Brasil na Copa!</span>
            ) : (
              <span>Contagem para o jogo do Brasil!</span>
            )}
            <span className="text-lg">🎆</span>
          </p>
          <p className="mt-1 text-sm font-medium text-green-50">
            {isLive ? (
              <>
                {teamAbbrev(match.homeTeam)} × {teamAbbrev(match.awayTeam)} — ao
                vivo
              </>
            ) : (
              <>
                Brasil × {teamAbbrev(opponent)} ·{" "}
                {brazilIsHome ? "em casa" : "fora"} ·{" "}
                {formatKickoff(match.kickoff)}
                {match.venue && (
                  <>
                    {" "}
                    · 📍 {match.venue}
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {!isLive && !left.done && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {left.days > 0 && (
              <CountdownBox value={pad(left.days)} label="dias" />
            )}
            <CountdownBox value={pad(left.hours)} label="horas" />
            <CountdownBox value={pad(left.minutes)} label="min" />
            <CountdownBox value={pad(left.seconds)} label="seg" />
            <Link
              href="/palpites"
              className="ml-1 shrink-0 rounded-xl bg-yellow-400 px-3 py-2 text-xs font-bold text-green-900 shadow hover:bg-yellow-300 sm:text-sm"
            >
              Palpitar ⚽
            </Link>
          </div>
        )}

        {isLive && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <LiveBadge />
            <Link
              href="/jogos"
              className="shrink-0 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-green-900 shadow hover:bg-yellow-300"
            >
              Ver jogo
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
