import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { getRanking } from "@/lib/ranking";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/Avatar";
import { formatKickoff } from "@/lib/format";
import { teamAbbrev } from "@/lib/teams";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const startsAt = settings.poolStartsAt;
  const minKickoff =
    startsAt && startsAt.getTime() > Date.now() ? startsAt : new Date();

  const [fullRanking, nextMatches, participants] = await Promise.all([
    getRanking(),
    prisma.match.findMany({
      where: { status: "SCHEDULED", kickoff: { gte: minKickoff } },
      orderBy: { kickoff: "asc" },
      take: 3,
    }),
    prisma.user.count({ where: { role: "USER" } }),
  ]);
  const ranking = fullRanking.slice(0, 5);

  return (
    <div>
      <section className="hero-photo relative overflow-hidden">
        <div className="container-app relative z-10 grid min-w-0 items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div className="min-w-0 animate-fade-in-up">
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              {settings.poolName}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/80">
              Dê seus palpites nos jogos da Copa do Mundo, dispute o ranking com
              a galera e mostre quem entende mais de futebol. União, comunidade
              e muita diversão!
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/cadastro" className="btn-accent text-base">
                Quero participar
              </Link>
              <Link
                href="/jogos"
                className="btn border border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                Ver próximos jogos
              </Link>
            </div>
            <div className="mt-8 flex gap-6 text-white">
              <div>
                <p className="font-display text-3xl font-extrabold">
                  {participants}
                </p>
                <p className="text-sm text-white/60">participantes</p>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold">
                  {settings.pointsExact}
                </p>
                <p className="text-sm text-white/60">pts no placar exato</p>
              </div>
            </div>
          </div>

          <div className="animate-pop min-w-0 rounded-3xl bg-white/95 p-6 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-brand-900">
                🏆 Líderes do bolão
              </h2>
              <Link
                href="/ranking"
                className="shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Ver tudo
              </Link>
            </div>
            <ul className="mt-4 space-y-2">
              {ranking.length === 0 && (
                <li className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                  Ainda não há pontuações. Seja o primeiro a palpitar!
                </li>
              )}
              {ranking.map((r) => (
                <li
                  key={r.userId}
                  className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                >
                  <span className="w-6 shrink-0 text-center font-display font-bold text-slate-400">
                    {r.position}
                  </span>
                  <Avatar name={r.name} userId={r.userId} size={36} />
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
                    {r.name}
                  </span>
                  <span className="shrink-0 font-display font-bold text-brand-700">
                    {r.totalPoints}
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      pts
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-app py-14">
        <h2 className="text-center font-display text-3xl font-extrabold text-brand-900">
          Como funciona
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: "📝",
              title: "1. Faça seu cadastro",
              text: "Crie seu perfil com nome e foto e entre na disputa do Grupo Jovem.",
            },
            {
              icon: "🎯",
              title: "2. Dê seus palpites",
              text: "Palpite o placar de cada jogo antes do apito inicial. Depois trava!",
            },
            {
              icon: "🏆",
              title: "3. Suba no ranking",
              text: "Os resultados são buscados automaticamente e sua pontuação é calculada.",
            },
          ].map((c) => (
            <div key={c.title} className="card p-6">
              <div className="text-4xl">{c.icon}</div>
              <h3 className="mt-3 font-display text-lg font-bold text-slate-900">
                {c.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-app grid gap-8 pb-16 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-display text-xl font-bold text-brand-900">
            Sistema de pontuação
          </h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
              <span className="font-medium text-slate-700">
                🎯 Acertou o placar exato
              </span>
              <span className="badge bg-brand-600 text-white">
                {settings.pointsExact} pts
              </span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
              <span className="font-medium text-slate-700">
                ✅ Acertou o vencedor / empate
              </span>
              <span className="badge bg-brand-500 text-white">
                {settings.pointsResult} pts
              </span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
              <span className="font-medium text-slate-700">
                ➗ Acertou só o saldo de gols
              </span>
              <span className="badge bg-brand-400 text-white">
                {settings.pointsGoalDiff} pt
              </span>
            </li>
          </ul>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-brand-900">
              Próximos jogos
            </h3>
            <Link
              href="/jogos"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Ver todos
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {nextMatches.length === 0 && (
              <li className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                Nenhum jogo agendado no momento.
              </li>
            )}
            {nextMatches.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <span className="font-medium text-slate-800">
                  {teamAbbrev(m.homeTeam)}{" "}
                  <span className="text-slate-400">×</span>{" "}
                  {teamAbbrev(m.awayTeam)}
                </span>
                <span className="block text-xs text-slate-500">
                  {formatKickoff(m.kickoff)}
                  {m.venue && ` · 📍 ${m.venue}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
