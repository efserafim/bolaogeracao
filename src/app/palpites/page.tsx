import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { predictionLockMs } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";
import {
  PredictionsBoard,
  type BoardMatch,
} from "@/components/PredictionsBoard";

export const dynamic = "force-dynamic";

export default async function PalpitesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/palpites");

  const settings = await getSettings();
  const lockMinutes = settings.predictionLockMinutes;
  const lockMs = predictionLockMs(lockMinutes);
  const startsAt = settings.poolStartsAt;
  const now = Date.now();

  const poolMin = startsAt ?? new Date(0);
  const scheduled = await prisma.match.findMany({
    where: { status: "SCHEDULED", kickoff: { gte: poolMin } },
    orderBy: { kickoff: "asc" },
  });

  const predictions = await prisma.prediction.findMany({
    where: { userId: user.id },
  });
  const byMatch = new Map(predictions.map((p) => [p.matchId, p]));

  const matches: BoardMatch[] = scheduled.map((m) => {
    const pred = byMatch.get(m.id);
    const locked = m.kickoff.getTime() - lockMs <= now;
    return {
      id: m.id,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeCrest: m.homeCrest,
      awayCrest: m.awayCrest,
      kickoff: m.kickoff.toISOString(),
      groupName: m.groupName,
      stage: m.stage,
      venue: m.venue,
      homeGuess: pred?.homeScore ?? null,
      awayGuess: pred?.awayScore ?? null,
      locked,
    };
  });

  const openCount = matches.filter((m) => !m.locked).length;
  const closedCount = matches.filter((m) => m.locked).length;

  return (
    <div>
      <PageHeader
        title="Meus Palpites"
        subtitle={`Palpite o placar de cada jogo. Os palpites fecham ${lockMinutes} minutos antes do início e não podem mais ser alterados.`}
      />
      <div className="container-app py-8">
        {!settings.predictionsOpen && (
          <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            ⚠️ Os palpites estão temporariamente fechados pela coordenação.
          </div>
        )}
        {openCount > 0 && (
          <p className="mb-4 text-sm text-slate-500">
            {openCount} jogo(s) aberto(s) para palpite
            {closedCount > 0 && ` · ${closedCount} encerrado(s)`}
          </p>
        )}
        <PredictionsBoard
          matches={matches}
          predictionsOpen={settings.predictionsOpen}
        />
      </div>
    </div>
  );
}
