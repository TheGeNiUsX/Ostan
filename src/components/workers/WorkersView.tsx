"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Shield,
  ShieldAlert,
  X,
  Lock,
  CheckCircle2,
  Search,
} from "lucide-react";

export interface UserItem {
  id: string;
  name: string;
  nameAr?: string | null;
  email: string;
  role: string;
  status: string;
  isProtected: boolean;
  phone?: string | null;
  department?: { id: string; name: string } | null;
  createdAt?: string;
}

export function WorkersView() {
  const { t, locale } = useI18n();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [phone, setPhone] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openNewModal = () => {
    setEditingUser(null);
    setName("");
    setNameAr("");
    setEmail("");
    setPassword("");
    setRole("EMPLOYEE");
    setPhone("");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setName(u.name);
    setNameAr(u.nameAr || "");
    setEmail(u.email);
    setPassword("");
    setRole(u.role);
    setPhone(u.phone || "");
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingUser) {
        // Edit existing user
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            nameAr,
            email,
            role,
            phone,
            password: password.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update user");
        }

        setSuccessMsg(locale === "ar" ? "تم تحديث بيانات المستخدم في النظام و Firebase بنجاح!" : "User updated successfully in Database & Firebase!");
      } else {
        // Create new user (DB + Firebase Auth)
        if (!password.trim()) {
          setError(locale === "ar" ? "يرجى تحديد كلمة المرور للحساب." : "Password is required for new accounts.");
          setSaving(false);
          return;
        }

        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            nameAr,
            email,
            password,
            role,
            phone,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create user");
        }

        setSuccessMsg(locale === "ar" ? "تم إنشاء الحساب في النظام و Firebase بنجاح!" : "User created & registered in Firebase successfully!");
      }

      setIsModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (u: UserItem) => {
    if (u.isProtected || u.email === "waseem.tw@hotmail.com") {
      alert(locale === "ar" ? "لا يمكن حذف حساب المسؤول المتميز الرئيسي." : "The protected Super Admin account cannot be deleted.");
      return;
    }

    const confirmMsg = locale === "ar"
      ? `هل أنت متأكد من حذف ${u.name}؟ سيتم حذف الحساب نهائياً من النظام و Firebase وتحرير البريد الإلكتروني فوراً.`
      : `Are you sure you want to delete ${u.name}? This will permanently remove the account from Database and Firebase Auth, freeing the email for registration.`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }
      setSuccessMsg(locale === "ar" ? "تم حذف الحساب من النظام و Firebase بنجاح!" : "User deleted from Database & Firebase Auth!");
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.nameAr && u.nameAr.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Panel */}
      <div
        className="glass-panel"
        style={{
          padding: "1.5rem 1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, #818cf8, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
            }}
          >
            <Users size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              {locale === "ar" ? "إدارة الموظفين وفريق العمل" : "Employees & User Management"}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {locale === "ar"
                ? "إنشاء وإدارة حسابات الموظفين مع المزامنة الفورية في Firebase Authentication."
                : "Create, edit, and delete real employee accounts with real-time Firebase Auth synchronization."}
            </p>
          </div>
        </div>

        <button onClick={openNewModal} className="btn btn-primary" style={{ padding: "0.6rem 1.2rem" }}>
          <Plus size={16} />
          <span>{locale === "ar" ? "+ إضافة موظف جديد" : "+ Add New Employee"}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            borderRadius: "var(--radius-md)",
            color: "#34d399",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.88rem",
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "0.85rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <Search size={18} color="var(--text-faint)" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={locale === "ar" ? "بحث بالاسم أو البريد أو الرتبة..." : "Search by name, email, or role..."}
          className="input-field"
          style={{ maxWidth: "380px" }}
        />
        <div style={{ marginInlineStart: "auto", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          {filteredUsers.length} {locale === "ar" ? "مستخدمين مسجلين" : "Registered Accounts"}
        </div>
      </div>

      {/* Users Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {filteredUsers.map((u) => {
          const isMasterAdmin = u.email === "waseem.tw@hotmail.com" || u.isProtected;

          return (
            <div
              key={u.id}
              className="glass-panel card-hover"
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1rem",
                border: isMasterAdmin ? "1px solid rgba(244, 63, 94, 0.35)" : "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "var(--radius-full)",
                        background: isMasterAdmin
                          ? "linear-gradient(135deg, #f43f5e, #fb7185)"
                          : "linear-gradient(135deg, #6366f1, #06b6d4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                      }}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        {locale === "ar" && u.nameAr ? u.nameAr : u.name}
                        {isMasterAdmin && (
                          <span title="Protected Master Admin">
                            <ShieldAlert size={14} color="#f43f5e" />
                          </span>
                        )}
                      </h3>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "2px" }}>
                        <Mail size={12} />
                        <span>{u.email}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      u.role === "SUPER_ADMIN"
                        ? "badge-rose"
                        : u.role === "ADMIN"
                        ? "badge-primary"
                        : u.role === "MANAGER"
                        ? "badge-emerald"
                        : "badge-cyan"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>

                {u.phone && (
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem", marginInlineStart: "3.25rem" }}>
                    <Phone size={12} />
                    <span>{u.phone}</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="badge badge-secondary" style={{ fontSize: "0.68rem" }}>
                  {u.department ? u.department.name : "General Staff"}
                </span>

                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    onClick={() => openEditModal(u)}
                    className="btn btn-ghost"
                    style={{ padding: "0.35rem", color: "var(--text-muted)" }}
                    title="Edit User"
                  >
                    <Edit2 size={16} />
                  </button>

                  {!isMasterAdmin && (
                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="btn btn-ghost"
                      style={{ padding: "0.35rem", color: "#fb7185" }}
                      title="Delete User from Database & Firebase"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: "520px",
              width: "100%",
              padding: "1.75rem",
              background: "linear-gradient(180deg, rgba(26, 34, 52, 0.95) 0%, rgba(15, 22, 35, 0.98) 100%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                {editingUser
                  ? (locale === "ar" ? "تعديل حساب موظف" : "Edit Employee Account")
                  : (locale === "ar" ? "إضافة موظف جديد (تسجيل في Firebase)" : "Create User (Sync with Firebase)")}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost" style={{ padding: "0.3rem" }}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div
                style={{
                  padding: "0.6rem 0.85rem",
                  background: "rgba(244, 63, 94, 0.15)",
                  border: "1px solid rgba(244, 63, 94, 0.35)",
                  borderRadius: "var(--radius-md)",
                  color: "#fb7185",
                  fontSize: "0.82rem",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSaveUser} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Khalid Al-Ghamdi"
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    الاسم الكامل (عربي)
                  </label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: خالد الغامدي"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="khalid@company.com"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  {editingUser ? "New Password (leave empty to keep current)" : "Password *"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? "•••••••• (unchanged)" : "At least 6 characters"}
                  className="input-field"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    System Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-field"
                    disabled={editingUser?.isProtected}
                  >
                    <option value="EMPLOYEE">Employee (عامل / موظف)</option>
                    <option value="MANAGER">Manager (مدير قسم)</option>
                    <option value="STOCK_MANAGER">Stock Manager (مدير المستودع)</option>
                    <option value="ADMIN">Administrator (مدير النظام)</option>
                    {editingUser?.isProtected && <option value="SUPER_ADMIN">Super Admin</option>}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? "Saving..." : editingUser ? "Save Changes" : "Create & Register in Firebase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
