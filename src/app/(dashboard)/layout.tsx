import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AppShell } from "@/components/shell/AppShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const sanitizedUser = {
    id: user.id,
    name: user.name,
    nameAr: user.nameAr,
    email: user.email,
    role: user.role,
    isProtected: user.isProtected,
  };

  return <AppShell user={sanitizedUser}>{children}</AppShell>;
}
