import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserEffectivePermissions } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";
import { AuditAction, UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { createFirebaseIdentityUser } from "@/lib/firebase/identity-toolkit";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissions = await getUserEffectivePermissions(currentUser.id);
    const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN || currentUser.email === "waseem.tw@hotmail.com";
    const canView = isSuperAdmin || currentUser.role === UserRole.ADMIN || permissions.includes("users:read");

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await db.user.findMany({
      include: { department: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        nameAr: u.nameAr,
        phone: u.phone,
        nationality: u.nationality,
        role: u.role,
        status: u.status,
        isProtected: u.isProtected,
        department: u.department ? { id: u.department.id, name: u.department.name } : null,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN || currentUser.email === "waseem.tw@hotmail.com";
    const permissions = await getUserEffectivePermissions(currentUser.id);
    const canCreate = isSuperAdmin || currentUser.role === UserRole.ADMIN || permissions.includes("users:create");

    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden: You lack permissions to create users." }, { status: 403 });
    }

    const body = await req.json();
    const { name, nameAr, email, password, role, departmentId, phone, nationality } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists in DB
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    // 1. Create in Firebase Auth & Cloud Firestore
    let fbUid: string | null = null;
    try {
      const fbResult = await createFirebaseIdentityUser({
        email: normalizedEmail,
        password: password,
        displayName: name.trim(),
      });
      fbUid = fbResult?.uid || null;
      console.log(`🔥 Registered user ${normalizedEmail} in Firebase Auth. (UID: ${fbUid})`);
    } catch (fbErr: any) {
      console.warn("Notice during Firebase user creation:", fbErr);
    }

    // 2. Create in Prisma Database
    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = (role as UserRole) || UserRole.EMPLOYEE;

    const newUser = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        nameAr: nameAr ? nameAr.trim() : null,
        role: assignedRole,
        status: UserStatus.ACTIVE,
        isProtected: false,
        departmentId: departmentId || null,
        phone: phone || null,
        nationality: nationality || null,
      },
      include: { department: true },
    });

    // 3. Record Audit Log
    await logAuditEvent({
      userId: currentUser.id,
      action: AuditAction.CREATE,
      entity: "User",
      entityId: newUser.id,
      details: {
        createdEmail: newUser.email,
        createdRole: newUser.role,
        firebaseSynced: Boolean(fbUid),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        nameAr: newUser.nameAr,
        role: newUser.role,
        status: newUser.status,
        department: newUser.department ? { id: newUser.department.id, name: newUser.department.name } : null,
      },
    });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}
