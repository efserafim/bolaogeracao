import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { JogosByDay, type JogosDay } from "@/components/JogosByDay";
import { dayKey, formatDay } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth";
import { getPoolMatchFilter } from "@/lib/settings";
import { hasLivePoolMatches } from "@/lib/live-matches";
import { AutoRefresh } from "@/components/AutoRefresh";

export const revalidate = 15;

export default async function JogosPage() {
  const [user, poolFilter, live] = await Promise.all([
    getCurrentUser(),
    getPoolMatchFilter(),
    hasLivePoolMatches(),
  ]);

  const [matches, myPredictions] = await Promise.all([
    prisma.match.findMany({
      where: poolFilter,
      orderBy: { kickoff: "asc" },
    }),
    user
      ? prisma.prediction.findMany({ where: { userId: user.id } })
      : Promise.resolve([]),
  ]);
  const predByMatch = new Map(myPredictions.map((p) => [p.matchId, p]));

  const byDay = new Map<string, typeof matches>();
  for (const m of matches) {
    const key = dayKey(m.kickoff);
    const list = byDay.get(key) ?? [];
    list.push(m);
    byDay.set(key, list);
  }
  const days: JogosDay[] = Array.from(byDay.entries()).map(
    ([key, dayMatches]) => ({
      key,
      label: formatDay(dayMatches[0].kickoff),
      matches: dayMatches.map((m) => {
        const pred = predByMatch.get(m.id);
        return {
          id: m.id,
          kickoff: m.kickoff.toISOString(),
          stage: m.stage,
          groupName: m.groupName,
          competition: m.competition,
          venue: m.venue,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeCrest: m.homeCrest,
          awayCrest: m.awayCrest,
          status: m.status,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          started:
            new Date(m.kickoff).getTime() <= Date.now() ||
            m.status !== "SCHEDULED",
          prediction: pred
            ? {
                homeScore: pred.homeScore,
                awayScore: pred.awayScore,
                scored: pred.scored,
                points: pred.points,
              }
            : null,
        };
      }),
    })
  );

  return (
    <div>
      <AutoRefresh live={live} />
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
          <JogosByDay days={days} />
        )}
      </div>
    </div>
  );
}
