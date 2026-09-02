import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit";
import { AuditAction, UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Special Auto-Super Admin Rule for waseem.tw@hotmail.com
    const isWaseemSuperAdmin = normalizedEmail === "waseem.tw@hotmail.com";
    const role: UserRole = isWaseemSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.EMPLOYEE;
    const isProtected = isWaseemSuperAdmin;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in database
    const newUser = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
        isProtected,
        status: "ACTIVE",
      },
    });

    // Create session token
    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      isSuperAdmin: newUser.role === UserRole.SUPER_ADMIN,
      name: newUser.name,
    });

    // Set HTTP-only session cookie
    await setSessionCookie(token);

    // Log audit event
    await logAuditEvent({
      userId: newUser.id,
      action: AuditAction.CREATE,
      entity: "User",
      details: {
        message: isWaseemSuperAdmin ? "Super Admin registered and auto-promoted" : "New worker registered",
        email: newUser.email,
        role: newUser.role,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isProtected: newUser.isProtected,
      },
      isAutoSuperAdmin: isWaseemSuperAdmin,
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
