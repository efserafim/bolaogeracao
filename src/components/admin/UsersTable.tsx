"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
            <tr key={u.id}>
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
                <div className="flex justify-end gap-2">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
