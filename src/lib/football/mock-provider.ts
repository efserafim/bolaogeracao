import type {
  FootballProvider,
  ProviderMatch,
  ProviderStanding,
} from "./types";

function crest(name: string) {
  const codes: Record<string, string> = {
    Brasil: "br",
    Argentina: "ar",
    França: "fr",
    Inglaterra: "gb-eng",
    Espanha: "es",
    Portugal: "pt",
    Alemanha: "de",
    Holanda: "nl",
    Croácia: "hr",
    Uruguai: "uy",
    Bélgica: "be",
    Marrocos: "ma",
    Japão: "jp",
    "Estados Unidos": "us",
    México: "mx",
    Senegal: "sn",
  };
  const code = codes[name];
  return code ? `https://flagcdn.com/w80/${code}.png` : null;
}

function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 60 * 60 * 1000).toISOString();
}

const TEAMS_GROUPS: Record<string, string[]> = {
  "Grupo A": ["Brasil", "Senegal", "México", "Croácia"],
  "Grupo B": ["Argentina", "Marrocos", "Japão", "Holanda"],
};

function buildMatches(): ProviderMatch[] {
  const matches: ProviderMatch[] = [];
  let id = 1;

  const make = (
    home: string,
    away: string,
    group: string,
    kickoff: string,
    status: ProviderMatch["status"],
    hs: number | null,
    as: number | null
  ): ProviderMatch => ({
    externalId: `mock-${id++}`,
    competition: "Copa do Mundo",
    stage: "Fase de Grupos",
    groupName: group,
    homeTeam: home,
    awayTeam: away,
    homeCrest: crest(home),
    awayCrest: crest(away),
    kickoff,
    status,
    homeScore: hs,
    awayScore: as,
  });

  matches.push(make("Brasil", "Senegal", "Grupo A", hoursFromNow(-72), "FINISHED", 3, 1));
  matches.push(make("México", "Croácia", "Grupo A", hoursFromNow(-48), "FINISHED", 0, 0));
  matches.push(make("Argentina", "Marrocos", "Grupo B", hoursFromNow(-46), "FINISHED", 2, 2));
  matches.push(make("Japão", "Holanda", "Grupo B", hoursFromNow(-24), "FINISHED", 1, 2));

  matches.push(make("Brasil", "México", "Grupo A", hoursFromNow(-1), "LIVE", 1, 0));

  matches.push(make("Senegal", "Croácia", "Grupo A", hoursFromNow(3), "SCHEDULED", null, null));
  matches.push(make("Argentina", "Japão", "Grupo B", hoursFromNow(6), "SCHEDULED", null, null));
  matches.push(make("Marrocos", "Holanda", "Grupo B", hoursFromNow(27), "SCHEDULED", null, null));
  matches.push(make("Brasil", "Croácia", "Grupo A", hoursFromNow(50), "SCHEDULED", null, null));
  matches.push(make("Senegal", "México", "Grupo A", hoursFromNow(54), "SCHEDULED", null, null));
  matches.push(make("Argentina", "Holanda", "Grupo B", hoursFromNow(74), "SCHEDULED", null, null));
  matches.push(make("Japão", "Marrocos", "Grupo B", hoursFromNow(78), "SCHEDULED", null, null));

  return matches;
}

function buildStandings(): ProviderStanding[] {
  const standings: ProviderStanding[] = [];
  for (const [group, teams] of Object.entries(TEAMS_GROUPS)) {
    teams.forEach((team, i) => {
      standings.push({
        competition: "Copa do Mundo",
        groupName: group,
        teamName: team,
        crest: crest(team),
        position: i + 1,
        playedGames: 2,
        won: Math.max(0, 2 - i),
        draw: i === 1 ? 1 : 0,
        lost: i >= 2 ? i - 1 : 0,
        points: Math.max(0, 6 - i * 2),
        goalsFor: 5 - i,
        goalsAgainst: i,
        goalDifference: 5 - i - i,
      });
    });
  }
  return standings;
}

export class MockProvider implements FootballProvider {
  name = "mock";

  async getMatches(): Promise<ProviderMatch[]> {
    return buildMatches();
  }

  async getStandings(): Promise<ProviderStanding[]> {
    return buildStandings();
  }
}
