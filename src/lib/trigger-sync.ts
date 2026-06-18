import { syncEverything } from "./sync";

function siteBase() {
  return (
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    null
  );
}

export function shouldUseBackgroundSync() {
  if (process.env.NETLIFY === "true") return true;
  const base = siteBase();
  if (base?.includes("netlify.app")) return true;
  return Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/** Dispara sync em background na Netlify (ate 15 min) ou roda inline em dev. */
export async function triggerSync() {
  const secret = process.env.CRON_SECRET;
  const base = siteBase();

  if (shouldUseBackgroundSync() && base && secret) {
    const res = await fetch(`${base}/.netlify/functions/run-sync-background`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
    });

    if (res.status === 202 || res.ok) {
      return { started: true as const };
    }

    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao iniciar sync (${res.status}): ${body}`);
  }

  const result = await syncEverything();
  return { started: false as const, result };
}
