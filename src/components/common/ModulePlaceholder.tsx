"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { LucideIcon, ArrowLeft, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

interface ModulePlaceholderProps {
  titleEn: string;
  titleAr: string;
  phase: string;
  icon: LucideIcon;
  featuresEn: string[];
  featuresAr: string[];
}

export function ModulePlaceholder({
  titleEn,
  titleAr,
  phase,
  icon: Icon,
  featuresEn,
  featuresAr,
}: ModulePlaceholderProps) {
  const { locale, t } = useI18n();

  const title = locale === "ar" ? titleAr : titleEn;
  const features = locale === "ar" ? featuresAr : featuresEn;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "800px" }}>
      <div
        className="glass-panel"
        style={{
          padding: "2.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "1.25rem",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))",
            color: "var(--primary-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(99, 102, 241, 0.3)",
          }}
        >
          <Icon size={32} />
        </div>

        <div>
          <span className="badge badge-primary" style={{ marginBottom: "0.5rem" }}>
            {phase}
          </span>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.4rem" }}>{title}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "520px", margin: "0.5rem auto 0" }}>
            {locale === "ar"
              ? "هذه الوحدة مخصصة للتطوير في المرحلة المحددة حسب خطة التطوير التدريجي لـ Ostan."
              : "This module is slated for implementation according to Ostan's structured roadmap."}
          </p>
        </div>

        {/* Feature Highlights Planned */}
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            textAlign: "start",
          }}
        >
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-faint)", marginBottom: "0.75rem", textTransform: "uppercase" }}>
            {locale === "ar" ? "المميزات المخططة لهذه الوحدة:" : "Planned Features For This Module:"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {features.map((feat, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                <CheckCircle size={15} color="var(--primary-500)" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/dashboard" className="btn btn-secondary" style={{ marginTop: "0.5rem" }}>
          {locale === "ar" ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
          <span>{locale === "ar" ? "العودة للوحة التحكم" : "Back to Dashboard"}</span>
        </Link>
      </div>
    </div>
  );
}
