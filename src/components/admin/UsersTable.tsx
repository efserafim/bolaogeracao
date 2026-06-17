"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Avatar } from "../Avatar";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  predictions: number;
  points: number;
  createdAt: string;
}

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function toggleRole(u: AdminUserRow) {
    setBusy(u.id);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: u.id,
        role: u.role === "ADMIN" ? "USER" : "ADMIN",
      }),
    });
    setBusy(null);
    router.refresh();
  }

  async function savePassword(u: AdminUserRow) {
    if (newPassword.length < 6) {
      setPasswordError("A senha precisa de ao menos 6 caracteres.");
      return;
    }
    setPasswordError(null);
    setBusy(u.id);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.id, password: newPassword }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setPasswordError(data.error ?? "Erro ao alterar senha.");
      return;
    }
    setPasswordUserId(null);
    setNewPassword("");
    router.refresh();
  }

  async function remove(u: AdminUserRow) {
    if (!confirm(`Remover ${u.name}? Os palpites também serão apagados.`)) return;
    setBusy(u.id);
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.id }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Participante</th>
            <th className="px-4 py-3">Palpites</th>
            <th className="px-4 py-3">Pontos</th>
            <th className="px-4 py-3">Papel</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <Fragment key={u.id}>
              <tr>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} image={u.image} size={34} />
                    <div>
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{u.predictions}</td>
                <td className="px-4 py-3 font-semibold text-brand-700">
                  {u.points}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      u.role === "ADMIN"
                        ? "bg-accent-500 text-brand-950"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {u.role === "ADMIN" ? "Admin" : "Participante"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => {
                        if (passwordUserId === u.id) {
                          setPasswordUserId(null);
                          setNewPassword("");
                          setPasswordError(null);
                        } else {
                          setPasswordUserId(u.id);
                          setNewPassword("");
                          setPasswordError(null);
                        }
                      }}
                      disabled={busy === u.id}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      {passwordUserId === u.id ? "Cancelar" : "Alterar senha"}
                    </button>
                    <button
                      onClick={() => toggleRole(u)}
                      disabled={busy === u.id}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      {u.role === "ADMIN" ? "Tornar participante" : "Tornar admin"}
                    </button>
                    {u.id !== currentUserId && (
                      <button
                        onClick={() => remove(u)}
                        disabled={busy === u.id}
                        className="btn px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              {passwordUserId === u.id && (
                <tr>
                  <td colSpan={5} className="bg-slate-50 px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <label className="label text-xs">
                          Nova senha para {u.name}
                        </label>
                        <input
                          type="password"
                          className="input"
                          minLength={6}
                          placeholder="Mínimo 6 caracteres"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => savePassword(u)}
                        disabled={busy === u.id}
                        className="btn-primary shrink-0"
                      >
                        {busy === u.id ? "Salvando..." : "Salvar senha"}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
