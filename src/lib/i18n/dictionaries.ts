export type Locale = "en" | "ar";

export const dictionaries = {
  en: {
    // Brand & General
    app_name: "Ostan",
    tagline: "Internal Enterprise Management System",
    welcome_back: "Welcome back",
    signed_in_as: "Signed in as",
    
    // Navigation
    nav_dashboard: "Dashboard",
    nav_employees: "Employees",
    nav_departments: "Departments",
    nav_tasks: "Task Management",
    nav_reminders: "Reminders",
    nav_stock: "Stock & Inventory",
    nav_stock_requests: "Stock Requests",
    nav_reports: "Reports & Analytics",
    nav_audit_logs: "Audit Logs",
    nav_settings: "System Settings",
    nav_profile: "My Profile",
    nav_security: "Security & Access",
    
    // Auth
    auth_title: "Sign in to Ostan",
    auth_subtitle: "Enter your enterprise credentials to access your portal",
    auth_email_label: "Email Address",
    auth_email_placeholder: "user@ostan.internal",
    auth_password_label: "Password",
    auth_password_placeholder: "••••••••",
    auth_submit: "Sign In",
    auth_signing_in: "Signing in...",
    auth_demo_title: "Quick Demo Role Switcher",
    auth_demo_desc: "Click any profile below to prefill credentials for testing roles & permissions:",
    auth_error_invalid: "Invalid email or password",
    auth_error_disabled: "Your account is currently disabled. Please contact your Super Admin.",
    auth_logout: "Sign Out",
    auth_protected_badge: "Protected Super Admin",
    
    // Roles
    role_SUPER_ADMIN: "Super Admin",
    role_ADMIN: "Administrator",
    role_MANAGER: "Department Manager",
    role_EMPLOYEE: "Employee",
    role_STOCK_MANAGER: "Stock Manager",

    // Statuses
    status_ACTIVE: "Active",
    status_ON_LEAVE: "On Leave",
    status_SUSPENDED: "Suspended",
    status_TERMINATED: "Terminated",

    // Common Actions
    action_save: "Save Changes",
    action_cancel: "Cancel",
    action_edit: "Edit",
    action_delete: "Delete",
    action_create: "Create New",
    action_search: "Search...",
    action_filter: "Filter",
    action_export: "Export Data",
    action_refresh: "Refresh",
    action_view_all: "View All",
    action_close: "Close",
    action_apply: "Apply",
    action_back: "Back",
    
    // Theme & Display
    theme_light: "Light",
    theme_dark: "Dark",
    theme_system: "System",
    lang_en: "English",
    lang_ar: "العربية (Arabic)",
    
    // Dashboard
    dash_greeting_morning: "Good morning",
    dash_greeting_afternoon: "Good afternoon",
    dash_greeting_evening: "Good evening",
    dash_subtitle: "Here is your organization's real-time operational overview.",
    dash_total_employees: "Total Employees",
    dash_active_employees: "Active on Duty",
    dash_open_tasks: "Open Tasks",
    dash_overdue_tasks: "Overdue Tasks",
    dash_upcoming_reminders: "Upcoming Reminders",
    dash_low_stock_items: "Low Stock Items",
    dash_system_status: "System Health & Security",
    dash_recent_activity: "Recent System Activity",
    dash_modules_overview: "Core Modules & Services",
    dash_role_privileges: "Your Active Privileges",
    dash_all_systems_normal: "All services operational • RBAC Active",

    // Audit Logs
    audit_title: "Security & Audit Trail",
    audit_subtitle: "Real-time tamper-evident log of all system mutations and authentication events.",
    audit_action: "Action",
    audit_user: "User",
    audit_entity: "Target Entity",
    audit_ip: "IP Address",
    audit_time: "Timestamp",
    audit_details: "Metadata / Changes",
    audit_all_actions: "All Actions",

    // Settings
    settings_title: "System Settings & Preferences",
    settings_subtitle: "Configure localization, theme appearances, and security preferences.",
    settings_appearance: "Appearance & Language",
    settings_security: "Security Controls",
    settings_system_info: "System Information",
    settings_theme_label: "Color Theme",
    settings_lang_label: "Interface Language",
    settings_save_success: "Settings saved successfully",
  },
  ar: {
    // Brand & General
    app_name: "أستان",
    tagline: "نظام الإدارة الداخلية الموحد للمنشأة",
    welcome_back: "مرحباً بك مجدداً",
    signed_in_as: "مسجل الدخول كـ",
    
    // Navigation
    nav_dashboard: "لوحة التحكم",
    nav_employees: "إدارة الموظفين",
    nav_departments: "الأقسام",
    nav_tasks: "إدارة المهام",
    nav_reminders: "التذكيرات",
    nav_stock: "المخزون والمستودع",
    nav_stock_requests: "طلبات الصرف",
    nav_reports: "التقارير والتحليلات",
    nav_audit_logs: "سجل العمليات والأمان",
    nav_settings: "إعدادات النظام",
    nav_profile: "ملفي الشخصي",
    nav_security: "الأمان والصلاحيات",
    
    // Auth
    auth_title: "تسجيل الدخول إلى أستان",
    auth_subtitle: "أدخل بياناتك المؤسسية للوصول إلى لوحة التحكم",
    auth_email_label: "البريد الإلكتروني",
    auth_email_placeholder: "user@ostan.internal",
    auth_password_label: "كلمة المرور",
    auth_password_placeholder: "••••••••",
    auth_submit: "دخول",
    auth_signing_in: "جاري التحقق...",
    auth_demo_title: "التبديل السريع للأدوار (تجريبي)",
    auth_demo_desc: "اضغط على أي حساب أدناه لتعبئة بيانات الدخول واختبار الصلاحيات والأدوار فوراً:",
    auth_error_invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    auth_error_disabled: "تم إيقاف هذا الحساب. يرجى التواصل مع المسؤول المتميز (Super Admin).",
    auth_logout: "تسجيل الخروج",
    auth_protected_badge: "مسؤول متميز محمي",
    
    // Roles
    role_SUPER_ADMIN: "مسؤول متميز (Super Admin)",
    role_ADMIN: "مدير النظام (Admin)",
    role_MANAGER: "مدير قسم (Manager)",
    role_EMPLOYEE: "موظف (Employee)",
    role_STOCK_MANAGER: "مدير المستودع (Stock Manager)",

    // Statuses
    status_ACTIVE: "نشط",
    status_ON_LEAVE: "في إجازة",
    status_SUSPENDED: "موقوف",
    status_TERMINATED: "منتهي الخدمة",

    // Common Actions
    action_save: "حفظ التغييرات",
    action_cancel: "إلغاء",
    action_edit: "تعديل",
    action_delete: "حذف",
    action_create: "إضافة جديد",
    action_search: "بحث...",
    action_filter: "تصفية",
    action_export: "تصدير البيانات",
    action_refresh: "تحديث",
    action_view_all: "عرض الكل",
    action_close: "إغلاق",
    action_apply: "تطبيق",
    action_back: "رجوع",
    
    // Theme & Display
    theme_light: "نهاري",
    theme_dark: "ليلي",
    theme_system: "تلقائي (حسب النظام)",
    lang_en: "English (الإنجليزية)",
    lang_ar: "العربية",
    
    // Dashboard
    dash_greeting_morning: "صباح الخير",
    dash_greeting_afternoon: "مساء الخير",
    dash_greeting_evening: "مساء الخير",
    dash_subtitle: "نظرة عامة ومباشرة على مؤشرات العمليات والأداء للمنشأة.",
    dash_total_employees: "إجمالي الموظفين",
    dash_active_employees: "على رأس العمل",
    dash_open_tasks: "المهام الجارية",
    dash_overdue_tasks: "المهام المتأخرة",
    dash_upcoming_reminders: "التذكيرات القادمة",
    dash_low_stock_items: "أصناف قيد النفاد",
    dash_system_status: "سلامة النظام والأمان",
    dash_recent_activity: "آخر الأنشطة والعمليات",
    dash_modules_overview: "الخدمات والأنظمة الفرعية",
    dash_role_privileges: "صلاحياتك الحالية",
    dash_all_systems_normal: "جميع الأنظمة تعمل بكفاءة • التحكم بالصلاحيات نشط",

    // Audit Logs
    audit_title: "سجل العمليات والأمان",
    audit_subtitle: "سجل فوري ومحمّي لجميع عمليات التعديل والدخول في النظام.",
    audit_action: "نوع العملية",
    audit_user: "المستخدم",
    audit_entity: "العنصر المستهدف",
    audit_ip: "عنوان IP",
    audit_time: "التوقيت",
    audit_details: "التفاصيل والتغييرات",
    audit_all_actions: "جميع العمليات",

    // Settings
    settings_title: "إعدادات النظام والتفضيلات",
    settings_subtitle: "تخصيص المظهر، لغة الواجهة، وضوابط الأمان.",
    settings_appearance: "المظهر واللغة",
    settings_security: "ضوابط الأمان",
    settings_system_info: "معلومات النظام",
    settings_theme_label: "سمة المظهر",
    settings_lang_label: "لغة الواجهة",
    settings_save_success: "تم حفظ الإعدادات بنجاح",
  },
};

export type TranslationKey = keyof typeof dictionaries.en;
