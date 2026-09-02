import { getCurrentUser } from "@/lib/auth/session";
import { StockRequestsView } from "@/components/stock/StockRequestsView";

export const dynamic = "force-dynamic";

export default async function StockRequestsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isSuperAdmin = user.role === "SUPER_ADMIN" || user.email === "waseem.tw@hotmail.com";

  return (
    <StockRequestsView
      userName={user.name}
      userRole={user.role}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
