import { getRanking } from "@/lib/ranking";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { AutoRefresh } from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default async function RankingPage() {
  const [ranking, me] = await Promise.all([getRanking(), getCurrentUser()]);

  const podium = ranking.slice(0, 3);

  return (
    <div>
      <AutoRefresh intervalMs={45000} />
      <PageHeader
        title="Ranking Geral"
        subtitle="A classificação do bolão, atualizada automaticamente após cada jogo."
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
                    <Avatar
                      name={r.name}
                      userId={r.userId}
                      size={64}
                      className="mt-2"
                    />
                    <p className="mt-2 max-w-full truncate font-display font-bold text-slate-900">
                      {r.name}
                    </p>
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
                      <Avatar name={r.name} userId={r.userId} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800">
                          {r.name}
                          {isMe && (
                            <span className="ml-1 text-xs font-semibold text-brand-600">
                              (você)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {r.scored}/{r.predictions} palpites · {r.exact} exatos
                        </p>
                      </div>
                      <span className="shrink-0 font-display text-lg font-bold text-brand-700">
                        {r.totalPoints}
                        <span className="ml-0.5 text-xs font-normal text-slate-400">
                          pts
                        </span>
                      </span>
                    </div>
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
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar name={r.name} userId={r.userId} size={34} />
                            <span className="truncate font-medium text-slate-800">
                              {r.name}
                              {isMe && (
                                <span className="ml-2 text-xs font-semibold text-brand-600">
                                  (você)
                                </span>
                              )}
                            </span>
                          </div>
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
