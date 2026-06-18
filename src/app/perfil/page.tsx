"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PhotoInput } from "@/components/PhotoInput";

export default function PerfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/perfil");
      return;
    }
    if (status !== "authenticated") return;

    setLoadingProfile(true);
    fetch("/api/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error("Falha ao carregar perfil");
        return res.json();
      })
      .then((data) => {
        setName(data.name ?? session?.user?.name ?? "");
        setImage(data.image ?? null);
      })
      .catch(() => setMsg("Não foi possível carregar seu perfil."))
      .finally(() => setLoadingProfile(false));
  }, [status, router, session?.user?.name]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error ?? "Erro ao salvar.");
      return;
    }
    await update({ name });
    setMsg("Perfil atualizado com sucesso! ✓");
    router.refresh();
  }

  if (status === "loading" || loadingProfile) {
    return (
      <div className="container-app py-20 text-center text-slate-400">
        Carregando...
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Meu Perfil" subtitle="Atualize seu nome e sua foto." />
      <div className="container-app py-8">
        <form onSubmit={save} className="card max-w-lg space-y-5 p-6">
          <PhotoInput name={name} value={image} onChange={setImage} />
          <div>
            <label className="label" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input
              className="input bg-slate-50 text-slate-400"
              value={session?.user?.email ?? ""}
              disabled
            />
          </div>
          {msg && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.includes("sucesso")
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {msg}
            </p>
          )}
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
