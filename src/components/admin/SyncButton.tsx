"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function sync() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      let data: { error?: string; matchesSynced?: number; standingsSynced?: number; predictionsScored?: number; provider?: string; skipped?: boolean } = {};
      try {
        data = await res.json();
      } catch {
        setMsg(
          res.status === 502
            ? "O servidor demorou demais (limite da Netlify). A sincronização automática a cada 3 min continua ativa — tente de novo em instantes."
            : "Resposta inválida do servidor. Tente novamente."
        );
        return;
      }
      if (!res.ok) {
        setMsg(data.error ?? "Erro ao sincronizar.");
        return;
      }
      if (data.skipped) {
        setMsg("Sincronização já em andamento. Aguarde alguns segundos.");
        return;
      }
      setMsg(
        `✓ ${data.matchesSynced} jogos · ${data.standingsSynced} na tabela · ${data.predictionsScored} palpites pontuados (fonte: ${data.provider}).`
      );
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={sync} disabled={loading} className="btn-primary">
        {loading ? "Sincronizando..." : "🔄 Sincronizar jogos e resultados"}
      </button>
      {msg && <p className="mt-2 text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
