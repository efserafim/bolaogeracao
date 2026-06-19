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

export async function getBrazilMatchHighlight() {
  const now = new Date();

  const live = await prisma.match.findFirst({
    where: { status: "LIVE", ...brazilWhere() },
    orderBy: { kickoff: "asc" },
  });
  if (live) {
    return {
      type: "live" as const,
      match: {
        id: live.id,
        homeTeam: live.homeTeam,
        awayTeam: live.awayTeam,
        homeCrest: live.homeCrest,
        awayCrest: live.awayCrest,
        kickoff: live.kickoff.toISOString(),
      },
    };
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

  return {
    type: "upcoming" as const,
    match: {
      id: next.id,
      homeTeam: next.homeTeam,
      awayTeam: next.awayTeam,
      homeCrest: next.homeCrest,
      awayCrest: next.awayCrest,
      kickoff: next.kickoff.toISOString(),
    },
  };
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
