import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function purgeTestWorkers() {
  console.log("🧹 Purging all test workers...");

  const deleted = await prisma.user.deleteMany({
    where: {
      email: {
        not: "waseem.tw@hotmail.com",
      },
    },
  });

  console.log(`✅ Deleted ${deleted.count} test accounts.`);

  // Verify only Osama Al-Twaish remains
  await prisma.user.updateMany({
    where: { email: "waseem.tw@hotmail.com" },
    data: {
      name: "Osama Al-Twaish",
      nameAr: "اسامة الطويش",
    },
  });

  const remaining = await prisma.user.findMany({
    select: { name: true, nameAr: true, email: true, role: true },
  });
  console.log("Remaining Real Users in Database:", JSON.stringify(remaining, null, 2));
}

purgeTestWorkers().finally(() => prisma.$disconnect());
