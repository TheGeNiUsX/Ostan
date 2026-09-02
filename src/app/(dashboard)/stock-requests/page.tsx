"use client";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { FileSpreadsheet } from "lucide-react";

export default function StockRequestsPage() {
  return (
    <ModulePlaceholder
      phase="Phase 5 Milestone"
      icon={FileSpreadsheet}
      titleEn="Stock Requests & Approvals"
      titleAr="طلبات الصرف والاعتماد"
      featuresEn={[
        "Employee & Manager tool/item requisition workflow",
        "Stock Manager approval and issuance dashboard",
        "Real-time quantity deductions upon approval",
        "Request status tracking & historical records",
      ]}
      featuresAr={[
        "سير عمل طلبات الأدوات والمواد من الموظفين والمدراء",
        "لوحة اعتماد وصرف الطلبات لمدير المستودع",
        "خصم فوري للكميات من المخزون فور الاعتماد",
        "تتبع حالات الطلبات والسجل التاريخي للصرف",
      ]}
    />
  );
}
