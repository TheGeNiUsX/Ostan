import { getCurrentUser } from "@/lib/auth/session";
import { StockView } from "@/components/stock/StockView";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isSuperAdmin = user.role === "SUPER_ADMIN" || user.email === "waseem.tw@hotmail.com";

  return <StockView userRole={user.role} isSuperAdmin={isSuperAdmin} />;
}
