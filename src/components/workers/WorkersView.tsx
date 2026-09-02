"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Users, Plus, Trash2, Edit2, Phone, Briefcase, X } from "lucide-react";

export interface WorkerItem {
  id: string;
  name: string;
  responsibility: string;
  role: string;
  phone?: string;
}

export function WorkersView() {
  const { t, locale } = useI18n();
  const [workers, setWorkers] = useState<WorkerItem[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("ostan_workers") || "[]");
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [responsibility, setResponsibility] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    localStorage.setItem("ostan_workers", JSON.stringify(workers));
  }, [workers]);

  const openNewModal = () => {
    setEditingId(null);
    setName("");
    setResponsibility("");
    setRole("EMPLOYEE");
    setPhone("");
    setIsModalOpen(true);
  };

  const openEditModal = (w: WorkerItem) => {
    setEditingId(w.id);
    setName(w.name);
    setResponsibility(w.responsibility);
    setRole(w.role);
    setPhone(w.phone || "");
    setIsModalOpen(true);
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !responsibility.trim()) return;

    if (editingId) {
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === editingId
            ? {
                ...w,
                name: name.trim(),
                responsibility: responsibility.trim(),
                role,
                phone: phone.trim() || undefined,
              }
            : w
        )
      );

      // Also update workerName in any existing tasks
      if (typeof window !== "undefined") {
        const savedTasks = JSON.parse(localStorage.getItem("ostan_tasks") || "[]");
        const updatedTasks = savedTasks.map((t: any) =>
          t.workerId === editingId ? { ...t, workerName: name.trim() } : t
        );
        localStorage.setItem("ostan_tasks", JSON.stringify(updatedTasks));
      }
    } else {
      const newWorker: WorkerItem = {
        id: Date.now().toString(),
        name: name.trim(),
        responsibility: responsibility.trim(),
        role,
        phone: phone.trim() || undefined,
      };
      setWorkers((prev) => [...prev, newWorker]);
    }

    setIsModalOpen(false);
  };

  const deleteWorker = (id: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>
            {locale === "ar" ? "إدارة العمال وفريق العمل" : "Workers & Team Management"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {locale === "ar"
              ? "سجل العمال والموظفين مع المسمى الوظيفي والأدوار لتخصيص المهام لهم."
              : "Register company staff with their responsibilities and roles to assign tasks."}
          </p>
        </div>

        <button onClick={openNewModal} className="btn btn-primary">
          <Plus size={16} />
          <span>{locale === "ar" ? "+ إضافة عامل / موظف" : "+ Add Worker"}</span>
        </button>
      </div>

      {workers.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: "center",
            padding: "3.5rem",
            color: "var(--text-faint)",
            border: "1px dashed var(--border-subtle)",
          }}
        >
          <Users size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
          <div style={{ fontWeight: 600, fontSize: "1rem" }}>No workers registered yet</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Click "+ Add Worker" to add team members.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {workers.map((w) => (
            <div
              key={w.id}
              className="glass-panel card-hover"
              style={{
                padding: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #007aff, #8b5cf6)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}
              >
                {w.name.charAt(0)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{w.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  <Briefcase size={13} />
                  <span>{w.responsibility}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "6px" }}>
                  <span className="badge badge-primary">{w.role}</span>
                  {w.phone && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      <Phone size={11} />
                      <span>{w.phone}</span>
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => openEditModal(w)}
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem", fontSize: "0.75rem" }}
                  title="Edit Worker"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deleteWorker(w.id)}
                  className="btn btn-danger"
                  style={{ padding: "0.4rem", fontSize: "0.75rem" }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Worker Creation / Edit Modal */}
      {isModalOpen && (
        <div className="hud-modal-overlay">
          <div className="hud-modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                {editingId ? "✏️ Edit Worker Profile" : "👥 Register Company Worker"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="input-label">Worker Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Al-Otaibi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Responsibility / Position *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Field Supervisor, Fleet Driver, Technician..."
                  value={responsibility}
                  onChange={(e) => setResponsibility(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">System Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="STOCK_MANAGER">STOCK_MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div>
                <label className="input-label">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+966 50 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update Worker" : "Save Worker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
