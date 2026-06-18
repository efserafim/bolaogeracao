import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { triggerSync } from "@/lib/trigger-sync";

export const dynamic = "force-dynamic";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const outcome = await triggerSync();

    if (outcome.started) {
      return NextResponse.json({
        ok: true,
        started: true,
        message:
          "Sincronização iniciada em segundo plano. Os dados atualizam em alguns segundos.",
      });
    }

    return NextResponse.json({ ok: true, ...outcome.result });
  } catch (err: any) {
    console.error("sync error", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro na sincronização." },
      { status: 500 }
    );
  }
}
