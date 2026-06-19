import { dayKey } from "./format";
import { prisma } from "./prisma";
import { isBrazilTeam } from "./teams";

function brazilWhere() {
  return {
    OR: [
      { homeTeam: { equals: "Brazil", mode: "insensitive" as const } },
      { awayTeam: { equals: "Brazil", mode: "insensitive" as const } },
      { homeTeam: { equals: "Brasil", mode: "insensitive" as const } },
      { awayTeam: { equals: "Brasil", mode: "insensitive" as const } },
    ],
  };
}

function toMatchInfo(match: {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string | null;
  awayCrest: string | null;
  venue: string | null;
  kickoff: Date;
}) {
  return {
    id: match.id,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeCrest: match.homeCrest,
    awayCrest: match.awayCrest,
    venue: match.venue,
    kickoff: match.kickoff.toISOString(),
  };
}

export async function getBrazilMatchHighlight() {
  const now = new Date();

  const live = await prisma.match.findFirst({
    where: { status: "LIVE", ...brazilWhere() },
    orderBy: { kickoff: "asc" },
  });
  if (live) {
    return { type: "live" as const, match: toMatchInfo(live) };
  }

  const startedToday = await prisma.match.findFirst({
    where: {
      ...brazilWhere(),
      status: { not: "FINISHED" },
      kickoff: { lte: now },
    },
    orderBy: { kickoff: "desc" },
  });
  if (startedToday && isBrazilGameToday(startedToday.kickoff)) {
    return { type: "live" as const, match: toMatchInfo(startedToday) };
  }

  const next = await prisma.match.findFirst({
    where: {
      status: "SCHEDULED",
      kickoff: { gt: now },
      ...brazilWhere(),
    },
    orderBy: { kickoff: "asc" },
  });

  if (!next) return null;

  // Contagem e comemoracao so no dia do jogo (a partir de 00h em Brasilia).
  if (!isBrazilGameToday(next.kickoff)) return null;

  return {
    type: "upcoming" as const,
    match: toMatchInfo(next),
  };
}

export function isBrazilGameToday(kickoff: string | Date): boolean {
  return dayKey(new Date()) === dayKey(kickoff);
}

export function getOpponent(
  homeTeam: string,
  awayTeam: string
): { brazilIsHome: boolean; opponent: string } {
  const brazilIsHome = isBrazilTeam(homeTeam);
  return {
    brazilIsHome,
    opponent: brazilIsHome ? awayTeam : homeTeam,
  };
}
