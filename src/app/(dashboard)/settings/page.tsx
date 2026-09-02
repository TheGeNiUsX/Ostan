"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import {
  Settings,
  Palette,
  Globe,
  Shield,
  Database,
  Save,
  CheckCircle2,
  Lock,
  Sliders,
} from "lucide-react";

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();

  const [companyName, setCompanyName] = useState("Ostan");
  const [companyNameAr, setCompanyNameAr] = useState("أستان");
  const [stockThreshold, setStockThreshold] = useState("5");
  const [sessionHours, setSessionHours] = useState("24");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          if (data.settings.company_name) setCompanyName(data.settings.company_name);
          if (data.settings.company_name_ar) setCompanyNameAr(data.settings.company_name_ar);
          if (data.settings.stock_alert_threshold) setStockThreshold(data.settings.stock_alert_threshold);
          if (data.settings.session_timeout_hours) setSessionHours(data.settings.session_timeout_hours);
        }
      })
      .catch((e) => console.error("Could not load settings:", e));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "company_name", value: companyName }),
      });
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "company_name_ar", value: companyNameAr }),
      });
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "stock_alert_threshold", value: stockThreshold }),
      });
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "session_timeout_hours", value: sessionHours }),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px" }}>
      {/* Page Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Settings size={26} color="var(--primary-500)" />
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800 }}>{t("settings_title")}</h1>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
          {t("settings_subtitle")}
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: "0.85rem 1rem",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "var(--radius-md)",
            color: "#34d399",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          <CheckCircle2 size={18} />
          <span>{t("settings_save_success")}</span>
        </div>
      )}

      {/* Appearance & Localization Section */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <Palette size={18} color="var(--primary-500)" />
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{t("settings_appearance")}</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {/* Theme Selector */}
          <div className="input-group">
            <label className="input-label">{t("settings_theme_label")}</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["light", "dark", "system"] as const).map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => setTheme(th)}
                  className={`btn ${theme === th ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem", textTransform: "capitalize" }}
                >
                  {t(`theme_${th}` as any, th)}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector */}
          <div className="input-group">
            <label className="input-label">{t("settings_lang_label")}</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`btn ${locale === "en" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem" }}
              >
                {t("lang_en")}
              </button>
              <button
                type="button"
                onClick={() => setLocale("ar")}
                className={`btn ${locale === "ar" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem" }}
              >
                {t("lang_ar")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Brand & Parameters Form */}
      <form onSubmit={handleSave} className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <Sliders size={18} color="#06b6d4" />
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
            {locale === "ar" ? "المعايير المؤسسية" : "Enterprise System Parameters"}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <div className="input-group">
            <label className="input-label">{locale === "ar" ? "اسم المنشأة (الإنجليزية)" : "Company Name (English)"}</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label">{locale === "ar" ? "اسم المنشأة (العربية)" : "Company Name (Arabic)"}</label>
            <input
              type="text"
              value={companyNameAr}
              onChange={(e) => setCompanyNameAr(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label">{locale === "ar" ? "حد التنبيه الافتراضي لانخفاض المخزون" : "Low-Stock Alert Threshold"}</label>
            <input
              type="number"
              value={stockThreshold}
              onChange={(e) => setStockThreshold(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label">{locale === "ar" ? "مدة انتهاء الجلسة (بالساعات)" : "Session Expiration (Hours)"}</label>
            <input
              type="number"
              value={sessionHours}
              onChange={(e) => setSessionHours(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "0.6rem 1.4rem" }}>
            <Save size={15} />
            <span>{saving ? "Saving..." : t("action_save")}</span>
          </button>
        </div>
      </form>

      {/* System Information Panel */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Database size={18} color="#10b981" />
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{t("settings_system_info")}</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            fontSize: "0.82rem",
          }}
        >
          <div style={{ background: "var(--bg-surface)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "var(--text-faint)" }}>Architecture</div>
            <div style={{ fontWeight: 600, marginTop: "2px" }}>Next.js App Router</div>
          </div>
          <div style={{ background: "var(--bg-surface)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "var(--text-faint)" }}>Database</div>
            <div style={{ fontWeight: 600, marginTop: "2px" }}>PostgreSQL + Prisma ORM</div>
          </div>
          <div style={{ background: "var(--bg-surface)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "var(--text-faint)" }}>Security Engine</div>
            <div style={{ fontWeight: 600, marginTop: "2px" }}>RBAC + Immutable Super Admin Guard</div>
          </div>
          <div style={{ background: "var(--bg-surface)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "var(--text-faint)" }}>Phase Status</div>
            <div style={{ fontWeight: 600, marginTop: "2px", color: "var(--emerald-500)" }}>Phase 1 Foundation: Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
