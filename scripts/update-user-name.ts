import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateUserNameArabic() {
  console.log("👤 Updating Arabic name to اسامة الطويش...");

  const user = await prisma.user.updateMany({
    where: { email: "waseem.tw@hotmail.com" },
    data: {
      name: "Osama Al-Twaish",
      nameAr: "اسامة الطويش",
    },
  });

  console.log("✅ Updated user count:", user.count);
  const updatedUser = await prisma.user.findUnique({ where: { email: "waseem.tw@hotmail.com" } });
  console.log("📄 Current profile in database:", updatedUser?.name, "|", updatedUser?.nameAr);
}

updateUserNameArabic()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
