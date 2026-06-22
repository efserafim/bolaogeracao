import { getRanking } from "@/lib/ranking";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { RankingParticipant } from "@/components/RankingParticipant";
import { AutoRefresh } from "@/components/AutoRefresh";

export const revalidate = 30;

const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default async function RankingPage() {
  const [ranking, me] = await Promise.all([getRanking(), getCurrentUser()]);
  const isLoggedIn = !!me;

  const podium = ranking.slice(0, 3);

  return (
    <div>
      <AutoRefresh intervalMs={90000} />
      <PageHeader
        title="Ranking Geral"
        subtitle={
          isLoggedIn
            ? "Clique no nome de um participante para ver os palpites de hoje e o histórico completo."
            : "A classificação do bolão, atualizada automaticamente após cada jogo."
        }
      />

      <div className="container-app py-8">
        {ranking.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            O ranking aparecerá assim que os primeiros jogos forem pontuados.
          </div>
        ) : (
          <>
            {podium.length >= 1 && (
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {podium.map((r) => (
                  <div
                    key={r.userId}
                    className={`card flex w-full min-w-0 flex-col items-center p-6 text-center ${
                      r.position === 1
                        ? "ring-2 ring-accent-400 sm:order-2 sm:-translate-y-2"
                        : r.position === 2
                          ? "sm:order-1"
                          : "sm:order-3"
                    }`}
                  >
                    <span className="text-3xl">{medals[r.position]}</span>
                    <RankingParticipant
                      userId={r.userId}
                      name={r.name}
                      image={r.image}
                      avatarSize={64}
                      isMe={me?.id === r.userId}
                      isLoggedIn={isLoggedIn}
                      layout="stacked"
                    />
                    <p className="font-display text-2xl font-extrabold text-brand-700">
                      {r.totalPoints}
                      <span className="text-sm font-normal text-slate-400">
                        {" "}
                        pts
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {r.exact} placar(es) exato(s)
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 sm:hidden">
              {ranking.map((r) => {
                const isMe = me?.id === r.userId;
                return (
                  <div
                    key={r.userId}
                    className={`card min-w-0 p-4 ${isMe ? "ring-2 ring-brand-200" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 shrink-0 text-center font-display text-lg font-bold text-slate-400">
                        {medals[r.position] ?? r.position}
                      </span>
                      <RankingParticipant
                        userId={r.userId}
                        name={r.name}
                        image={r.image}
                        avatarSize={40}
                        isMe={isMe}
                        isLoggedIn={isLoggedIn}
                        className="min-w-0 flex-1"
                      />
                      <span className="shrink-0 font-display text-lg font-bold text-brand-700">
                        {r.totalPoints}
                        <span className="ml-0.5 text-xs font-normal text-slate-400">
                          pts
                        </span>
                      </span>
                    </div>
                    <p className="mt-2 pl-10 text-xs text-slate-500">
                      {r.scored}/{r.predictions} palpites · {r.exact} exatos
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="card hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Participante</th>
                    <th className="px-4 py-3 text-center">Palpites</th>
                    <th className="px-4 py-3 text-center">Exatos</th>
                    <th className="px-4 py-3 text-right">Pontos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ranking.map((r) => {
                    const isMe = me?.id === r.userId;
                    return (
                      <tr
                        key={r.userId}
                        className={isMe ? "bg-brand-50/60" : ""}
                      >
                        <td className="px-4 py-3 font-display font-bold text-slate-500">
                          {medals[r.position] ?? r.position}
                        </td>
                        <td className="px-4 py-3">
                          <RankingParticipant
                            userId={r.userId}
                            name={r.name}
                            image={r.image}
                            avatarSize={34}
                            isMe={isMe}
                            isLoggedIn={isLoggedIn}
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-slate-500">
                          {r.scored}/{r.predictions}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-500">
                          {r.exact}
                        </td>
                        <td className="px-4 py-3 text-right font-display font-bold text-brand-700">
                          {r.totalPoints}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
