// Valor padrao quando ainda nao configurado no admin.
export const DEFAULT_PREDICTION_LOCK_MINUTES = 30;

/** Sync com a API de futebol (local / cron). */
export const DEFAULT_SYNC_INTERVAL_MS = 60_000;

/** Atualizacao da pagina quando nao ha jogo ao vivo. */
export const REFRESH_INTERVAL_MS = 60_000;

/** Atualizacao da pagina durante jogos LIVE. */
export const REFRESH_LIVE_INTERVAL_MS = 20_000;

export function predictionLockMs(minutes: number) {
  return minutes * 60 * 1000;
}
