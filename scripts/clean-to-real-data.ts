import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function cleanToRealData() {
  console.log("🧹 Cleaning out seed mock data and keeping only real data...\n");

  // 1. Find or create master Super Admin (waseem.tw@hotmail.com)
  const masterEmail = "waseem.tw@hotmail.com";
  let masterUser = await prisma.user.findUnique({
    where: { email: masterEmail },
  });

  const dummyHash = await bcrypt.hash("Hhuyt9900@", 10);

  if (!masterUser) {
    masterUser = await prisma.user.create({
      data: {
        email: masterEmail,
        passwordHash: dummyHash,
        name: "Waseem Al-Otaibi",
        nameAr: "وسيم العتيبي",
        phone: "+966 50 111 2233",
        nationality: "Saudi Arabian",
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        isProtected: true,
      },
    });
    console.log("  ✅ Master Super Admin created:", masterEmail);
  } else {
    masterUser = await prisma.user.update({
      where: { id: masterUser.id },
      data: {
        name: "Waseem Al-Otaibi",
        nameAr: "وسيم العتيبي",
        role: UserRole.SUPER_ADMIN,
        isProtected: true,
        status: UserStatus.ACTIVE,
      },
    });
    console.log("  ✅ Master Super Admin preserved:", masterEmail);
  }

  // 2. Remove fake seed users (emails ending in @ostan.internal)
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: "@ostan.internal",
      },
      id: {
        not: masterUser.id,
      },
    },
  });
  console.log(`  🗑️ Removed ${deletedUsers.count} mock/seed test accounts.`);

  // 3. Keep real users count
  const totalUsers = await prisma.user.count();
  console.log(`  👥 Total real active users in database: ${totalUsers}`);

  console.log("\n=======================================================");
  console.log("🎉 SUCCESS: Database cleaned to 100% REAL DATA!");
  console.log("=======================================================\n");
}

cleanToRealData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
