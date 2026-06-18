import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaSync: PrismaClient | undefined;
};

/** Conexao direta (porta 5432) — evita timeout do pooler em escritas pesadas. */
export const prismaSync =
  globalForPrisma.prismaSync ??
  new PrismaClient({
    datasources: {
      db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaSync = prismaSync;
}
