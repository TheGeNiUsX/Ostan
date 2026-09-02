"use client";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { Package } from "lucide-react";

export default function StockPage() {
  return (
    <ModulePlaceholder
      phase="Phase 5 Milestone"
      icon={Package}
      titleEn="Stock & Inventory Management"
      titleAr="إدارة المخزون والمستودع"
      featuresEn={[
        "Equipment, Spare Parts, Office Supplies & Product Catalog",
        "SKU, Categories, Quantities & Purchase Prices",
        "Configurable Low-Stock Alert Thresholds",
        "Item Photos & Expiry Dates",
        "Stock Movements & Audit History",
      ]}
      featuresAr={[
        "دليل المعدات وقطع الغيار والأدوات المكتبية والمنتجات",
        "رموز التخزين (SKU)، التصنيفات، الكميات، وأسعار الشراء",
        "حدود تنبيه انخفاض المخزون القابلة للتخصيص",
        "صور الأصناف وتواريخ انتهاء الصلاحية",
        "سجل حركات المخزون والمستودع",
      ]}
    />
  );
}
