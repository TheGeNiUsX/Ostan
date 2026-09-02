"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Bell,
  Check,
  Plus,
  Trash2,
  Edit2,
  X,
  Flag,
  Clock,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export interface ReminderItem {
  id: string;
  title: string;
  notes?: string;
  reminderTime?: string;
  completed: boolean;
  flagged?: boolean;
  notified?: boolean;
  createdAt?: string;
}

export function AppleRemindersView() {
  const { t, locale } = useI18n();

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("ostan_reminders") || "[]");
    }
    return [];
  });

  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "FLAGGED" | "COMPLETED">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Deletion 2-step confirmation modal state
  const [deleteCandidate, setDeleteCandidate] = useState<ReminderItem | null>(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [isFlagged, setIsFlagged] = useState(false);

  // Live timer tick every 1000ms
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("ostan_reminders", JSON.stringify(reminders));
  }, [reminders]);

  // Scheduled Audio Alarm Trigger
  useEffect(() => {
    reminders.forEach((r) => {
      if (!r.completed && !r.notified && r.reminderTime) {
        const target = new Date(r.reminderTime).getTime();
        if (currentTime >= target) {
          playAlarmChime();
          if (typeof window !== "undefined" && (window as any).OstanStyle?.showToast) {
            (window as any).OstanStyle.showToast(r.title, r.notes || "Reminder is due!");
          }
          setReminders((prev) =>
            prev.map((item) => (item.id === r.id ? { ...item, notified: true } : item))
          );
        }
      }
    });
  }, [currentTime, reminders]);

  const playAlarmChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setTitle("");
    setNotes("");
    setReminderTime("");
    setIsFlagged(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ReminderItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setNotes(item.notes || "");
    setReminderTime(item.reminderTime || "");
    setIsFlagged(!!item.flagged);
    setIsModalOpen(true);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      setReminders((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                title: title.trim(),
                notes: notes.trim() || undefined,
                reminderTime: reminderTime || undefined,
                flagged: isFlagged,
                notified: false,
              }
            : r
        )
      );
    } else {
      const newItem: ReminderItem = {
        id: Date.now().toString(),
        title: title.trim(),
        notes: notes.trim() || undefined,
        reminderTime: reminderTime || undefined,
        flagged: isFlagged,
        completed: false,
        notified: false,
        createdAt: new Date().toISOString(),
      };
      setReminders((prev) => [newItem, ...prev]);
    }

    setIsModalOpen(false);
  };

  const toggleComplete = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const confirmDelete = () => {
    if (!deleteCandidate) return;
    const targetId = deleteCandidate.id;

    // Save to Recycle Bin log in localStorage
    try {
      const recycleBin = JSON.parse(localStorage.getItem("ostan_recycle_bin") || "[]");
      recycleBin.unshift({
        id: "rec_" + Date.now(),
        type: "reminder",
        title: deleteCandidate.title,
        data: deleteCandidate,
        deletedAt: new Date().toISOString(),
      });
      localStorage.setItem("ostan_recycle_bin", JSON.stringify(recycleBin));
    } catch (e) {
      console.error("Recycle bin log error:", e);
    }

    setReminders((prev) => prev.filter((r) => r.id !== targetId));
    setDeleteCandidate(null);
  };

  // Filtered Reminders
  const filteredReminders = useMemo(() => {
    if (activeFilter === "ACTIVE") return reminders.filter((r) => !r.completed);
    if (activeFilter === "FLAGGED") return reminders.filter((r) => r.flagged && !r.completed);
    if (activeFilter === "COMPLETED") return reminders.filter((r) => r.completed);
    return reminders;
  }, [reminders, activeFilter]);

  const activeCount = reminders.filter((r) => !r.completed).length;
  const flaggedCount = reminders.filter((r) => r.flagged && !r.completed).length;
  const completedCount = reminders.filter((r) => r.completed).length;

  // Format Remaining Countdown String
  const formatCountdown = (targetIso?: string) => {
    if (!targetIso) return null;
    const target = new Date(targetIso).getTime();
    const diff = target - currentTime;

    if (diff <= 0) {
      return { text: locale === "ar" ? "🚨 متأخر / مستحق الآن" : "🚨 Overdue / Due Now", isOverdue: true };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let parts = [];
    if (days > 0) parts.push(`${days}${locale === "ar" ? "ي" : "d"}`);
    if (hours > 0 || days > 0) parts.push(`${hours}${locale === "ar" ? "س" : "h"}`);
    parts.push(`${minutes}${locale === "ar" ? "د" : "m"}`);
    parts.push(`${seconds}${locale === "ar" ? "ث" : "s"}`);

    return {
      text: `${locale === "ar" ? "⏳ متبقي: " : "⏳ Due in: "} ${parts.join(" ")}`,
      isOverdue: false,
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header Bar */}
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
            <Bell size={24} color="#f59e0b" />
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>
              {locale === "ar" ? "التذكيرات والتنبيهات" : "Reminders & Alerts"}
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
            {locale === "ar"
              ? "متابعة التنبيهات الموقوتة مع العد التنازلي المباشر والتنبيه الصوتي."
              : "Real-time scheduled alarms with live countdown tracking and audio chimes."}
          </p>
        </div>

        <button onClick={openNewModal} className="btn btn-primary">
          <Plus size={16} />
          <span>{locale === "ar" ? "+ إضافة تذكير جديد" : "+ Add Reminder"}</span>
        </button>
      </div>

      {/* Filter Tabs & Counter Badges */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`btn ${activeFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "0.82rem", padding: "0.45rem 0.9rem" }}
        >
          <span>{locale === "ar" ? "جميع التذكيرات" : "All Reminders"}</span>
          <span style={{ opacity: 0.8, fontSize: "0.75rem" }}>({reminders.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter("ACTIVE")}
          className={`btn ${activeFilter === "ACTIVE" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "0.82rem", padding: "0.45rem 0.9rem" }}
        >
          <span>{locale === "ar" ? "قيد الانتظار" : "Active"}</span>
          <span style={{ opacity: 0.8, fontSize: "0.75rem" }}>({activeCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter("FLAGGED")}
          className={`btn ${activeFilter === "FLAGGED" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "0.82rem", padding: "0.45rem 0.9rem" }}
        >
          <span>{locale === "ar" ? "مهم 🚩" : "Flagged 🚩"}</span>
          <span style={{ opacity: 0.8, fontSize: "0.75rem" }}>({flaggedCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter("COMPLETED")}
          className={`btn ${activeFilter === "COMPLETED" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "0.82rem", padding: "0.45rem 0.9rem" }}
        >
          <span>{locale === "ar" ? "المكتملة ✓" : "Completed ✓"}</span>
          <span style={{ opacity: 0.8, fontSize: "0.75rem" }}>({completedCount})</span>
        </button>
      </div>

      {/* Reminders List Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {filteredReminders.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              textAlign: "center",
              padding: "3.5rem 1.5rem",
              color: "var(--text-faint)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <Bell size={36} color="var(--text-faint)" style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-muted)" }}>
              {locale === "ar" ? "لا توجد تذكيرات في هذا القسم" : "No reminders in this view"}
            </div>
            <div style={{ fontSize: "0.82rem", marginTop: "4px" }}>
              {locale === "ar" ? "انقر على زر '+ إضافة تذكير جديد' لجدولة تنبيه موقوت." : "Click '+ Add Reminder' to schedule a timed reminder."}
            </div>
          </div>
        ) : (
          filteredReminders.map((r) => {
            const countdown = formatCountdown(r.reminderTime);

            return (
              <div
                key={r.id}
                className="glass-panel card-hover"
                style={{
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.9rem",
                  border: r.flagged ? "1px solid rgba(249, 115, 22, 0.4)" : "1px solid var(--border-subtle)",
                }}
              >
                {/* Complete Toggle Checkbox */}
                <div
                  onClick={() => toggleComplete(r.id)}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: r.completed ? "2px solid var(--primary-500)" : "2px solid #94a3b8",
                    background: r.completed ? "var(--primary-500)" : "transparent",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    marginTop: "2px",
                    flexShrink: 0,
                    transition: "all var(--transition-fast)",
                  }}
                  title={r.completed ? "Mark incomplete" : "Mark completed"}
                >
                  {r.completed && <Check size={14} strokeWidth={3} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "0.98rem",
                        textDecoration: r.completed ? "line-through" : "none",
                        color: r.completed ? "var(--text-faint)" : "var(--text-main)",
                      }}
                    >
                      {r.title}
                    </span>

                    {r.flagged && (
                      <span className="badge badge-amber" style={{ fontSize: "0.68rem", padding: "0.1rem 0.4rem" }}>
                        🚩 {locale === "ar" ? "هام" : "Flagged"}
                      </span>
                    )}

                    {r.completed && (
                      <span className="badge badge-emerald" style={{ fontSize: "0.68rem", padding: "0.1rem 0.4rem" }}>
                        ✓ {locale === "ar" ? "مكتمل" : "Completed"}
                      </span>
                    )}
                  </div>

                  {r.notes && (
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      {r.notes}
                    </div>
                  )}

                  {/* Scheduled Time & Live Countdown Pill */}
                  {r.reminderTime && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "8px", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "0.78rem", color: "#60a5fa", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={13} />
                        <span>{new Date(r.reminderTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                      </div>

                      {!r.completed && countdown && (
                        <div
                          style={{
                            fontSize: "0.74rem",
                            fontFamily: "monospace",
                            fontWeight: 700,
                            padding: "0.15rem 0.55rem",
                            borderRadius: "var(--radius-full)",
                            background: countdown.isOverdue ? "rgba(244, 63, 94, 0.15)" : "rgba(6, 182, 212, 0.15)",
                            color: countdown.isOverdue ? "#f43f5e" : "#06b6d4",
                            border: countdown.isOverdue ? "1px solid rgba(244, 63, 94, 0.3)" : "1px solid rgba(6, 182, 212, 0.3)",
                            animation: countdown.isOverdue ? "pulse 2s infinite" : "none",
                          }}
                        >
                          {countdown.text}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => openEditModal(r)}
                    className="btn btn-ghost"
                    style={{ padding: "0.35rem" }}
                    title="Edit Reminder"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(r)}
                    className="btn btn-ghost"
                    style={{ padding: "0.35rem", color: "var(--rose-glow)" }}
                    title="Delete Reminder"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reminder Create/Edit Modal */}
      {isModalOpen && (
        <div className="hud-modal-overlay">
          <div className="hud-modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                {editingId
                  ? (locale === "ar" ? "✏️ تعديل التذكير" : "✏️ Edit Reminder")
                  : (locale === "ar" ? "⏰ جدولة تذكير موقوت" : "⏰ Schedule New Reminder")}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReminder} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="input-label">
                  {locale === "ar" ? "عنوان التذكير *" : "Reminder Title *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={locale === "ar" ? "مثال: فحص مستويات الوقود والمولد..." : "e.g. Inspect fuel levels and generator..."}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">
                  {locale === "ar" ? "الملاحظات والتفاصيل" : "Notes & Details"}
                </label>
                <textarea
                  rows={2}
                  placeholder={locale === "ar" ? "إضافة تفاصيل أو تعليمات..." : "Add details or instructions..."}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">
                  {locale === "ar" ? "تاريخ ووقت التنبيه (سيصدر رنين صوتي)" : "Target Reminder Date & Time (Audio alarm will ring)"}
                </label>
                <input
                  type="datetime-local"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="input-field"
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.88rem" }}>
                <input
                  type="checkbox"
                  checked={isFlagged}
                  onChange={(e) => setIsFlagged(e.target.checked)}
                />
                <span>{locale === "ar" ? "تحديد كـ مهم / عاجل 🚩" : "Mark as Flagged / High Priority 🚩"}</span>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  {locale === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId
                    ? (locale === "ar" ? "تحديث التذكير" : "Update Reminder")
                    : (locale === "ar" ? "حفظ وجدولة التنبيه" : "Save & Schedule Alarm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2-Step Confirmation Modal on Delete */}
      {deleteCandidate && (
        <div className="hud-modal-overlay">
          <div className="hud-modal-box" style={{ maxWidth: "420px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(244, 63, 94, 0.15)",
                  color: "#f43f5e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  {locale === "ar" ? "تأكيد حذف التذكير" : "Confirm Deletion"}
                </h3>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {locale === "ar" ? "سيتم نقل العنصر إلى سلة المحذوفات" : "Item will be moved to Recycle Bin"}
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--text-main)", marginBottom: "1.25rem" }}>
              {locale === "ar" ? (
                <>
                  هل أنت متأكد من رغبتك في حذف <strong>"{deleteCandidate.title}"</strong>؟ يمكنك استعادته لاحقاً من سجل المحذوفات.
                </>
              ) : (
                <>
                  Are you sure you want to delete <strong>"{deleteCandidate.title}"</strong>? You can restore it later from the Recycle Bin.
                </>
              )}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="btn btn-secondary"
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn btn-danger"
                style={{ background: "#e11d48", color: "#fff" }}
              >
                {locale === "ar" ? "نعم، احذف التذكير" : "Yes, Delete Reminder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
