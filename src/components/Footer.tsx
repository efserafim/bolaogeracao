import Image from "next/image";

export function Footer({
  poolName,
  parishName,
}: {
  poolName: string;
  parishName: string;
}) {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-app flex flex-col items-center justify-between gap-4 py-8 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Grupo Jovem Geração Eucarística"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full bg-brand-600 object-contain p-1"
          />
          <div>
            <p className="font-display font-bold text-brand-900">{poolName}</p>
            <p className="text-sm text-slate-500">{parishName}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 sm:items-end">
          <p className="text-sm text-slate-400">
            Feito com fé e amizade · União, comunidade e diversão ⚽
          </p>
          <p className="text-sm text-slate-500">
            Criado por{" "}
            <span className="font-medium text-slate-700">Eduardo Serafim</span>
            {" · "}
            <a
              href="https://instagram.com/efserafim"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              @efserafim
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
