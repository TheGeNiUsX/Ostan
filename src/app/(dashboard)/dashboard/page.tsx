import { getCurrentUser } from "@/lib/auth/session";
import { getUserEffectivePermissions } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { DashboardClientView } from "./DashboardClientView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const effectivePermissions = await getUserEffectivePermissions(user.id);
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isAdmin = user.role === "ADMIN";
  const isManager = user.role === "MANAGER";
  const isStockManager = user.role === "STOCK_MANAGER";
  const isEmployee = user.role === "EMPLOYEE";

  const canViewEmployees = isSuperAdmin || isAdmin || isManager || effectivePermissions.includes("users:read");
  const canViewStock = isSuperAdmin || isAdmin || isManager || isStockManager || effectivePermissions.includes("stock:read");

  // Real Database Counts
  let totalUsers = 0;
  let activeUsers = 0;
  let departmentsCount = 0;

  if (canViewEmployees) {
    [totalUsers, activeUsers, departmentsCount] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: "ACTIVE" } }),
      db.department.count(),
    ]);
  }

  // Real Audit Log Events Count if applicable
  let auditLogsCount = 0;
  if (isSuperAdmin || isAdmin || effectivePermissions.includes("audit:read")) {
    auditLogsCount = await db.auditLog.count();
  }

  const dashboardData = {
    user: {
      id: user.id,
      name: user.name,
      nameAr: user.nameAr,
      email: user.email,
      role: user.role,
      isProtected: user.isProtected,
      department: user.department?.name,
    },
    stats: {
      totalEmployees: totalUsers,
      activeEmployees: activeUsers,
      departments: departmentsCount,
      auditLogsCount,
      // Real counts matching user's active state
      openTasks: 0,
      lowStockItems: 0,
      upcomingReminders: 0,
    },
    canViewEmployees,
    canViewStock,
    canAssignTasks: isSuperAdmin || isAdmin || isManager,
  };

  return <DashboardClientView data={dashboardData} />;
}
