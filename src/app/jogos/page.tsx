import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge } from "@/components/PageHeader";
import { TeamFlag } from "@/components/TeamFlag";
import { formatKickoff } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth";
import { getPoolMatchFilter } from "@/lib/settings";
import { AutoRefresh } from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

export default async function JogosPage() {
  const user = await getCurrentUser();
  const poolFilter = await getPoolMatchFilter();
  const matches = await prisma.match.findMany({
    where: poolFilter,
    orderBy: { kickoff: "asc" },
  });

  const myPredictions = user
    ? await prisma.prediction.findMany({ where: { userId: user.id } })
    : [];
  const predByMatch = new Map(myPredictions.map((p) => [p.matchId, p]));

  return (
    <div>
      <AutoRefresh intervalMs={45000} />
      <PageHeader
        title="Jogos da Copa"
        subtitle="Acompanhe os jogos, resultados e dê seus palpites antes do apito inicial."
      >
        <Link href="/palpites" className="btn-primary">
          Fazer palpites
        </Link>
      </PageHeader>

      <div className="container-app py-8">
        {matches.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            Nenhum jogo carregado ainda. A coordenação precisa sincronizar os
            jogos no painel administrativo.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {matches.map((m) => {
              const started =
                new Date(m.kickoff).getTime() <= Date.now() ||
                m.status !== "SCHEDULED";
              const pred = predByMatch.get(m.id);
              return (
                <div key={m.id} className="card p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {m.groupName ? `${m.groupName} · ` : ""}
                      {m.stage ?? m.competition}
                    </span>
                    <StatusBadge status={m.status} />
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <TeamFlag name={m.homeTeam} crest={m.homeCrest} />
                    <div className="flex min-w-[64px] items-center justify-center">
                      {m.status === "FINISHED" || m.status === "LIVE" ? (
                        <span className="font-display text-xl font-extrabold text-slate-900">
                          {m.homeScore ?? 0} <span className="text-slate-300">×</span>{" "}
                          {m.awayScore ?? 0}
                        </span>
                      ) : (
                        <span className="text-slate-300">×</span>
                      )}
                    </div>
                    <TeamFlag name={m.awayTeam} crest={m.awayCrest} align="right" />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                    <span className="text-slate-500">
                      {formatKickoff(m.kickoff)}
                    </span>
                    {pred ? (
                      <span className="badge bg-brand-50 text-brand-700">
                        Seu palpite: {pred.homeScore}×{pred.awayScore}
                        {pred.scored && pred.points !== null && (
                          <span className="ml-1 font-bold">
                            (+{pred.points})
                          </span>
                        )}
                      </span>
                    ) : started ? (
                      <span className="text-xs text-slate-400">
                        Palpites encerrados
                      </span>
                    ) : (
                      <Link
                        href="/palpites"
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Palpitar →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
