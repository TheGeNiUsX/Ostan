"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckSquare,
  Bell,
  Package,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  ShieldAlert,
  Lock,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id?: string;
    name: string;
    nameAr?: string | null;
    email: string;
    role: string;
    isProtected?: boolean;
  } | null;
}

export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useI18n();

  const [lockedModalSection, setLockedModalSection] = useState<string | null>(null);
  const [accessRules, setAccessRules] = useState<Record<string, Record<string, "accessible" | "locked" | "hidden">>>({});

  useEffect(() => {
    // 1. Try reading from localStorage first
    try {
      const cached = localStorage.getItem("ostan_access_rules");
      if (cached) {
        setAccessRules(JSON.parse(cached));
      }
    } catch {}

    // 2. Fetch fresh rules from API
    fetch("/api/access-rules")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.rules) {
          setAccessRules(data.rules);
          localStorage.setItem("ostan_access_rules", JSON.stringify(data.rules));
        }
      })
      .catch((err) => console.error("Sidebar access rules fetch error:", err));
  }, [user?.email]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.email === "waseem.tw@hotmail.com";
  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";
  const isStockManager = user?.role === "STOCK_MANAGER";

  const canManageWorkers = isSuperAdmin || isAdmin || isManager;
  const canAssignTasks = isSuperAdmin || isAdmin || isManager;

  // Helper to evaluate item access state: "accessible" | "locked" | "hidden"
  const getItemAccessState = (sectionKey: string): "accessible" | "locked" | "hidden" => {
    if (isSuperAdmin) return "accessible";

    // Check user-specific rules
    if (user?.id && accessRules[user.id] && accessRules[user.id][sectionKey]) {
      return accessRules[user.id][sectionKey];
    }

    // Role-based defaults
    if (sectionKey === "employees" && !canManageWorkers) return "hidden";
    if (sectionKey === "departments" && !canManageWorkers) return "hidden";
    if (sectionKey === "stock" && (user?.role === "EMPLOYEE")) return "hidden";
    if (sectionKey === "stock-requests" && (user?.role === "EMPLOYEE")) return "hidden";
    if (sectionKey === "reports" && !isSuperAdmin && !isAdmin) return "hidden";
    if (sectionKey === "audit-logs" && !isSuperAdmin && !isAdmin) return "hidden";

    return "accessible";
  };

  // Build Navigation Sections dynamically filtered by Role & Access Rules
  const navGroups: { label: string; items: { href: string; label: string; icon: any; sectionKey: string; accessState: "accessible" | "locked" | "hidden" }[] }[] = [];

  // 1. Overview Section
  navGroups.push({
    label: locale === "ar" ? "الرئيسية" : "Overview",
    items: [
      { href: "/dashboard", label: t("nav_dashboard"), icon: LayoutDashboard, sectionKey: "dashboard", accessState: "accessible" },
    ],
  });

  // 2. Organization Section
  const orgItems: { href: string; label: string; icon: any; sectionKey: string; accessState: "accessible" | "locked" | "hidden" }[] = [];
  const empState = getItemAccessState("employees");
  if (empState !== "hidden") {
    orgItems.push({ href: "/employees", label: t("nav_employees"), icon: Users, sectionKey: "employees", accessState: empState });
  }
  const deptState = getItemAccessState("departments");
  if (deptState !== "hidden") {
    orgItems.push({ href: "/departments", label: t("nav_departments"), icon: Building2, sectionKey: "departments", accessState: deptState });
  }
  if (orgItems.length > 0) {
    navGroups.push({
      label: locale === "ar" ? "فريق العمل والمؤسسة" : "Organization",
      items: orgItems,
    });
  }

  // 3. Operations Section
  const opsItems: { href: string; label: string; icon: any; sectionKey: string; accessState: "accessible" | "locked" | "hidden" }[] = [];
  const taskState = getItemAccessState("tasks");
  if (taskState !== "hidden") {
    opsItems.push({
      href: "/tasks",
      label: canAssignTasks ? t("nav_tasks") : (locale === "ar" ? "المهام" : "Tasks"),
      icon: CheckSquare,
      sectionKey: "tasks",
      accessState: taskState,
    });
  }
  const remState = getItemAccessState("reminders");
  if (remState !== "hidden") {
    opsItems.push({ href: "/reminders", label: t("nav_reminders"), icon: Bell, sectionKey: "reminders", accessState: remState });
  }
  if (opsItems.length > 0) {
    navGroups.push({
      label: locale === "ar" ? "العمليات والمهام" : "Operations",
      items: opsItems,
    });
  }

  // 4. Inventory Section
  const invItems: { href: string; label: string; icon: any; sectionKey: string; accessState: "accessible" | "locked" | "hidden" }[] = [];
  const stockState = getItemAccessState("stock");
  if (stockState !== "hidden") {
    invItems.push({ href: "/stock", label: t("nav_stock"), icon: Package, sectionKey: "stock", accessState: stockState });
  }
  const reqState = getItemAccessState("stock-requests");
  if (reqState !== "hidden") {
    invItems.push({ href: "/stock-requests", label: t("nav_stock_requests"), icon: FileSpreadsheet, sectionKey: "stock-requests", accessState: reqState });
  }
  if (invItems.length > 0) {
    navGroups.push({
      label: locale === "ar" ? "المستودع والمخزون" : "Inventory",
      items: invItems,
    });
  }

  // 5. Intelligence & Security Section
  const intelItems: { href: string; label: string; icon: any; sectionKey: string; accessState: "accessible" | "locked" | "hidden" }[] = [];
  const repState = getItemAccessState("reports");
  if (repState !== "hidden") {
    intelItems.push({ href: "/reports", label: t("nav_reports"), icon: BarChart3, sectionKey: "reports", accessState: repState });
  }
  const auditState = getItemAccessState("audit-logs");
  if (auditState !== "hidden") {
    intelItems.push({ href: "/audit-logs", label: t("nav_audit_logs"), icon: ShieldCheck, sectionKey: "audit-logs", accessState: auditState });
  }
  if (intelItems.length > 0) {
    navGroups.push({
      label: locale === "ar" ? "التقارير والأمان" : "Intelligence & Security",
      items: intelItems,
    });
  }

  // 6. System Section
  const sysState = getItemAccessState("settings");
  if (sysState !== "hidden") {
    navGroups.push({
      label: locale === "ar" ? "النظام" : "System",
      items: [
        { href: "/settings", label: t("nav_settings"), icon: Settings, sectionKey: "settings", accessState: sysState },
      ],
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 35,
          }}
        />
      )}

      {/* INTERACTIVE OBSIDIAN SECTION LOCKED MODAL */}
      {lockedModalSection && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: "460px",
              width: "100%",
              padding: "2rem",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              background: "linear-gradient(180deg, rgba(30, 24, 40, 0.95) 0%, rgba(15, 12, 22, 0.98) 100%)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(244, 63, 94, 0.15)",
                border: "1px solid rgba(244, 63, 94, 0.35)",
                color: "#f43f5e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
                fontSize: "1.6rem",
                boxShadow: "0 0 24px rgba(244, 63, 94, 0.3)",
              }}
            >
              <Lock size={28} />
            </div>

            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.5rem" }}>
              {locale === "ar" ? "🔒 القسم مقفل من الإدارة" : "🔒 Section Locked by Administrator"}
            </h2>

            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              {locale === "ar"
                ? `تم قفل هذا القسم (${lockedModalSection}) لحسابك من قبل المسؤول (waseem.tw@hotmail.com). ليس لديك تصريح للوصول إلى هذه العمليات.`
                : `This section (${lockedModalSection}) has been locked for your account by Administrator (waseem.tw@hotmail.com). Please contact your administrator if you require access.`}
            </p>

            <button
              onClick={() => setLockedModalSection(null)}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.95rem", fontWeight: 700 }}
            >
              {locale === "ar" ? "حسناً، فهمت" : "Understood"}
            </button>
          </div>
        </div>
      )}

      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand Header Card with the Transparent Glowing Logo Emblem */}
        <div
          style={{
            padding: "1.1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {/* Transparent Glowing Neon Logo Emblem */}
            <div
              style={{
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: "transparent",
                filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))",
              }}
            >
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
                <defs>
                  <linearGradient id="side-logo-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#007aff" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                  <linearGradient id="side-logo-violet-grad" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                  <filter id="side-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="glow" />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                  </filter>
                </defs>
                <path d="M 50 10 A 40 40 0 1 1 18 78 A 32 32 0 1 0 50 20 A 30 30 0 0 1 76 34 A 40 40 0 0 0 50 10 Z" fill="url(#side-logo-blue-grad)" filter="url(#side-neon-glow)" />
                <path d="M 50 20 A 30 30 0 1 1 24 68 A 22 22 0 1 0 50 28 A 20 20 0 0 1 68 40 A 30 30 0 0 0 50 20 Z" fill="url(#side-logo-violet-grad)" opacity="0.9" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="url(#side-logo-blue-grad)" strokeWidth="2.5" opacity="0.6" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.02em", color: "#ffffff", lineHeight: 1 }}>
                {t("app_name")}
              </div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: "0.4rem", display: "none" }}
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <div
                style={{
                  paddingInline: "0.75rem",
                  marginBottom: "0.35rem",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-faint)",
                }}
              >
                {group.label}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const isLocked = item.accessState === "locked";

                  if (isLocked) {
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => setLockedModalSection(item.label)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.55rem 0.75rem",
                          borderRadius: "var(--radius-md)",
                          color: "#94a3b8",
                          background: "rgba(244, 63, 94, 0.05)",
                          border: "1px dashed rgba(244, 63, 94, 0.3)",
                          fontWeight: 500,
                          fontSize: "0.88rem",
                          cursor: "pointer",
                          textAlign: "start",
                          width: "100%",
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <Icon size={18} strokeWidth={1.8} style={{ opacity: 0.7 }} />
                          <span style={{ opacity: 0.85 }}>{item.label}</span>
                        </div>
                        <span className="badge badge-rose" style={{ fontSize: "0.65rem", padding: "1px 5px" }}>
                          🔒 {locale === "ar" ? "مقفل" : "Locked"}
                        </span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.55rem 0.75rem",
                        borderRadius: "var(--radius-md)",
                        color: isActive ? "var(--primary-500)" : "var(--text-muted)",
                        background: isActive ? "rgba(99, 102, 241, 0.12)" : "transparent",
                        fontWeight: isActive ? 600 : 500,
                        fontSize: "0.88rem",
                        textDecoration: "none",
                        transition: "all var(--transition-fast)",
                      }}
                      className="nav-link"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Card & Sign Out Footer */}
        {user && (
          <div
            style={{
              padding: "1rem",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--bg-surface-elevated)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-full)",
                  background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                }}
              >
                {user.name.charAt(0)}
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--text-main)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {locale === "ar" && user.nameAr ? user.nameAr : user.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "2px" }}>
                  <span
                    className={`badge ${
                      user.role === "SUPER_ADMIN"
                        ? "badge-rose"
                        : user.role === "ADMIN"
                        ? "badge-primary"
                        : user.role === "MANAGER"
                        ? "badge-emerald"
                        : "badge-cyan"
                    }`}
                    style={{ fontSize: "0.65rem", padding: "0.1rem 0.45rem" }}
                  >
                    {user.isProtected && <ShieldAlert size={10} />}
                    {t(`role_${user.role}` as any, user.role)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                width: "100%",
                padding: "0.5rem",
                fontSize: "0.8rem",
                justifyContent: "center",
              }}
            >
              <LogOut size={14} />
              <span>{locale === "ar" ? "تسجيل الخروج" : "Sign Out"}</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
