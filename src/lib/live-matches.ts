import { prisma } from "./prisma";
import { getPoolMatchFilter } from "./settings";

export async function hasLivePoolMatches() {
  const poolFilter = await getPoolMatchFilter();
  const live = await prisma.match.count({
    where: { ...poolFilter, status: "LIVE" },
  });
  return live > 0;
}
