import { Prisma } from "@prisma/client";
import type { ProviderMatch, ProviderStanding } from "./football/types";
import { getFootballProvider } from "./football";
import { prismaSync as prisma } from "./prisma-sync";
import { calculatePoints } from "./scoring";
import { getRules, getPoolMatchFilter } from "./settings";
import { invalidateAppCache, CACHE_TAGS } from "./revalidate";

// Trava com expiracao — se a Netlify matar a funcao (502), nao fica presa
let syncLockUntil = 0;
const LOCK_MS = 90_000;

function tryAcquireSync() {
  if (Date.now() < syncLockUntil) return false;
  syncLockUntil = Date.now() + LOCK_MS;
  return true;
}

function releaseSync() {
  syncLockUntil = 0;
}

function newId() {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `c${t}${r}`.slice(0, 25);
}

async function bulkUpsertMatches(matches: ProviderMatch[]) {
  if (matches.length === 0) return 0;

  const CHUNK = 50;
  for (let i = 0; i < matches.length; i += CHUNK) {
    const chunk = matches.slice(i, i + CHUNK);
    const rows = chunk.map(
      (m) =>
        Prisma.sql`(
          ${newId()},
          ${m.externalId},
          ${m.competition},
          ${m.stage},
          ${m.groupName},
          ${m.homeTeam},
          ${m.awayTeam},
          ${m.homeCrest},
          ${m.awayCrest},
          ${m.venue},
          ${new Date(m.kickoff)},
          ${Prisma.raw(`'${m.status}'::"MatchStatus"`)},
          ${m.homeScore},
          ${m.awayScore},
          ${m.penaltyWinner ?? null},
          NOW(),
          NOW()
        )`
    );

    await prisma.$executeRaw`
      INSERT INTO "Match" (
        "id", "externalId", "competition", "stage", "groupName",
        "homeTeam", "awayTeam", "homeCrest", "awayCrest", "venue", "kickoff",
        "status", "homeScore", "awayScore", "penaltyWinner", "createdAt", "updatedAt"
      )
      VALUES ${Prisma.join(rows)}
      ON CONFLICT ("externalId") DO UPDATE SET
        "competition" = EXCLUDED."competition",
        "stage" = EXCLUDED."stage",
        "groupName" = EXCLUDED."groupName",
        "homeTeam" = EXCLUDED."homeTeam",
        "awayTeam" = EXCLUDED."awayTeam",
        "homeCrest" = EXCLUDED."homeCrest",
        "awayCrest" = EXCLUDED."awayCrest",
        "venue" = EXCLUDED."venue",
        "kickoff" = EXCLUDED."kickoff",
        "status" = EXCLUDED."status",
        "homeScore" = CASE WHEN "Match"."scoreLocked" THEN "Match"."homeScore" ELSE EXCLUDED."homeScore" END,
        "awayScore" = CASE WHEN "Match"."scoreLocked" THEN "Match"."awayScore" ELSE EXCLUDED."awayScore" END,
        "penaltyWinner" = EXCLUDED."penaltyWinner",
        "updatedAt" = NOW()
    `;
  }

  return matches.length;
}

async function bulkUpsertStandings(standings: ProviderStanding[]) {
  if (standings.length === 0) return 0;

  const CHUNK = 50;
  for (let i = 0; i < standings.length; i += CHUNK) {
    const chunk = standings.slice(i, i + CHUNK);
    const rows = chunk.map((s) => {
      const groupKey = s.groupName ?? "";
      return Prisma.sql`(
        ${newId()},
        ${s.competition},
        ${groupKey},
        ${s.teamName},
        ${s.crest},
        ${s.position},
        ${s.playedGames},
        ${s.won},
        ${s.draw},
        ${s.lost},
        ${s.points},
        ${s.goalsFor},
        ${s.goalsAgainst},
        ${s.goalDifference},
        NOW()
      )`;
    });

    await prisma.$executeRaw`
      INSERT INTO "Standing" (
        "id", "competition", "groupName", "teamName", "crest",
        "position", "playedGames", "won", "draw", "lost", "points",
        "goalsFor", "goalsAgainst", "goalDifference", "updatedAt"
      )
      VALUES ${Prisma.join(rows)}
      ON CONFLICT ("competition", "groupName", "teamName") DO UPDATE SET
        "crest" = EXCLUDED."crest",
        "position" = EXCLUDED."position",
        "playedGames" = EXCLUDED."playedGames",
        "won" = EXCLUDED."won",
        "draw" = EXCLUDED."draw",
        "lost" = EXCLUDED."lost",
        "points" = EXCLUDED."points",
        "goalsFor" = EXCLUDED."goalsFor",
        "goalsAgainst" = EXCLUDED."goalsAgainst",
        "goalDifference" = EXCLUDED."goalDifference",
        "updatedAt" = NOW()
    `;
  }

  return standings.length;
}

async function persistMatches(matches: ProviderMatch[]) {
  return bulkUpsertMatches(matches);
}

async function persistStandings(standings: ProviderStanding[]) {
  return bulkUpsertStandings(standings);
}

export async function syncEverything() {
  const provider = getFootballProvider();
  if (!tryAcquireSync()) {
    return {
      provider: provider.name,
      skipped: true,
      matchesSynced: 0,
      standingsSynced: 0,
      predictionsScored: 0,
    };
  }
  try {
    const [matches, standings] = await Promise.all([
      provider.getMatches(),
      provider.getStandings(),
    ]);

    const [matchesSynced, standingsSynced] = await Promise.all([
      persistMatches(matches),
      persistStandings(standings),
    ]);

    const predictionsScored = await rescoreAllFinishedMatches();
    if (matchesSynced > 0 || predictionsScored > 0) {
      invalidateAppCache();
    }
    return {
      provider: provider.name,
      matchesSynced,
      standingsSynced,
      predictionsScored,
    };
  } finally {
    releaseSync();
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

export async function rescoreAllFinishedMatches() {
  const rules = await getRules();
  const poolFilter = await getPoolMatchFilter();

  const finished = await prisma.match.findMany({
    where: {
      ...poolFilter,
      status: "FINISHED",
      homeScore: { not: null },
      awayScore: { not: null },
    },
    include: { predictions: true },
  });

  const updates = [];
  for (const match of finished) {
    const result = {
      homeScore: match.homeScore as number,
      awayScore: match.awayScore as number,
      penaltyWinner: match.penaltyWinner,
      kickoff: match.kickoff,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
    };
    for (const p of match.predictions) {
      const points = calculatePoints(
        {
          homeScore: p.homeScore,
          awayScore: p.awayScore,
          penaltyGuess: p.penaltyGuess,
        },
        result,
        rules
      );
      if (!p.scored || p.points !== points) {
        updates.push(
          prisma.prediction.update({
            where: { id: p.id },
            data: { points, scored: true },
          })
        );
      }
    }
  }

  if (updates.length === 0) return 0;

  await prisma.$transaction(updates);
  invalidateAppCache([CACHE_TAGS.ranking]);
  return updates.length;
}

/** @deprecated use rescoreAllFinishedMatches */
export async function scoreFinishedMatches() {
  return rescoreAllFinishedMatches();
}

export type SyncStep = "matches" | "standings" | "score";

export async function runSyncStep(step: SyncStep) {
  const provider = getFootballProvider();
  if (step === "matches") {
    return { provider: provider.name, matchesSynced: await syncMatches() };
  }
  if (step === "standings") {
    return { provider: provider.name, standingsSynced: await syncStandings() };
  }
  return { provider: provider.name, predictionsScored: await rescoreAllFinishedMatches() };
}
