import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserEffectivePermissions } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissions = await getUserEffectivePermissions(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nameAr: user.nameAr,
        phone: user.phone,
        nationality: user.nationality,
        role: user.role,
        status: user.status,
        isProtected: user.isProtected,
        department: user.department,
        permissions,
      },
    });
  } catch (error) {
    console.error("Auth /me error:", error);
    return NextResponse.json({ error: "Failed to fetch user state" }, { status: 500 });
  }
}
