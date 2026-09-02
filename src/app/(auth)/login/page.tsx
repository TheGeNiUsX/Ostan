"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { loginWithFirebase, registerWithFirebase } from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Sun,
  Moon,
  Building2,
  Package,
  UserCheck,
  Sparkles,
  Flame,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("waseem.tw@hotmail.com");
  const [password, setPassword] = useState("OstanAdmin123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isWaseemEmail = email.toLowerCase().trim() === "waseem.tw@hotmail.com";

  const demoAccounts = [
    {
      role: "SUPER_ADMIN",
      roleLabel: locale === "ar" ? "المسؤول المتميز (Super Admin)" : "Super Admin",
      name: "Waseem Al-Otaibi",
      email: "waseem.tw@hotmail.com",
      password: "OstanAdmin123!",
      icon: ShieldAlert,
      badgeClass: "badge-rose",
      desc: locale === "ar" ? "حساب المسؤول المتميز • تحكم كامل في أقسام وقفل النظام" : "Master Admin Account • Full Lock & Access Control",
    },
    {
      role: "ADMIN",
      roleLabel: locale === "ar" ? "مدير النظام (Admin)" : "Administrator",
      name: locale === "ar" ? "سارة المنصور" : "Sara Al-Mansoor",
      email: "admin@ostan.internal",
      password: "Admin123!",
      icon: ShieldCheck,
      badgeClass: "badge-primary",
      desc: locale === "ar" ? "إدارة المستخدمين والأقسام والإعدادات" : "Manage Users, Departments, Settings",
    },
    {
      role: "MANAGER",
      roleLabel: locale === "ar" ? "مدير قسم (Manager)" : "Department Manager",
      name: locale === "ar" ? "خالد الغامدي" : "Khalid Al-Ghamdi",
      email: "manager@ostan.internal",
      password: "Manager123!",
      icon: Building2,
      badgeClass: "badge-emerald",
      desc: locale === "ar" ? "إدارة الموظفين والمهام والمخزون" : "Manage Team, Tasks & Stock View",
    },
    {
      role: "EMPLOYEE",
      roleLabel: locale === "ar" ? "موظف (Employee)" : "Employee",
      name: locale === "ar" ? "فيصل الحربي" : "Faisal Al-Harbi",
      email: "employee@ostan.internal",
      password: "Employee123!",
      icon: UserCheck,
      badgeClass: "badge-cyan",
      desc: locale === "ar" ? "المهام المعينة والتذكيرات الشخصية" : "Assigned Tasks & Personal Reminders",
    },
  ];

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setAuthMode("login");
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Firebase Auth Step
      try {
        if (authMode === "signup") {
          await registerWithFirebase(name, email, password);
        } else {
          await loginWithFirebase(email, password);
        }
      } catch (fbErr: any) {
        console.warn("Firebase Auth Notice (proceeding with unified server session):", fbErr?.message || fbErr);
      }

      // 2. Server Session & HTTP-Only Cookie Step
      const endpoint = authMode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const payload = authMode === "signup" ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed. Please check your details.");
        setLoading(false);
        return;
      }

      if (authMode === "signup") {
        if (data.isAutoSuperAdmin) {
          setSuccessMsg(
            locale === "ar"
              ? "🎉 مرحباً بك! تم تعيينك كمسؤول متميز للنظام (Super Admin) بنجاح."
              : "🎉 Welcome! You have been automatically assigned as Super Admin."
          );
        } else {
          setSuccessMsg(
            locale === "ar"
              ? "✅ تم إنشاء الحساب بنجاح! جاري الدخول للمنصة..."
              : "✅ Account created successfully! Logging in..."
          );
        }
      }

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "radial-gradient(ellipse at top, #1e1b4b 0%, #0b0f19 70%)",
        position: "relative",
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          padding: "1.25rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, #6366f1, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 0 16px var(--primary-glow)",
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
              {t("app_name")}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "-2px" }}>
              {t("tagline")}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          {/* Language Switch */}
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="btn btn-secondary"
            style={{ borderRadius: "var(--radius-full)", padding: "0.45rem 0.85rem", fontSize: "0.82rem" }}
          >
            <Globe size={15} />
            <span>{locale === "en" ? "العربية" : "English"}</span>
          </button>

          {/* Theme Switch */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="btn btn-secondary"
            style={{ borderRadius: "var(--radius-full)", padding: "0.45rem 0.85rem", fontSize: "0.82rem" }}
          >
            {resolvedTheme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: "520px" }}>
          {/* Auth Card */}
          <div
            className="glass-panel"
            style={{
              padding: "2.25rem",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* Mode Switch Tabs (Sign In vs Sign Up) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
                background: "var(--bg-surface)",
                padding: "4px",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.5rem",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`btn ${authMode === "login" ? "btn-primary" : "btn-ghost"}`}
                style={{ padding: "0.5rem", fontSize: "0.88rem" }}
              >
                {locale === "ar" ? "تسجيل الدخول" : "Sign In"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`btn ${authMode === "signup" ? "btn-primary" : "btn-ghost"}`}
                style={{ padding: "0.5rem", fontSize: "0.88rem" }}
              >
                {locale === "ar" ? "إنشاء حساب عامل" : "Sign Up (Worker)"}
              </button>
            </div>

            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h1 style={{ fontSize: "1.45rem", fontWeight: 800, marginBottom: "0.3rem" }}>
                {authMode === "signup"
                  ? (locale === "ar" ? "تسجيل حساب عامل جديد" : "Create New Worker Account")
                  : (locale === "ar" ? "تسجيل الدخول إلى أستان" : "Sign in to Ostan")}
              </h1>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                {authMode === "signup"
                  ? (locale === "ar"
                      ? "سجل حسابك للوصول إلى المهام والتذكيرات المخصصة لك"
                      : "Register to access your assigned workflow and tasks")
                  : (locale === "ar"
                      ? "أدخل بيانات حسابك للمتابعة وإدارة العمليات"
                      : "Enter your enterprise credentials to access your portal")}
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(244, 63, 94, 0.12)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--rose-500)",
                  fontSize: "0.85rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "var(--radius-md)",
                  color: "#34d399",
                  fontSize: "0.85rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {authMode === "signup" && (
                <div className="input-group">
                  <label className="input-label" htmlFor="name-input">
                    {locale === "ar" ? "الاسم الكامل *" : "Full Name *"}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={locale === "ar" ? "مثال: وسيم العتيبي" : "e.g. Waseem Al-Otaibi"}
                      className="input-field"
                      style={{ paddingInlineStart: "2.4rem" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        insetInlineStart: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-faint)",
                      }}
                    >
                      <User size={16} />
                    </div>
                  </div>
                </div>
              )}

              <div className="input-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="input-label" htmlFor="email-input">
                    {t("auth_email_label")}
                  </label>
                  {isWaseemEmail && (
                    <span className="badge badge-rose" style={{ fontSize: "0.68rem", padding: "0.1rem 0.45rem" }}>
                      👑 {locale === "ar" ? "مسؤول متميز تلقائي" : "Auto Super Admin"}
                    </span>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="waseem.tw@hotmail.com"
                    className="input-field"
                    style={{ paddingInlineStart: "2.4rem" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      insetInlineStart: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-faint)",
                    }}
                  >
                    <Mail size={16} />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="password-input">
                  {t("auth_password_label")}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth_password_placeholder")}
                    className="input-field"
                    style={{ paddingInlineStart: "2.4rem" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      insetInlineStart: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-faint)",
                    }}
                  >
                    <Lock size={16} />
                  </div>
                </div>
              </div>

              {authMode === "signup" && isWaseemEmail && (
                <div
                  style={{
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(244, 63, 94, 0.08)",
                    border: "1px solid rgba(244, 63, 94, 0.25)",
                    fontSize: "0.78rem",
                    color: "#fb7185",
                  }}
                >
                  ⚡ {locale === "ar"
                    ? "البريد waseem.tw@hotmail.com مخصص تلقائياً كمسؤول متميز بكامل صلاحيات قفل وإخفاء الأقسام وإدارة الحسابات."
                    : "waseem.tw@hotmail.com is assigned as master Super Admin with full lock/hide controls across sections."}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  marginTop: "0.5rem",
                }}
              >
                <span>
                  {loading
                    ? (locale === "ar" ? "جاري المعالجة..." : "Processing...")
                    : authMode === "signup"
                    ? (locale === "ar" ? "إنشاء الحساب والدخول" : "Create Account & Sign In")
                    : t("auth_submit")}
                </span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Quick Demo Switcher */}
          <div
            className="glass-panel"
            style={{
              marginTop: "1.25rem",
              padding: "1.25rem",
            }}
          >
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>
                {t("auth_demo_title")}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {t("auth_demo_desc")}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                const isSelected = email === account.email && authMode === "login";

                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleQuickFill(account.email, account.password)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.6rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? "1px solid var(--primary-500)" : "1px solid var(--border-subtle)",
                      background: isSelected ? "rgba(99, 102, 241, 0.15)" : "var(--bg-surface)",
                      cursor: "pointer",
                      textAlign: "start",
                      color: "inherit",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-surface-elevated)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{account.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{account.desc}</div>
                      </div>
                    </div>

                    <span className={`badge ${account.badgeClass}`} style={{ fontSize: "0.68rem" }}>
                      {account.roleLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
