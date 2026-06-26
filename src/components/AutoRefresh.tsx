"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  REFRESH_INTERVAL_MS,
  REFRESH_LIVE_INTERVAL_MS,
} from "@/lib/constants";

/**
 * Atualiza os dados da pagina periodicamente (revalida o Server Component
 * via router.refresh), dando sensacao de "tempo real" sem recarregar a pagina.
 */
export function AutoRefresh({
  intervalMs = REFRESH_INTERVAL_MS,
  liveIntervalMs = REFRESH_LIVE_INTERVAL_MS,
  live = false,
}: {
  intervalMs?: number;
  liveIntervalMs?: number;
  live?: boolean;
}) {
  const router = useRouter();
  const ms = live ? liveIntervalMs : intervalMs;

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    const id = setInterval(refresh, ms);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, ms]);

  return null;
}
