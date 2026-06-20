import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import type { ScoreRules } from "./scoring";
import { CACHE_TAGS, invalidateAppCache } from "./revalidate";

type SettingsRow = NonNullable<Awaited<ReturnType<typeof prisma.settings.findUnique>>>;

function normalizeSettings(settings: SettingsRow): SettingsRow {
  return {
    ...settings,
    poolStartsAt: settings.poolStartsAt
      ? new Date(settings.poolStartsAt as string | Date)
      : null,
  };
}

async function loadSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "singleton" } });
  }
  return normalizeSettings(settings);
}

const getSettingsCached = unstable_cache(loadSettings, ["settings-singleton"], {
  revalidate: 60,
  tags: [CACHE_TAGS.settings],
});

/** Configuracoes globais (cache de 60s entre requisicoes). */
export const getSettings = cache(async () =>
  normalizeSettings(await getSettingsCached())
);

export function clearSettingsCache() {
  invalidateAppCache([CACHE_TAGS.settings, CACHE_TAGS.ranking]);
}

export async function getRules(): Promise<ScoreRules> {
  const s = await getSettings();
  return {
    pointsExact: s.pointsExact,
    pointsResult: s.pointsResult,
    pointsGoalDiff: s.pointsGoalDiff,
  };
}

/**
 * Clausula de filtro para considerar apenas jogos do bolao
 * (a partir de poolStartsAt, quando definido).
 */
export async function getPoolMatchFilter(): Promise<{
  kickoff?: { gte: Date };
}> {
  const s = await getSettings();
  return s.poolStartsAt ? { kickoff: { gte: s.poolStartsAt } } : {};
}
