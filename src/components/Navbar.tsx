"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Avatar } from "./Avatar";

const links = [
  { href: "/jogos", label: "Jogos" },
  { href: "/palpites", label: "Meus Palpites" },
  { href: "/ranking", label: "Ranking" },
  { href: "/historico", label: "Histórico" },
  { href: "/campeoes", label: "Campeões" },
];

export function Navbar({ poolName }: { poolName: string }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-950/95 backdrop-blur supports-[backdrop-filter]:bg-brand-950/80">
      <nav className="container-app flex h-16 items-center justify-between gap-2 overflow-hidden">
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl py-1 pr-2 outline-none transition focus-visible:ring-2 focus-visible:ring-accent-400"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-lg font-black text-brand-950 shadow">
            ⚽
          </span>
          <span className="truncate font-display text-base font-extrabold tracking-tight text-white sm:text-lg">
            {poolName}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === l.href
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pathname.startsWith("/admin")
                  ? "bg-accent-500 text-brand-950"
                  : "text-accent-400 hover:bg-white/10"
              }`}
            >
              Painel
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {status === "authenticated" ? (
            <>
              <Link href="/perfil" className="flex items-center gap-2">
                <Avatar
                  name={session.user?.name ?? "?"}
                  userId={(session.user as any)?.id}
                  size={34}
                />
                <span className="max-w-[120px] truncate text-sm font-medium text-white">
                  {session.user?.name}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-medium text-white/60 hover:text-white"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white">
                Entrar
              </Link>
              <Link href="/cadastro" className="btn-accent">
                Participar
              </Link>
            </>
          )}
        </div>

        <button
          className="shrink-0 rounded-lg p-2 text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-brand-950 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-accent-400 hover:bg-white/10"
              >
                Painel Admin
              </Link>
            )}
            <div className="my-2 h-px bg-white/10" />
            {status === "authenticated" ? (
              <>
                <Link
                  href="/perfil"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
                >
                  Meu Perfil
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/60 hover:bg-white/10"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setOpen(false)}
                  className="btn-accent mt-1"
                >
                  Participar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
