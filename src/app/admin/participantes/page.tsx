import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { UsersTable, type AdminUserRow } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";

export default async function ParticipantesPage() {
  const me = await getCurrentUser();
  const users = await prisma.user.findMany({
    include: { predictions: true },
    orderBy: { createdAt: "asc" },
  });

  const rows: AdminUserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role,
    predictions: u.predictions.length,
    points: u.predictions.reduce((s, p) => s + (p.points ?? 0), 0),
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageHeader
        title="Participantes"
        subtitle={`${rows.length} pessoa(s) cadastrada(s) no bolão.`}
      />
      <div className="container-app py-8">
        <UsersTable users={rows} currentUserId={me?.id ?? ""} />
      </div>
    </div>
  );
}
