"use client";

import Image from "next/image";
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

function NavLink({
  href,
  label,
  active,
  onClick,
  className = "",
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 lg:px-3.5 ${
        active
          ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      } ${className}`}
    >
      {label}
    </Link>
  );
}

function RumoAoHexaTag() {
  return (
    <span className="navbar-hexa-tag" aria-label="Rumo ao Hexa">
      <span className="navbar-hexa-word navbar-hexa-green">RUMO</span>
      <span className="navbar-hexa-word navbar-hexa-yellow"> AO </span>
      <span className="navbar-hexa-word navbar-hexa-blue">HEXA</span>
    </span>
  );
}

export function Navbar({
  parishName,
  parishSubtitle = "Paróquia Santo Antônio - Bacaxá",
}: {
  parishName: string;
  parishSubtitle?: string;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="navbar-header sticky top-0 z-40">
      <nav className="navbar-inner container-app">
        <Link href="/" className="navbar-brand group">
          <div className="navbar-logo-badge shrink-0">
            <Image
              src="/logo.png"
              alt={parishName}
              width={80}
              height={80}
              className="navbar-logo-image"
              priority
            />
          </div>
          <span className="navbar-brand-copy">
            <span className="navbar-brand-title">{parishName}</span>
            <span className="navbar-brand-subtitle">{parishSubtitle}</span>
            <RumoAoHexaTag />
          </span>
        </Link>

        <div className="navbar-links hidden md:flex">
          {links.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              label={l.label}
              active={pathname === l.href}
            />
          ))}
          {isAdmin && (
            <NavLink
              href="/admin"
              label="Painel"
              active={pathname.startsWith("/admin")}
            />
          )}
        </div>

        <div className="navbar-actions hidden md:flex">
          {status === "authenticated" ? (
            <>
              <Link href="/perfil" className="navbar-profile">
                <Avatar
                  name={session.user?.name ?? "?"}
                  userId={(session.user as any)?.id}
                  size={34}
                />
                <span className="max-w-[7.5rem] truncate text-sm font-semibold text-white/90 lg:max-w-[9rem]">
                  {session.user?.name}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="navbar-ghost-btn"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="navbar-ghost-btn">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="btn-accent px-4 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/35"
              >
                Participar
              </Link>
            </>
          )}
        </div>

        <button
          className="navbar-menu-btn md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {open && (
        <div className="navbar-mobile-menu border-t border-white/10 md:hidden">
          <div className="container-app flex flex-col gap-1.5 py-4">
            {links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                active={pathname === l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-2.5"
              />
            ))}
            {isAdmin && (
              <NavLink
                href="/admin"
                label="Painel Admin"
                active={pathname.startsWith("/admin")}
                onClick={() => setOpen(false)}
                className="px-4 py-2.5"
              />
            )}
            <div className="my-2 h-px bg-white/10" />
            {status === "authenticated" ? (
              <>
                <Link
                  href="/perfil"
                  onClick={() => setOpen(false)}
                  className="navbar-profile px-4 py-2.5"
                >
                  <Avatar
                    name={session.user?.name ?? "?"}
                    userId={(session.user as any)?.id}
                    size={34}
                  />
                  <span className="text-sm font-semibold text-white/90">
                    Meu Perfil
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="navbar-ghost-btn px-4 py-2.5 text-left"
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-1 pt-1">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="navbar-ghost-btn px-4 py-2.5 text-center"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setOpen(false)}
                  className="btn-accent justify-center shadow-lg shadow-accent-500/20"
                >
                  Participar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
