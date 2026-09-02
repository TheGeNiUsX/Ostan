import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DepartmentsClientView } from "./DepartmentsClientView";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Load all departments from DB
  const departments = await db.department.findMany({
    include: {
      manager: true,
      employees: {
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Load all users from DB
  const users = await db.user.findMany({
    include: {
      department: true,
    },
    orderBy: { name: "asc" },
  });

  // Load access rules setting from DB
  const setting = await db.systemSetting.findUnique({
    where: { key: "worker_section_access_rules" },
  });

  let initialRules: Record<string, Record<string, "accessible" | "locked" | "hidden">> = {};
  if (setting?.value) {
    try {
      initialRules = JSON.parse(setting.value);
    } catch {
      initialRules = {};
    }
  }

  return (
    <DepartmentsClientView
      currentUser={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProtected: user.isProtected,
      }}
      departments={departments}
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        nameAr: u.nameAr,
        email: u.email,
        role: u.role,
        isProtected: u.isProtected,
        department: u.department ? { id: u.department.id, name: u.department.name, nameAr: u.department.nameAr } : null,
      }))}
      initialRules={initialRules}
    />
  );
}
