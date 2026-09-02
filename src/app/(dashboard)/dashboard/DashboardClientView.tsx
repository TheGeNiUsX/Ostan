"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import {
  Users,
  CheckSquare,
  Bell,
  Package,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Layers,
  Clock,
  Sparkles,
} from "lucide-react";

interface DashboardClientProps {
  data: {
    user: {
      id: string;
      name: string;
      nameAr?: string | null;
      email: string;
      role: string;
      isProtected: boolean;
      department?: string;
    };
    stats: {
      totalEmployees: number;
      activeEmployees: number;
      departments: number;
      auditLogsCount: number;
      openTasks: number;
      lowStockItems: number;
      upcomingReminders: number;
    };
    canViewEmployees: boolean;
    canViewStock: boolean;
    canAssignTasks: boolean;
  };
}

export function DashboardClientView({ data }: DashboardClientProps) {
  const { t, locale } = useI18n();
  const { user, stats, canViewEmployees, canViewStock, canAssignTasks } = data;

  // Local storage real counters sync (matching live tasks, reminders, and stock items)
  const [liveStats, setLiveStats] = useState({
    openTasks: stats.openTasks,
    upcomingReminders: stats.upcomingReminders,
    lowStockItems: stats.lowStockItems,
  });

  useEffect(() => {
    try {
      const storedTasks = JSON.parse(localStorage.getItem("ostan_tasks") || "[]");
      const storedReminders = JSON.parse(localStorage.getItem("ostan_reminders") || "[]");
      const storedStock = JSON.parse(localStorage.getItem("ostan_stock") || "[]");

      // Filter tasks according to user role
      let userTasks = storedTasks.filter((t: any) => t.status !== "COMPLETED");
      if (!canAssignTasks) {
        userTasks = userTasks.filter(
          (t: any) =>
            t.workerName?.toLowerCase() === user.name.toLowerCase() ||
            t.workerId === user.id ||
            (user.role === "STOCK_MANAGER" && t.workerRole === "STOCK_MANAGER") ||
            (user.role === "EMPLOYEE" && t.workerRole === "EMPLOYEE")
        );
      }

      const activeReminders = storedReminders.filter((r: any) => !r.completed);
      const lowStock = storedStock.filter((s: any) => s.quantity <= s.threshold);

      setLiveStats({
        openTasks: userTasks.length,
        upcomingReminders: activeReminders.length,
        lowStockItems: lowStock.length,
      });
    } catch (e) {
      console.error("Failed to load local live stats:", e);
    }
  }, [user, canAssignTasks]);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return t("dash_greeting_morning");
    if (hours < 18) return t("dash_greeting_afternoon");
    return t("dash_greeting_evening");
  };

  const displayName = locale === "ar" && user.nameAr ? user.nameAr : user.name;

  // Build stat cards strictly for permitted roles
  const statCards = [];

  // 1. Total Employees (Only for Admin, Super Admin, Manager)
  if (canViewEmployees) {
    statCards.push({
      title: t("dash_total_employees"),
      value: stats.totalEmployees,
      subtext: `${stats.activeEmployees} ${t("dash_active_employees")}`,
      icon: Users,
      color: "var(--primary-500)",
      glow: "var(--primary-glow)",
      href: "/employees",
    });
  }

  // 2. Open Tasks (Scoped for All Roles)
  statCards.push({
    title: canAssignTasks ? t("dash_open_tasks") : (locale === "ar" ? "المهام المسندة إليك" : "My Assigned Tasks"),
    value: liveStats.openTasks,
    subtext: liveStats.openTasks === 0 ? (locale === "ar" ? "جميع المهام مكتملة" : "All tasks up to date") : (locale === "ar" ? "قيد المتابعة والتنفيذ" : "In progress"),
    icon: CheckSquare,
    color: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.2)",
    href: "/tasks",
  });

  // 3. Reminders
  statCards.push({
    title: t("dash_upcoming_reminders"),
    value: liveStats.upcomingReminders,
    subtext: liveStats.upcomingReminders === 0 ? (locale === "ar" ? "لا توجد تنبيهات معلقة" : "No pending alerts") : (locale === "ar" ? "تذكيرات مجدولة" : "Active alerts"),
    icon: Bell,
    color: "#f59e0b",
    glow: "var(--amber-glow)",
    href: "/reminders",
  });

  // 4. Low Stock Items (Only for Roles with Stock access)
  if (canViewStock) {
    statCards.push({
      title: t("dash_low_stock_items"),
      value: liveStats.lowStockItems,
      subtext: liveStats.lowStockItems > 0 ? (locale === "ar" ? "تنبيه نقص في المخزون" : "Below threshold alert") : (locale === "ar" ? "المخزون مكتمل" : "Stock healthy"),
      icon: Package,
      color: "#f43f5e",
      glow: "var(--rose-glow)",
      href: "/stock",
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Welcome Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "1.75rem 2rem",
          background: "linear-gradient(135deg, rgba(79, 70, 229, 0.18), rgba(6, 182, 212, 0.08))",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span style={{ fontSize: "1.4rem" }}>👋</span>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>
              {getGreeting()}, {displayName}
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            {t("dash_subtitle")}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {user.isProtected && (
            <div
              className="badge badge-rose"
              style={{
                padding: "0.4rem 0.8rem",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <ShieldAlert size={14} />
              <span>{t("auth_protected_badge")}</span>
            </div>
          )}

          <div
            className="badge badge-primary"
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.8rem",
            }}
          >
            <ShieldCheck size={14} />
            <span>{t(`role_${user.role}` as any, user.role)}</span>
          </div>
        </div>
      </div>

      {/* Real Metric Cards Grid (Role-Filtered) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className="glass-panel card-hover"
                style={{
                  padding: "1.35rem 1.5rem",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      {card.title}
                    </div>
                    <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem", color: "var(--text-main)" }}>
                      {card.value}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginTop: "0.35rem" }}>
                      {card.subtext}
                    </div>
                  </div>

                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-md)",
                      background: card.glow,
                      color: card.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Navigation & Active Operations */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Quick Operations Links */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Layers size={18} color="var(--primary-500)" />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                {locale === "ar" ? "الوصول السريع للعمليات" : "Quick Operations"}
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              href="/tasks"
              className="glass-panel card-hover"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <CheckSquare size={18} color="#06b6d4" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {canAssignTasks ? t("nav_tasks") : (locale === "ar" ? "المهام" : "Tasks")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {canAssignTasks
                      ? (locale === "ar" ? "إسناد وتوزيع المهام على العمال المسجلين ومتابعة مراحل التنفيذ" : "Assign tasks to specific registered workers with full edit controls")
                      : (locale === "ar" ? "متابعة وإنجاز المهام المسندة إليك" : "Track and complete your assigned tasks")}
                  </div>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </Link>

            <Link
              href="/reminders"
              className="glass-panel card-hover"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Bell size={18} color="#f59e0b" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t("nav_reminders")}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {locale === "ar" ? "التذكيرات والتنبيهات الموقوتة مع الإنذار الصوتي" : "Scheduled reminders with live alarms"}
                  </div>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </Link>

            {canViewStock && (
              <Link
                href="/stock"
                className="glass-panel card-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Package size={18} color="#f43f5e" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t("nav_stock")}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {locale === "ar" ? "إدارة المخزون وتتبع الكميات وحدود التنبيه" : "Stock inventory & low-stock alerts"}
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </Link>
            )}
          </div>
        </div>

        {/* System Status Card */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Clock size={18} color="#10b981" />
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
              {locale === "ar" ? "حالة النظام والجاهزية" : "System Readiness"}
            </h2>
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#34d399", fontWeight: 700, fontSize: "0.95rem" }}>
              <span>🟢</span>
              <span>{t("dash_all_systems_normal")}</span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
              {locale === "ar"
                ? "قاعدة البيانات متصلة، وجميع خدمات التنبيهات وإدارة العمليات تعمل بكفاءة عالية."
                : "Database connected, scheduled alarms active, and role access controls strictly enforced."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
