/**
 * Inicializa a sincronizacao automatica em segundo plano.
 * Roda apenas no runtime Node.js (nao no Edge) e uma unica vez.
 *
 * A cada intervalo busca jogos/resultados/classificacao da API de futebol
 * e recalcula a pontuacao dos jogos encerrados — dando atualizacao
 * "em tempo real" (dentro do limite da API gratuita).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const g = globalThis as unknown as { __bolaoSyncStarted?: boolean };
  if (g.__bolaoSyncStarted) return;
  g.__bolaoSyncStarted = true;

  const provider = (process.env.FOOTBALL_PROVIDER ?? "mock").toLowerCase();
  if (provider === "mock") {
    console.log("[auto-sync] desativado (FOOTBALL_PROVIDER = mock).");
    return;
  }

  // Na Netlify o processo nao fica vivo; a sincronizacao roda via scheduled function.
  if (process.env.NETLIFY) {
    console.log("[auto-sync] desativado na Netlify (usa scheduled function).");
    return;
  }

  const intervalMs = Number(process.env.SYNC_INTERVAL_MS ?? 60_000);

  const run = async () => {
    try {
      const { syncEverything } = await import("./lib/sync");
      const result = await syncEverything();
      console.log(
        `[auto-sync] ${new Date().toISOString()} ->`,
        JSON.stringify(result)
      );
    } catch (err) {
      console.error("[auto-sync] erro:", (err as Error)?.message ?? err);
    }
  };

  // primeira execucao logo apos subir + agendamento periodico
  setTimeout(run, 8000);
  setInterval(run, intervalMs);
  console.log(`[auto-sync] ativo: sincronizando a cada ${intervalMs / 1000}s.`);
}
