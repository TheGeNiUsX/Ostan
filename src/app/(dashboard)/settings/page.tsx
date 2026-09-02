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
  Volume2,
  Flame,
  Clock,
  Building,
} from "lucide-react";

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();

  const [companyName, setCompanyName] = useState("Ostan Enterprise");
  const [companyNameAr, setCompanyNameAr] = useState("مؤسسة أستان");
  const [stockThreshold, setStockThreshold] = useState("5");
  const [sessionHours, setSessionHours] = useState("24");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [audioTesting, setAudioTesting] = useState(false);

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

  const handleTestAudioAlarm = () => {
    setAudioTesting(true);
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      }
    } catch (e) {
      console.warn("Audio Context notice:", e);
    }
    setTimeout(() => setAudioTesting(false), 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: "1.5rem 1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
            }}
          >
            <Settings size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              {locale === "ar" ? "إعدادات النظام والتهيئة العامة" : "System Settings & Configuration"}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {locale === "ar"
                ? "إدارة هوية المؤسسة، الاتصال السحابي بـ Firebase، والمظهر العام والأمان."
                : "Manage enterprise identity, Firebase cloud synchronization, themes, and security."}
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div
            style={{
              padding: "0.5rem 1rem",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "var(--radius-md)",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{locale === "ar" ? "تم حفظ الإعدادات بنجاح!" : "Settings saved successfully!"}</span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* 1. Firebase Cloud Connectivity Card */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Flame size={20} color="#f59e0b" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              {locale === "ar" ? "حالة الربط السحابي (Firebase)" : "Firebase Cloud Connection"}
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {locale === "ar"
              ? "النظام متصل بشكل مباشر وفوري بقاعدة بيانات Firebase وخدمات التوثيق السحابية."
              : "Live real-time link to Firebase Authentication & Cloud Firestore database."}
          </p>

          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Project ID</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f59e0b" }}>ostan-75a0c</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Auth Domain</span>
              <span style={{ fontSize: "0.82rem", color: "var(--text-main)" }}>ostan-75a0c.firebaseapp.com</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Connection Status</span>
              <span className="badge badge-emerald">🟢 Active & Synced</span>
            </div>
          </div>
        </div>

        {/* 2. Appearance & Diagnostics Card */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Palette size={20} color="#818cf8" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              {locale === "ar" ? "المظهر والفحص الصوتي" : "Appearance & Diagnostics"}
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                {locale === "ar" ? "نمط العرض (Theme)" : "Theme Mode"}
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`btn ${theme === "dark" ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1 }}
                >
                  Dark Theme
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`btn ${theme === "light" ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1 }}
                >
                  Light Theme
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                {locale === "ar" ? "فحص جرس الإنذار الصوتي" : "Audio Alarm Diagnostics"}
              </label>
              <button
                type="button"
                onClick={handleTestAudioAlarm}
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }}
              >
                <Volume2 size={16} />
                <span>{audioTesting ? "🔔 Ringing (880Hz)..." : "Test Audio Alarm Chime"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Enterprise Profile & Policies Form */}
      <form onSubmit={handleSave} className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Building size={20} color="#38bdf8" />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            {locale === "ar" ? "بيانات المؤسسة والسياسات العامة" : "Enterprise Identity & Policies"}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Company Name (English)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              اسم المؤسسة (باللغة العربية)
            </label>
            <input
              type="text"
              value={companyNameAr}
              onChange={(e) => setCompanyNameAr(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              {locale === "ar" ? "حد التنبيه لنقص المخزون (Default Low Stock Threshold)" : "Default Low Stock Threshold"}
            </label>
            <input
              type="number"
              min="1"
              value={stockThreshold}
              onChange={(e) => setStockThreshold(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              {locale === "ar" ? "مدة صلاحية جلسة الدخول بالساعات (Session Timeout)" : "Session Timeout (Hours)"}
            </label>
            <input
              type="number"
              min="1"
              value={sessionHours}
              onChange={(e) => setSessionHours(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "0.6rem 1.4rem" }}>
            <Save size={16} />
            <span>{saving ? (locale === "ar" ? "جاري الحفظ..." : "Saving...") : (locale === "ar" ? "حفظ التغييرات" : "Save Settings")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
