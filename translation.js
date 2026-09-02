/**
 * Ostan Comprehensive Bilingual Translation Dictionary & Engine (English ↔ Arabic)
 */

(function () {
  const dictionary = {
    en: {
      // Top Header & General
      app_name: "Ostan",
      app_subtitle: "Enterprise Management System",
      lang_toggle: "🌐 العربية",
      theme_toggle: "🌓 Theme",
      auth_logout: "Sign Out",
      search_placeholder: "Search anything across modules...",

      // Module Navigation
      nav_group_overview: "OVERVIEW",
      nav_dashboard: "Dashboard",
      nav_group_org: "ORGANIZATION",
      nav_employees: "Employees",
      nav_departments: "Departments",
      nav_group_ops: "OPERATIONS",
      nav_reminders: "Reminders",
      nav_tasks: "Task Management",
      nav_group_inv: "INVENTORY",
      nav_stock: "Stock & Inventory",
      nav_stock_requests: "Stock Requests",
      nav_group_sec: "INTELLIGENCE & SECURITY",
      nav_reports: "Reports & Analytics",
      nav_audit_logs: "Audit Logs",
      nav_group_sys: "SYSTEM",
      nav_settings: "System Settings",

      // Dashboard Greetings & Cards
      dash_greeting_morning: "Good morning",
      dash_greeting_afternoon: "Good afternoon",
      dash_greeting_evening: "Good evening",
      dash_subtitle: "Here is your organization's real-time operational overview.",
      dash_total_employees: "Total Employees",
      dash_active_on_duty: "Active on Duty",
      dash_open_tasks: "Open Tasks",
      dash_tasks_in_progress: "In progress & pending",
      dash_my_assigned_tasks: "My Assigned Tasks",
      dash_all_tasks_completed: "All tasks up to date",
      dash_upcoming_reminders: "Upcoming Reminders",
      dash_active_alerts: "Active alerts",
      dash_no_reminders: "No pending alerts",
      dash_low_stock_items: "Low Stock Items",
      dash_stock_alert: "Below threshold alert",
      dash_stock_healthy: "Stock healthy",
      dash_active_tasks_title: "Active Assigned Tasks",
      dash_no_active_tasks: "No active tasks assigned.",

      // Quick Operations
      quick_ops_title: "⚡ Quick Operations",
      op_tasks_title: "Task Management",
      op_tasks_desc: "Assign tasks to specific registered workers with full edit controls",
      op_reminders_title: "Reminders & Sound Alarms",
      op_reminders_desc: "Create scheduled reminders with live countdown tracking and chime",
      op_stock_title: "Warehouse & Stock Catalog",
      op_stock_desc: "Manage inventory counts, safety thresholds, and material requests",

      // Employees Section
      emp_section_title: "Employees & User Management",
      emp_section_desc: "Create, edit, and delete real employee accounts with real-time Firebase sync.",
      btn_add_employee: "+ Add New Employee",
      search_emp_placeholder: "Search by name, email, or role...",
      registered_accounts_label: "Live Registered Accounts",
      protected_admin_badge: "Protected Super Admin",
      staff_member_badge: "Staff Member",

      // Departments & Console
      dept_section_title: "Departments & Worker Section Access Control",
      dept_section_desc: "Select a worker, choose a section, and configure lock or hide policies.",
      dept_step_1: "1. Select Worker:",
      dept_step_2: "2. Select Section:",
      dept_step_3: "3. Choose Policy:",
      btn_apply_policy: "Apply Policy",
      policy_accessible: "OK (Full Access)",
      policy_locked: "LOCKED 🔒",
      policy_hidden: "HIDDEN 👁️",
      matrix_worker_col: "Worker / Account",
      matrix_title: "Department Permissions Matrix",

      // Tasks Section
      tasks_section_title: "Tasks & Assignments",
      tasks_section_desc: "Assign and track execution progress across company staff.",
      tasks_section_desc_emp: "View and execute your assigned tasks and update progress.",
      btn_assign_task: "+ Assign Task",
      task_filter_label: "Filter by Assignee:",
      filter_all_workers: "All Staff",
      col_todo: "To Do",
      col_progress: "In Progress",
      col_done: "Done ✓",
      btn_cancel_task: "🚫 Cancel Task",

      // Reminders Section
      rem_section_title: "Reminders & Alerts",
      rem_section_desc: "Scheduled reminders with live countdown tracking and 880Hz audio alarm chime.",
      btn_new_reminder: "+ New Reminder",
      col_action: "Action Needed",
      col_scheduled: "Scheduled Ahead",
      col_completed: "Completed",
      countdown_due_in: "⏳ Due in:",
      countdown_overdue: "🚨 Overdue by:",
      countdown_now: "⏰ Due now!",

      // Warehouse Section
      stock_section_title: "Warehouse & Stock Management",
      stock_section_desc: "Track equipment catalog, categories, quantities, and low stock threshold alerts.",
      btn_add_stock: "+ Add Inventory Item",
      cat_general: "General",
      cat_equipment: "Equipment",
      cat_tools: "Tools",
      cat_consumables: "Consumables",

      // Stock Requests Section
      requests_section_title: "Material & Stock Requests",
      requests_section_desc: "Submit and review material withdrawal requests with automated inventory deduction.",
      btn_submit_request: "+ Submit Request",
      col_request_item: "Requested Item",
      col_request_qty: "Qty",
      col_request_by: "Requested By",
      col_request_status: "Status",
      col_request_actions: "Actions",

      // Reports Section
      reports_section_title: "Reports & Analytics",
      reports_section_desc: "Operational telemetry, task completion rates, and inventory flow.",

      // Audit Logs Section
      audit_section_title: "Enterprise Audit Logs",
      audit_section_desc: "Immutable activity trail for security compliance and tracking.",

      // Settings Section
      settings_section_title: "System Settings",
      settings_section_desc: "Customize interface appearance themes and test audio alarm diagnostics.",
      settings_theme_label: "Theme Mode",
      settings_audio_label: "Audio Alarm Diagnostics",
      btn_test_audio: "Test Audio Alarm Chime (880Hz)",

      // Auth Portal
      auth_title: "Sign in to Ostan",
      auth_subtitle: "Enterprise Operations & Business Intelligence Platform",
      tab_login: "Sign In",
      tab_signup: "Sign Up (New Employee)",
      label_fullname: "Full Name *",
      placeholder_fullname: "e.g. Khalid Al-Ghamdi",
      label_email: "Email Address *",
      placeholder_email: "khalid@company.com",
      label_password: "Password *",
      placeholder_password: "At least 6 characters",
      btn_submit_login: "Sign In to Platform",
      btn_submit_signup: "Create Account & Sign In",

      // Modals General
      btn_cancel: "Cancel",
      btn_save: "Save Changes",
      btn_delete: "Delete",
      btn_edit: "Edit",
    },

    ar: {
      // Top Header & General
      app_name: "أستان",
      app_subtitle: "منظومة إدارة المنشآت الذكية",
      lang_toggle: "🌐 English",
      theme_toggle: "🌓 المظهر",
      auth_logout: "تسجيل الخروج",
      search_placeholder: "بحث في جميع أقسام المنظومة...",

      // Module Navigation
      nav_group_overview: "الرئيسية",
      nav_dashboard: "لوحة التحكم",
      nav_group_org: "المؤسسة وفريق العمل",
      nav_employees: "الموظفين",
      nav_departments: "الأقسام والصلاحيات",
      nav_group_ops: "العمليات والمهام",
      nav_reminders: "التذكيرات",
      nav_tasks: "إدارة المهام",
      nav_group_inv: "المستودع والمخزون",
      nav_stock: "المستودع والمخزون",
      nav_stock_requests: "طلبات الصرف",
      nav_group_sec: "التقارير والأمان",
      nav_reports: "التقارير والإحصائيات",
      nav_audit_logs: "سجل العمليات",
      nav_group_sys: "النظام",
      nav_settings: "إعدادات النظام",

      // Dashboard Greetings & Cards
      dash_greeting_morning: "صباح الخير",
      dash_greeting_afternoon: "مساء الخير",
      dash_greeting_evening: "مساء الخير",
      dash_subtitle: "نظرة عامة ومباشرة على العمليات والمهام وفريق العمل.",
      dash_total_employees: "إجمالي الموظفين",
      dash_active_on_duty: "على رأس العمل",
      dash_open_tasks: "المهام المفتوحة",
      dash_tasks_in_progress: "قيد التنفيذ والمتابعة",
      dash_my_assigned_tasks: "المهام المسندة إليك",
      dash_all_tasks_completed: "جميع المهام مكتملة",
      dash_upcoming_reminders: "التنبيهات القادمة",
      dash_active_alerts: "تنبيهات مجدولة",
      dash_no_reminders: "لا توجد تنبيهات معلقة",
      dash_low_stock_items: "نواقص المخزون",
      dash_stock_alert: "أصناف دون الحد الأدنى",
      dash_stock_healthy: "المخزون مكتمل",
      dash_active_tasks_title: "قائمة المهام النشطة المسندة إليك",
      dash_no_active_tasks: "لا توجد مهام نشطة مسندة حالياً.",

      // Quick Operations
      quick_ops_title: "⚡ العمليات السريعة",
      op_tasks_title: "إدارة وتوزيع المهام",
      op_tasks_desc: "إسناد المهام للعمال ومتابعة مراحل الإنجاز والتحديث الفوري",
      op_reminders_title: "التذكيرات والمنبه الصوتي",
      op_reminders_desc: "إنشاء تذكيرات موقوتة مع عداد تنازلي وجرس إنذار صوتي",
      op_stock_title: "دليل المستودع والمخزون",
      op_stock_desc: "متابعة كميات الأصناف، وحدود التنبيه، وطلبات الصرف",

      // Employees Section
      emp_section_title: "إدارة الموظفين وفريق العمل",
      emp_section_desc: "إنشاء وتعديل وحذف حسابات الموظفين مع المزامنة اللحظية في Firebase.",
      btn_add_employee: "+ إضافة موظف جديد",
      search_emp_placeholder: "بحث بالاسم أو البريد أو الرتبة...",
      registered_accounts_label: "حسابات مسجلة (مباشر)",
      protected_admin_badge: "مسؤول متميز رئيسي",
      staff_member_badge: "عضو فريق العمل",

      // Departments & Console
      dept_section_title: "الأقسام والتحكم في وصول العمال للأقسام",
      dept_section_desc: "اختر العامل، وحدد القسم، ثم قم بضبط سياسة القفل أو الإخفاء.",
      dept_step_1: "1. اختر الموظف:",
      dept_step_2: "2. اختر القسم:",
      dept_step_3: "3. حدد السياسة:",
      btn_apply_policy: "تطبيق السياسة",
      policy_accessible: "متاح (وصول كامل)",
      policy_locked: "مقفل 🔒",
      policy_hidden: "مخفي 👁️",
      matrix_worker_col: "الموظف / الحساب",
      matrix_title: "جدول مصفوفة الصلاحيات لكل قسم",

      // Tasks Section
      tasks_section_title: "إدارة المهام وتعيين العمال",
      tasks_section_desc: "إسناد ومتابعة مراحل تنفيذ المهام بين أفراد فريق العمل.",
      tasks_section_desc_emp: "متابعة وتنفيذ المهام المسندة إليك وتحديث حالة الإنجاز.",
      btn_assign_task: "+ إسناد مهمة",
      task_filter_label: "تصفية بحسب الموظف:",
      filter_all_workers: "جميع الموظفين",
      col_todo: "قيد الانتظار",
      col_progress: "قيد التنفيذ",
      col_done: "مكتملة ✓",
      btn_cancel_task: "🚫 إلغاء المهمة",

      // Reminders Section
      rem_section_title: "التذكيرات والتنبيهات الموقوتة",
      rem_section_desc: "تذكيرات موقوتة مع عداد تنازلي حي وجرس إنذار صوتي بتردد 880 هرتز.",
      btn_new_reminder: "+ تذكير جديد",
      col_action: "مطلوبة الآن",
      col_scheduled: "مجدولة قادمة",
      col_completed: "مكتملة",
      countdown_due_in: "⏳ متبقي:",
      countdown_overdue: "🚨 متأخر منذ:",
      countdown_now: "⏰ حان الموعد الآن!",

      // Warehouse Section
      stock_section_title: "المستودع وإدارة المخزون",
      stock_section_desc: "متابعة أصناف المعدات، والتصنيفات، والكميات، وتنبيهات نواقص المخزون.",
      btn_add_stock: "+ إضافة صنف للمستودع",
      cat_general: "عام",
      cat_equipment: "معدات",
      cat_tools: "أدوات وعدد",
      cat_consumables: "مواد استهلاكية",

      // Stock Requests Section
      requests_section_title: "طلبات صرف المواد والمعدات",
      requests_section_desc: "تقديم ومراجعة واعتماد طلبات صرف المواد من المستودع مع الخصم التلقائي.",
      btn_submit_request: "+ تقديم طلب",
      col_request_item: "الصنف المطلوب",
      col_request_qty: "الكمية",
      col_request_by: "مقدم الطلب",
      col_request_status: "الحالة",
      col_request_actions: "الإجراءات",

      // Reports Section
      reports_section_title: "التقارير والإحصائيات",
      reports_section_desc: "مؤشرات الأداء التشغيلي، ومعدلات إنجاز المهام، وحركة المخزون.",

      // Audit Logs Section
      audit_section_title: "سجل العمليات والتوثيق الأمني",
      audit_section_desc: "سجل غير قابل للتعديل لجميع العمليات لأغراض الامتثال والأمان.",

      // Settings Section
      settings_section_title: "إعدادات النظام",
      settings_section_desc: "تخصيص المظهر العام للنظام واختبار المنبه الصوتي.",
      settings_theme_label: "نمط العرض",
      settings_audio_label: "فحص جرس الإنذار الصوتي",
      btn_test_audio: "فحص جرس الإنذار (880Hz)",

      // Auth Portal
      auth_title: "تسجيل الدخول إلى أستان",
      auth_subtitle: "منصة إدارة العمليات والمؤسسات الذكية",
      tab_login: "تسجيل الدخول",
      tab_signup: "إنشاء حساب جديد (تسجيل موظف)",
      label_fullname: "الاسم الكامل *",
      placeholder_fullname: "مثال: خالد الغامدي",
      label_email: "البريد الإلكتروني *",
      placeholder_email: "khalid@company.com",
      label_password: "كلمة المرور *",
      placeholder_password: "6 أحرف أو أرقام على الأقل",
      btn_submit_login: "دخول إلى المنصة",
      btn_submit_signup: "إنشاء الحساب والدخول",

      // Modals General
      btn_cancel: "إلغاء",
      btn_save: "حفظ التغييرات",
      btn_delete: "حذف",
      btn_edit: "تعديل",
    },
  };

  function getTranslation(key, lang) {
    const currentLang = lang || document.documentElement.getAttribute("lang") || "en";
    const dict = dictionary[currentLang] || dictionary.en;
    return dict[key] || dictionary.en[key] || key;
  }

  function applyTranslations(lang) {
    const targetLang = lang || document.documentElement.getAttribute("lang") || "en";
    const isRtl = targetLang === "ar";

    document.documentElement.setAttribute("lang", targetLang);
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
    localStorage.setItem("ostan_locale", targetLang);

    // Update all text elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translation = getTranslation(key, targetLang);
      if (translation !== undefined) {
        el.textContent = translation;
      }
    });

    // Update all placeholders with data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation = getTranslation(key, targetLang);
      if (translation) {
        el.setAttribute("placeholder", translation);
      }
    });

    // If dynamic view updater exists, call it
    if (typeof window.renderCurrentModuleView === "function") {
      window.renderCurrentModuleView();
    }
  }

  window.OstanI18n = {
    dictionary,
    t: getTranslation,
    applyTranslations,
    toggle: function () {
      const current = document.documentElement.getAttribute("lang") || "en";
      const next = current === "en" ? "ar" : "en";
      applyTranslations(next);
      return next;
    },
    init: function () {
      const savedLang = localStorage.getItem("ostan_locale") || "en";
      applyTranslations(savedLang);
    },
  };

  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.OstanI18n.init();
    });
  } else {
    window.OstanI18n.init();
  }
})();
