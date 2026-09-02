"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  User,
} from "lucide-react";

export interface StockRequestItem {
  id: string;
  itemName: string;
  quantity: number;
  requestedBy: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const DEFAULT_REQUESTS: StockRequestItem[] = [
  { id: "req-1", itemName: "High-Pressure Hydraulic Valve", quantity: 2, requestedBy: "Faisal Al-Harbi", reason: "Routine overhaul on pump line #3", status: "APPROVED", createdAt: "2026-09-02" },
  { id: "req-2", itemName: "Safety Helmets (High-Vis Yellow)", quantity: 5, requestedBy: "Khalid Al-Ghamdi", reason: "New field contractors onboarding", status: "PENDING", createdAt: "2026-09-02" },
];

export function StockRequestsView({
  userName = "Worker",
  userRole = "EMPLOYEE",
  isSuperAdmin = false,
}: {
  userName?: string;
  userRole?: string;
  isSuperAdmin?: boolean;
}) {
  const { locale } = useI18n();

  const [requests, setRequests] = useState<StockRequestItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ostan_stock_requests");
      return stored ? JSON.parse(stored) : DEFAULT_REQUESTS;
    }
    return DEFAULT_REQUESTS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

  const canApprove = isSuperAdmin || userRole === "ADMIN" || userRole === "MANAGER" || userRole === "STOCK_MANAGER";

  useEffect(() => {
    localStorage.setItem("ostan_stock_requests", JSON.stringify(requests));
  }, [requests]);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const newReq: StockRequestItem = {
      id: "req-" + Date.now(),
      itemName,
      quantity: Number(quantity),
      requestedBy: userName,
      reason,
      status: "PENDING",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setRequests((prev) => [newReq, ...prev]);
    setIsModalOpen(false);
    setItemName("");
    setQuantity(1);
    setReason("");
  };

  const handleUpdateStatus = (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

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
              background: "linear-gradient(135deg, #fb923c, #ea580c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 0 20px rgba(251, 146, 60, 0.3)",
            }}
          >
            <FileSpreadsheet size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              {locale === "ar" ? "طلبات الصرف والمستودع" : "Stock & Material Requests"}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {locale === "ar"
                ? "تقديم واعتماد طلبات صرف قطع الغيار والمعدات من المستودع."
                : "Submit and approve requests for spare parts and equipment from the warehouse."}
            </p>
          </div>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ padding: "0.6rem 1.1rem" }}>
          <Plus size={16} />
          <span>{locale === "ar" ? "+ تقديم طلب صرف جديد" : "+ Submit Stock Request"}</span>
        </button>
      </div>

      {/* Requests Table */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "start" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-faint)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                <th style={{ padding: "0.75rem 1rem", textAlign: "start" }}>{locale === "ar" ? "الصنف المطلوب" : "Requested Item"}</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>{locale === "ar" ? "الكمية" : "Qty"}</th>
                <th style={{ padding: "0.75rem 0.75rem", textAlign: "start" }}>{locale === "ar" ? "مقدم الطلب" : "Requested By"}</th>
                <th style={{ padding: "0.75rem 0.75rem", textAlign: "start" }}>{locale === "ar" ? "السبب / الملاحظات" : "Reason"}</th>
                <th style={{ padding: "0.75rem 0.75rem", textAlign: "center" }}>{locale === "ar" ? "الحالة" : "Status"}</th>
                {canApprove && <th style={{ padding: "0.75rem 0.75rem", textAlign: "center" }}>{locale === "ar" ? "الإجراء" : "Actions"}</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {req.itemName}
                  </td>
                  <td style={{ padding: "0.85rem 0.5rem", textAlign: "center", fontWeight: 800 }}>
                    {req.quantity}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {req.requestedBy}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {req.reason || "Operational need"}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", textAlign: "center" }}>
                    <span
                      className={`badge ${
                        req.status === "APPROVED"
                          ? "badge-emerald"
                          : req.status === "REJECTED"
                          ? "badge-rose"
                          : "badge-amber"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  {canApprove && (
                    <td style={{ padding: "0.85rem 0.75rem", textAlign: "center" }}>
                      {req.status === "PENDING" ? (
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                          <button
                            onClick={() => handleUpdateStatus(req.id, "APPROVED")}
                            className="btn btn-primary"
                            style={{ padding: "2px 8px", fontSize: "0.72rem" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                            className="btn btn-secondary"
                            style={{ padding: "2px 8px", fontSize: "0.72rem", color: "#fb7185" }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Request */}
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
              maxWidth: "480px",
              width: "100%",
              padding: "1.75rem",
              background: "linear-gradient(180deg, rgba(26, 34, 52, 0.95) 0%, rgba(15, 22, 35, 0.98) 100%)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.25rem" }}>
              {locale === "ar" ? "تقديم طلب صرف صنف" : "Submit Stock Request"}
            </h2>

            <form onSubmit={handleCreateRequest} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Industrial Grade Drill Bit Set"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Reason / Work Order Notes
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Required for generator overhaul on site B"
                  className="input-field"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
