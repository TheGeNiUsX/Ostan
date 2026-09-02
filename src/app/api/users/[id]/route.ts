import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserEffectivePermissions } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";
import { AuditAction, UserRole, UserStatus } from "@prisma/client";
import { deleteFirebaseUser, updateFirebaseUser } from "@/lib/firebase/admin";
import { deleteFirebaseIdentityUser } from "@/lib/firebase/identity-toolkit";
import * as bcrypt from "bcryptjs";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN || currentUser.email === "waseem.tw@hotmail.com";
    const permissions = await getUserEffectivePermissions(currentUser.id);
    const canEdit = isSuperAdmin || currentUser.role === UserRole.ADMIN || permissions.includes("users:edit");

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden: You lack permissions to edit users." }, { status: 403 });
    }

    const userId = params.id;
    const targetUser = await db.user.findUnique({ where: { id: userId } });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Protect Master Super Admin
    if (targetUser.isProtected && !isSuperAdmin) {
      return NextResponse.json({ error: "Protected Super Admin accounts cannot be edited." }, { status: 403 });
    }

    const body = await req.json();
    const { name, nameAr, email, role, status, departmentId, phone, nationality, password } = body;

    const oldEmail = targetUser.email;
    const newEmail = email ? email.toLowerCase().trim() : oldEmail;

    // 1. If email or password changed, update in Firebase Auth
    if (newEmail !== oldEmail || password) {
      await updateFirebaseUser({
        oldEmail: oldEmail,
        newEmail: newEmail,
        displayName: name || targetUser.name,
        password: password || undefined,
      });
    }

    // 2. Update in Prisma DB
    const updateData: any = {
      name: name ? name.trim() : undefined,
      nameAr: nameAr ? nameAr.trim() : undefined,
      email: newEmail,
      role: role ? (role as UserRole) : undefined,
      status: status ? (status as UserStatus) : undefined,
      departmentId: departmentId !== undefined ? departmentId : undefined,
      phone: phone !== undefined ? phone : undefined,
      nationality: nationality !== undefined ? nationality : undefined,
    };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      include: { department: true },
    });

    await logAuditEvent({
      userId: currentUser.id,
      action: AuditAction.UPDATE,
      entity: "User",
      entityId: updated.id,
      details: {
        updatedEmail: updated.email,
        previousEmail: oldEmail !== newEmail ? oldEmail : undefined,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN || currentUser.email === "waseem.tw@hotmail.com";
    const permissions = await getUserEffectivePermissions(currentUser.id);
    const canDelete = isSuperAdmin || permissions.includes("users:delete");

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden: You lack permissions to delete users." }, { status: 403 });
    }

    const userId = params.id;
    const targetUser = await db.user.findUnique({ where: { id: userId } });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (targetUser.isProtected || targetUser.email === "waseem.tw@hotmail.com") {
      return NextResponse.json({ error: "The protected Super Admin account cannot be deleted." }, { status: 403 });
    }

    // 1. Delete from Firebase Auth & Cloud Firestore
    try {
      await deleteFirebaseIdentityUser(targetUser.email);
      await deleteFirebaseUser(targetUser.email);
      console.log(`🔥 Deleted user ${targetUser.email} from Firebase.`);
    } catch (fbErr) {
      console.warn("Notice during Firebase user deletion:", fbErr);
    }

    // 2. Delete from Prisma DB
    await db.user.delete({
      where: { id: userId },
    });

    // 3. Record Audit Log
    await logAuditEvent({
      userId: currentUser.id,
      action: AuditAction.DELETE,
      entity: "User",
      entityId: userId,
      details: {
        deletedEmail: targetUser.email,
        deletedName: targetUser.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} (${targetUser.email}) successfully deleted from Database and Firebase.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
