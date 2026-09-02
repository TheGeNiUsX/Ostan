"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/lib/i18n/context";
import { CheckSquare, Plus, Trash2, Edit2, User, Flag, ArrowRight, X } from "lucide-react";

export interface TaskItem {
  id: string;
  workerId: string;
  workerName: string;
  workerRole?: string;
  title: string;
  desc?: string;
  priority: "Normal" | "High" | "Urgent";
  status: "TODO" | "PROGRESS" | "COMPLETED";
  createdAt: string;
}

interface TasksViewProps {
  currentUser?: {
    id: string;
    name: string;
    nameAr?: string | null;
    email: string;
    role: string;
  };
  canAssignTasks?: boolean;
}

export function TasksView({ currentUser, canAssignTasks = false }: TasksViewProps) {
  const { t, locale } = useI18n();

  const [workers, setWorkers] = useState<Array<{ id: string; name: string; responsibility: string; role?: string }>>([]);
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("ostan_tasks") || "[]");
    }
    return [];
  });

  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [assigneeId, setAssigneeId] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<"Normal" | "High" | "Urgent">("Normal");
  const [status, setStatus] = useState<"TODO" | "PROGRESS" | "COMPLETED">("TODO");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWorkers = JSON.parse(localStorage.getItem("ostan_workers") || "[]");
      setWorkers(savedWorkers);
      if (savedWorkers.length > 0 && !assigneeId) {
        setAssigneeId(savedWorkers[0].id);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ostan_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const openNewModal = () => {
    if (!canAssignTasks) return;
    setEditingId(null);
    setTitle("");
    setDesc("");
    setPriority("Normal");
    setStatus("TODO");
    if (workers.length > 0) setAssigneeId(workers[0].id);
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    if (!canAssignTasks) return;
    setEditingId(task.id);
    setAssigneeId(task.workerId);
    setTitle(task.title);
    setDesc(task.desc || "");
    setPriority(task.priority);
    setStatus(task.status);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAssignTasks || !title.trim() || !assigneeId) return;

    const worker = workers.find((w) => w.id === assigneeId);
    if (!worker) return;

    if (editingId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                workerId: worker.id,
                workerName: worker.name,
                workerRole: worker.role,
                title: title.trim(),
                desc: desc.trim() || undefined,
                priority,
                status,
              }
            : t
        )
      );
    } else {
      const newTask: TaskItem = {
        id: Date.now().toString(),
        workerId: worker.id,
        workerName: worker.name,
        workerRole: worker.role,
        title: title.trim(),
        desc: desc.trim() || undefined,
        priority,
        status,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);
    }

    setIsModalOpen(false);
  };

  const updateStatus = (id: string, newStatus: "TODO" | "PROGRESS" | "COMPLETED") => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const deleteTask = (id: string) => {
    if (!canAssignTasks) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTasks = useMemo(() => {
    // If not allowed to assign to others (Employee / Stock Manager), only show tasks assigned to self
    if (!canAssignTasks && currentUser) {
      return tasks.filter(
        (t) =>
          t.workerName?.toLowerCase() === currentUser.name.toLowerCase() ||
          t.workerId === currentUser.id ||
          (currentUser.role === "STOCK_MANAGER" && t.workerRole === "STOCK_MANAGER") ||
          (currentUser.role === "EMPLOYEE" && t.workerRole === "EMPLOYEE")
      );
    }

    if (selectedWorkerFilter === "ALL") return tasks;
    return tasks.filter((t) => t.workerId === selectedWorkerFilter);
  }, [tasks, selectedWorkerFilter, canAssignTasks, currentUser]);

  const todoTasks = filteredTasks.filter((t) => t.status === "TODO");
  const progressTasks = filteredTasks.filter((t) => t.status === "PROGRESS");
  const completedTasks = filteredTasks.filter((t) => t.status === "COMPLETED");

  // Dynamic Header Content
  const pageTitle = canAssignTasks
    ? (locale === "ar" ? "إدارة المهام وتعيينها للموظفين" : "Tasks & Worker Assignments")
    : (locale === "ar" ? "المهام" : "Tasks");

  const pageDescription = canAssignTasks
    ? (locale === "ar"
        ? "اختر موظفاً وقم بإسناد المهام له ومتابعة تقدم الإنجاز عبر لوحة كانبان."
        : "Select a registered worker, assign tasks, and monitor workflow progression.")
    : (locale === "ar"
        ? "متابعة وإنجاز المهام المسندة إليك وتحديث حالة التنفيذ."
        : "View and update your assigned tasks and track execution status.");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>{pageTitle}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{pageDescription}</p>
        </div>

        {/* Manager / Admin Assign & Filter Controls */}
        {canAssignTasks && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Filter by Worker */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>Worker:</span>
              <select
                value={selectedWorkerFilter}
                onChange={(e) => setSelectedWorkerFilter(e.target.value)}
                className="input-field"
                style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem", width: "auto" }}
              >
                <option value="ALL">All Workers ({workers.length})</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                if (workers.length === 0) {
                  alert("Please add at least one worker first in the Workers section!");
                  return;
                }
                openNewModal();
              }}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>{locale === "ar" ? "+ إسناد مهمة جديدة" : "+ Assign Task"}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3 Columns: To Do / In Progress / Completed */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", alignItems: "flex-start" }}>
        {/* Column 1: To Do */}
        <div className="glass-panel" style={{ padding: "1.1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>To Do</h3>
            <span className="badge badge-primary">{todoTasks.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", minHeight: "100px" }}>
            {todoTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                canManage={canAssignTasks}
                onEdit={openEditModal}
                onUpdateStatus={updateStatus}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="glass-panel" style={{ padding: "1.1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>In Progress</h3>
            <span className="badge badge-amber">{progressTasks.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", minHeight: "100px" }}>
            {progressTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                canManage={canAssignTasks}
                onEdit={openEditModal}
                onUpdateStatus={updateStatus}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="glass-panel" style={{ padding: "1.1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Completed</h3>
            <span className="badge badge-emerald">{completedTasks.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", minHeight: "100px" }}>
            {completedTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                canManage={canAssignTasks}
                onEdit={openEditModal}
                onUpdateStatus={updateStatus}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Task Creation / Edit Modal */}
      {isModalOpen && canAssignTasks && (
        <div className="hud-modal-overlay">
          <div className="hud-modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                {editingId ? "✏️ Edit Task" : "📋 Assign Task to Worker"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="input-label">Select Assignee Worker *</label>
                <select
                  required
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="input-field"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.responsibility}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete warehouse audit on section 4..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Instructions & Details</label>
                <textarea
                  rows={2}
                  placeholder="Instructions for the worker..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label className="input-label">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High ⚡</option>
                    <option value="Urgent">Urgent 🚨</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Status Column</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="TODO">To Do</option>
                    <option value="PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update Task" : "Dispatch & Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  canManage,
  onEdit,
  onUpdateStatus,
  onDelete,
}: {
  task: TaskItem;
  canManage: boolean;
  onEdit: (t: TaskItem) => void;
  onUpdateStatus: (id: string, s: "TODO" | "PROGRESS" | "COMPLETED") => void;
  onDelete: (id: string) => void;
}) {
  const priorityBadge =
    task.priority === "Urgent"
      ? "badge-rose"
      : task.priority === "High"
      ? "badge-amber"
      : "badge-primary";

  return (
    <div
      style={{
        background: "var(--bg-surface-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        padding: "0.85rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
      }}
      className="card-hover"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{task.title}</div>
        {canManage && (
          <div style={{ display: "flex", gap: "2px" }}>
            <button
              onClick={() => onEdit(task)}
              style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: "2px" }}
              title="Edit Task"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: "2px" }}
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {task.desc && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{task.desc}</div>}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "6px",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#60a5fa" }}>👤 {task.workerName}</span>
          <span className={`badge ${priorityBadge}`}>{task.priority}</span>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          {task.status !== "TODO" && (
            <button
              onClick={() => onUpdateStatus(task.id, "TODO")}
              className="btn btn-secondary"
              style={{ padding: "2px 6px", fontSize: "0.7rem" }}
            >
              To Do
            </button>
          )}
          {task.status !== "PROGRESS" && (
            <button
              onClick={() => onUpdateStatus(task.id, "PROGRESS")}
              className="btn btn-secondary"
              style={{ padding: "2px 6px", fontSize: "0.7rem" }}
            >
              Prog
            </button>
          )}
          {task.status !== "COMPLETED" && (
            <button
              onClick={() => onUpdateStatus(task.id, "COMPLETED")}
              className="btn btn-primary"
              style={{ padding: "2px 6px", fontSize: "0.7rem" }}
            >
              Done ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
