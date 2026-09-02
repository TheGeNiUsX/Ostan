import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";
import { AuditAction, UserRole } from "@prisma/client";

const ACCESS_RULES_SETTING_KEY = "worker_section_access_rules";

// Default access matrix
const DEFAULT_ACCESS_RULES: Record<string, Record<string, "accessible" | "locked" | "hidden">> = {};

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setting = await db.systemSetting.findUnique({
      where: { key: ACCESS_RULES_SETTING_KEY },
    });

    let rules = DEFAULT_ACCESS_RULES;
    if (setting?.value) {
      try {
        rules = JSON.parse(setting.value);
      } catch (e) {
        console.error("Failed to parse access rules JSON:", e);
      }
    }

    return NextResponse.json({
      rules,
      currentUserId: user.id,
      currentUserRole: user.role,
    });
  } catch (error) {
    console.error("Access Rules GET error:", error);
    return NextResponse.json({ error: "Failed to fetch access rules" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAuthorized = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Only Administrators can configure section access rules." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, sectionKey, accessState, bulkRules } = body;

    const setting = await db.systemSetting.findUnique({
      where: { key: ACCESS_RULES_SETTING_KEY },
    });

    let rules: Record<string, Record<string, "accessible" | "locked" | "hidden">> = {};
    if (setting?.value) {
      try {
        rules = JSON.parse(setting.value);
      } catch {
        rules = {};
      }
    }

    if (bulkRules && typeof bulkRules === "object") {
      // Overwrite / merge bulk rules
      rules = { ...rules, ...bulkRules };
    } else if (userId && sectionKey && accessState) {
      // Single rule update
      if (!rules[userId]) {
        rules[userId] = {};
      }
      rules[userId][sectionKey] = accessState;
    } else {
      return NextResponse.json(
        { error: "Invalid payload: userId, sectionKey, and accessState or bulkRules required." },
        { status: 400 }
      );
    }

    // Persist to database
    const serialized = JSON.stringify(rules);
    await db.systemSetting.upsert({
      where: { key: ACCESS_RULES_SETTING_KEY },
      update: { value: serialized, description: "Worker granular section access and locking rules" },
      create: { key: ACCESS_RULES_SETTING_KEY, value: serialized, description: "Worker granular section access and locking rules" },
    });

    // Log audit event
    await logAuditEvent({
      userId: user.id,
      action: AuditAction.PERMISSION_CHANGE,
      entity: "SectionAccessPolicy",
      entityId: userId || "bulk",
      details: {
        configuredBy: user.email,
        targetUser: userId,
        sectionKey,
        accessState,
      },
    });

    return NextResponse.json({ success: true, rules });
  } catch (error) {
    console.error("Access Rules POST error:", error);
    return NextResponse.json({ error: "Failed to update access rules" }, { status: 500 });
  }
}
