"use client";

import { useEffect, useState } from "react";

const NOTICE_KEY = "penalty-update-notice-v1";

export function UpdateNoticeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(localStorage.getItem(NOTICE_KEY) !== "seen");
  }, []);

  function close() {
    localStorage.setItem(NOTICE_KEY, "seen");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-950/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-notice-title"
    >
      <div className="w-full max-w-2xl animate-pop rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-2xl ring-1 ring-black/10 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Nota de atualização
            </p>
            <h2
              id="update-notice-title"
              className="mt-2 font-display text-xl font-extrabold text-amber-950 sm:text-2xl"
            >
              Atualização nos jogos decididos por pênaltis
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-xl p-2 text-amber-800 transition hover:bg-amber-100"
            aria-label="Fechar aviso"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-amber-900">
          A pontuação dos jogos a partir dos 32 avos agora considera apenas o
          placar até o fim da prorrogação; os gols da disputa de pênaltis não
          entram mais no placar final. Também foi adicionada uma opção para
          escolher quem vence caso o jogo vá para os pênaltis: quem acertar
          ganha +2 pontos.
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          Como a regra foi atualizada hoje, os jogos de ontem que terminaram
          nos pênaltis recebem uma recompensa extra de +2 pontos para cada
          palpite registrado nessa partida.
        </p>

        <button
          type="button"
          onClick={close}
          className="btn-primary mt-5 w-full sm:w-auto"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
