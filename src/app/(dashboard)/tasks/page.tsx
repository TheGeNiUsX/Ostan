import { getCurrentUser } from "@/lib/auth/session";
import { getUserEffectivePermissions } from "@/lib/auth/permissions";
import { TasksView } from "@/components/tasks/TasksView";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isAdmin = user.role === "ADMIN";
  const isManager = user.role === "MANAGER";

  const canAssignTasks = isSuperAdmin || isAdmin || isManager;

  return (
    <TasksView
      currentUser={{
        id: user.id,
        name: user.name,
        nameAr: user.nameAr,
        email: user.email,
        role: user.role,
      }}
      canAssignTasks={canAssignTasks}
    />
  );
}
