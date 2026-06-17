import type { Config } from "@netlify/functions";

/**
 * Sincronizacao periodica na Netlify (serverless nao mantem setInterval).
 * Chama o endpoint interno protegido por CRON_SECRET.
 */
export default async () => {
  const base =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.NEXTAUTH_URL;
  const secret = process.env.CRON_SECRET;

  if (!base || !secret) {
    console.error("[scheduled-sync] URL ou CRON_SECRET ausente.");
    return new Response("Config ausente", { status: 500 });
  }

  try {
    const res = await fetch(`${base}/api/cron/sync`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const body = await res.text();
    console.log("[scheduled-sync]", res.status, body);
    return new Response(body, { status: res.ok ? 200 : 500 });
  } catch (err) {
    console.error("[scheduled-sync] erro:", err);
    return new Response("Erro na sincronizacao", { status: 500 });
  }
};

export const config: Config = {
  schedule: "*/3 * * * *",
};
