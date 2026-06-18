"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-4xl">😵</p>
      <h2 className="mt-4 font-display text-xl font-bold text-slate-900">
        Algo deu errado ao carregar a página
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Pode ser instabilidade temporária do servidor. Tente recarregar.
      </p>
      <button onClick={reset} className="btn-primary mt-6">
        Tentar novamente
      </button>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-slate-100 p-3 text-left text-xs text-slate-600">
          {error.message}
        </pre>
      )}
    </div>
  );
}
