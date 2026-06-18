/**
 * Sincronizacao pesada em background (ate 15 min na Netlify).
 * O sufixo "-background" no nome ativa o modo background automaticamente.
 */
export default async (req: Request) => {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Não autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { syncEverything } = await import("../../src/lib/sync");
    const { prismaSync } = await import("../../src/lib/prisma-sync");
    const result = await syncEverything();
    console.log("[run-sync-background]", JSON.stringify(result));
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[run-sync-background]", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "Erro na sincronização." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    try {
      const { prismaSync } = await import("../../src/lib/prisma-sync");
      await prismaSync.$disconnect();
    } catch {
      /* ignore */
    }
  }
};
