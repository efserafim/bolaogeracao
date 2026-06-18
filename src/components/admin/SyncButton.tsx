"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SyncResponse = {
  error?: string;
  started?: boolean;
  message?: string;
  matchesSynced?: number;
  standingsSynced?: number;
  predictionsScored?: number;
  provider?: string;
};

export function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function sync() {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      let data: SyncResponse = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(
          res.status === 502
            ? "Servidor indisponível. Tente novamente em instantes."
            : "Resposta inválida do servidor."
        );
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao sincronizar.");
      }

      if (data.started) {
        setMsg(
          data.message ??
            "Sincronização iniciada! Atualizando dados em segundo plano..."
        );
        setTimeout(() => router.refresh(), 12_000);
        return;
      }

      setMsg(
        `✓ ${data.matchesSynced} jogos · ${data.standingsSynced} na tabela · ${data.predictionsScored} palpites pontuados (fonte: ${data.provider}).`
      );
      router.refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Erro ao sincronizar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={sync} disabled={loading} className="btn-primary">
        {loading ? "Iniciando..." : "🔄 Sincronizar jogos e resultados"}
      </button>
      {msg && <p className="mt-2 text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
