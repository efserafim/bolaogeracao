import type { ProviderMatch, ProviderStanding } from "./football/types";
import { getFootballProvider } from "./football";
import { prisma } from "./prisma";
import { calculatePoints } from "./scoring";
import { getRules, getPoolMatchFilter } from "./settings";

// Trava simples para evitar sincronizacoes simultaneas (cron + auto-sync + admin)
let syncing = false;

async function runInChunks(ops: any[], chunkSize = 100) {
  if (ops.length === 0) return;
  for (let i = 0; i < ops.length; i += chunkSize) {
    await prisma.$transaction(ops.slice(i, i + chunkSize));
  }
}

function buildMatchOps(matches: ProviderMatch[]) {
  return matches.map((m) =>
    prisma.match.upsert({
      where: { externalId: m.externalId },
      create: {
        externalId: m.externalId,
        competition: m.competition,
        stage: m.stage ?? null,
        groupName: m.groupName ?? null,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeCrest: m.homeCrest ?? null,
        awayCrest: m.awayCrest ?? null,
        kickoff: new Date(m.kickoff),
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
      },
      update: {
        stage: m.stage ?? null,
        groupName: m.groupName ?? null,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeCrest: m.homeCrest ?? null,
        awayCrest: m.awayCrest ?? null,
        kickoff: new Date(m.kickoff),
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
      },
    })
  );
}

function buildStandingOps(standings: ProviderStanding[]) {
  return standings.map((s) =>
    prisma.standing.upsert({
      where: {
        competition_groupName_teamName: {
          competition: s.competition,
          groupName: s.groupName ?? "",
          teamName: s.teamName,
        },
      },
      create: {
        competition: s.competition,
        groupName: s.groupName ?? null,
        teamName: s.teamName,
        crest: s.crest ?? null,
        position: s.position,
        playedGames: s.playedGames,
        won: s.won,
        draw: s.draw,
        lost: s.lost,
        points: s.points,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
      },
      update: {
        crest: s.crest ?? null,
        position: s.position,
        playedGames: s.playedGames,
        won: s.won,
        draw: s.draw,
        lost: s.lost,
        points: s.points,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
      },
    })
  );
}

async function persistMatches(matches: ProviderMatch[]) {
  await runInChunks(buildMatchOps(matches));
  return matches.length;
}

async function persistStandings(standings: ProviderStanding[]) {
  await runInChunks(buildStandingOps(standings));
  return standings.length;
}

export async function syncEverything() {
  const provider = getFootballProvider();
  if (syncing) {
    return {
      provider: provider.name,
      skipped: true,
      matchesSynced: 0,
      standingsSynced: 0,
      predictionsScored: 0,
    };
  }
  syncing = true;
  try {
    const [matches, standings] = await Promise.all([
      provider.getMatches(),
      provider.getStandings(),
    ]);

    const [matchesSynced, standingsSynced] = await Promise.all([
      persistMatches(matches),
      persistStandings(standings),
    ]);

    const scored = await scoreFinishedMatches();
    return {
      provider: provider.name,
      matchesSynced,
      standingsSynced,
      predictionsScored: scored,
    };
  } finally {
    syncing = false;
  }
}

export async function syncMatches() {
  const provider = getFootballProvider();
  const matches = await provider.getMatches();
  return persistMatches(matches);
}

export async function syncStandings() {
  const provider = getFootballProvider();
  const standings = await provider.getStandings();
  return persistStandings(standings);
}

export async function scoreFinishedMatches() {
  const rules = await getRules();
  const poolFilter = await getPoolMatchFilter();

  const finished = await prisma.match.findMany({
    where: {
      ...poolFilter,
      status: "FINISHED",
      homeScore: { not: null },
      awayScore: { not: null },
      predictions: { some: { scored: false } },
    },
    include: {
      predictions: {
        where: { scored: false },
      },
    },
  });

  const updates: any[] = [];
  for (const match of finished) {
    const result = {
      homeScore: match.homeScore as number,
      awayScore: match.awayScore as number,
    };
    for (const p of match.predictions) {
      const points = calculatePoints(
        { homeScore: p.homeScore, awayScore: p.awayScore },
        result,
        rules
      );
      updates.push(
        prisma.prediction.update({
          where: { id: p.id },
          data: { points, scored: true },
        })
      );
    }
  }

  await runInChunks(updates);
  return updates.length;
}
