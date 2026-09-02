"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import {
  Menu,
  Moon,
  Sun,
  Globe,
  Bell,
  Search,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  user: {
    name: string;
    nameAr?: string | null;
    email: string;
    role: string;
    isProtected?: boolean;
  } | null;
}

export function Header({ onToggleSidebar, user }: HeaderProps) {
  const { locale, setLocale, t } = useI18n();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleLocale = () => {
    setLocale(locale === "en" ? "ar" : "en");
  };

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  const sampleNotifications = [
    {
      id: "1",
      title: locale === "ar" ? "جاهزية النظام" : "System Readiness",
      desc: locale === "ar" ? "نظام أستان جاهز وتكامل الصلاحيات نشط." : "Ostan Phase 1 RBAC engine initialized.",
      time: "Just now",
      icon: ShieldCheck,
      color: "var(--emerald-500)",
    },
    {
      id: "2",
      title: locale === "ar" ? "حماية الحساب المتميز" : "Super Admin Protection",
      desc: locale === "ar" ? "قفل الحماية مفعل للمسؤول الرئيسي." : "Super Admin immutable guard active.",
      time: "10m ago",
      icon: CheckCircle2,
      color: "var(--primary-500)",
    },
    {
      id: "3",
      title: locale === "ar" ? "المرحلة القادمة" : "Next Milestone",
      desc: locale === "ar" ? "المرحلة 2: إدارة الموظفين والأقسام." : "Phase 2: Employee & Department modules.",
      time: "1h ago",
      icon: AlertTriangle,
      color: "var(--amber-500)",
    },
  ];

  return (
    <header className="app-header">
      {/* Left side: Hamburger + Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, maxWidth: "500px" }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-ghost"
          style={{ padding: "0.5rem", display: "inline-flex" }}
          aria-label="Toggle Menu"
        >
          <Menu size={20} />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-full)",
            padding: "0.4rem 0.9rem",
            width: "100%",
            maxWidth: "360px",
          }}
        >
          <Search size={16} color="var(--text-faint)" />
          <input
            type="text"
            placeholder={t("action_search")}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-main)",
              fontSize: "0.85rem",
              width: "100%",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {/* Right side: Language, Theme, Notifications */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        {/* Language Switcher */}
        <button
          onClick={toggleLocale}
          className="btn btn-secondary"
          style={{
            padding: "0.45rem 0.75rem",
            fontSize: "0.8rem",
            borderRadius: "var(--radius-full)",
          }}
          title="Switch Language (EN / AR)"
        >
          <Globe size={15} />
          <span>{locale === "en" ? "العربية" : "English"}</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{
            padding: "0.45rem 0.75rem",
            fontSize: "0.8rem",
            borderRadius: "var(--radius-full)",
          }}
          title={`Current theme: ${theme}. Click to switch.`}
        >
          {resolvedTheme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
          <span style={{ textTransform: "capitalize" }}>{theme}</span>
        </button>

        {/* Notifications Popover Trigger */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-secondary"
            style={{
              padding: "0.45rem",
              borderRadius: "var(--radius-full)",
              position: "relative",
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span
              style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "8px",
                height: "8px",
                borderRadius: "var(--radius-full)",
                background: "var(--rose-500)",
              }}
            />
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              className="glass-panel"
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                insetInlineEnd: 0,
                width: "320px",
                padding: "1rem",
                boxShadow: "var(--shadow-lg)",
                zIndex: 50,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  {locale === "ar" ? "التنبيهات المباشرة" : "Live Notifications"}
                </span>
                <span className="badge badge-primary" style={{ fontSize: "0.65rem" }}>
                  {sampleNotifications.length} New
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {sampleNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      style={{
                        display: "flex",
                        gap: "0.6rem",
                        padding: "0.5rem",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          color: n.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{n.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{n.desc}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-faint)", marginTop: "2px" }}>
                          {n.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
