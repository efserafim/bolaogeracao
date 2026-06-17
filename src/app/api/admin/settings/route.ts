import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreFinishedMatches } from "@/lib/sync";
import { clearSettingsCache } from "@/lib/settings";

const schema = z.object({
  poolName: z.string().min(2).max(120).optional(),
  parishName: z.string().min(2).max(120).optional(),
  pointsExact: z.number().int().min(0).max(100).optional(),
  pointsResult: z.number().int().min(0).max(100).optional(),
  pointsGoalDiff: z.number().int().min(0).max(100).optional(),
  predictionsOpen: z.boolean().optional(),
  poolStartsAt: z.string().nullable().optional(),
  predictionLockMinutes: z.number().int().min(0).max(180).optional(),
});

export async function PUT(req: Request) {
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

  const { poolStartsAt, ...rest } = parsed.data;
  const data: any = { ...rest };
  if (poolStartsAt !== undefined) {
    data.poolStartsAt = poolStartsAt ? new Date(poolStartsAt) : null;
  }

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  clearSettingsCache();

  if (
    parsed.data.pointsExact !== undefined ||
    parsed.data.pointsResult !== undefined ||
    parsed.data.pointsGoalDiff !== undefined ||
    poolStartsAt !== undefined
  ) {
    await scoreFinishedMatches();
  }

  return NextResponse.json({ ok: true, settings });
}
