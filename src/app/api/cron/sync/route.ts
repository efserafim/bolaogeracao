import { NextResponse } from "next/server";
import { triggerSync } from "@/lib/trigger-sync";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const outcome = await triggerSync();
    if (outcome.started) {
      return NextResponse.json({ ok: true, started: true });
    }
    return NextResponse.json({ ok: true, ...outcome.result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Erro na sincronização." },
      { status: 500 }
    );
  }
}
