import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { department: true },
    });

    if (!user) {
      await logAuditEvent({
        action: AuditAction.SECURITY_EVENT,
        entity: "Auth",
        details: { message: "Failed login attempt: user not found", email },
      });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status === "SUSPENDED" || user.status === "TERMINATED") {
      await logAuditEvent({
        userId: user.id,
        action: AuditAction.SECURITY_EVENT,
        entity: "Auth",
        details: { message: "Login blocked: account is suspended/terminated", status: user.status },
      });
      return NextResponse.json(
        { error: "Account is disabled. Please contact your Super Admin." },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent({
        userId: user.id,
        action: AuditAction.SECURITY_EVENT,
        entity: "Auth",
        details: { message: "Failed login attempt: invalid password" },
      });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.role === "SUPER_ADMIN",
      name: user.name,
    });

    // Set cookie
    await setSessionCookie(token);

    // Record successful login audit
    await logAuditEvent({
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: "Session",
      details: { role: user.role, isProtected: user.isProtected },
    });

    return NextResponse.json({
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
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
