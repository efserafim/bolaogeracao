import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/format";
import { describePoints } from "@/lib/scoring";
import { getRules } from "@/lib/settings";
import { teamDisplayName } from "@/lib/teams";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, role: true },
  });

  if (!target || target.role !== "USER") {
    return NextResponse.json({ error: "Participante não encontrado" }, { status: 404 });
  }

  const [predictions, rules] = await Promise.all([
    prisma.prediction.findMany({
      where: { userId: params.id },
      include: { match: true },
      orderBy: { match: { kickoff: "desc" } },
    }),
    getRules(),
  ]);

  const today = dayKey(new Date());
  const totalPoints = predictions.reduce((s, p) => s + (p.points ?? 0), 0);

  const scoreBreakdown = predictions
    .filter(
      (p) =>
        p.scored &&
        p.match.status === "FINISHED" &&
        p.match.homeScore !== null &&
        p.match.awayScore !== null
    )
    .map((p) => {
      const result = {
        homeScore: p.match.homeScore as number,
        awayScore: p.match.awayScore as number,
        penaltyWinner: p.match.penaltyWinner,
        kickoff: p.match.kickoff,
      };
      const { points, reason } = describePoints(
        {
          homeScore: p.homeScore,
          awayScore: p.awayScore,
          penaltyGuess: p.penaltyGuess,
        },
        result,
        rules
      );
      return {
        matchLabel: `${teamDisplayName(p.match.homeTeam)} × ${teamDisplayName(p.match.awayTeam)}`,
        palpite: `${p.homeScore}×${p.awayScore}`,
        result: `${result.homeScore}×${result.awayScore}`,
        points,
        reason,
        kickoff: p.match.kickoff.toISOString(),
      };
    })
    .sort(
      (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
    );

  return NextResponse.json({
    viewerId: me.id,
    user: { id: target.id, name: target.name },
    totalPoints,
    todayKey: today,
    rules,
    scoreBreakdown,
    predictions: predictions.map((p) => ({
      id: p.id,
      homeScore: p.homeScore,
      awayScore: p.awayScore,
      penaltyGuess: p.penaltyGuess,
      points: p.points,
      scored: p.scored,
      match: {
        id: p.match.id,
        homeTeam: p.match.homeTeam,
        awayTeam: p.match.awayTeam,
        homeCrest: p.match.homeCrest,
        awayCrest: p.match.awayCrest,
        homeScore: p.match.homeScore,
        awayScore: p.match.awayScore,
        penaltyWinner: p.match.penaltyWinner,
        status: p.match.status,
        kickoff: p.match.kickoff.toISOString(),
        venue: p.match.venue,
      },
    })),
  });
}
