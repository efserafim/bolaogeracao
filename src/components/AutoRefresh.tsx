"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Atualiza os dados da pagina periodicamente (revalida o Server Component
 * via router.refresh), dando sensacao de "tempo real" sem recarregar a pagina.
 */
export function AutoRefresh({ intervalMs = 45000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        router.refresh();
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
