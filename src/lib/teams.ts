/** Códigos FIFA de 3 letras para nomes vindos da football-data.org (inglês). */
const TEAM_CODES: Record<string, string> = {
  Brazil: "BRA",
  Argentina: "ARG",
  Uruguay: "URU",
  Colombia: "COL",
  Chile: "CHI",
  Peru: "PER",
  Ecuador: "ECU",
  Paraguay: "PAR",
  Bolivia: "BOL",
  Venezuela: "VEN",
  Mexico: "MEX",
  "United States": "USA",
  Canada: "CAN",
  "Costa Rica": "CRC",
  Panama: "PAN",
  Jamaica: "JAM",
  Honduras: "HON",
  "El Salvador": "SLV",
  Guatemala: "GUA",
  Haiti: "HAI",
  "Trinidad and Tobago": "TRI",
  France: "FRA",
  Germany: "GER",
  Spain: "ESP",
  Italy: "ITA",
  England: "ENG",
  Netherlands: "NED",
  Belgium: "BEL",
  Portugal: "POR",
  Croatia: "CRO",
  Switzerland: "SUI",
  Poland: "POL",
  Sweden: "SWE",
  Denmark: "DEN",
  Austria: "AUT",
  "Czech Republic": "CZE",
  Ukraine: "UKR",
  Serbia: "SRB",
  Wales: "WAL",
  Scotland: "SCO",
  Turkey: "TUR",
  Greece: "GRE",
  Romania: "ROU",
  Hungary: "HUN",
  Slovakia: "SVK",
  Slovenia: "SVN",
  Ireland: "IRL",
  "Northern Ireland": "NIR",
  Morocco: "MAR",
  Senegal: "SEN",
  Ghana: "GHA",
  Nigeria: "NGA",
  Cameroon: "CMR",
  "Ivory Coast": "CIV",
  "Côte d'Ivoire": "CIV",
  Egypt: "EGY",
  Tunisia: "TUN",
  Algeria: "ALG",
  "South Africa": "RSA",
  Kenya: "KEN",
  Mali: "MLI",
  Japan: "JPN",
  "Korea Republic": "KOR",
  "South Korea": "KOR",
  "Korea DPR": "PRK",
  China: "CHN",
  Australia: "AUS",
  "Saudi Arabia": "KSA",
  Iran: "IRN",
  Iraq: "IRQ",
  Qatar: "QAT",
  "United Arab Emirates": "UAE",
  Uzbekistan: "UZB",
  Jordan: "JOR",
  Oman: "OMA",
  Bahrain: "BHR",
  India: "IND",
  Indonesia: "IDN",
  Thailand: "THA",
  Vietnam: "VIE",
  "New Zealand": "NZL",
  Curacao: "CUW",
  Curaçao: "CUW",
  Suriname: "SUR",
};

export function teamAbbrev(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "A definir") return "—";

  if (TEAM_CODES[trimmed]) return TEAM_CODES[trimmed];

  const key = Object.keys(TEAM_CODES).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase()
  );
  if (key) return TEAM_CODES[key];

  const letters = trimmed.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters.length >= 3) return letters.slice(0, 3).toUpperCase();
  return trimmed.slice(0, 3).toUpperCase();
}

export function isBrazilTeam(name: string): boolean {
  const n = name.trim().toLowerCase();
  return n === "brazil" || n === "brasil";
}
