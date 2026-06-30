export type ScoreRules = {
  pointsExact: number;
  pointsResult: number;
  pointsGoalDiff: number;
};

export type PenaltyWinner = "HOME" | "AWAY";

const PENALTY_WINNER_BONUS = 2;
const PENALTY_REWARD_BONUS = 2;
const PENALTY_REWARD_DAY_KEY = "2026-06-29";

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

function dayKey(date: Date | string) {
  return new Date(date).toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

function isYesterdayPenaltyRewardMatch(kickoff?: Date | string | null) {
  return kickoff ? dayKey(kickoff) === PENALTY_REWARD_DAY_KEY : false;
}

function calculateBasePoints(
  prediction: { homeScore: number; awayScore: number },
  result: { homeScore: number; awayScore: number },
  rules: ScoreRules
) {
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

function calculatePenaltyBonus(
  prediction: { penaltyGuess?: PenaltyWinner | string | null },
  result: {
    penaltyWinner?: PenaltyWinner | string | null;
    kickoff?: Date | string | null;
  }
) {
  if (!result.penaltyWinner) return 0;

  let bonus = 0;
  if (prediction.penaltyGuess === result.penaltyWinner) {
    bonus += PENALTY_WINNER_BONUS;
  }
  if (isYesterdayPenaltyRewardMatch(result.kickoff)) {
    bonus += PENALTY_REWARD_BONUS;
  }
  return bonus;
}

export function calculatePoints(
  prediction: {
    homeScore: number;
    awayScore: number;
    penaltyGuess?: PenaltyWinner | string | null;
  },
  result: {
    homeScore: number;
    awayScore: number;
    penaltyWinner?: PenaltyWinner | string | null;
    kickoff?: Date | string | null;
  },
  rules: ScoreRules = DEFAULT_RULES
): number {
  return (
    calculateBasePoints(prediction, result, rules) +
    calculatePenaltyBonus(prediction, result)
  );
}

export function describePoints(
  prediction: {
    homeScore: number;
    awayScore: number;
    penaltyGuess?: PenaltyWinner | string | null;
  },
  result: {
    homeScore: number;
    awayScore: number;
    penaltyWinner?: PenaltyWinner | string | null;
    kickoff?: Date | string | null;
  },
  rules: ScoreRules = DEFAULT_RULES
): { points: number; reason: string } {
  const points = calculatePoints(prediction, result, rules);
  const basePoints = calculateBasePoints(prediction, result, rules);

  const reasons: string[] = [];
  if (basePoints === rules.pointsExact) {
    reasons.push("Placar exato");
  } else if (basePoints === rules.pointsResult) {
    reasons.push("Acertou o resultado");
  } else if (basePoints === rules.pointsGoalDiff) {
    reasons.push("Acertou o saldo de gols");
  } else {
    reasons.push("Errou o palpite");
  }

  if (result.penaltyWinner && prediction.penaltyGuess === result.penaltyWinner) {
    reasons.push("+2 vencedor nos penaltis");
  }
  if (result.penaltyWinner && isYesterdayPenaltyRewardMatch(result.kickoff)) {
    reasons.push("+2 recompensa penaltis de ontem");
  }

  return { points, reason: reasons.join(" · ") };
}
