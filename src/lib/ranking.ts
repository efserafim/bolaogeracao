import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { getSettings } from "./settings";
import { CACHE_TAGS } from "./revalidate";

export interface RankingRow {
  userId: string;
  name: string;
  image: string | null;
  totalPoints: number;
  predictions: number;
  scored: number;
  exact: number;
  position: number;
}

async function loadRanking(): Promise<RankingRow[]> {
  const [users, settings] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        image: true,
        predictions: { select: { points: true, scored: true } },
      },
    }),
    getSettings(),
  ]);

  const exactPoints = settings.pointsExact;

  const rows = users.map((u) => {
    const totalPoints = u.predictions.reduce(
      (sum, p) => sum + (p.points ?? 0),
      0
    );
    const scored = u.predictions.filter((p) => p.scored).length;
    const exact = exactPoints
      ? u.predictions.filter((p) => p.scored && p.points === exactPoints).length
      : 0;
    return {
      userId: u.id,
      name: u.name,
      image: u.image,
      totalPoints,
      predictions: u.predictions.length,
      scored,
      exact,
      position: 0,
    };
  });

  rows.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exact !== a.exact) return b.exact - a.exact;
    return a.name.localeCompare(b.name);
  });

  rows.forEach((r, i) => (r.position = i + 1));
  return rows;
}

const getRankingCached = unstable_cache(loadRanking, ["ranking-all"], {
  revalidate: 30,
  tags: [CACHE_TAGS.ranking],
});

/** Ranking completo (cache de 30s entre requisicoes). */
export const getRanking = cache(getRankingCached);
