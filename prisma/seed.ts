import { PrismaClient, UserRole, UserStatus, AuditAction } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS_LIST = [
  // Users
  { code: "users:read", name: "View Users", nameAr: "عرض المستخدمين", category: "Users", description: "View employee profiles and user list" },
  { code: "users:create", name: "Create Users", nameAr: "إضافة مستخدم", category: "Users", description: "Create new employee and user accounts" },
  { code: "users:edit", name: "Edit Users", nameAr: "تعديل المستخدمين", category: "Users", description: "Update profile information and status" },
  { code: "users:delete", name: "Delete Users", nameAr: "حذف المستخدمين", category: "Users", description: "Remove users from the system" },

  // Roles & Security
  { code: "roles:manage", name: "Manage Roles", nameAr: "إدارة الأدوار", category: "Security", description: "Assign and configure system roles" },
  { code: "permissions:manage", name: "Manage Permissions", nameAr: "إدارة الصلاحيات", category: "Security", description: "Override user-level permissions" },

  // Departments
  { code: "departments:read", name: "View Departments", nameAr: "عرض الأقسام", category: "Departments", description: "View company departments" },
  { code: "departments:manage", name: "Manage Departments", nameAr: "إدارة الأقسام", category: "Departments", description: "Create and update departments" },

  // Tasks
  { code: "tasks:read", name: "View Assigned Tasks", nameAr: "عرض المهام المعينة", category: "Tasks", description: "View tasks assigned to oneself" },
  { code: "tasks:view_all", name: "View All Tasks", nameAr: "عرض جميع المهام", category: "Tasks", description: "View department or company-wide tasks" },
  { code: "tasks:create", name: "Create Tasks", nameAr: "إنشاء مهام", category: "Tasks", description: "Create and assign new tasks" },
  { code: "tasks:edit", name: "Edit Tasks", nameAr: "تعديل المهام", category: "Tasks", description: "Update task details and progression" },
  { code: "tasks:delete", name: "Delete Tasks", nameAr: "حذف المهام", category: "Tasks", description: "Remove tasks" },
  { code: "tasks:assign", name: "Assign Tasks", nameAr: "تعيين المهام", category: "Tasks", description: "Assign tasks to team members" },

  // Reminders
  { code: "reminders:read", name: "View Reminders", nameAr: "عرض التذكيرات", category: "Reminders", description: "View personal and company reminders" },
  { code: "reminders:create", name: "Create Reminders", nameAr: "إنشاء تذكير", category: "Reminders", description: "Create personal or team reminders" },
  { code: "reminders:manage", name: "Manage Company Reminders", nameAr: "إدارة تذكيرات الشركة", category: "Reminders", description: "Manage document/contract expiry alerts" },

  // Stock & Inventory
  { code: "stock:read", name: "View Stock", nameAr: "عرض المخزون", category: "Stock", description: "Inspect inventory items, quantities, and categories" },
  { code: "stock:create", name: "Add Stock Items", nameAr: "إضافة أصناف", category: "Stock", description: "Add new products and spare parts" },
  { code: "stock:edit", name: "Edit Stock", nameAr: "تعديل المخزون", category: "Stock", description: "Update stock counts and item details" },
  { code: "stock:delete", name: "Delete Stock", nameAr: "حذف أصناف", category: "Stock", description: "Remove inventory items" },
  { code: "stock:thresholds", name: "Configure Stock Thresholds", nameAr: "ضبط حدود التنبيه للمخزون", category: "Stock", description: "Set low-stock alert trigger levels" },

  // Stock Requests
  { code: "stock_requests:read", name: "View Stock Requests", nameAr: "عرض طلبات الصرف", category: "Stock Requests", description: "View item requests" },
  { code: "stock_requests:create", name: "Submit Stock Request", nameAr: "تقديم طلب صرف", category: "Stock Requests", description: "Request tools or supplies" },
  { code: "stock_requests:approve", name: "Approve Stock Requests", nameAr: "اعتماد طلبات الصرف", category: "Stock Requests", description: "Approve and fulfill stock requests" },

  // Reports & Analytics
  { code: "reports:view", name: "View Reports", nameAr: "عرض التقارير", category: "Reports", description: "Access business reports and dashboards" },
  { code: "reports:export", name: "Export Reports", nameAr: "تصدير التقارير", category: "Reports", description: "Download CSV and PDF reports" },

  // Audit Logs
  { code: "audit:view", name: "View Audit Logs", nameAr: "عرض سجل العمليات", category: "Audit", description: "Inspect security events and audit trails" },

  // Settings
  { code: "settings:read", name: "View Settings", nameAr: "عرض الإعدادات", category: "Settings", description: "View system configurations" },
  { code: "settings:manage", name: "Manage Settings", nameAr: "إدارة الإعدادات", category: "Settings", description: "Update system-wide settings" },
];

const ROLE_PERMISSIONS_MAP: Record<UserRole, string[]> = {
  SUPER_ADMIN: PERMISSIONS_LIST.map((p) => p.code),
  ADMIN: PERMISSIONS_LIST.map((p) => p.code).filter(c => c !== "roles:manage"), // Admin cannot change Super Admin roles
  MANAGER: [
    "users:read", "users:create", "users:edit",
    "departments:read",
    "tasks:read", "tasks:view_all", "tasks:create", "tasks:edit", "tasks:assign",
    "reminders:read", "reminders:create", "reminders:manage",
    "stock:read",
    "stock_requests:read", "stock_requests:create",
    "reports:view",
    "settings:read"
  ],
  EMPLOYEE: [
    "tasks:read", "tasks:edit",
    "reminders:read", "reminders:create",
    "stock_requests:create",
    "settings:read"
  ],
  STOCK_MANAGER: [
    "stock:read", "stock:create", "stock:edit", "stock:delete", "stock:thresholds",
    "stock_requests:read", "stock_requests:create", "stock_requests:approve",
    "reports:view",
    "settings:read"
  ]
};

async function main() {
  console.log("🌱 Starting Ostan database seed...");

  // 1. Seed Permissions
  console.log("Creating permissions...");
  for (const perm of PERMISSIONS_LIST) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, nameAr: perm.nameAr, category: perm.category, description: perm.description },
      create: perm,
    });
  }

  // 2. Fetch all permissions map
  const allPermissions = await prisma.permission.findMany();
  const permCodeToId = new Map(allPermissions.map((p) => [p.code, p.id]));

  // 3. Seed Role Permissions
  console.log("Assigning role permissions...");
  for (const [role, codes] of Object.entries(ROLE_PERMISSIONS_MAP)) {
    const typedRole = role as UserRole;
    for (const code of codes) {
      const permissionId = permCodeToId.get(code);
      if (permissionId) {
        await prisma.rolePermission.upsert({
          where: {
            role_permissionId: {
              role: typedRole,
              permissionId: permissionId,
            },
          },
          update: {},
          create: {
            role: typedRole,
            permissionId: permissionId,
          },
        });
      }
    }
  }

  // 4. Seed Departments
  console.log("Creating departments...");
  const execDept = await prisma.department.upsert({
    where: { name: "Executive Management" },
    update: {},
    create: {
      name: "Executive Management",
      nameAr: "الإدارة التنفيذية",
      description: "Company executive leadership and administration",
    },
  });

  const hrDept = await prisma.department.upsert({
    where: { name: "Human Resources" },
    update: {},
    create: {
      name: "Human Resources",
      nameAr: "الموارد البشرية",
      description: "People operations, talent, and employee relations",
    },
  });

  const opsDept = await prisma.department.upsert({
    where: { name: "Operations & Logistics" },
    update: {},
    create: {
      name: "Operations & Logistics",
      nameAr: "العمليات واللوجستيات",
      description: "Inventory, supply chain, and fleet maintenance",
    },
  });

  const itDept = await prisma.department.upsert({
    where: { name: "Information Technology" },
    update: {},
    create: {
      name: "Information Technology",
      nameAr: "تقنية المعلومات",
      description: "Software engineering, infrastructure, and security",
    },
  });

  // 5. Seed Users with hashed passwords
  console.log("Creating default role accounts...");
  // 5. Initialize Real Master Super Admin (waseem.tw@hotmail.com)
  console.log("Configuring Master Super Admin account (waseem.tw@hotmail.com)...");
  const passwordSalt = 10;
  const masterPasswordHash = await bcrypt.hash("Hhuyt9900@", passwordSalt);

  await prisma.user.upsert({
    where: { email: "waseem.tw@hotmail.com" },
    update: {
      name: "Osama Al-Twaish",
      nameAr: "اسامة الطويش",
      phone: "+966 50 111 2233",
      nationality: "Saudi Arabian",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isProtected: true,
      departmentId: execDept.id,
      passwordHash: masterPasswordHash,
    },
    create: {
      email: "waseem.tw@hotmail.com",
      passwordHash: masterPasswordHash,
      name: "Osama Al-Twaish",
      nameAr: "اسامة الطويش",
      phone: "+966 50 111 2233",
      nationality: "Saudi Arabian",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isProtected: true,
      departmentId: execDept.id,
    },
  });

  // 6. Seed System Settings
  console.log("Configuring system settings...");
  const defaultSettings = [
    { key: "company_name", value: "Ostan Enterprise", description: "Company primary brand name" },
    { key: "company_name_ar", value: "مؤسسة أستان", description: "Company Arabic brand name" },
    { key: "default_language", value: "en", description: "Default interface language" },
    { key: "default_theme", value: "system", description: "Default color theme" },
    { key: "stock_alert_threshold", value: "5", description: "Default low stock alert trigger count" },
    { key: "session_timeout_hours", value: "24", description: "Session inactivity expiration" },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }

  // 7. Initial Audit Log
  const masterAdmin = await prisma.user.findUnique({ where: { email: "waseem.tw@hotmail.com" } });
  if (masterAdmin) {
    await prisma.auditLog.create({
      data: {
        userId: masterAdmin.id,
        action: AuditAction.CREATE,
        entity: "System",
        entityId: "Phase-Real-Init",
        details: JSON.stringify({ message: "Ostan real system data initialized successfully." }),
        ipAddress: "127.0.0.1",
        userAgent: "Ostan-Seed-Runner/1.0",
      },
    });
  }

  console.log("✅ Ostan real system configuration completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
