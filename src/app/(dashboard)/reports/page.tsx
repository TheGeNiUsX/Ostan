"use client";

import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      phase="Phase 6 Milestone"
      icon={BarChart3}
      titleEn="Reports, Analytics & Integrations"
      titleAr="التقارير والتحليلات والربط الخارجي"
      featuresEn={[
        "Company-wide operational analytics & KPI charts",
        "PDF & CSV export engine",
        "Microsoft 365 Calendar, Email & Teams integration",
        "WhatsApp notification alerts & task dispatches",
        "Executive leadership reports",
      ]}
      featuresAr={[
        "تحليلات العمليات ومؤشرات الأداء للشركة",
        "محرك تصدير التقارير بصيغة PDF و CSV",
        "الربط مع خدمات Microsoft 365 (التقويم، البريد، وتيمز)",
        "إشعارات وتنبيهات واتساب المباشرة للمهام",
        "تقارير الإدارة التنفيذية والقيادة",
      ]}
    />
  );
}
