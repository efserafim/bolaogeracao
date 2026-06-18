"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SyncResult = {
  error?: string;
  matchesSynced?: number;
  standingsSynced?: number;
  predictionsScored?: number;
  provider?: string;
  skipped?: boolean;
};

async function callStep(
  step: "matches" | "standings" | "score"
): Promise<SyncResult> {
  const res = await fetch(`/api/admin/sync?step=${step}`, { method: "POST" });
  let data: SyncResult = {};
  try {
    data = await res.json();
  } catch {
    throw new Error(
      res.status === 502
        ? "Servidor demorou demais nesta etapa. Tente novamente."
        : "Resposta inválida do servidor."
    );
  }
  if (!res.ok) {
    throw new Error(data.error ?? "Erro ao sincronizar.");
  }
  return data;
}

export function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function sync() {
    setLoading(true);
    setMsg(null);
    setStatus("Buscando jogos...");

    const totals = {
      matchesSynced: 0,
      standingsSynced: 0,
      predictionsScored: 0,
      provider: "",
    };

    try {
      setStatus("Atualizando jogos...");
      const matches = await callStep("matches");
      totals.matchesSynced = matches.matchesSynced ?? 0;
      totals.provider = matches.provider ?? "";

      setStatus("Atualizando tabela de grupos...");
      const standings = await callStep("standings");
      totals.standingsSynced = standings.standingsSynced ?? 0;

      setStatus("Calculando pontos...");
      const score = await callStep("score");
      totals.predictionsScored = score.predictionsScored ?? 0;

      setMsg(
        `✓ ${totals.matchesSynced} jogos · ${totals.standingsSynced} na tabela · ${totals.predictionsScored} palpites pontuados (fonte: ${totals.provider}).`
      );
      router.refresh();
    } catch (err: any) {
      setMsg(
        err?.message ??
          "Erro ao sincronizar. A sincronização automática a cada 3 min continua ativa."
      );
    } finally {
      setLoading(false);
      setStatus(null);
    }
  }

  return (
    <div>
      <button onClick={sync} disabled={loading} className="btn-primary">
        {loading ? "Sincronizando..." : "🔄 Sincronizar jogos e resultados"}
      </button>
      {status && (
        <p className="mt-2 text-sm text-slate-500">{status}</p>
      )}
      {msg && <p className="mt-2 text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
