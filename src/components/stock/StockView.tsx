"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  X,
  Layers,
} from "lucide-react";

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  threshold: number;
  location?: string;
  price?: number;
}

const DEFAULT_STOCK_ITEMS: StockItem[] = [
  { id: "st-1", name: "High-Pressure Hydraulic Valve", sku: "VALVE-HYD-01", category: "Spare Parts", quantity: 18, threshold: 5, location: "Shelf A-12", price: 120 },
  { id: "st-2", name: "Industrial Grade Drill Bit Set", sku: "TOOL-DRL-09", category: "Tools", quantity: 4, threshold: 6, location: "Shelf B-04", price: 45 },
  { id: "st-3", name: "Safety Helmets (High-Vis Yellow)", sku: "PPE-HLM-22", category: "Safety / PPE", quantity: 35, threshold: 10, location: "Storage Bay 2", price: 25 },
  { id: "st-4", name: "Motor Oil Synthetic 5W-40 (20L)", sku: "LUB-OIL-5W", category: "Consumables", quantity: 3, threshold: 5, location: "Rack C-01", price: 85 },
];

export function StockView({
  userRole = "EMPLOYEE",
  isSuperAdmin = false,
}: {
  userRole?: string;
  isSuperAdmin?: boolean;
}) {
  const { locale } = useI18n();

  const [items, setItems] = useState<StockItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ostan_stock");
      return stored ? JSON.parse(stored) : DEFAULT_STOCK_ITEMS;
    }
    return DEFAULT_STOCK_ITEMS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form inputs
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Spare Parts");
  const [quantity, setQuantity] = useState<number>(10);
  const [threshold, setThreshold] = useState<number>(5);
  const [location, setLocation] = useState("Shelf A-01");

  const canManageStock = isSuperAdmin || userRole === "ADMIN" || userRole === "MANAGER" || userRole === "STOCK_MANAGER";

  useEffect(() => {
    localStorage.setItem("ostan_stock", JSON.stringify(items));
  }, [items]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    setSku("SKU-" + Math.floor(1000 + Math.random() * 9000));
    setCategory("Spare Parts");
    setQuantity(10);
    setThreshold(5);
    setLocation("Shelf A-01");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StockItem) => {
    setEditingId(item.id);
    setName(item.name);
    setSku(item.sku);
    setCategory(item.category);
    setQuantity(item.quantity);
    setThreshold(item.threshold);
    setLocation(item.location || "");
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(locale === "ar" ? "هل أنت متأكد من حذف هذا الصنف من المستودع؟" : "Are you sure you want to delete this inventory item?")) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingId
            ? { ...i, name, sku, category, quantity: Number(quantity), threshold: Number(threshold), location }
            : i
        )
      );
    } else {
      const newItem: StockItem = {
        id: "st-" + Date.now(),
        name,
        sku,
        category,
        quantity: Number(quantity),
        threshold: Number(threshold),
        location,
      };
      setItems((prev) => [newItem, ...prev]);
    }
    setIsModalOpen(false);
  };

  const filteredItems = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const lowStockCount = items.filter((i) => i.quantity <= i.threshold).length;

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
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)",
            }}
          >
            <Package size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              {locale === "ar" ? "المستودع وإدارة المخزون" : "Warehouse & Stock Inventory"}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {locale === "ar"
                ? "إدارة المعدات، قطع الغيار، ومراقبة حدود تنبيه نقص المخزون."
                : "Equipment, spare parts catalog, and automated low-stock threshold alerts."}
            </p>
          </div>
        </div>

        {canManageStock && (
          <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: "0.6rem 1.1rem" }}>
            <Plus size={16} />
            <span>{locale === "ar" ? "+ إضافة صنف للمخزون" : "+ Add Stock Item"}</span>
          </button>
        )}
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockCount > 0 && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fb7185",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <AlertTriangle size={18} />
          <span>
            {locale === "ar"
              ? `⚠️ تنبيه نقص المخزون: يوجد ${lowStockCount} أصناف وصلت أو تجاوزت حد التنبيه الأدنى!`
              : `⚠️ Low Stock Alert: ${lowStockCount} items have reached or fallen below critical threshold levels!`}
          </span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "260px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-faint)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "ar" ? "بحث بالاسم أو الكود (SKU)..." : "Search item or SKU..."}
              className="input-field"
              style={{ paddingLeft: "2.2rem" }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
            style={{ width: "180px" }}
          >
            <option value="ALL">{locale === "ar" ? "جميع التصنيفات" : "All Categories"}</option>
            <option value="Spare Parts">Spare Parts</option>
            <option value="Tools">Tools</option>
            <option value="Safety / PPE">Safety / PPE</option>
            <option value="Consumables">Consumables</option>
          </select>
        </div>

        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
          {filteredItems.length} {locale === "ar" ? "أصناف متوفرة" : "Items in Catalog"}
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {filteredItems.map((item) => {
          const isLow = item.quantity <= item.threshold;

          return (
            <div
              key={item.id}
              className="glass-panel card-hover"
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1rem",
                border: isLow ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>
                    {item.sku}
                  </span>
                  <span className={`badge ${isLow ? "badge-rose" : "badge-emerald"}`}>
                    {isLow ? (locale === "ar" ? "⚠️ ناقص" : "Low Stock") : (locale === "ar" ? "متوفر" : "In Stock")}
                  </span>
                </div>

                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>
                  {item.name}
                </h3>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {item.category} • {item.location || "General Shelf"}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "1.45rem", fontWeight: 800, color: isLow ? "#fb7185" : "var(--text-main)" }}>
                    {item.quantity} <span style={{ fontSize: "0.78rem", color: "var(--text-faint)", fontWeight: 500 }}>units</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {locale === "ar" ? `حد التنبيه: ${item.threshold}` : `Threshold: ${item.threshold}`}
                  </div>
                </div>

                {canManageStock && (
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="btn btn-ghost"
                      style={{ padding: "0.35rem", color: "var(--text-muted)" }}
                      title="Edit Item"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-ghost"
                      style={{ padding: "0.35rem", color: "#fb7185" }}
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Item */}
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
              maxWidth: "500px",
              width: "100%",
              padding: "1.75rem",
              background: "linear-gradient(180deg, rgba(26, 34, 52, 0.95) 0%, rgba(15, 22, 35, 0.98) 100%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                {editingId
                  ? (locale === "ar" ? "تعديل صنف في المخزون" : "Edit Stock Item")
                  : (locale === "ar" ? "إضافة صنف جديد للمستودع" : "Add New Stock Item")}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost" style={{ padding: "0.3rem" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  {locale === "ar" ? "اسم الصنف *" : "Item Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hydraulic Pump Valve 24V"
                  className="input-field"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Tools">Tools</option>
                    <option value="Safety / PPE">Safety / PPE</option>
                    <option value="Consumables">Consumables</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    {locale === "ar" ? "الكمية المتوفرة" : "Available Quantity"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    {locale === "ar" ? "حد التنبيه الأدنى" : "Low Stock Threshold"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Storage Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Shelf B-12"
                  className="input-field"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  {locale === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? (locale === "ar" ? "حفظ التعديلات" : "Save Changes") : (locale === "ar" ? "إضافة الصنف" : "Add Item")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
