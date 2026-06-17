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
    const res = await fetch("/api/admin/sync", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error ?? "Erro ao sincronizar.");
      return;
    }
    setMsg(
      `✓ ${data.matchesSynced} jogos · ${data.standingsSynced} na tabela · ${data.predictionsScored} palpites pontuados (fonte: ${data.provider}).`
    );
    router.refresh();
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
