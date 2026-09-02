import { db } from "@/lib/db";
import { AuditAction } from "@prisma/client";
import { headers } from "next/headers";

interface LogAuditEventParams {
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | string;
}

export async function logAuditEvent({
  userId,
  action,
  entity,
  entityId,
  details,
}: LogAuditEventParams) {
  try {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    try {
      const headerList = headers();
      ipAddress = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "127.0.0.1";
      userAgent = headerList.get("user-agent") || null;
    } catch {
      // Background or static context where headers are unavailable
    }

    const detailsString = typeof details === "object" ? JSON.stringify(details) : details || null;

    return await db.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        details: detailsString,
        ipAddress: ipAddress ? ipAddress.split(",")[0].trim() : null,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}
