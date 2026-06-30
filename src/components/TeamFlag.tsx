import { teamAbbrev, teamDisplayName } from "@/lib/teams";

export function TeamFlag({
  name,
  crest,
  align = "left",
  className = "",
}: {
  name: string;
  crest?: string | null;
  align?: "left" | "right";
  className?: string;
}) {
  const displayName = teamDisplayName(name);

  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2.5 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      } ${className}`}
    >
      {crest ? (
        <img
          src={crest}
          alt={displayName}
          className="h-7 w-9 rounded-sm object-cover shadow-sm ring-1 ring-black/5"
        />
      ) : (
        <span className="flex h-7 w-9 items-center justify-center rounded-sm bg-slate-100 text-xs">
          🏳️
        </span>
      )}
      <span
        className="truncate font-display text-sm font-bold tracking-wide text-slate-800 sm:text-base"
        title={displayName}
      >
        {teamAbbrev(name)}
      </span>
    </div>
  );
}
