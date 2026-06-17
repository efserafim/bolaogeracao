import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN"]).optional(),
  password: z
    .string()
    .min(6, "A senha precisa de ao menos 6 caracteres")
    .optional(),
});

const deleteSchema = z.object({ userId: z.string().min(1) });

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const { userId, role, password } = parsed.data;
  if (!role && !password) {
    return NextResponse.json(
      { error: "Informe o papel ou a nova senha." },
      { status: 400 }
    );
  }

  const data: { role?: "USER" | "ADMIN"; passwordHash?: string } = {};
  if (role) data.role = role;
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return NextResponse.json({ ok: true, user: { id: user.id, role: user.role } });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const body = await req.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  if (parsed.data.userId === admin.id) {
    return NextResponse.json(
      { error: "Você não pode remover a própria conta." },
      { status: 400 }
    );
  }
  await prisma.user.delete({ where: { id: parsed.data.userId } });
  return NextResponse.json({ ok: true });
}
