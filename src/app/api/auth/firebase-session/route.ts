import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit";
import { AuditAction, UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, name, fbUid } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isWaseem = normalizedEmail === "waseem.tw@hotmail.com";

    // Find or create user in Prisma DB to keep server-side RBAC in sync
    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { department: true },
    });

    if (!user) {
      const dummyPasswordHash = await bcrypt.hash(Date.now().toString() + "_" + Math.random(), 10);
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: dummyPasswordHash,
          name: name ? name.trim() : (isWaseem ? "Osama Al-Twaish" : "Worker"),
          nameAr: isWaseem ? "اسامة الطويش" : null,
          role: isWaseem ? UserRole.SUPER_ADMIN : UserRole.EMPLOYEE,
          status: UserStatus.ACTIVE,
          isProtected: isWaseem,
        },
        include: { department: true },
      });
    } else if (isWaseem && user.role !== UserRole.SUPER_ADMIN) {
      // Ensure Waseem is always Super Admin
      user = await db.user.update({
        where: { id: user.id },
        data: { role: UserRole.SUPER_ADMIN, isProtected: true },
        include: { department: true },
      });
    }

    // Create session token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.role === UserRole.SUPER_ADMIN || isWaseem,
      name: user.name,
    });

    // Set HTTP-only cookie
    await setSessionCookie(token);

    // Record login audit event
    await logAuditEvent({
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: "FirebaseAuthSession",
      details: {
        email: user.email,
        role: user.role,
        isProtected: user.isProtected,
        fbUid: fbUid || null,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nameAr: user.nameAr,
        role: user.role,
        isProtected: user.isProtected,
        department: user.department?.name,
      },
    });
  } catch (error) {
    console.error("Firebase session sync error:", error);
    return NextResponse.json({ error: "Failed to establish verified session" }, { status: 500 });
  }
}
