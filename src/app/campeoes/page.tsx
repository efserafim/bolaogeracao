import { prisma } from "@/lib/prisma";
import { getRanking } from "@/lib/ranking";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";

export const revalidate = 60;

const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default async function CampeoesPage() {
  const champions = await prisma.champion.findMany({
    include: { user: true },
    orderBy: [{ awardedAt: "desc" }, { position: "asc" }],
  });

  const bySeason = new Map<string, typeof champions>();
  for (const c of champions) {
    const arr = bySeason.get(c.season) ?? [];
    arr.push(c);
    bySeason.set(c.season, arr);
  }

  const leader = (await getRanking())[0];

  return (
    <div>
      <PageHeader
        title="🏆 Campeões do Bolão"
        subtitle="A galeria de honra do Grupo Jovem: quem brilhou em cada edição."
      />

      <div className="container-app py-8">
        {leader && (
          <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-accent-500 to-accent-400 p-1">
            <div className="rounded-[14px] bg-white p-6 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-accent-600">
                  Líder da edição atual
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <Avatar name={leader.name} userId={leader.userId} size={56} />
                  <div>
                    <p className="font-display text-xl font-extrabold text-slate-900">
                      {leader.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {leader.totalPoints} pontos · {leader.exact} placares
                      exatos
                    </p>
                  </div>
                </div>
              </div>
              <span className="mt-4 block text-5xl sm:mt-0">👑</span>
            </div>
          </div>
        )}

        {bySeason.size === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            Ainda não há edições encerradas. Quando a coordenação encerrar uma
            edição, os campeões aparecerão aqui!
          </div>
        ) : (
          <div className="space-y-8">
            {[...bySeason.entries()].map(([season, list]) => (
              <div key={season}>
                <h2 className="mb-4 font-display text-xl font-bold text-brand-900">
                  {season}
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {list
                    .sort((a, b) => a.position - b.position)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="card flex items-center gap-3 p-5"
                      >
                        <span className="text-3xl">
                          {medals[c.position] ?? `#${c.position}`}
                        </span>
                        <Avatar
                          name={c.user.name}
                          userId={c.user.id}
                          size={48}
                        />
                        <div>
                          <p className="font-display font-bold text-slate-900">
                            {c.user.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {c.points} pontos
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
