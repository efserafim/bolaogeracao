"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface SettingsValues {
  poolName: string;
  parishName: string;
  pointsExact: number;
  pointsResult: number;
  pointsGoalDiff: number;
  predictionsOpen: boolean;
  predictionLockMinutes: number;
  poolStartsAt: string; // formato datetime-local ("" = sem limite)
}

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter();
  const [values, setValues] = useState<SettingsValues>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof SettingsValues>(key: K, v: SettingsValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const payload = {
      ...values,
      // datetime-local -> ISO (ou null para limpar)
      poolStartsAt: values.poolStartsAt
        ? new Date(values.poolStartsAt).toISOString()
        : null,
    };
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data: { error?: string; warning?: string } = {};
    try {
      data = await res.json();
    } catch {
      setSaving(false);
      setMsg(
        res.status >= 500
          ? "Servidor demorou demais. Tente salvar novamente em instantes."
          : "Resposta inválida do servidor."
      );
      return;
    }

    setSaving(false);
    if (!res.ok) {
      setMsg(data.error ?? "Erro ao salvar.");
      return;
    }
    setMsg(
      data.warning ??
        "✓ Configurações salvas. Pontuações recalculadas se as regras mudaram."
    );
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Nome do bolão</label>
          <input
            className="input"
            value={values.poolName}
            onChange={(e) => set("poolName", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Nome do grupo / paróquia</label>
          <input
            className="input"
            value={values.parishName}
            onChange={(e) => set("parishName", e.target.value)}
          />
        </div>
      </div>

      <div>
        <p className="label">Regras de pontuação</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <label className="text-sm font-medium text-slate-600">
              🎯 Placar exato
            </label>
            <input
              type="number"
              min={0}
              className="input mt-2"
              value={values.pointsExact}
              onChange={(e) => set("pointsExact", Number(e.target.value))}
            />
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <label className="text-sm font-medium text-slate-600">
              ✅ Vencedor / empate
            </label>
            <input
              type="number"
              min={0}
              className="input mt-2"
              value={values.pointsResult}
              onChange={(e) => set("pointsResult", Number(e.target.value))}
            />
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <label className="text-sm font-medium text-slate-600">
              ➗ Saldo de gols
            </label>
            <input
              type="number"
              min={0}
              className="input mt-2"
              value={values.pointsGoalDiff}
              onChange={(e) => set("pointsGoalDiff", Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="label">Bolão começa a valer a partir de</label>
        <input
          type="datetime-local"
          className="input"
          value={values.poolStartsAt}
          onChange={(e) => set("poolStartsAt", e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-400">
          Só os jogos com início a partir desta data/hora contam no bolão.
          Deixe em branco para incluir todos.
        </p>
      </div>

      <div>
        <label className="label">Encerramento dos palpites</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={180}
            className="input w-28"
            value={values.predictionLockMinutes}
            onChange={(e) =>
              set("predictionLockMinutes", Number(e.target.value))
            }
          />
          <span className="text-sm text-slate-600">
            minutos antes do início do jogo
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Após esse prazo, o palpite fica travado e não pode mais ser alterado.
          Use 0 para fechar só no apito inicial.
        </p>
      </div>

      <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
        <input
          type="checkbox"
          className="h-5 w-5 rounded"
          checked={values.predictionsOpen}
          onChange={(e) => set("predictionsOpen", e.target.checked)}
        />
        <span className="text-sm font-medium text-slate-700">
          Permitir que os participantes enviem/editem palpites
        </span>
      </label>

      {msg && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            msg.startsWith("✓")
              ? "bg-emerald-50 text-emerald-600"
              : msg.includes("salvas")
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-600"
          }`}
        >
          {msg}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}
