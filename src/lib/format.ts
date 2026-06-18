const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

const dayFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "long",
  day: "2-digit",
  month: "long",
});

export function formatKickoff(date: Date | string) {
  return dateFmt.format(new Date(date));
}

export function formatTime(date: Date | string) {
  return timeFmt.format(new Date(date));
}

export function formatDay(date: Date | string) {
  const label = dayFmt.format(new Date(date));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Chave YYYY-MM-DD no fuso de Brasilia para agrupar jogos por dia. */
export function dayKey(date: Date | string) {
  return new Date(date).toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "Fase de grupos",
  LAST_32: "32 avos de final",
  LAST_16: "Oitavas de final",
  QUARTER_FINALS: "Quartas de final",
  SEMI_FINALS: "Semifinais",
  THIRD_PLACE: "Disputa do 3º lugar",
  FINAL: "Final",
  PLAYOFF_ROUND_1: "Repescagem",
  PLAYOFF_ROUND_2: "Repescagem",
  QUALIFICATION: "Eliminatórias",
};

function formatGroup(groupName: string) {
  const match = groupName.match(/^GROUP_([A-Z]+)$/i);
  if (match) return `Grupo ${match[1].toUpperCase()}`;
  return groupName.replace(/_/g, " ");
}

function formatStage(stage: string) {
  return STAGE_LABELS[stage] ?? stage.replace(/_/g, " ").toLowerCase();
}

/** Rótulo legível para fase/grupo do jogo (ex.: "Grupo A · Fase de grupos"). */
export function formatMatchMeta(
  stage: string | null | undefined,
  groupName?: string | null,
  competition?: string | null
) {
  const parts: string[] = [];
  if (groupName) parts.push(formatGroup(groupName));
  if (stage && !(groupName && stage === "GROUP_STAGE")) {
    parts.push(formatStage(stage));
  }
  if (parts.length > 0) return parts.join(" · ");
  if (competition) return competition.replace(/_/g, " ");
  return "Copa do Mundo";
}
