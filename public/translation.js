/**
 * Ostan Comprehensive Bilingual Translation Dictionary & Engine (English ↔ Arabic)
 */

(function () {
  const dictionary = {
    en: {
      // Brand & General
      app_name: "Ostan",
      app_subtitle: "",
      lang_toggle: "🌐 العربية",
      theme_toggle: "🌓 Theme",

      // Status Grid Cards (Matching the Operational List)
      stat_reminders: "Reminders",
      stat_tasks: "Tasks",
      stat_workers: "Workers",
      stat_warehouse: "Warehouse",
      stat_completed: "Completed",
      stat_flagged: "Flagged",

      // Module Nav
      nav_operations_header: "Operations & Modules",
      nav_reminders: "Reminders & Alerts",
      nav_tasks: "Tasks & Assignments",
      nav_tasks_employee: "Tasks",
      nav_workers: "Workers & Team",
      nav_warehouse: "Warehouse & Stock",
      nav_users: "Users Management",
      nav_recycle_bin: "Recycle Bin & Restore Log",
      nav_settings: "System Settings",
      nav_btn_quick_reminder: "+ Create Scheduled Reminder",

      // Section Titles & Descriptions
      mod_reminders_title: "Reminders & Alerts",
      mod_reminders_desc: "Create scheduled reminders with live countdown tracking, sound alarms and edit controls.",
      mod_reminders_btn: "+ New Reminder",

      mod_tasks_title: "Tasks & Assignments",
      mod_tasks_title_employee: "Tasks",
      mod_tasks_desc: "Assign tasks to specific registered workers with full edit controls.",
      mod_tasks_desc_employee: "View and update your assigned tasks and execution progress.",
      mod_tasks_btn: "+ Assign Task",

      mod_workers_title: "Workers & Staff Management",
      mod_workers_desc: "Manage company team, roles, responsibilities, and profiles.",
      mod_workers_btn: "+ Add Worker",

      mod_warehouse_title: "Warehouse & Stock Management",
      mod_warehouse_desc: "Track equipment inventory, edit counts and low-stock alerts.",
      mod_warehouse_btn: "+ Add Item",

      mod_users_title: "Users & Accounts Management",
      mod_users_desc: "Manage system accounts, credentials, pictures, roles, and granular module permissions.",
      mod_users_btn: "+ Add User Account",

      mod_recycle_title: "Recycle Bin & Restore Log",
      mod_recycle_desc: "Audit trail of deleted items with instant one-click restoration to active rosters.",
      mod_recycle_btn: "Empty Bin",

      mod_settings_title: "System Settings",
      mod_settings_desc: "Configure theme, language, and audio alarm diagnostics.",
      mod_settings_btn: "Save",

      // Live Countdown Strings
      countdown_due_in: "Due in:",
      countdown_overdue: "🚨 Overdue by:",
      unit_days: "d",
      unit_hours: "h",
      unit_mins: "m",
      unit_secs: "s",
      countdown_time_arrived: "⏰ Scheduled time arrived!",

      // 2-Step Confirmation Modal
      confirm_delete_title: "⚠️ Confirm Deletion",
      confirm_delete_prompt: "Are you sure you want to delete this item? It will be moved to the Recycle Bin and can be restored at any time.",
      btn_confirm_delete: "Yes, Move to Bin",
      btn_confirm_perm_delete: "Permanently Delete",

      // Recycle Bin & Restore
      recycle_bin_empty: "Recycle Bin is empty. Deleted items will appear here.",
      btn_restore: "♻️ Restore Item",
      toast_restored: "Item restored successfully to active view!",
      toast_deleted: "Item moved to Recycle Bin.",
      badge_item_type_reminder: "Reminder",
      badge_item_type_task: "Task",
      badge_item_type_worker: "Worker",
      badge_item_type_stock: "Warehouse",
      badge_item_type_user: "User Account",

      // Users Management Section
      users_catalog_title: "System User Accounts & Security Credentials",
      no_users: "No user accounts found. Click \"+ Add User Account\" to create one.",
      badge_protected: "Protected",
      badge_active: "Active",
      badge_suspended: "Suspended",
      perm_reminders: "Reminders",
      perm_tasks: "Tasks",
      perm_workers: "Workers",
      perm_warehouse: "Warehouse",
      perm_settings: "Settings",
      perm_users: "Users Mgmt",
      current_user_label: "Active Session:",
      switch_user_prompt: "Switch User Role (Test RBAC):",

      // Modals - User
      modal_user_create_title: "👤 Create User Account",
      modal_user_edit_title: "✏️ Edit User Account & Permissions",
      label_user_name: "Full Name *",
      placeholder_user_name: "e.g. Abdulrahman Al-Harbi",
      label_user_email: "Email Address *",
      placeholder_user_email: "e.g. a.harbi@ostan.internal",
      label_user_password: "Password *",
      placeholder_user_password: "Enter password (or leave blank to keep unchanged)",
      label_user_photo: "Profile Picture (Optional)",
      label_user_role: "System Role *",
      label_user_status: "Account Status",
      label_user_permissions: "Module Access Permissions",

      // Reminders Columns & Actions
      col_action_items: "Action Items",
      col_timed_scheduled: "Timed & Scheduled",
      col_completed: "Completed",
      btn_add_item: "+ Add Item",
      no_reminders: "No active reminders. Click + Add Item to create one.",

      // Tasks Kanban Columns
      filter_worker_label: "Filter by Worker:",
      all_workers_option: "All Workers",
      col_todo: "To Do",
      col_progress: "In Progress",
      col_done: "Done ✓",
      btn_assign_task: "+ Assign New Task",
      no_tasks: "No tasks created yet.",

      // Workers Section
      registered_staff_title: "Registered Company Workers & Staff",
      no_workers: "No workers registered yet. Click \"+ Add New Worker\" to add staff.",
      active_tasks_count: "Active Tasks",

      // Warehouse Section
      inventory_catalog_title: "Inventory & Equipment Catalog",
      no_stock: "No warehouse items in stock. Click \"+ Add Inventory Item\" to track supplies.",
      badge_low_stock: "Low Stock",
      badge_in_stock: "In Stock",
      min_threshold_label: "Min:",
      label_stock_image: "Item Photo (Optional)",
      btn_remove_image: "Remove Photo",
      cat_general: "General",
      cat_equipment: "Equipment",
      cat_consumables: "Consumables",
      cat_tools: "Tools",

      // Modals - Reminders
      modal_rem_create_title: "⏰ Set Scheduled Reminder",
      modal_rem_edit_title: "✏️ Edit Reminder",
      label_rem_title: "Reminder Title *",
      placeholder_rem_title: "e.g. Inspect generator fuel levels...",
      label_rem_notes: "Notes & Details",
      placeholder_rem_notes: "e.g. Check fuel tanks at station B...",
      label_rem_time: "Target Reminder Date & Time * (Alarm will ring)",
      label_rem_flagged: "Mark as Flagged 🚩",
      btn_save_reminder: "Save Reminder",
      btn_update_reminder: "Update Reminder",

      // Modals - Workers
      modal_worker_create_title: "👥 Register Company Worker",
      modal_worker_edit_title: "✏️ Edit Worker Profile",
      label_worker_name: "Worker Name *",
      placeholder_worker_name: "e.g. Tariq Al-Otaibi",
      label_worker_resp: "Responsibility / Job Title *",
      placeholder_worker_resp: "e.g. Electrical Supervisor, Fleet Driver...",
      label_worker_role: "System Role",
      label_worker_phone: "Phone / Contact (Optional)",
      btn_save_worker: "Save Worker",
      btn_update_worker: "Update Worker",

      // Modals - Tasks
      modal_task_create_title: "📋 Assign Task to Worker",
      modal_task_edit_title: "✏️ Edit Task",
      label_task_worker: "Select Assignee Worker *",
      select_worker_placeholder: "-- Select a Worker --",
      label_task_title: "Task Title *",
      placeholder_task_title: "e.g. Inspect hydraulic generators on site B...",
      label_task_desc: "Instructions & Details",
      placeholder_task_desc: "Task execution instructions...",
      label_task_priority: "Priority",
      priority_normal: "Normal",
      priority_high: "High Priority ⚡",
      priority_urgent: "Urgent / Critical 🚨",
      label_task_status: "Status",
      status_todo: "To Do",
      status_progress: "In Progress",
      status_completed: "Completed",
      btn_save_task: "Dispatch & Assign",
      btn_update_task: "Update Task",

      // Modals - Stock
      modal_stock_create_title: "📦 Add Warehouse Item",
      modal_stock_edit_title: "✏️ Edit Inventory Item",
      label_stock_name: "Item / Product Name *",
      placeholder_stock_name: "e.g. Safety Helmets (Class E)",
      label_stock_sku: "SKU / Code",
      label_stock_cat: "Category",
      label_stock_qty: "Quantity",
      label_stock_thresh: "Low-Stock Alert Threshold",
      btn_save_stock: "Add Item",
      btn_update_stock: "Update Item",

      // Common Actions
      btn_cancel: "Cancel",
      btn_delete: "Delete",
      btn_edit: "Edit",
      btn_save: "Save",
      btn_close: "Close",

      // Settings
      settings_appearance_title: "Appearance & Language",
      btn_dark_theme: "Dark Theme",
      btn_light_theme: "Light Theme",
      btn_en_lang: "English (LTR)",
      btn_ar_lang: "العربية (RTL)",
      settings_test_alarm_title: "Test Reminder Alarm Chime",
      settings_test_alarm_desc: "Click to test the in-app audio chime synthesizer and toast notification.",
      btn_test_alarm: "🔔 Test Audio Alarm Now",
    },
    ar: {
      // Brand & General
      app_name: "أستان",
      app_subtitle: "",
      lang_toggle: "🌐 English",
      theme_toggle: "🌓 المظهر",

      // Status Grid Cards (Matching the Operational List)
      stat_reminders: "التذكيرات",
      stat_tasks: "المهام",
      stat_workers: "العمال",
      stat_warehouse: "المستودع",
      stat_completed: "المكتملة",
      stat_flagged: "المميزة",

      // Module Nav
      nav_operations_header: "الأنظمة والعمليات",
      nav_reminders: "التذكيرات والتنبيهات",
      nav_tasks: "المهام وتعيين العمال",
      nav_tasks_employee: "المهام",
      nav_workers: "العمال وفريق العمل",
      nav_warehouse: "المستودع والمخزون",
      nav_users: "إدارة المستخدمين",
      nav_recycle_bin: "سجل الاستعادة وسلة المحذوفات",
      nav_settings: "إعدادات النظام",
      nav_btn_quick_reminder: "+ إنشاء تذكير موقوت",

      // Section Titles & Descriptions
      mod_reminders_title: "التذكيرات والتنبيهات الموقوتة",
      mod_reminders_desc: "إنشاء تذكيرات موقوتة مع عداد تنازلي حي وجرس إنذار صوتي وتنبيهات فورية قابلة للتعديل.",
      mod_reminders_btn: "+ تذكير جديد",

      mod_tasks_title: "إدارة المهام وتعيين العمال",
      mod_tasks_title_employee: "المهام",
      mod_tasks_desc: "إسناد وتوزيع المهام على العمال المسجلين ومتابعة مراحل التنفيذ والإنجاز.",
      mod_tasks_desc_employee: "متابعة وإنجاز المهام المسندة إليك وتحديث حالة التنفيذ.",
      mod_tasks_btn: "+ إسناد مهمة",

      mod_workers_title: "إدارة العمال وفريق العمل",
      mod_workers_desc: "تسجيل الموظفين والعمال، وتحديد المسمى الوظيفي والأدوار والصلاحيات.",
      mod_workers_btn: "+ إضافة عامل",

      mod_warehouse_title: "المستودع وإدارة المخزون",
      mod_warehouse_desc: "متابعة دليل المعدات وقطع الغيار، الكميات، وحدود التنبيه لنقص المخزون.",
      mod_warehouse_btn: "+ إضافة صنف",

      mod_users_title: "إدارة حسابات المستخدمين والصلاحيات",
      mod_users_desc: "إدارة حسابات النظام، بيانات الدخول، الصور، وتحديد الصلاحيات التفصيلية لكل قسم.",
      mod_users_btn: "+ إضافة حساب مستخدم",

      mod_recycle_title: "سجل الاستعادة وسلة المحذوفات",
      mod_recycle_desc: "سجل توثيقي لجميع العناصر المحذوفة مع إمكانية استعادتها فوراً بضغطة زر واحدة.",
      mod_recycle_btn: "إفراغ السلة",

      mod_settings_title: "إعدادات النظام",
      mod_settings_desc: "تخصيص المظهر، لغة الواجهة، واختبار جرس التنبيه الصوتي.",
      mod_settings_btn: "حفظ",

      // Live Countdown Strings
      countdown_due_in: "متبقي:",
      countdown_overdue: "🚨 متأخر منذ:",
      unit_days: "يوم",
      unit_hours: "ساعة",
      unit_mins: "دقيقة",
      unit_secs: "ثانية",
      countdown_time_arrived: "⏰ حان موعد التذكير الآن!",

      // 2-Step Confirmation Modal
      confirm_delete_title: "⚠️ تأكيد عملية الحذف",
      confirm_delete_prompt: "هل أنت متأكد من رغبتك في حذف هذا العنصر؟ سيتم نقله إلى سلة المحذوفات ويمكنك استعادته في أي وقت.",
      btn_confirm_delete: "نعم، نقل لسلة المحذوفات",
      btn_confirm_perm_delete: "حذف نهائي",

      // Recycle Bin & Restore
      recycle_bin_empty: "سلة المحذوفات فارغة حالياً. أي عنصر تقوم بحذفه سيظهر هنا مع خيار استعادته.",
      btn_restore: "♻️ استعادة العنصر",
      toast_restored: "تم استعادة العنصر بنجاح وإعادته للقائمة النشطة!",
      toast_deleted: "تم نقل العنصر إلى سلة المحذوفات.",
      badge_item_type_reminder: "تذكير",
      badge_item_type_task: "مهمة",
      badge_item_type_worker: "عامل",
      badge_item_type_stock: "صنف مخزني",
      badge_item_type_user: "حساب مستخدم",

      // Users Management Section
      users_catalog_title: "سجل حسابات المستخدمين وصلاحيات الوصول",
      no_users: "لا توجد حسابات مسجلة. اضغط \"+ إضافة حساب مستخدم\" لإنشاء حساب.",
      badge_protected: "محمي",
      badge_active: "نشط",
      badge_suspended: "معلق",
      perm_reminders: "التذكيرات",
      perm_tasks: "المهام",
      perm_workers: "العمال",
      perm_warehouse: "المستودع",
      perm_settings: "الإعدادات",
      perm_users: "إدارة المستخدمين",
      current_user_label: "الجلسة الحالية:",
      switch_user_prompt: "تبديل الحساب (لاختبار الصلاحيات):",

      // Modals - User
      modal_user_create_title: "👤 إنشاء حساب مستخدم جديد",
      modal_user_edit_title: "✏️ تعديل بيانات الحساب والصلاحيات",
      label_user_name: "الاسم الكامل *",
      placeholder_user_name: "مثال: عبد الرحمن الحربي",
      label_user_email: "البريد الإلكتروني *",
      placeholder_user_email: "مثال: a.harbi@ostan.internal",
      label_user_password: "كلمة المرور *",
      placeholder_user_password: "أدخل كلمة المرور (أو اتركها فارغة للإبقاء على الحالية)",
      label_user_photo: "الصورة الشخصية (اختياري)",
      label_user_role: "الدور في النظام *",
      label_user_status: "حالة الحساب",
      label_user_permissions: "صلاحيات الوصول للأقسام والأنظمة",

      // Reminders Columns & Actions
      col_action_items: "عناصر العمل",
      col_timed_scheduled: "المجدولة زمنياً",
      col_completed: "المكتملة",
      btn_add_item: "+ إضافة عنصر",
      no_reminders: "لا توجد تذكيرات جارية حالياً. اضغط + إضافة عنصر لإنشاء تذكير.",

      // Tasks Kanban Columns
      filter_worker_label: "تصفية حسب العامل:",
      all_workers_option: "جميع العمال",
      col_todo: "قيد الانتظار",
      col_progress: "جاري التنفيذ",
      col_done: "مكتملة ✓",
      btn_assign_task: "+ إسناد مهمة جديدة",
      no_tasks: "لم يتم إنشاء أي مهام بعد.",

      // Workers Section
      registered_staff_title: "قائمة العمال والموظفين المسجلين",
      no_workers: "لم يتم تسجيل أي عمال بعد. اضغط \"+ إضافة عامل\" لتسجيل أعضاء الفريق.",
      active_tasks_count: "مهام نشطة",

      // Warehouse Section
      inventory_catalog_title: "دليل المعدات والأصناف المخزنية",
      no_stock: "لا توجد أصناف مسجلة في المستودع. اضغط \"+ إضافة صنف\" لإدارة المخزون.",
      badge_low_stock: "قيد النفاد ⚠️",
      badge_in_stock: "متوفر بالمستودع",
      min_threshold_label: "الحد الأدنى:",
      label_stock_image: "صورة الصنف (اختياري)",
      btn_remove_image: "حذف الصورة",
      cat_general: "عام",
      cat_equipment: "معدات",
      cat_consumables: "مواد استهلاكية",
      cat_tools: "أدوات",

      // Modals - Reminders
      modal_rem_create_title: "⏰ ضبط تذكير موقوت",
      modal_rem_edit_title: "✏️ تعديل التذكير",
      label_rem_title: "عنوان التذكير *",
      placeholder_rem_title: "مثال: فحص مستوى وقود المولدات...",
      label_rem_notes: "التفاصيل والملاحظات",
      placeholder_rem_notes: "مثال: مراجعة خزانات الوقود في المحطة ب...",
      label_rem_time: "تاريخ ووقت التنبيه * (سيرن جرس الإنذار)",
      label_rem_flagged: "تمييز التذكير بعلم 🚩",
      btn_save_reminder: "حفظ وجدولة التنبيه",
      btn_update_reminder: "تحديث التذكير",

      // Modals - Workers
      modal_worker_create_title: "👥 تسجيل عامل / موظف جديد",
      modal_worker_edit_title: "✏️ تعديل بيانات العامل",
      label_worker_name: "اسم العامل / الموظف *",
      placeholder_worker_name: "مثال: طارق العتيبي",
      label_worker_resp: "المسمى الوظيفي / المسؤولية *",
      placeholder_worker_resp: "مثال: مشرف كهربائي، سائق، فني ميكانيكا...",
      label_worker_role: "الدور في النظام",
      label_worker_phone: "رقم الهاتف / الاتصال (اختياري)",
      btn_save_worker: "تسجيل العامل",
      btn_update_worker: "تحديث بيانات العامل",

      // Modals - Tasks
      modal_task_create_title: "📋 إسناد مهمة جديدة لعامل",
      modal_task_edit_title: "✏️ تعديل المهمة",
      label_task_worker: "اختر العامل المسند إليه *",
      select_worker_placeholder: "-- اختر العامل من القائمة --",
      label_task_title: "عنوان المهمة *",
      placeholder_task_title: "مثال: فحص المضخات الهيدروليكية في الموقع...",
      label_task_desc: "تعليمات وتفاصيل التنفيذ",
      placeholder_task_desc: "تفاصيل تعليمات العمل للعامل...",
      label_task_priority: "مستوى الأولوية",
      priority_normal: "عادية",
      priority_high: "أولوية عالية ⚡",
      priority_urgent: "حرجة / عاجلة جداً 🚨",
      label_task_status: "حالة المهمة",
      status_todo: "قيد الانتظار",
      status_progress: "جاري التنفيذ",
      status_completed: "مكتملة",
      btn_save_task: "إرسال وإسناد المهمة",
      btn_update_task: "تحديث المهمة",

      // Modals - Stock
      modal_stock_create_title: "📦 إضافة صنف للمستودع",
      modal_stock_edit_title: "✏️ تعديل بيانات الصنف",
      label_stock_name: "اسم الصنف / المعدة *",
      placeholder_stock_name: "مثال: خوذات السلامة (فئة E)",
      label_stock_sku: "رمز الصنف (SKU)",
      label_stock_cat: "التصنيف",
      label_stock_qty: "الكمية الحالية",
      label_stock_thresh: "حد التنبيه لانخفاض المخزون",
      btn_save_stock: "إضافة الصنف",
      btn_update_stock: "تحديث الصنف",

      // Common Actions
      btn_cancel: "إلغاء",
      btn_delete: "حذف",
      btn_edit: "تعديل",
      btn_save: "حفظ",
      btn_close: "إغلاق",

      // Settings
      settings_appearance_title: "المظهر واللغة",
      btn_dark_theme: "المظهر الليلي (Dark)",
      btn_light_theme: "المظهر النهاري (Light)",
      btn_en_lang: "English (الإنجليزية)",
      btn_ar_lang: "العربية (RTL)",
      settings_test_alarm_title: "اختبار جرس التنبيه الصوتي",
      settings_test_alarm_desc: "اضغط لتشغيل نغمة التنبيه الصوتي وظهور الإشعار المنبثق.",
      btn_test_alarm: "🔔 تشغيل نغمة الإنذار الآن",
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

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translation = getTranslation(key, targetLang);
      if (translation !== undefined) {
        el.textContent = translation;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation = getTranslation(key, targetLang);
      if (translation) {
        el.setAttribute("placeholder", translation);
      }
    });

    // Update category option text if exists
    const optGeneral = document.getElementById("opt-cat-general");
    const optEquip = document.getElementById("opt-cat-equipment");
    const optConsum = document.getElementById("opt-cat-consumables");
    const optTools = document.getElementById("opt-cat-tools");
    if (optGeneral) optGeneral.textContent = getTranslation("cat_general", targetLang);
    if (optEquip) optEquip.textContent = getTranslation("cat_equipment", targetLang);
    if (optConsum) optConsum.textContent = getTranslation("cat_consumables", targetLang);
    if (optTools) optTools.textContent = getTranslation("cat_tools", targetLang);

    if (typeof window.applyDynamicLabels === "function") {
      window.applyDynamicLabels();
    } else if (typeof window.setModule === "function" && window.state?.activeModule) {
      window.setModule(window.state.activeModule);
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.OstanI18n.init();
    });
  } else {
    window.OstanI18n.init();
  }
})();
