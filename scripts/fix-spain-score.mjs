import { PrismaClient } from "@prisma/client";

function calculatePoints(prediction, result, rules = { pointsExact: 5, pointsResult: 3, pointsGoalDiff: 1 }) {
  if (prediction.homeScore === result.homeScore && prediction.awayScore === result.awayScore) {
    return rules.pointsExact;
  }
  const outcome = (h, a) => (h > a ? "HOME" : h < a ? "AWAY" : "DRAW");
  if (outcome(prediction.homeScore, prediction.awayScore) === outcome(result.homeScore, result.awayScore)) {
    return rules.pointsResult;
  }
  const predDiff = Math.abs(prediction.homeScore - prediction.awayScore);
  const realDiff = Math.abs(result.homeScore - result.awayScore);
  if (predDiff === realDiff) return rules.pointsGoalDiff;
  return 0;
}

const prisma = new PrismaClient();

const match = await prisma.match.findFirst({
  where: { externalId: "537371" },
  include: { predictions: { include: { user: { select: { name: true } } } } },
});

if (!match) {
  console.error("Jogo Espanha x Arabia nao encontrado.");
  process.exit(1);
}

console.log("Antes:", `${match.homeScore}x${match.awayScore}`, "locked=", match.scoreLocked);

await prisma.match.update({
  where: { id: match.id },
  data: { homeScore: 4, awayScore: 0, scoreLocked: true, status: "FINISHED" },
});

const result = { homeScore: 4, awayScore: 0 };
let changed = 0;

for (const p of match.predictions) {
  const points = calculatePoints(
    { homeScore: p.homeScore, awayScore: p.awayScore },
    result
  );
  if (p.points !== points) {
    console.log(`${p.user.name}: ${p.homeScore}x${p.awayScore} ${p.points} -> ${points} pts`);
    changed++;
  }
  await prisma.prediction.update({
    where: { id: p.id },
    data: { points, scored: true },
  });
}

console.log(`\nPlacar corrigido para 4x0 (travado). ${changed} palpite(s) repontuado(s).`);
await prisma.$disconnect();
