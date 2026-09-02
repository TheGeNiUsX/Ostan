import { db } from "@/lib/db";
import { UserRole, User } from "@prisma/client";
import { getCurrentUser } from "./session";

export interface UserWithPermissions extends User {
  userPermissions?: Array<{
    granted: boolean;
    permission: {
      code: string;
    };
  }>;
}

/**
 * Returns a set of all effective permission codes for a given user.
 * Resolution logic:
 * 1. If SUPER_ADMIN -> all permissions in the system.
 * 2. Role baseline permissions from RolePermission table.
 * 3. + UserPermission overrides where granted = true.
 * 4. - UserPermission overrides where granted = false.
 */
export async function getUserEffectivePermissions(userId: string): Promise<string[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      userPermissions: {
        include: { permission: true },
      },
    },
  });

  if (!user) return [];

  // Super Admin has all permissions unconditionally
  if (user.role === UserRole.SUPER_ADMIN) {
    const allPerms = await db.permission.findMany({ select: { code: true } });
    return allPerms.map((p) => p.code);
  }

  // Fetch base role permissions
  const rolePermissions = await db.rolePermission.findMany({
    where: { role: user.role },
    include: { permission: true },
  });

  const permissionSet = new Set<string>(rolePermissions.map((rp) => rp.permission.code));

  // Apply user-level overrides
  for (const up of user.userPermissions) {
    if (up.granted) {
      permissionSet.add(up.permission.code);
    } else {
      permissionSet.delete(up.permission.code);
    }
  }

  return Array.from(permissionSet);
}

/**
 * Check if the user has a specific permission
 */
export async function hasPermission(userId: string, permissionCode: string): Promise<boolean> {
  const permissions = await getUserEffectivePermissions(userId);
  return permissions.includes(permissionCode);
}

/**
 * Enforces Super Admin Protection Invariant:
 * - Target users who have role === 'SUPER_ADMIN' or isProtected === true cannot be
 *   modified, deactivated, or deleted by any user who is not a SUPER_ADMIN.
 * - Protected Super Admins (isProtected = true) cannot have their role changed, deactivated, or deleted by anyone.
 */
export function assertSuperAdminProtection(
  targetUser: { role: UserRole; isProtected: boolean; id: string },
  performingUser: { role: UserRole; id: string }
) {
  // If target is protected Super Admin, absolute protection
  if (targetUser.isProtected) {
    if (performingUser.id !== targetUser.id && performingUser.role !== UserRole.SUPER_ADMIN) {
      throw new Error("SECURITY_VIOLATION: Protected Super Admin cannot be modified or deleted by non-super-admins.");
    }
  }

  // If target is Super Admin, only another Super Admin can manage
  if (targetUser.role === UserRole.SUPER_ADMIN && performingUser.role !== UserRole.SUPER_ADMIN) {
    throw new Error("SECURITY_VIOLATION: Only a Super Admin can manage Super Admin accounts.");
  }
}

/**
 * Server guard: requires authentication or throws / redirects
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED: Authentication required.");
  }
  return user;
}

/**
 * Server guard: requires one of the allowed roles
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  if (user.role === UserRole.SUPER_ADMIN) return user;
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`FORBIDDEN: Requires one of the roles [${allowedRoles.join(", ")}]. Current role: ${user.role}`);
  }
  return user;
}

/**
 * Server guard: requires a specific permission code
 */
export async function requirePermission(permissionCode: string) {
  const user = await requireAuth();
  if (user.role === UserRole.SUPER_ADMIN) return user;
  const isAllowed = await hasPermission(user.id, permissionCode);
  if (!isAllowed) {
    throw new Error(`FORBIDDEN: Missing required permission "${permissionCode}".`);
  }
  return user;
}
