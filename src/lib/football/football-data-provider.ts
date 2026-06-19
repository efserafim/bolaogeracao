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
    return matches.map((m) => ({
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
      status: mapStatus(m.status),
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
    }));
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
