import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { syncEverything, scoreFinishedMatches } from "../src/lib/sync";

const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      poolName: "Bolão da Copa - Geração Eucarística",
      parishName: "Grupo Jovem Geração Eucarística",
      pointsExact: 5,
      pointsResult: 3,
      pointsGoalDiff: 1,
      predictionLockMinutes: 30,
    },
    update: {},
  });

  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@grupojovem.com")
    .toLowerCase()
    .trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("Defina ADMIN_PASSWORD no arquivo .env antes de rodar o seed.");
  }
  const adminName = process.env.ADMIN_NAME ?? "Coordenação Grupo Jovem";

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
    update: { role: "ADMIN" },
  });
  console.log(`✓ Admin: ${adminEmail} / senha: ${adminPassword}`);

  const demoPass = await bcrypt.hash("123456", 10);
  const demos = [
    { name: "Ana Clara", email: "ana@grupojovem.com" },
    { name: "João Pedro", email: "joao@grupojovem.com" },
    { name: "Mariana Souza", email: "mariana@grupojovem.com" },
  ];
  for (const d of demos) {
    await prisma.user.upsert({
      where: { email: d.email },
      create: { ...d, passwordHash: demoPass, role: "USER" },
      update: {},
    });
  }

  const result = await syncEverything();
  console.log("✓ Sincronizacao:", result);

  const users = await prisma.user.findMany({ where: { role: "USER" } });
  const matches = await prisma.match.findMany();
  for (const u of users) {
    for (const m of matches) {
      const hs = Math.floor(Math.random() * 4);
      const as = Math.floor(Math.random() * 4);
      await prisma.prediction.upsert({
        where: { userId_matchId: { userId: u.id, matchId: m.id } },
        create: { userId: u.id, matchId: m.id, homeScore: hs, awayScore: as },
        update: {},
      });
    }
  }

  const scored = await scoreFinishedMatches();
  console.log(`✓ Palpites pontuados: ${scored}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
