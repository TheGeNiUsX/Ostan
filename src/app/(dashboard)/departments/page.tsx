"use client";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { Building2 } from "lucide-react";

export default function DepartmentsPage() {
  return (
    <ModulePlaceholder
      phase="Phase 2 Milestone"
      icon={Building2}
      titleEn="Department Management"
      titleAr="إدارة الأقسام"
      featuresEn={[
        "Organizational structure and department creation",
        "Department Manager assignment",
        "Employee headcounts & department statistics",
        "Cross-department workflows",
      ]}
      featuresAr={[
        "الهيكل التنظيمي وإنشاء الأقسام",
        "تعيين مدراء الأقسام",
        "إحصائيات وعدد موظفي كل قسم",
        "إجراءات العمل المشتركة بين الأقسام",
      ]}
    />
  );
}
