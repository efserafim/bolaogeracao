import type {
  FootballProvider,
  ProviderMatch,
  ProviderMatchStatus,
  ProviderStanding,
} from "./types";

const BASE = "https://api.football-data.org/v4";

function mapStatus(status: string): ProviderMatchStatus {
  switch (status) {
    case "IN_PLAY":
    case "PAUSED":
      return "LIVE";
    case "FINISHED":
      return "FINISHED";
    case "POSTPONED":
    case "SUSPENDED":
    case "CANCELLED":
      return "POSTPONED";
    default:
      return "SCHEDULED";
  }
}

type ScoreBlock = {
  home?: number | null;
  away?: number | null;
  homeTeam?: number | null;
  awayTeam?: number | null;
} | null | undefined;

function readScoreBlock(block: ScoreBlock): {
  homeScore: number | null;
  awayScore: number | null;
} | null {
  if (!block) return null;
  const home = block.home ?? block.homeTeam ?? null;
  const away = block.away ?? block.awayTeam ?? null;
  if (home === null && away === null) return null;
  return { homeScore: home ?? 0, awayScore: away ?? 0 };
}

/** Placar atual: regularTime durante o jogo; fullTime ao encerrar. */
function extractScores(
  score: Record<string, ScoreBlock> | null | undefined,
  status: ProviderMatchStatus
) {
  if (!score) return { homeScore: null, awayScore: null };

  const blocks =
    status === "FINISHED"
      ? [score.fullTime, score.regularTime, score.halfTime]
      : [score.regularTime, score.fullTime, score.halfTime, score.extraTime];

  for (const block of blocks) {
    const parsed = readScoreBlock(block);
    if (parsed) return parsed;
  }

  return { homeScore: null, awayScore: null };
}

export class FootballDataProvider implements FootballProvider {
  name = "api";
  private token: string;
  private competition: string;

  constructor(token: string, competition = "WC") {
    this.token = token;
    this.competition = competition;
  }

  private async request<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "X-Auth-Token": this.token },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(
        `football-data.org respondeu ${res.status}: ${await res.text()}`
      );
    }
    return res.json() as Promise<T>;
  }

  async getMatches(): Promise<ProviderMatch[]> {
    const data = await this.request<any>(
      `/competitions/${this.competition}/matches`
    );
    const matches: any[] = data.matches ?? [];
    return matches.map((m) => {
      const status = mapStatus(m.status);
      const { homeScore, awayScore } = extractScores(m.score, status);
      return {
      externalId: String(m.id),
      competition: data.competition?.name ?? "Copa do Mundo",
      stage: m.stage ?? null,
      groupName: m.group ?? null,
      homeTeam: m.homeTeam?.name ?? "A definir",
      awayTeam: m.awayTeam?.name ?? "A definir",
      homeCrest: m.homeTeam?.crest ?? null,
      awayCrest: m.awayTeam?.crest ?? null,
      venue: m.venue ?? null,
      kickoff: m.utcDate,
      status,
      homeScore,
      awayScore,
    };
    });
  }

  async getStandings(): Promise<ProviderStanding[]> {
    const data = await this.request<any>(
      `/competitions/${this.competition}/standings`
    );
    const result: ProviderStanding[] = [];
    const competition = data.competition?.name ?? "Copa do Mundo";
    for (const block of data.standings ?? []) {
      if (block.type && block.type !== "TOTAL") continue;
      for (const row of block.table ?? []) {
        result.push({
          competition,
          groupName: block.group ?? null,
          teamName: row.team?.name ?? "—",
          crest: row.team?.crest ?? null,
          position: row.position,
          playedGames: row.playedGames ?? 0,
          won: row.won ?? 0,
          draw: row.draw ?? 0,
          lost: row.lost ?? 0,
          points: row.points ?? 0,
          goalsFor: row.goalsFor ?? 0,
          goalsAgainst: row.goalsAgainst ?? 0,
          goalDifference: row.goalDifference ?? 0,
        });
      }
    }
    return result;
  }
}
