"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  ShieldCheck,
  RefreshCw,
  Filter,
  Activity,
  User,
  Globe,
  Clock,
  Code2,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    nameAr?: string | null;
    email: string;
    role: string;
  } | null;
}

export default function AuditLogsPage() {
  const { t, locale } = useI18n();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = actionFilter === "ALL" ? "/api/audit-logs" : `/api/audit-logs?action=${actionFilter}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load audit logs");
      }
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "badge-primary";
      case "LOGOUT":
        return "badge-cyan";
      case "CREATE":
        return "badge-emerald";
      case "UPDATE":
      case "PERMISSION_CHANGE":
        return "badge-amber";
      case "DELETE":
      case "SECURITY_EVENT":
        return "badge-rose";
      default:
        return "badge-primary";
    }
  };

  const actionOptions = [
    { value: "ALL", label: t("audit_all_actions") },
    { value: "LOGIN", label: "LOGIN" },
    { value: "LOGOUT", label: "LOGOUT" },
    { value: "CREATE", label: "CREATE" },
    { value: "UPDATE", label: "UPDATE" },
    { value: "PERMISSION_CHANGE", label: "PERMISSION_CHANGE" },
    { value: "SECURITY_EVENT", label: "SECURITY_EVENT" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <ShieldCheck size={26} color="var(--primary-500)" />
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800 }}>{t("audit_title")}</h1>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            {t("audit_subtitle")}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Action Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Filter size={15} color="var(--text-faint)" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="input-field"
              style={{
                padding: "0.45rem 0.75rem",
                fontSize: "0.82rem",
                width: "auto",
                minWidth: "140px",
              }}
            >
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="btn btn-secondary"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem" }}
          >
            <RefreshCw size={14} className={loading ? "pulse-glow" : ""} />
            <span>{t("action_refresh")}</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            borderRadius: "var(--radius-md)",
            color: "var(--rose-500)",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "start",
            fontSize: "0.85rem",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                color: "var(--text-faint)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <th style={{ padding: "0.85rem 1.25rem", textAlign: "start" }}>{t("audit_action")}</th>
              <th style={{ padding: "0.85rem 1.25rem", textAlign: "start" }}>{t("audit_user")}</th>
              <th style={{ padding: "0.85rem 1.25rem", textAlign: "start" }}>{t("audit_entity")}</th>
              <th style={{ padding: "0.85rem 1.25rem", textAlign: "start" }}>{t("audit_details")}</th>
              <th style={{ padding: "0.85rem 1.25rem", textAlign: "start" }}>{t("audit_ip")}</th>
              <th style={{ padding: "0.85rem 1.25rem", textAlign: "start" }}>{t("audit_time")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                    <RefreshCw size={18} className="pulse-glow" />
                    <span>Loading audit records...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--text-faint)" }}>
                  No audit log entries matching this filter.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const userName =
                  log.user ? (locale === "ar" && log.user.nameAr ? log.user.nameAr : log.user.name) : "System / Unauthenticated";

                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background var(--transition-fast)",
                    }}
                  >
                    {/* Action */}
                    <td style={{ padding: "0.85rem 1.25rem" }}>
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* User */}
                    <td style={{ padding: "0.85rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "var(--radius-full)",
                            background: "var(--bg-surface-hover)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          <User size={13} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{userName}</div>
                          {log.user?.email && (
                            <div style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
                              {log.user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Entity */}
                    <td style={{ padding: "0.85rem 1.25rem" }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                          color: "var(--text-main)",
                          background: "var(--bg-surface)",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {log.entity} {log.entityId ? `#${log.entityId}` : ""}
                      </span>
                    </td>

                    {/* Details */}
                    <td style={{ padding: "0.85rem 1.25rem", maxWidth: "260px" }}>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          fontFamily: "monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={log.details || ""}
                      >
                        {log.details || "—"}
                      </div>
                    </td>

                    {/* IP */}
                    <td style={{ padding: "0.85rem 1.25rem" }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-faint)", fontFamily: "monospace" }}>
                        {log.ipAddress || "127.0.0.1"}
                      </span>
                    </td>

                    {/* Time */}
                    <td style={{ padding: "0.85rem 1.25rem", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {new Date(log.createdAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
