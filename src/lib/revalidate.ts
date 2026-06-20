import { revalidatePath, revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  settings: "app-settings",
  ranking: "app-ranking",
  brazil: "app-brazil",
} as const;

const REVALIDATE_PATHS = ["/", "/jogos", "/ranking", "/campeoes"] as const;

export function invalidateAppCache(
  tags: (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS][] = [
    CACHE_TAGS.settings,
    CACHE_TAGS.ranking,
    CACHE_TAGS.brazil,
  ]
) {
  for (const tag of tags) {
    revalidateTag(tag);
  }
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}
