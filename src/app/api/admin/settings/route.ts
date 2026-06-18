import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreFinishedMatches } from "@/lib/sync";
import { clearSettingsCache } from "@/lib/settings";

export const dynamic = "force-dynamic";

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

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const { poolStartsAt, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (poolStartsAt !== undefined) {
      data.poolStartsAt = poolStartsAt ? new Date(poolStartsAt) : null;
    }

    await prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...data },
      update: data,
    });

    clearSettingsCache();

    let warning: string | undefined;
    const rulesChanged =
      parsed.data.pointsExact !== undefined ||
      parsed.data.pointsResult !== undefined ||
      parsed.data.pointsGoalDiff !== undefined ||
      poolStartsAt !== undefined;

    if (rulesChanged) {
      try {
        await scoreFinishedMatches();
      } catch (err) {
        console.error("rescore after settings failed", err);
        warning =
          "Configurações salvas. O recálculo de pontos será feito na próxima sincronização.";
      }
    }

    return NextResponse.json({ ok: true, warning });
  } catch (err: any) {
    console.error("settings PUT error", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro ao salvar configurações." },
      { status: 500 }
    );
  }
}
