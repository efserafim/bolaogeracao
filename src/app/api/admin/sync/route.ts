import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  runSyncStep,
  syncEverything,
  type SyncStep,
} from "@/lib/sync";

export const maxDuration = 26;
export const dynamic = "force-dynamic";

const STEPS: SyncStep[] = ["matches", "standings", "score"];

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const step = new URL(req.url).searchParams.get("step") as SyncStep | null;

  try {
    if (step && STEPS.includes(step)) {
      const result = await runSyncStep(step);
      return NextResponse.json({ ok: true, ...result });
    }

    const result = await syncEverything();
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("sync error", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro na sincronização." },
      { status: 500 }
    );
  }
}
