import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/PageHeader";
import { SyncButton } from "@/components/admin/SyncButton";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { CloseEditionForm } from "@/components/admin/CloseEditionForm";

export const dynamic = "force-dynamic";

function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-5">
      <p className="font-display text-3xl font-extrabold text-brand-700">
        {value}
      </p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const settings = await getSettings();
  const [participants, matches, finished, predictions, provider] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.match.count(),
      prisma.match.count({ where: { status: "FINISHED" } }),
      prisma.prediction.count(),
      Promise.resolve(process.env.FOOTBALL_PROVIDER ?? "mock"),
    ]);

  return (
    <div>
      <PageHeader
        title="Visão geral"
        subtitle="Gerencie o bolão, sincronize resultados e ajuste as regras."
      />
      <div className="container-app space-y-8 py-8">
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Participantes" value={participants} />
          <Stat label="Jogos carregados" value={matches} />
          <Stat label="Jogos encerrados" value={finished} />
          <Stat label="Palpites feitos" value={predictions} />
        </div>

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-brand-900">
            Sincronização de resultados
          </h2>
          <p className="mb-4 mt-1 text-sm text-slate-500">
            Fonte de dados atual:{" "}
            <span className="font-semibold text-slate-700">{provider}</span>.
            Ao sincronizar, os jogos e a classificação são atualizados e os
            palpites dos jogos encerrados são pontuados automaticamente.
          </p>
          <SyncButton />
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-brand-900">
            Configurações e regras de pontuação
          </h2>
          <SettingsForm
            initial={{
              poolName: settings.poolName,
              parishName: settings.parishName,
              pointsExact: settings.pointsExact,
              pointsResult: settings.pointsResult,
              pointsGoalDiff: settings.pointsGoalDiff,
              predictionsOpen: settings.predictionsOpen,
              predictionLockMinutes: settings.predictionLockMinutes,
              poolStartsAt: toLocalInput(settings.poolStartsAt),
            }}
          />
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-brand-900">
            Encerrar edição
          </h2>
          <p className="mb-4 mt-1 text-sm text-slate-500">
            Congela o ranking atual e registra os campeões na página de
            Campeões.
          </p>
          <CloseEditionForm />
        </section>
      </div>
    </div>
  );
}
