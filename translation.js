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
      nav_tasks_emp: "Tasks",
      nav_group_inv: "INVENTORY",
      nav_stock: "Stock & Inventory",
      nav_stock_requests: "Stock Requests",
      nav_group_sec: "INTELLIGENCE & SECURITY",
      nav_reports: "Reports & Analytics",
      nav_audit_logs: "Audit Logs",
      nav_group_sys: "SYSTEM",
      nav_messages: "Messages Sender",
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
      dash_active_tasks_title: "Tasks",
      dash_no_active_tasks: "No active tasks assigned.",

      // Quick Operations
      quick_ops_title: "⚡ Quick Operations",
      op_tasks_title: "Task Management",
      op_tasks_title_emp: "Tasks",
      op_tasks_desc: "Assign tasks to specific registered workers with full edit controls",
      op_tasks_desc_emp: "View and update your assigned tasks and track execution status.",
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

      // Departments 2 Tabs & Granular Permissions
      dept_tab_all_users: "👥 All Users",
      dept_tab_permissions: "🛡️ Permissions",
      perm_select_worker_label: "Select User to Configure Permissions:",
      perm_save_btn: "💾 Save User Permissions",
      perm_sec_emp: "👥 Employees & Staff Management",
      perm_sec_stock: "📦 Warehouse & Stock Catalog",
      perm_sec_tasks: "☑️ Tasks & Work Assignments",
      perm_sec_rem: "⏰ Reminders & Scheduled Alarms",
      perm_sec_rep: "📈 Reports & Analytics",
      perm_sec_audit: "🛡️ Enterprise Audit Logs",
      perm_sec_set: "⚙️ System Settings",
      perm_view: "View / Seeing",
      perm_create: "Add / Create",
      perm_edit: "Edit",
      perm_delete: "Delete / Remove",
      perm_request: "Submit Material Requests",
      perm_approve_requests: "Approve / Reject Requests",
      perm_status_change: "Update Progress Status",
      stock_photo_label: "Item Photo",
      stock_upload_btn: "Upload Photo",
      stock_remove_photo: "Remove Photo",

      // Tasks Section
      tasks_section_title: "Tasks & Assignments",
      tasks_section_title_emp: "Tasks",
      tasks_section_desc: "Assign and track execution progress across company staff.",
      tasks_section_desc_emp: "View and update your assigned tasks and track execution status.",
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
      label_phone: "Phone / WhatsApp Number (+966) *",
      placeholder_phone: "+966 5X XXX XXXX",
      phone_hint: "Starts with +966 by default. Must contain exactly 9 digits (e.g. +966 50 123 4567). Spaces are ignored.",
      label_password: "Password *",
      placeholder_password: "At least 6 characters",
      btn_submit_login: "Sign In to Platform",
      btn_submit_signup: "Create Account & Sign In",

      // Modals General
      btn_cancel: "Cancel",
      btn_save: "Save Changes",
      btn_delete: "Delete",
      btn_edit: "Edit",

      // Messages Sender & WhatsApp
      messages_section_title: "Messages Sender & WhatsApp Integration",
      messages_section_desc: "Pair your WhatsApp account, compose messages with dynamic variables, and send automated announcements to staff.",
      whatsapp_studio_title: "📱 WhatsApp Pairing Studio",
      whatsapp_studio_desc: "Scan the QR code with WhatsApp on your phone to link your business or personal number.",
      whatsapp_status_label: "Connection Status:",
      whatsapp_status_disconnected: "Disconnected / Ready to Pair",
      whatsapp_status_connected: "Connected & Active",
      whatsapp_refresh_qr: "🔄 Refresh QR Code",
      whatsapp_disconnect_btn: "🔌 Disconnect Account",
      whatsapp_link_phone_btn: "🔢 Link with Phone Number",
      whatsapp_scan_step1: "1. Open WhatsApp on your mobile phone",
      whatsapp_scan_step2: "2. Tap Menu (⋮) or Settings (⚙️) and select Linked Devices",
      whatsapp_scan_step3: "3. Point your camera at this QR code to connect",
      msg_recipients_title: "👥 Select Recipients",
      msg_recipients_all: "All Employees (Broadcast)",
      msg_recipients_stock: "Warehouse & Stock Staff",
      msg_recipients_custom: "Custom User Selection",
      msg_composer_title: "✍️ Message Composer",
      msg_composer_placeholder: "Type your message here... Use tags like {name}, {role}, {date} to personalize each message automatically.",
      msg_vars_title: "Click to Insert Dynamic Variables:",
      msg_prewritten_title: "⚡ Pre-written Texts & Quick Templates",
      msg_add_template_btn: "+ Add Pre-written Text",
      msg_delay_title: "⏱️ Anti-Ban Delay Between Messages",
      msg_delay_desc: "Delays dispatching between recipients to avoid WhatsApp spam detection and account blocking.",
      msg_delay_5s: "5 Seconds (Fast)",
      msg_delay_7s: "7 Seconds (Balanced)",
      msg_delay_10s: "10 Seconds (Recommended)",
      msg_delay_15s: "15 Seconds (Safe)",
      msg_delay_20s: "20 Seconds (High Protection)",
      msg_delay_30s: "30 Seconds (Maximum Anti-Ban)",
      btn_start_queue: "🚀 Start Automated Dispatch (With Anti-Ban Timer)",
      dispatch_runner_title: "⚡ Automated WhatsApp Dispatch Runner",
      dispatch_runner_info: "WhatsApp Web puts the message in the chat box. Press Enter in WhatsApp to send, then click 'I Sent It' or let the anti-ban delay timer advance automatically.",
      dispatch_runner_step_inst: "⚠️ In WhatsApp Web: Press [Enter] or click [➤ Send] to send the text.",
      btn_confirm_sent: "✅ I Sent It — Next Recipient",
      btn_minimize: "Minimize",
      btn_auto_sender_helper: "⚡ Auto-Send Bookmarklet",
      auto_send_modal_title: "⚡ 1-Click WhatsApp Web Auto-Send Tool",
      auto_send_modal_desc: "Because browsers block websites from clicking buttons inside WhatsApp Web, drag this button to your bookmarks bar. Click it once in WhatsApp Web to automatically press Send on all incoming messages!",
      auto_mode_banner_title: "⚡ 100% Hands-Free Automated Sender Mode",
      auto_mode_banner_desc: "Enables hands-free dispatching: automatically clicks the Send button and closes tabs for all selected contacts.",
      btn_download_extension: "📥 Download Auto-Sender Extension (.ZIP)",
      btn_setup_guide: "📖 Setup Guide (3 Steps)",
      dispatch_runner_next_btn: "Open Next Recipient Now",
      dispatch_runner_pause: "Pause Timer",
      dispatch_runner_resume: "Resume Timer",
      dispatch_runner_stop: "Stop Queue",
      btn_send_whatsapp: "🚀 Send Automated Messages via WhatsApp",
      btn_copy_text: "📋 Copy Personalized Text",
      msg_history_title: "📜 Dispatch History & Sent Logs",
      modal_template_title: "📝 Add Pre-written Template",
      template_name_label: "Template Name / Title",
      template_cat_label: "Category",
      template_body_label: "Template Text Content",
      btn_save_template: "Save Template",
      perm_sec_messages: "💬 Messages Sender & WhatsApp",
      perm_send_messages: "Send WhatsApp Messages",
      perm_manage_templates: "Manage Pre-written Templates",

      // 2-Step Delete Confirmation & Recycle Bin
      modal_confirm_delete_title: "Confirm Deletion",
      modal_confirm_delete_desc: "Are you sure you want to delete this item? It will be safely moved to the Recycle & Restore Bin in Audit Logs, and can be restored anytime.",
      modal_confirm_perm_delete_desc: "⚠️ CAUTION: This action is permanent and cannot be undone. The record will be permanently purged from all databases.",
      btn_confirm_delete_proceed: "🗑️ Yes, Delete Item",
      btn_confirm_perm_delete_proceed: "⚠️ Yes, Delete Permanently",
      btn_restore: "♻️ Restore Item",
      btn_perm_delete: "🗑️ Purge",
      audit_recycle_title: "♻️ Recycle & Restore Bin",
      audit_recycle_desc: "Browse and safely restore deleted employees, tasks, reminders, and warehouse items with real-time cloud synchronization.",
      audit_chart_title: "📊 Deleted Items Analytics & Breakdown",
      audit_filter_all: "All Deleted",
      audit_filter_users: "👤 Employees",
      audit_filter_tasks: "📋 Tasks",
      audit_filter_reminders: "⏰ Reminders",
      audit_filter_stock: "📦 Stock Items",
      audit_recycle_empty: "Recycle bin is empty. No deleted records found.",
      stat_total_deleted: "Total Deleted",
      stat_deleted_users: "Employees",
      stat_deleted_tasks: "Tasks",
      stat_deleted_reminders: "Reminders",
      stat_deleted_stock: "Stock Items",
      audit_item_restored_toast: "Item Restored Successfully",
      audit_item_perm_deleted_toast: "Item Permanently Deleted",
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
      nav_tasks_emp: "المهام",
      nav_group_inv: "المستودع والمخزون",
      nav_stock: "المستودع والمخزون",
      nav_stock_requests: "طلبات الصرف",
      nav_group_sec: "التقارير والأمان",
      nav_reports: "التقارير والإحصائيات",
      nav_audit_logs: "سجل العمليات",
      nav_group_sys: "النظام",
      nav_messages: "مرسل الرسائل",
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
      dash_active_tasks_title: "المهام",
      dash_no_active_tasks: "لا توجد مهام نشطة مسندة حالياً.",

      // Quick Operations
      quick_ops_title: "⚡ العمليات السريعة",
      op_tasks_title: "إدارة وتوزيع المهام",
      op_tasks_title_emp: "المهام",
      op_tasks_desc: "إسناد المهام للعمال ومتابعة مراحل الإنجاز والتحديث الفوري",
      op_tasks_desc_emp: "استعراض وتحديث المهام المسندة إليك ومتابعة حالة التنفيذ.",
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

      // Departments 2 Tabs & Granular Permissions
      dept_tab_all_users: "👥 جميع المستخدمين",
      dept_tab_permissions: "🛡️ الصلاحيات",
      perm_select_worker_label: "اختر المستخدم لضبط صلاحياته:",
      perm_save_btn: "💾 حفظ وتطبيق الصلاحيات",
      perm_sec_emp: "👥 إدارة الموظفين والمستخدمين",
      perm_sec_stock: "📦 المستودع وكتالوج المخزون",
      perm_sec_tasks: "☑️ المهام وتوزيع الأعمال",
      perm_sec_rem: "⏰ التذكيرات والمنبه الصوتي",
      perm_sec_rep: "📈 التقارير ومؤشرات الأداء",
      perm_sec_audit: "🛡️ سجل العمليات الأمني",
      perm_sec_set: "⚙️ إعدادات النظام",
      perm_view: "استعراض ورؤية",
      perm_create: "إضافة وإنشاء",
      perm_edit: "تعديل",
      perm_delete: "حذف وإلغاء",
      perm_request: "طلب صرف مواد",
      perm_approve_requests: "اعتماد ورفض الطلبات",
      perm_status_change: "تحديث حالة الإنجاز",
      stock_photo_label: "صورة الصنف",
      stock_upload_btn: "رفع صورة",
      stock_remove_photo: "إزالة الصورة",

      // Tasks Section
      tasks_section_title: "إدارة المهام وتعيين العمال",
      tasks_section_title_emp: "المهام",
      tasks_section_desc: "إسناد ومتابعة مراحل تنفيذ المهام بين أفراد فريق العمل.",
      tasks_section_desc_emp: "استعراض وتحديث المهام المسندة إليك ومتابعة حالة التنفيذ.",
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
      label_phone: "رقم الجوال / واتساب (+966) *",
      placeholder_phone: "+966 5X XXX XXXX",
      phone_hint: "يبدأ بـ +966 افتراضياً. يتكون من 9 أرقام (مثال: 4567 123 50 966+). المسافات مقبولة ويتم إزالتها عند الحفظ.",
      label_password: "كلمة المرور *",
      placeholder_password: "6 أحرف أو أرقام على الأقل",
      btn_submit_login: "دخول إلى المنصة",
      btn_submit_signup: "إنشاء الحساب والدخول",

      // Modals General
      btn_cancel: "إلغاء",
      btn_save: "حفظ التغييرات",
      btn_delete: "حذف",
      btn_edit: "تعديل",

      // Messages Sender & WhatsApp
      messages_section_title: "مرسل الرسائل والربط مع واتساب",
      messages_section_desc: "ربط حساب واتساب عبر رمز QR، وكتابة الرسائل بالمتغيرات التلقائية، وإرسال الرسائل الآلية للموظفين.",
      whatsapp_studio_title: "📱 استوديو ربط واتساب (WhatsApp QR)",
      whatsapp_studio_desc: "امسح رمز الاستجابة السريعة (QR) عبر تطبيق واتساب لربط رقم هاتفك مع النظام مباشرة.",
      whatsapp_status_label: "حالة الاتصال:",
      whatsapp_status_disconnected: "غير متصل / جاهز للمسح",
      whatsapp_status_connected: "متصل ونشط",
      whatsapp_refresh_qr: "🔄 تحديث الرمز",
      whatsapp_disconnect_btn: "🔌 إلغاء الربط",
      whatsapp_link_phone_btn: "🔢 الربط برقم الهاتف",
      whatsapp_scan_step1: "١. افتح تطبيق واتساب على هاتفك المحمول",
      whatsapp_scan_step2: "٢. اضغط على القائمة (⋮) أو الإعدادات (⚙️) واختر الأجهزة المرتبطة",
      whatsapp_scan_step3: "٣. وجّه كاميرا هاتفك نحو هذا الرمز للربط الفوري",
      msg_recipients_title: "👥 تحديد المستلمين",
      msg_recipients_all: "جميع الموظفين (إرسال جماعي)",
      msg_recipients_stock: "فريق المستودع والمخزون",
      msg_recipients_custom: "تحديد موظفين محددين",
      msg_composer_title: "✍️ كتابة وصياغة الرسالة",
      msg_composer_placeholder: "اكتب نص الرسالة هنا... استخدم المتغيرات مثل {name} و {role} لتخصيص كل رسالة تلقائياً باسم الموظف.",
      msg_vars_title: "اضغط لإدراج متغير تلقائي:",
      msg_prewritten_title: "⚡ نصوص ورسائل جاهزة (قوالب سريعة)",
      msg_add_template_btn: "+ إضافة نص جاهز",
      msg_delay_title: "⏱️ مؤقت التأخير بين الرسائل (حماية من الحظر)",
      msg_delay_desc: "تأخير زمني ذكي بين كل رسالة وأخرى لتفادي كشف الرسائل المتكررة وحماية رقمك من قيود وحظر واتساب.",
      msg_delay_5s: "٥ ثوانٍ (سريع)",
      msg_delay_7s: "٧ ثوانٍ (متوازن وسريع)",
      msg_delay_10s: "١٠ ثوانٍ (موصى به - متوازن)",
      msg_delay_15s: "١٥ ثانية (آمن)",
      msg_delay_20s: "٢٠ ثانية (حماية مشددة)",
      msg_delay_30s: "٣٠ ثانية (أقصى أمان للحسابات الجديدة)",
      btn_start_queue: "🚀 بدء الإرسال الآلي (مع مؤقت الحماية من الحظر)",
      dispatch_runner_title: "⚡ نظام الإرسال الآلي ومؤقت الأمان",
      dispatch_runner_info: "يقوم النظام بفتح المحادثة ووضع النص المخصص للمستلم. اضغط Enter في واتساب للإرسال ثم اضغط 'تم الإرسال' أو انتظر المؤقت الآلي.",
      dispatch_runner_step_inst: "⚠️ في واتساب: اضغط زر [Enter] أو سهم الإرسال الأخضر (➤) لإرسال الرسالة.",
      btn_confirm_sent: "✅ تم الإرسال — المستلم التالي",
      btn_minimize: "تصغير",
      btn_auto_sender_helper: "⚡ أداة الضغط التلقائي على إرسال",
      auto_send_modal_title: "⚡ أداة الضغط التلقائي على زر الإرسال في واتساب ويب",
      auto_send_modal_desc: "نظراً لأن متصفحات الويب تمنع المواقع من الضغط داخل واتساب ويب، اسحب هذا الزر إلى شريط المفضلة لديك. اضغط عليه مرة واحدة داخل واتساب ويب وسيقوم تلقائياً بالضغط على زر الإرسال لكل رسالة يتم فتحها من أستان!",
      auto_mode_banner_title: "⚡ نظام الإرسال الآلي بالكامل (الضغط التلقائي على إرسال)",
      auto_mode_banner_desc: "تشغيل الإرسال الآلي بدون لمس لوحة المفاتيح: يقوم تلقائياً بالضغط على زر إرسال وإغلاق النوافذ لجميع جهات الاتصال في الطابور.",
      btn_download_extension: "📥 تحميل أداة الإرسال التلقائي (.ZIP)",
      btn_setup_guide: "📖 دليل التفعيل (٣ خطوات سهلة)",
      dispatch_runner_next_btn: "فتح المستلم التالي فوراً",
      dispatch_runner_pause: "إيقاف مؤقت",
      dispatch_runner_resume: "استئناف المؤقت",
      dispatch_runner_stop: "إيقاف الطابور",
      btn_send_whatsapp: "🚀 إرسال الرسائل آلياً عبر واتساب",
      btn_copy_text: "📋 نسخ النص المخصص",
      msg_history_title: "📜 سجل الرسائل المرسلة والمجدولة",
      modal_template_title: "📝 إضافة قالب نصي جاهز",
      template_name_label: "عنوان / اسم القالب",
      template_cat_label: "التصنيف",
      template_body_label: "نص الرسالة الجاهزة",
      btn_save_template: "حفظ القالب",
      perm_sec_messages: "💬 مرسل الرسائل وواتساب",
      perm_send_messages: "إرسال رسائل واتساب",
      perm_manage_templates: "إدارة القوالب والنصوص الجاهزة",

      // 2-Step Delete Confirmation & Recycle Bin
      modal_confirm_delete_title: "تأكيد الحذف",
      modal_confirm_delete_desc: "هل أنت متأكد من رغبتك في حذف هذا العنصر؟ سيتم نقله بأمان إلى سلة المحذوفات والاستعادة في سجل التدقيق، ويمكنك استرجاعه في أي وقت.",
      modal_confirm_perm_delete_desc: "⚠️ تحذير: هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم مسح السجل نهائياً من كافة قواعد البيانات.",
      btn_confirm_delete_proceed: "🗑️ نعم، حذف العنصر",
      btn_confirm_perm_delete_proceed: "⚠️ نعم، حذف نهائي",
      btn_restore: "♻️ استعادة العنصر",
      btn_perm_delete: "🗑️ حذف نهائي",
      audit_recycle_title: "♻️ سلة المحذوفات والاستعادة الفورية",
      audit_recycle_desc: "استعراض واستعادة الموظفين، المهام، التذكيرات وعناصر المستودع المحذوفة بضغطة زر واحدة مع المزامنة السحابية المباشرة.",
      audit_chart_title: "📊 إحصائيات وتوزيع العناصر المحذوفة",
      audit_filter_all: "جميع المحذوفات",
      audit_filter_users: "👤 الموظفين",
      audit_filter_tasks: "📋 المهام",
      audit_filter_reminders: "⏰ التذكيرات",
      audit_filter_stock: "📦 المخزون",
      audit_recycle_empty: "سلة المحذوفات فارغة. لا توجد عناصر محذوفة حالياً.",
      stat_total_deleted: "إجمالي المحذوفات",
      stat_deleted_users: "الموظفين",
      stat_deleted_tasks: "المهام",
      stat_deleted_reminders: "التذكيرات",
      stat_deleted_stock: "عناصر المخزون",
      audit_item_restored_toast: "تمت استعادة العنصر بنجاح",
      audit_item_perm_deleted_toast: "تم الحذف النهائي للعنصر",
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
