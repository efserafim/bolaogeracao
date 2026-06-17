import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRanking } from "@/lib/ranking";

const schema = z.object({
  season: z.string().min(2).max(120),
  topN: z.number().int().min(1).max(10).default(3),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { season, topN } = parsed.data;
  const ranking = (await getRanking()).slice(0, topN);

  await prisma.champion.deleteMany({ where: { season } });
  await prisma.champion.createMany({
    data: ranking.map((r) => ({
      userId: r.userId,
      season,
      position: r.position,
      points: r.totalPoints,
    })),
  });

  return NextResponse.json({ ok: true, champions: ranking.length });
}
