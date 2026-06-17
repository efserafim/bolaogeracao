import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { syncEverything } from "@/lib/sync";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  try {
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
