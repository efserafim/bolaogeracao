import type { Config } from "@netlify/functions";

/**
 * Cron a cada 3 min — dispara sync em background (sem passar pela rota Next.js).
 */
export default async () => {
  const base =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.CRON_SECRET;

  if (!base || !secret) {
    console.error("[scheduled-sync] URL ou CRON_SECRET ausente.");
    return new Response("Config ausente", { status: 500 });
  }

  try {
    const res = await fetch(`${base}/.netlify/functions/run-sync-background`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
    });
    const body = await res.text();
    console.log("[scheduled-sync] background ->", res.status, body);
    return new Response(body, { status: res.status === 202 || res.ok ? 200 : 500 });
  } catch (err) {
    console.error("[scheduled-sync] erro:", err);
    return new Response("Erro ao disparar sincronização", { status: 500 });
  }
};

export const config: Config = {
  schedule: "*/3 * * * *",
};
