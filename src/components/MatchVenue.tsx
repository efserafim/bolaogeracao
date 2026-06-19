export function MatchVenue({ venue }: { venue?: string | null }) {
  if (!venue) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-slate-500">
      <span aria-hidden>📍</span>
      <span className="truncate" title={venue}>
        {venue}
      </span>
    </p>
  );
}
