"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { PhotoInput } from "@/components/PhotoInput";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, image }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Erro ao criar conta.");
      return;
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    router.push("/jogos");
    router.refresh();
  }

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-extrabold text-brand-900">
          Entre na disputa! 🎉
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Crie seu perfil e comece a palpitar com o Grupo Jovem.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <PhotoInput name={name} value={image} onChange={setImage} />

          <div>
            <label className="label" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Criando conta..." : "Criar minha conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
