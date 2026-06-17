import { prisma } from "./prisma";
import type { ScoreRules } from "./scoring";

type SettingsRow = Awaited<ReturnType<typeof prisma.settings.findUnique>>;

// Cache em memoria das configuracoes (mudam raramente). Evita 1 consulta
// ao banco em cada pagina, reduzindo a latencia com o banco remoto.
const SETTINGS_TTL_MS = 15000;
let settingsCache: { value: NonNullable<SettingsRow>; at: number } | null = null;

export function clearSettingsCache() {
  settingsCache = null;
}

export async function getSettings() {
  if (settingsCache && Date.now() - settingsCache.at < SETTINGS_TTL_MS) {
    return settingsCache.value;
  }
  let settings = await prisma.settings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "singleton" } });
  }
  settingsCache = { value: settings, at: Date.now() };
  return settings;
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
