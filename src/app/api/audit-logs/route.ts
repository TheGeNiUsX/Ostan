import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAuthorized =
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.ADMIN ||
      (await hasPermission(user.id, "audit:view"));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view audit logs." },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const action = url.searchParams.get("action");

    const where: any = {};
    if (action && action !== "ALL") {
      where.action = action;
    }

    const logs = await db.auditLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Audit log fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
