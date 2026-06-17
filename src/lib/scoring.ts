export type ScoreRules = {
  pointsExact: number;
  pointsResult: number;
  pointsGoalDiff: number;
};

export const DEFAULT_RULES: ScoreRules = {
  pointsExact: 5,
  pointsResult: 3,
  pointsGoalDiff: 1,
};

type Outcome = "HOME" | "AWAY" | "DRAW";

function outcome(home: number, away: number): Outcome {
  if (home > away) return "HOME";
  if (home < away) return "AWAY";
  return "DRAW";
}

export function calculatePoints(
  prediction: { homeScore: number; awayScore: number },
  result: { homeScore: number; awayScore: number },
  rules: ScoreRules = DEFAULT_RULES
): number {
  if (
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore
  ) {
    return rules.pointsExact;
  }

  const predOutcome = outcome(prediction.homeScore, prediction.awayScore);
  const realOutcome = outcome(result.homeScore, result.awayScore);

  if (predOutcome === realOutcome) {
    return rules.pointsResult;
  }

  // Saldo de gols: acertou a margem (ex: diferenca de 1 gol), mas errou o
  // vencedor. Ex.: resultado 2x1 e palpite 1x2 -> 1 ponto.
  const predDiff = Math.abs(prediction.homeScore - prediction.awayScore);
  const realDiff = Math.abs(result.homeScore - result.awayScore);
  if (predDiff === realDiff) {
    return rules.pointsGoalDiff;
  }

  return 0;
}
