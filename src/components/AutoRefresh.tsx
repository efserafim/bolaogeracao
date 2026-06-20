"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Atualiza os dados da pagina periodicamente (revalida o Server Component
 * via router.refresh), dando sensacao de "tempo real" sem recarregar a pagina.
 */
export function AutoRefresh({ intervalMs = 90000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    const id = setInterval(refresh, intervalMs);

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
  }, [router, intervalMs]);

  return null;
}
