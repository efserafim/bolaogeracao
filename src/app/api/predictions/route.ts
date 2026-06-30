import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { predictionLockMs } from "@/lib/constants";

const schema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0).max(30),
  awayScore: z.number().int().min(0).max(30),
  penaltyGuess: z.enum(["HOME", "AWAY"]).nullable().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { matchId, homeScore, awayScore, penaltyGuess } = parsed.data;

  const settings = await getSettings();
  if (!settings.predictionsOpen) {
    return NextResponse.json(
      { error: "Os palpites estão fechados pela coordenação." },
      { status: 403 }
    );
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json(
      { error: "Jogo não encontrado." },
      { status: 404 }
    );
  }

  const lockMinutes = settings.predictionLockMinutes;
  const lockMs = predictionLockMs(lockMinutes);
  const deadline = new Date(match.kickoff).getTime() - lockMs;
  const locked = Date.now() >= deadline;
  if (locked || match.status !== "SCHEDULED") {
    return NextResponse.json(
      {
        error: `Palpites encerrados para este jogo (fecham ${lockMinutes} min antes do início).`,
      },
      { status: 403 }
    );
  }

  const prediction = await prisma.prediction.upsert({
    where: { userId_matchId: { userId: user.id, matchId } },
    create: { userId: user.id, matchId, homeScore, awayScore, penaltyGuess },
    update: { homeScore, awayScore, penaltyGuess },
  });

  return NextResponse.json({ ok: true, prediction });
}
