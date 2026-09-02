import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (user) {
      await logAuditEvent({
        userId: user.id,
        action: AuditAction.LOGOUT,
        entity: "Session",
        details: { message: "User logged out successfully" },
      });
    }

    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
