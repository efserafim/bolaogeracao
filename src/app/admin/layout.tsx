import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const adminLinks = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/participantes", label: "Participantes" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div>
      <div className="border-b border-slate-200 bg-brand-950">
        <div className="container-app flex h-14 items-center gap-1 overflow-x-auto">
          <span className="mr-3 text-sm font-bold text-accent-400">
            ⚙️ Painel Admin
          </span>
          {adminLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
