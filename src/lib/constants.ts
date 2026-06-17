// Valor padrao quando ainda nao configurado no admin.
export const DEFAULT_PREDICTION_LOCK_MINUTES = 30;

export function predictionLockMs(minutes: number) {
  return minutes * 60 * 1000;
}
