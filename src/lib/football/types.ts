export type ProviderMatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "FINISHED"
  | "POSTPONED";

export interface ProviderMatch {
  externalId: string;
  competition: string;
  stage?: string | null;
  groupName?: string | null;
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string | null;
  awayCrest?: string | null;
  kickoff: string;
  status: ProviderMatchStatus;
  homeScore: number | null;
  awayScore: number | null;
}

export interface ProviderStanding {
  competition: string;
  groupName?: string | null;
  teamName: string;
  crest?: string | null;
  position: number;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface FootballProvider {
  name: string;
  getMatches(): Promise<ProviderMatch[]>;
  getStandings(): Promise<ProviderStanding[]>;
}
