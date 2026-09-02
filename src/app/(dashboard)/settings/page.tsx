"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import {
  Settings,
  Palette,
  Volume2,
} from "lucide-react";

export default function SettingsPage() {
  const { locale } = useI18n();
  const { theme, setTheme } = useTheme();
  const [audioTesting, setAudioTesting] = useState(false);

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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "600px" }}>
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", gap: "1rem" }}>
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
            {locale === "ar" ? "إعدادات النظام" : "System Settings & Configuration"}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
            {locale === "ar"
              ? "تخصيص المظهر العام للنظام واختبار المنبه الصوتي."
              : "Customize interface appearance themes and test audio alarm diagnostics."}
          </p>
        </div>
      </div>

      {/* Appearance & Diagnostics Card */}
      <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Palette size={20} color="#818cf8" />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            {locale === "ar" ? "المظهر والفحص الصوتي" : "Appearance & Diagnostics"}
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              {locale === "ar" ? "نمط العرض (Theme Mode)" : "Theme Mode"}
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

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
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
  );
}
