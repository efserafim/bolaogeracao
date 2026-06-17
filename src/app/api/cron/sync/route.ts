import { NextResponse } from "next/server";
import { syncEverything } from "@/lib/sync";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  try {
    const result = await syncEverything();
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Erro na sincronização." },
      { status: 500 }
    );
  }
}
