"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Building2,
  Users,
  Lock,
  EyeOff,
  CheckCircle2,
  Bell,
  CheckSquare,
  Package,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Settings,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Filter,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  nameAr?: string | null;
  email: string;
  role: string;
  isProtected?: boolean;
  department?: { id: string; name: string; nameAr?: string } | null;
}

interface DepartmentItem {
  id: string;
  name: string;
  nameAr: string;
  description?: string | null;
  manager?: { id: string; name: string } | null;
  employees: { id: string }[];
}

interface DepartmentsClientViewProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    isProtected?: boolean;
  };
  departments: DepartmentItem[];
  users: UserItem[];
  initialRules: Record<string, Record<string, "accessible" | "locked" | "hidden">>;
}

export const SECTIONS_CATALOGUE = [
  { key: "reminders", labelEn: "Reminders", labelAr: "التذكيرات والتنبيهات", icon: Bell, color: "#38bdf8" },
  { key: "employees", labelEn: "Employees (Employ)", labelAr: "الموظفين وفريق العمل", icon: Users, color: "#818cf8" },
  { key: "tasks", labelEn: "Task Management", labelAr: "إدارة المهام وتعيين العمال", icon: CheckSquare, color: "#34d399" },
  { key: "stock", labelEn: "Warehouse (Stock Inventory)", labelAr: "المستودع والمخزون", icon: Package, color: "#fbbf24" },
  { key: "stock-requests", labelEn: "Stock Requests", labelAr: "طلبات الصرف والمستودع", icon: FileSpreadsheet, color: "#fb923c" },
  { key: "reports", labelEn: "Reports & Analytics", labelAr: "التقارير والإحصائيات", icon: BarChart3, color: "#a855f7" },
  { key: "audit-logs", labelEn: "Audit Logs", labelAr: "سجل العمليات والأمان", icon: ShieldCheck, color: "#f43f5e" },
  { key: "settings", labelEn: "System Settings", labelAr: "إعدادات النظام", icon: Settings, color: "#94a3b8" },
];

export function DepartmentsClientView({
  currentUser,
  departments,
  users,
  initialRules,
}: DepartmentsClientViewProps) {
  const { locale } = useI18n();

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN" || currentUser.email === "waseem.tw@hotmail.com";
  const isAdmin = currentUser.role === "ADMIN";
  const canManagePolicies = isSuperAdmin || isAdmin;

  // Access rules state
  const [rules, setRules] = useState<Record<string, Record<string, "accessible" | "locked" | "hidden">>>(initialRules);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 3-Step Selection Form State
  const nonAdminUsers = users.filter((u) => u.email !== "waseem.tw@hotmail.com");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(nonAdminUsers[0]?.id || "");
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>("reminders");
  const [selectedAccessAction, setSelectedAccessAction] = useState<"accessible" | "locked" | "hidden">("accessible");

  // Filter state for matrix
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");

  // Helper to get rule
  const getUserSectionState = (userId: string, sectionKey: string): "accessible" | "locked" | "hidden" => {
    const user = users.find((u) => u.id === userId);
    if (user?.role === "SUPER_ADMIN" || user?.email === "waseem.tw@hotmail.com") {
      return "accessible";
    }
    if (rules[userId] && rules[userId][sectionKey]) {
      return rules[userId][sectionKey];
    }
    // Default fallback based on role
    if (sectionKey === "employees" && (user?.role === "EMPLOYEE" || user?.role === "STOCK_MANAGER")) return "hidden";
    if (sectionKey === "stock" && user?.role === "EMPLOYEE") return "hidden";
    if (sectionKey === "stock-requests" && user?.role === "EMPLOYEE") return "hidden";
    if ((sectionKey === "reports" || sectionKey === "audit-logs") && user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN") return "hidden";
    return "accessible";
  };

  const handleApplySingleRule = async () => {
    if (!selectedWorkerId || !selectedSectionKey) return;
    setSaving(true);
    setStatusMsg(null);

    const worker = users.find((u) => u.id === selectedWorkerId);
    const section = SECTIONS_CATALOGUE.find((s) => s.key === selectedSectionKey);

    try {
      const res = await fetch("/api/access-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedWorkerId,
          sectionKey: selectedSectionKey,
          accessState: selectedAccessAction,
        }),
      });

      if (!res.ok) throw new Error("Failed to update access rule");

      const newRules = {
        ...rules,
        [selectedWorkerId]: {
          ...(rules[selectedWorkerId] || {}),
          [selectedSectionKey]: selectedAccessAction,
        },
      };
      setRules(newRules);

      // Save to localStorage for instant client sidebar reactivity
      localStorage.setItem("ostan_access_rules", JSON.stringify(newRules));

      const actionText =
        selectedAccessAction === "accessible"
          ? (locale === "ar" ? "متاح (وصول كامل)" : "Accessible")
          : selectedAccessAction === "locked"
          ? (locale === "ar" ? "مقفل 🔒 (يظهر تأثير القفل)" : "Locked 🔒")
          : (locale === "ar" ? "مخفي 👁️ (إخفاء تام)" : "Hidden 👁️");

      setStatusMsg({
        type: "success",
        text: locale === "ar"
          ? `✅ تم تطبيق السياسة بنجاح: تم تعيين قسم (${section?.labelAr || selectedSectionKey}) للعامل (${worker?.name}) إلى حالة [${actionText}].`
          : `✅ Policy applied: Set "${section?.labelEn || selectedSectionKey}" for ${worker?.name} to [${actionText}].`,
      });
    } catch {
      setStatusMsg({
        type: "error",
        text: locale === "ar" ? "حدث خطأ أثناء حفظ السياسة." : "Error updating access policy.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCycleRuleInTable = async (userId: string, sectionKey: string) => {
    if (!canManagePolicies) return;
    const currentState = getUserSectionState(userId, sectionKey);
    const nextStateMap: Record<"accessible" | "locked" | "hidden", "accessible" | "locked" | "hidden"> = {
      accessible: "locked",
      locked: "hidden",
      hidden: "accessible",
    };
    const nextState = nextStateMap[currentState];

    const newRules = {
      ...rules,
      [userId]: {
        ...(rules[userId] || {}),
        [sectionKey]: nextState,
      },
    };
    setRules(newRules);
    localStorage.setItem("ostan_access_rules", JSON.stringify(newRules));

    try {
      await fetch("/api/access-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, sectionKey, accessState: nextState }),
      });
    } catch (e) {
      console.error("Failed to persist rule cycle:", e);
    }
  };

  const filteredUsers = nonAdminUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = filterDept === "ALL" || u.department?.id === filterDept;
    return matchSearch && matchDept;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "1.5rem 1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, #6366f1, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 0 20px var(--primary-glow)",
            }}
          >
            <Building2 size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              {locale === "ar" ? "إدارة الأقسام والتحكم في قفل وإخفاء الأقسام للعمال" : "Departments & Worker Section Access Control"}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {locale === "ar"
                ? "حدد العامل ثم اختر القسم وحدد ما إذا كنت تريد قفله بتأثير القفل أو إخفاءه تماماً."
                : "Select a worker, choose a section, and decide whether to Lock with lock effect or Hide the section."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="badge badge-rose" style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}>
            🛡️ {locale === "ar" ? "لوحة تحكم المسؤول المتميز" : "Super Admin Policy Console"}
          </span>
        </div>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            background: statusMsg.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)",
            border: `1px solid ${statusMsg.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
            color: statusMsg.type === "success" ? "#34d399" : "#fb7185",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          {statusMsg.type === "success" ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* 3-STEP SELECTION & POLICY CONTROL BAR */}
      <div
        className="glass-panel"
        style={{
          padding: "1.5rem",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          background: "linear-gradient(180deg, rgba(30, 39, 60, 0.7) 0%, rgba(17, 24, 39, 0.85) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <Sparkles size={18} style={{ color: "#38bdf8" }} />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
            {locale === "ar" ? "أداة التحكم السريع في قفل وإخفاء الأقسام (3 خطوات)" : "3-Step Worker Section Access Configurator"}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", alignItems: "flex-end" }}>
          {/* Step 1: Select Worker */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              {locale === "ar" ? "1. اختر العامل / الموظف:" : "1. Select Worker / Employee:"}
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="input-field"
              style={{ width: "100%", padding: "0.65rem 0.85rem", fontSize: "0.88rem" }}
            >
              {nonAdminUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role}) — {u.department?.name || "General"}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Section */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              {locale === "ar" ? "2. اختر القسم المستهدف:" : "2. Select Target Section:"}
            </label>
            <select
              value={selectedSectionKey}
              onChange={(e) => setSelectedSectionKey(e.target.value)}
              className="input-field"
              style={{ width: "100%", padding: "0.65rem 0.85rem", fontSize: "0.88rem" }}
            >
              {SECTIONS_CATALOGUE.map((sec) => (
                <option key={sec.key} value={sec.key}>
                  {locale === "ar" ? sec.labelAr : sec.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Choose Access Action */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              {locale === "ar" ? "3. حدد إجراء الصلاحية:" : "3. Choose Access Action:"}
            </label>
            <select
              value={selectedAccessAction}
              onChange={(e) => setSelectedAccessAction(e.target.value as "accessible" | "locked" | "hidden")}
              className="input-field"
              style={{ width: "100%", padding: "0.65rem 0.85rem", fontSize: "0.88rem", fontWeight: 600 }}
            >
              <option value="accessible">✅ {locale === "ar" ? "متاح (وصول كامل)" : "Accessible (Full Access)"}</option>
              <option value="locked">🔒 {locale === "ar" ? "مقفل (يظهر تأثير القفل)" : "Locked 🔒 (Show Lock Effect)"}</option>
              <option value="hidden">👁️ {locale === "ar" ? "مخفي (إخفاء تام عن العامل)" : "Hidden 👁️ (Completely Hidden)"}</option>
            </select>
          </div>

          {/* Submit Action Button */}
          <div>
            <button
              onClick={handleApplySingleRule}
              disabled={saving}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.68rem 1rem", fontSize: "0.92rem", fontWeight: 700 }}
            >
              <span>{saving ? (locale === "ar" ? "جاري الحفظ..." : "Applying...") : (locale === "ar" ? "⚡ تطبيق السياسة" : "⚡ Apply Policy")}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* DEPARTMENT STATS OVERVIEW CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        {departments.map((dept) => (
          <div key={dept.id} className="glass-panel card-hover" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#818cf8",
                }}
              >
                <Building2 size={18} />
              </div>
              <span className="badge badge-primary" style={{ fontSize: "0.72rem" }}>
                {dept.employees.length} {locale === "ar" ? "عامل" : "Workers"}
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-main)" }}>
              {locale === "ar" ? dept.nameAr : dept.name}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
              {dept.description || (locale === "ar" ? "قسم مؤسسي نشط" : "Active department")}
            </div>
          </div>
        ))}
      </div>

      {/* COMPREHENSIVE WORKER SECTION ACCESS MATRIX TABLE */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
              {locale === "ar" ? "جدول مصفوفة الصلاحيات وقفل الأقسام للعمال" : "Worker Section Access & Lock Matrix"}
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {locale === "ar"
                ? "اضغط على أي شارة لتغيير الحالة فوراً بين: متاح ✅ / مقفل 🔒 / مخفي 👁️"
                : "Click any cell badge to instantly toggle between: Accessible ✅ / Locked 🔒 / Hidden 👁️"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === "ar" ? "بحث عن عامل..." : "Search worker..."}
                className="input-field"
                style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem", width: "180px" }}
              />
            </div>

            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="input-field"
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
            >
              <option value="ALL">{locale === "ar" ? "جميع الأقسام" : "All Departments"}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {locale === "ar" ? d.nameAr : d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matrix Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "start" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-faint)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                <th style={{ padding: "0.75rem 1rem", textAlign: "start" }}>{locale === "ar" ? "العامل / الموظف" : "Worker / Employee"}</th>
                <th style={{ padding: "0.75rem 0.75rem", textAlign: "start" }}>{locale === "ar" ? "القسم" : "Dept"}</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>⏰ Reminders</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>👥 Employ</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>📋 Tasks</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>📦 Warehouse</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>📄 Requests</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>⚙️ Settings</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((worker) => {
                const sectionsKeys = ["reminders", "employees", "tasks", "stock", "stock-requests", "settings"];

                return (
                  <tr
                    key={worker.id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            color: "#fff",
                          }}
                        >
                          {worker.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-main)" }}>
                            {worker.name}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {worker.email} • <span className="badge badge-secondary" style={{ fontSize: "0.65rem" }}>{worker.role}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "0.85rem 0.75rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      {worker.department?.name || "General"}
                    </td>

                    {sectionsKeys.map((secKey) => {
                      const accessState = getUserSectionState(worker.id, secKey);
                      const isAccessible = accessState === "accessible";
                      const isLocked = accessState === "locked";
                      const isHidden = accessState === "hidden";

                      return (
                        <td key={secKey} style={{ padding: "0.85rem 0.5rem", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleCycleRuleInTable(worker.id, secKey)}
                            title="Click to cycle: Accessible ➔ Locked ➔ Hidden"
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: isAccessible
                                ? "1px solid rgba(16, 185, 129, 0.3)"
                                : isLocked
                                ? "1px solid rgba(244, 63, 94, 0.35)"
                                : "1px solid rgba(148, 163, 184, 0.25)",
                              background: isAccessible
                                ? "rgba(16, 185, 129, 0.12)"
                                : isLocked
                                ? "rgba(244, 63, 94, 0.15)"
                                : "rgba(148, 163, 184, 0.08)",
                              color: isAccessible
                                ? "#34d399"
                                : isLocked
                                ? "#fb7185"
                                : "#94a3b8",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {isAccessible && <CheckCircle2 size={12} />}
                            {isLocked && <Lock size={12} />}
                            {isHidden && <EyeOff size={12} />}
                            <span>{isAccessible ? "OK" : isLocked ? "LOCKED" : "HIDDEN"}</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
