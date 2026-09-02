import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";
import { AuditAction, UserRole } from "@prisma/client";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await db.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAllowed =
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.ADMIN ||
      (await hasPermission(user.id, "settings:manage"));

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to manage settings." },
        { status: 403 }
      );
    }

    const { key, value, description } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }

    const updated = await db.systemSetting.upsert({
      where: { key },
      update: { value: String(value), description: description || undefined },
      create: { key, value: String(value), description: description || undefined },
    });

    await logAuditEvent({
      userId: user.id,
      action: AuditAction.UPDATE,
      entity: "SystemSetting",
      entityId: key,
      details: { key, newValue: value },
    });

    return NextResponse.json({ setting: updated });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
