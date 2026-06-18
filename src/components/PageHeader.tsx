export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="container-app flex flex-col gap-3 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 max-w-full text-sm text-slate-500 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    SCHEDULED: { label: "Agendado", cls: "bg-brand-100 text-brand-700" },
    LIVE: { label: "● Ao vivo", cls: "bg-red-100 text-red-600 animate-pulse" },
    FINISHED: { label: "Encerrado", cls: "bg-slate-100 text-slate-500" },
    POSTPONED: { label: "Adiado", cls: "bg-amber-100 text-amber-700" },
  };
  const s = map[status] ?? map.SCHEDULED;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
