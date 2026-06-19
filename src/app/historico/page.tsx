import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge } from "@/components/PageHeader";
import { TeamFlag } from "@/components/TeamFlag";
import { MatchVenue } from "@/components/MatchVenue";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/historico");

  const predictions = await prisma.prediction.findMany({
    where: { userId: user.id },
    include: { match: true },
    orderBy: { match: { kickoff: "desc" } },
  });

  const total = predictions.reduce((s, p) => s + (p.points ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Meu Histórico"
        subtitle="Todos os seus palpites e a pontuação que cada um rendeu."
      >
        <div className="text-right">
          <p className="font-display text-3xl font-extrabold text-brand-700">
            {total}
          </p>
          <p className="text-sm text-slate-500">pontos no total</p>
        </div>
      </PageHeader>

      <div className="container-app py-8">
        {predictions.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            Você ainda não fez nenhum palpite.{" "}
            <a href="/palpites" className="font-semibold text-brand-600">
              Comece agora!
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.map((p) => {
              const m = p.match;
              const finished = m.status === "FINISHED";
              return (
                <div
                  key={p.id}
                  className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <TeamFlag name={m.homeTeam} crest={m.homeCrest} />
                      <span className="text-slate-300">×</span>
                      <TeamFlag name={m.awayTeam} crest={m.awayCrest} align="right" />
                    </div>
                    {m.venue && (
                      <div className="mt-2">
                        <MatchVenue venue={m.venue} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-center">
                      <p className="text-[11px] uppercase text-slate-400">
                        Seu palpite
                      </p>
                      <p className="font-display font-bold text-slate-800">
                        {p.homeScore}×{p.awayScore}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] uppercase text-slate-400">
                        Resultado
                      </p>
                      <p className="font-display font-bold text-slate-800">
                        {finished
                          ? `${m.homeScore}×${m.awayScore}`
                          : "—"}
                      </p>
                    </div>
                    <div className="min-w-[80px] text-center">
                      {p.scored ? (
                        <span
                          className={`badge ${
                            (p.points ?? 0) > 0
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          +{p.points} pts
                        </span>
                      ) : (
                        <StatusBadge status={m.status} />
                      )}
                    </div>
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
