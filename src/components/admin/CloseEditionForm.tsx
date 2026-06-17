"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CloseEditionForm() {
  const router = useRouter();
  const [season, setSeason] = useState("Copa do Mundo 2026");
  const [topN, setTopN] = useState(3);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function close(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirm(
        `Encerrar a edição "${season}" e registrar os ${topN} primeiros como campeões?`
      )
    )
      return;
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/champions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season, topN }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error ?? "Erro ao encerrar edição.");
      return;
    }
    setMsg(`✓ ${data.champions} campeões registrados em "${season}".`);
    router.refresh();
  }

  return (
    <form onSubmit={close} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Nome da edição</label>
          <input
            className="input"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Quantos campeões registrar</label>
          <input
            type="number"
            min={1}
            max={10}
            className="input"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
          />
        </div>
      </div>
      {msg && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
          {msg}
        </p>
      )}
      <button type="submit" disabled={loading} className="btn-accent">
        {loading ? "Encerrando..." : "🏆 Encerrar edição e premiar campeões"}
      </button>
    </form>
  );
}
