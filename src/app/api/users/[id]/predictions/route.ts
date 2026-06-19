import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/format";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, role: true },
  });

  if (!target || target.role !== "USER") {
    return NextResponse.json({ error: "Participante não encontrado" }, { status: 404 });
  }

  const predictions = await prisma.prediction.findMany({
    where: { userId: id },
    include: { match: true },
    orderBy: { match: { kickoff: "desc" } },
  });

  const today = dayKey(new Date());
  const totalPoints = predictions.reduce((s, p) => s + (p.points ?? 0), 0);

  return NextResponse.json({
    user: { id: target.id, name: target.name },
    totalPoints,
    todayKey: today,
    predictions: predictions.map((p) => ({
      id: p.id,
      homeScore: p.homeScore,
      awayScore: p.awayScore,
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
        status: p.match.status,
        kickoff: p.match.kickoff.toISOString(),
        venue: p.match.venue,
      },
    })),
  });
}
