const fs = require('fs');
const path = require('path');

console.log('=== IMPLEMENTING: REMOVE ORGANIZATION WORD, SYSTEM-WIDE CATEGORY MANAGEMENT, AND PROFILE PAGE ===\n');

// 1. UPDATE index.html
const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8').replace(/\r\n/g, '\n');

// A. Remove "Organizations" word
html = html.replace(
  '<span data-i18n="nav_stock_requests">Stock Requests (Organizations)</span>',
  '<span data-i18n="nav_stock_requests">Stock Requests</span>'
);

html = html.replace(
  '<span data-i18n="nav_stock_requests">طلبات الصرف (للمؤسسات)</span>',
  '<span data-i18n="nav_stock_requests">طلبات الصرف</span>'
);

html = html.replace(
  '<h2 data-i18n="requests_section_title" style="font-size: 1.3rem; font-weight: 800;">Stock Requests (Organizations)</h2>',
  '<h2 data-i18n="requests_section_title" style="font-size: 1.3rem; font-weight: 800;">Stock Requests</h2>'
);

html = html.replace(
  '<p data-i18n="requests_section_desc" style="font-size: 0.82rem; color: var(--text-muted);">Submit and review material withdrawal requests for organizations with automated inventory deduction.</p>',
  '<p data-i18n="requests_section_desc" style="font-size: 0.82rem; color: var(--text-muted);">Submit and review material withdrawal requests with automated inventory deduction.</p>'
);

console.log('✅ Removed "Organizations" word from navigation and section titles');


// B. Make pressing on user name navigate to Profile Page
// Sidebar user box
const oldSidebarUserBox = `          <div style="min-width: 0; flex: 1;">
            <div id="sidebar-user-name" style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              Osama Al-Twaish
            </div>
            <div style="margin-top: 1px;">
              <span id="sidebar-user-role" class="badge badge-rose" style="font-size: 0.62rem; padding: 0.1rem 0.45rem;">
                SUPER_ADMIN
              </span>
            </div>
          </div>`;

const newSidebarUserBox = `          <div onclick="setModule('profile')" style="min-width: 0; flex: 1; cursor: pointer;" title="عرض الملف الشخصي (My Profile)">
            <div id="sidebar-user-name" style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-decoration: underline; text-decoration-color: rgba(37,99,235,0.4); text-underline-offset: 2px;">
              Osama Al-Twaish
            </div>
            <div style="margin-top: 1px;">
              <span id="sidebar-user-role" class="badge badge-rose" style="font-size: 0.62rem; padding: 0.1rem 0.45rem;">
                SUPER_ADMIN
              </span>
            </div>
          </div>`;

html = html.replace(oldSidebarUserBox, newSidebarUserBox);

// Sidebar user avatar click
html = html.replace(
  '<div id="sidebar-user-avatar" class="user-avatar-circle" style="width: 36px; height: 36px; font-size: 0.85rem; background: linear-gradient(135deg, #6366f1, #06b6d4); flex-shrink: 0;">',
  '<div id="sidebar-user-avatar" class="user-avatar-circle" onclick="setModule(\'profile\')" style="width: 36px; height: 36px; font-size: 0.85rem; background: linear-gradient(135deg, #6366f1, #06b6d4); flex-shrink: 0; cursor: pointer;" title="عرض الملف الشخصي (My Profile)">'
);

// Top header user name click
html = html.replace(
  '<div style="text-align: start; line-height: 1.2; cursor: pointer;" onclick="setModule(\'settings\')">',
  '<div style="text-align: start; line-height: 1.2; cursor: pointer;" onclick="setModule(\'profile\')" title="عرض الملف الشخصي (My Profile)">'
);

html = html.replace(
  '<div id="top-header-user-avatar" class="user-avatar-circle" style="width: 30px; height: 30px; font-size: 0.82rem; font-weight: 800; background: linear-gradient(135deg, #2563eb, #7c3aed); border: 1.5px solid rgba(255,255,255,0.6); box-shadow: 0 1px 3px rgba(0,0,0,0.3); cursor: pointer;" onclick="setModule(\'settings\')">',
  '<div id="top-header-user-avatar" class="user-avatar-circle" style="width: 30px; height: 30px; font-size: 0.82rem; font-weight: 800; background: linear-gradient(135deg, #2563eb, #7c3aed); border: 1.5px solid rgba(255,255,255,0.6); box-shadow: 0 1px 3px rgba(0,0,0,0.3); cursor: pointer;" onclick="setModule(\'profile\')" title="عرض الملف الشخصي (My Profile)">'
);

console.log('✅ Connected user name and avatar to hidden Profile Page');


// C. Add view-profile section in index.html (before view-settings)
const profileViewHtml = `
        <!-- =========================================================================
             HIDDEN PROFILE PAGE (EXCLUSIVELY ACCESSIBLE VIA PRESSING ON USER NAME)
             ========================================================================= -->
        <section id="view-profile" style="display: none; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 1200px;">
          <!-- Executive Profile Banner Card -->
          <div class="glass-panel" style="padding: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(99, 102, 241, 0.04)); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); position: relative; overflow: hidden;">
            <div style="display: flex; align-items: center; gap: 1.5rem; min-width: 0; z-index: 1;">
              <div id="profile-avatar-large" style="width: 86px; height: 86px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #7c3aed); display: flex; align-items: center; justify-content: center; font-size: 2.3rem; font-weight: 800; color: #ffffff; border: 3px solid #ffffff; box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35); flex-shrink: 0;">
                O
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
                  <h1 id="profile-display-name" style="font-size: 1.65rem; font-weight: 800; color: var(--text-main); margin: 0; letter-spacing: -0.02em;">Osama Al-Twaish</h1>
                  <span id="profile-display-role-badge" class="badge badge-rose" style="font-size: 0.78rem; padding: 0.25rem 0.65rem; font-weight: 800;">SUPER_ADMIN</span>
                  <span class="badge badge-emerald" style="font-size: 0.72rem; padding: 0.2rem 0.55rem;">✓ نشط ومفعل</span>
                </div>
                <div id="profile-display-title" style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">المدير العام والمسؤول التنفيذي الأول لمنظومة أستان</div>
                <div style="display: flex; gap: 1rem; font-size: 0.75rem; color: var(--text-faint); margin-top: 6px;">
                  <span id="profile-meta-email">📧 waseem.tw@hotmail.com</span>
                  <span id="profile-meta-phone">📱 +966580539698</span>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 0.6rem; z-index: 1;">
              <button type="button" onclick="openProfileEditModal()" class="btn btn-primary" style="font-size: 0.82rem; padding: 0.5rem 1.1rem;">
                ✏️ تعديل بياناتي
              </button>
              <button type="button" onclick="setModule('dashboard')" class="btn btn-secondary" style="font-size: 0.82rem; padding: 0.5rem 1rem;">
                ← العودة للرئيسية
              </button>
            </div>
          </div>

          <!-- 3-Column Detailed Information Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.25rem;">
            <!-- Card 1: Official Personnel & ID Details -->
            <div class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
                <span style="font-size: 1.3rem;">👤</span>
                <div>
                  <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">البيانات الشخصية والوظيفية</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">Personal & Employment Information</div>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.82rem;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 0.4rem;">
                  <span style="color: var(--text-muted);">الاسم الكامل:</span>
                  <strong id="p-info-name" style="color: var(--text-main);">-</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 0.4rem;">
                  <span style="color: var(--text-muted);">البريد الإلكتروني:</span>
                  <strong id="p-info-email" style="color: var(--text-main);">-</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 0.4rem;">
                  <span style="color: var(--text-muted);">رقم الجوال:</span>
                  <strong id="p-info-phone" style="color: var(--text-main); direction: ltr;">-</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 0.4rem;">
                  <span style="color: var(--text-muted);">القسم / الإدارة:</span>
                  <strong id="p-info-dept" style="color: #2563eb;">الإدارة العامة والعمليات</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 0.4rem;">
                  <span style="color: var(--text-muted);">تاريخ الانضمام للنظام:</span>
                  <strong id="p-info-joined" style="color: var(--text-main);">2024-01-01</strong>
                </div>
              </div>
            </div>

            <!-- Card 2: Security & Role Clearances -->
            <div class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
                <span style="font-size: 1.3rem;">🛡️</span>
                <div>
                  <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">الصلاحيات والأمان التنفيذي</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">System Security Clearance</div>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.82rem;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 0.4rem;">
                  <span style="color: var(--text-muted);">مستوى الحساب:</span>
                  <strong id="p-info-clearance" style="color: #e11d48;">صلاحيات غير مقيدة (Full Super Admin)</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 0.4rem;">
                  <span style="color: var(--text-muted);">إدارة الفئات والمخزون:</span>
                  <strong style="color: #10b981;">✓ وصول كامل (Full Control)</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 0.4rem;">
                  <span style="color: var(--text-muted);">حذف الطلبات المنفذة:</span>
                  <strong style="color: #10b981;">✓ مسموح حصرياً</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 0.4rem;">
                  <span style="color: var(--text-muted);">بوابة التراسل والواتساب:</span>
                  <strong style="color: #10b981;">✓ مفعلة وموثقة</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 0.4rem;">
                  <span style="color: var(--text-muted);">طريقة المصادقة:</span>
                  <strong style="color: var(--text-main);">Enterprise Admin Token</strong>
                </div>
              </div>
            </div>

            <!-- Card 3: Session & Quick Settings -->
            <div class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
                <span style="font-size: 1.3rem;">⚡</span>
                <div>
                  <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">إعدادات الجلسة والتحكم</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">Session & Account Controls</div>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <button type="button" onclick="openProfileEditModal()" class="btn btn-secondary" style="justify-content: center; font-size: 0.8rem; padding: 0.55rem;">
                  🔒 تعديل كلمة المرور أو الهاتف
                </button>
                <button type="button" onclick="setModule('settings')" class="btn btn-secondary" style="justify-content: center; font-size: 0.8rem; padding: 0.55rem;">
                  ⚙️ إعدادات النظام والقوالب
                </button>
                <button type="button" onclick="userLogout()" class="btn btn-ghost" style="justify-content: center; font-size: 0.8rem; padding: 0.55rem; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.25);">
                  🚪 تسجيل الخروج من هذا الحساب
                </button>
              </div>
            </div>
          </div>
        </section>
`;

if (!html.includes('id="view-profile"')) {
  html = html.replace('<section id="view-settings"', profileViewHtml + '\n        <section id="view-settings"');
  console.log('✅ Injected hidden view-profile section');
}


// D. Add Edit Profile Modal before </body>
const editProfileModalHtml = `
  <!-- MODAL: EDIT USER PROFILE -->
  <div id="modal-edit-user-profile" class="hud-modal-overlay" style="display: none; z-index: 10002;" onclick="if(event.target===this) closeProfileEditModal()">
    <div class="hud-modal-box" style="max-width: 500px; width: 92vw;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">✏️ تعديل الملف الشخصي</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">تحديث اسم العرض، رقم الجوال وكلمة المرور</p>
        </div>
        <button onclick="closeProfileEditModal()" class="btn btn-ghost" style="font-size: 1.2rem; padding: 0.2rem 0.5rem;">✕</button>
      </div>

      <form onsubmit="handleSaveUserProfile(event)" style="display: flex; flex-direction: column; gap: 0.85rem;">
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">الاسم الكامل / Display Name *</label>
          <input id="profile-edit-name" type="text" required class="input-field">
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">البريد الإلكتروني / Email</label>
          <input id="profile-edit-email" type="email" readonly class="input-field" style="background: var(--bg-surface-elevated); color: var(--text-muted);">
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">رقم الجوال / Phone *</label>
          <input id="profile-edit-phone" type="text" required placeholder="05xxxxxxxx" class="input-field" style="direction: ltr; text-align: start;">
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">كلمة المرور الجديدة (اتركه فارغاً للإبقاء عليها)</label>
          <input id="profile-edit-password" type="password" placeholder="••••••••" class="input-field">
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.75rem;">
          <button type="button" onclick="closeProfileEditModal()" class="btn btn-secondary">إلغاء</button>
          <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
        </div>
      </form>
    </div>
  </div>
`;

if (!html.includes('id="modal-edit-user-profile"')) {
  html = html.replace('</body>', editProfileModalHtml + '\n</body>');
  console.log('✅ Injected modal-edit-user-profile');
}


// E. Add System-Wide Category Management in view-settings (Super Admin Only)
const systemCategoriesManagerHtml = `
          <!-- =========================================================================
               SUPER ADMIN EXCLUSIVE: SYSTEM-WIDE CATEGORY MANAGEMENT FOR WHOLE PROJECT
               ========================================================================= -->
          <div id="settings-categories-container" class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.85rem; flex-wrap: wrap; gap: 0.75rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0;">🏷️ إدارة كافة فئات وتصنيفات النظام (Whole Project Categories)</h3>
                  <span class="badge badge-rose" style="font-size: 0.68rem; padding: 0.15rem 0.5rem; font-weight: 800;">SUPER ADMIN ONLY</span>
                </div>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px;">
                  لوحة إدارة مركزية تتيح للمدير العام إضافة وتعديل وحذف تصنيفات كافة أقسام المشروع مع توضيح القسم المرتبط بكل فئة
                </p>
              </div>

              <!-- Button to open Add Category Modal -->
              <button type="button" onclick="openSystemCategoryAddDialog()" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.45rem 0.9rem;">
                + إضافة فئة جديدة للمشروع
              </button>
            </div>

            <!-- Section Filter Tabs -->
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" id="system-cat-section-filters">
              <button type="button" onclick="filterSystemCategories('ALL')" class="btn btn-primary" id="btn-cat-filter-ALL" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
                الكل (All Sections)
              </button>
              <button type="button" onclick="filterSystemCategories('stock')" class="btn btn-secondary" id="btn-cat-filter-stock" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
                📦 المخزون والمستودع (Warehouse)
              </button>
              <button type="button" onclick="filterSystemCategories('orders')" class="btn btn-secondary" id="btn-cat-filter-orders" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
                📋 الطلبيات والتوريد (Orders)
              </button>
              <button type="button" onclick="filterSystemCategories('tasks')" class="btn btn-secondary" id="btn-cat-filter-tasks" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
                ✅ المهام والعمليات (Tasks)
              </button>
              <button type="button" onclick="filterSystemCategories('employees')" class="btn btn-secondary" id="btn-cat-filter-employees" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
                👥 الكادر والموارد البشرية (HR Roles)
              </button>
            </div>

            <!-- Table of Categories -->
            <div class="table-responsive-wrapper">
              <table class="matrix-table" style="width: 100%; font-size: 0.82rem;">
                <thead>
                  <tr>
                    <th style="min-width: 180px;">اسم الفئة (Category)</th>
                    <th style="min-width: 170px;">القسم التابع له (Section)</th>
                    <th style="min-width: 280px;">التوضيح وبيان الاستخدام (Clarification & Scope)</th>
                    <th style="min-width: 100px; text-align: center;">العناصر المرتبطة</th>
                    <th style="min-width: 120px; text-align: end;">الإجراءات</th>
                  </tr>
                </thead>
                <tbody id="system-categories-table-body">
                  <!-- Rendered dynamically -->
                </tbody>
              </table>
            </div>
          </div>
`;

if (!html.includes('id="settings-categories-container"')) {
  html = html.replace('<!-- THEME & AUDIO DIAGNOSTICS -->', systemCategoriesManagerHtml + '\n              <!-- THEME & AUDIO DIAGNOSTICS -->');
  console.log('✅ Injected system-wide category manager into view-settings');
}


// F. Add Profile & Category Manager JavaScript Handlers in index.html
const systemCatJs = `
    // =========================================================================
    // USER PROFILE VIEW CONTROLLER (ACCESSIBLE VIA PRESSING ON USER NAME)
    // =========================================================================
    function renderUserProfileView() {
      const user = getCurrentUser();
      if (!user) return;

      const lang = document.documentElement.getAttribute("lang") || "en";
      const isSuper = isMasterSuperAdmin(user);

      const avatarEl = document.getElementById("profile-avatar-large");
      const nameEl = document.getElementById("profile-display-name");
      const roleBadgeEl = document.getElementById("profile-display-role-badge");
      const titleEl = document.getElementById("profile-display-title");
      const metaEmailEl = document.getElementById("profile-meta-email");
      const metaPhoneEl = document.getElementById("profile-meta-phone");

      const initial = (user.name || "U").charAt(0).toUpperCase();
      if (avatarEl) avatarEl.textContent = initial;
      if (nameEl) nameEl.textContent = user.name || "المستخدم";
      if (roleBadgeEl) {
        roleBadgeEl.textContent = user.role || "EMPLOYEE";
        roleBadgeEl.className = isSuper ? "badge badge-rose" : "badge badge-primary";
      }
      if (titleEl) {
        titleEl.textContent = isSuper
          ? (lang === "ar" ? "المدير العام والمسؤول التنفيذي الأول لمنظومة أستان" : "General Director & Executive Operations Manager")
          : (user.idProfession || user.role || "موظف معتمد");
      }
      if (metaEmailEl) metaEmailEl.textContent = "📧 " + (user.email || "user@ostan.sa");
      if (metaPhoneEl) metaPhoneEl.textContent = "📱 " + (user.phone || "-");

      const pName = document.getElementById("p-info-name");
      const pEmail = document.getElementById("p-info-email");
      const pPhone = document.getElementById("p-info-phone");
      const pDept = document.getElementById("p-info-dept");
      const pJoined = document.getElementById("p-info-joined");
      const pClearance = document.getElementById("p-info-clearance");

      if (pName) pName.textContent = user.name || "-";
      if (pEmail) pEmail.textContent = user.email || "-";
      if (pPhone) pPhone.textContent = user.phone || "-";
      if (pDept) pDept.textContent = user.department || (isSuper ? "الإدارة العامة والعمليات" : "شؤون الموظفين والميدان");
      if (pJoined) pJoined.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : (user.workStartDate || "2024-01-01");
      if (pClearance) {
        pClearance.textContent = isSuper ? "صلاحيات غير مقيدة (Full Super Admin)" : "صلاحيات قسم " + (user.department || "الموظفين");
        pClearance.style.color = isSuper ? "#e11d48" : "#2563eb";
      }
    }
    window.renderUserProfileView = renderUserProfileView;

    function openProfileEditModal() {
      const user = getCurrentUser();
      if (!user) return;

      const nameIn = document.getElementById("profile-edit-name");
      const emailIn = document.getElementById("profile-edit-email");
      const phoneIn = document.getElementById("profile-edit-phone");
      const passIn = document.getElementById("profile-edit-password");

      if (nameIn) nameIn.value = user.name || "";
      if (emailIn) emailIn.value = user.email || "";
      if (phoneIn) phoneIn.value = user.phone || "";
      if (passIn) passIn.value = "";

      const m = document.getElementById("modal-edit-user-profile");
      if (m) m.style.display = "flex";
    }
    window.openProfileEditModal = openProfileEditModal;

    function closeProfileEditModal() {
      const m = document.getElementById("modal-edit-user-profile");
      if (m) m.style.display = "none";
    }
    window.closeProfileEditModal = closeProfileEditModal;

    function handleSaveUserProfile(e) {
      e.preventDefault();
      const user = getCurrentUser();
      if (!user) return;

      const newName = document.getElementById("profile-edit-name").value.trim();
      const newPhone = document.getElementById("profile-edit-phone").value.trim();
      const newPass = document.getElementById("profile-edit-password").value.trim();

      if (!newName || !newPhone) {
        alert("يرجى ملء الاسم الكامل ورقم الجوال.");
        return;
      }

      user.name = newName;
      user.phone = newPhone;
      if (newPass) {
        user.password = newPass;
      }

      // Update in state.users or staff list
      if (window.state && window.state.users) {
        const u = window.state.users.find(x => x.id === user.id || x.email === user.email);
        if (u) {
          u.name = newName;
          u.phone = newPhone;
          if (newPass) u.password = newPass;
        }
      }

      // Update in employees if exists
      if (window.state && window.state.employees) {
        const emp = window.state.employees.find(x => x.id === user.id || x.email === user.email);
        if (emp) {
          emp.name = newName;
          emp.phone = newPhone;
        }
      }

      saveState();

      // Update sidebar and top header display immediately
      const sideName = document.getElementById("sidebar-user-name");
      const topName = document.getElementById("top-header-user-name");
      if (sideName) sideName.textContent = newName;
      if (topName) topName.textContent = newName;

      closeProfileEditModal();
      renderUserProfileView();

      if (window.OstanStyle) {
        window.OstanStyle.showToast("تم تحديث الملف الشخصي", "تم حفظ معلوماتك بنجاح!");
      }
    }
    window.handleSaveUserProfile = handleSaveUserProfile;


    // =========================================================================
    // SYSTEM-WIDE CATEGORY MANAGEMENT (SUPER ADMIN ONLY)
    // =========================================================================
    let currentSystemCategoryFilter = "ALL";

    function getSystemWideCategories() {
      if (window.state && window.state.systemCategories && window.state.systemCategories.length > 0) {
        return window.state.systemCategories;
      }

      try {
        const saved = localStorage.getItem("ostan_system_categories");
        if (saved) {
          window.state.systemCategories = JSON.parse(saved);
          return window.state.systemCategories;
        }
      } catch (e) {}

      const initial = [
        // 1. Warehouse & Stock
        { id: "cat_stock_gen", section: "stock", sectionName: "📦 المخزون والمستودع", name: "General (عام)", clarification: "أصناف تشغيلية ولوازم عامة بالمستودع الرئيسي" },
        { id: "cat_stock_eq", section: "stock", sectionName: "📦 المخزون والمستودع", name: "Equipment (معدات)", clarification: "الآليات والمعدات التشغيلية والميدانية" },
        { id: "cat_stock_tl", section: "stock", sectionName: "📦 المخزون والمستودع", name: "Tools (أدوات وعدد)", clarification: "المعدات اليدوية والعدد الفنية للفرق الميدانية" },
        { id: "cat_stock_cs", section: "stock", sectionName: "📦 المخزون والمستودع", name: "Consumables (مواد استهلاكية)", clarification: "القطع المستهلكة ومواد التعبئة والزيوت" },
        { id: "cat_stock_un", section: "stock", sectionName: "📦 المخزون والمستودع", name: "Uniforms (زي موحد)", clarification: "ملابس وتيشيرتات الكوادر الميدانية بكافة المقاسات" },

        // 2. Orders & Supply
        { id: "cat_ord_un", section: "orders", sectionName: "📋 الطلبيات والتوريد", name: "Uniform Dispatch (صرف الزي الموحد)", clarification: "طلبيات صرف الزي الميداني وتوزيع المقاسات والمدن" },
        { id: "cat_ord_eq", section: "orders", sectionName: "📋 الطلبيات والتوريد", name: "Site Equipment (معدات المواقع)", clarification: "أوامر توريد أدوات ومعدات المشاريع والفروع" },
        { id: "cat_ord_sf", section: "orders", sectionName: "📋 الطلبيات والتوريد", name: "Safety Gear (أدوات السلامة)", clarification: "خوذ وسترات وأحذية الأمان المهني للمشاريع" },

        // 3. Tasks & Operations
        { id: "cat_tsk_log", section: "tasks", sectionName: "✅ المهام والعمليات", name: "Logistics (لوجستيات)", clarification: "مهام الشحن والتوزيع والنقل بين الفروع والمواقع" },
        { id: "cat_tsk_fld", section: "tasks", sectionName: "✅ المهام والعمليات", name: "Field Inspection (تفتيش ميداني)", clarification: "جولات الرقابة الميدانية والمتابعة الإشرافية" },
        { id: "cat_tsk_adm", section: "tasks", sectionName: "✅ المهام والعمليات", name: "Administration (إدارية)", clarification: "مهام التدقيق والمطابقات ومراجعة الحسابات" },
        { id: "cat_tsk_urg", section: "tasks", sectionName: "✅ المهام والعمليات", name: "Urgent (عاجلة)", clarification: "مهام طارئة تتطلب تدخلاً فورياً مع إشعار بالموعد" },

        // 4. Staff & HR Roles
        { id: "cat_emp_pm", section: "employees", sectionName: "👥 الكادر والموارد البشرية", name: "Project Manager (مدير مشروع)", clarification: "المسؤول عن إدارة المشاريع التشغيلية وفرق العمل" },
        { id: "cat_emp_rm", section: "employees", sectionName: "👥 الكادر والموارد البشرية", name: "Regional Manager (مدير إقليمي)", clarification: "مدير المنطقة المشرف على فروع ومواقع مدن معينة" },
        { id: "cat_emp_sp", section: "employees", sectionName: "👥 الكادر والموارد البشرية", name: "Supervisor (مشرف ميداني)", clarification: "مشرف الفرق والكوادر الميدانية بالمواقع" },
        { id: "cat_emp_mc", section: "employees", sectionName: "👥 الكادر والموارد البشرية", name: "Merchandiser (مصفف أرفف / منسق)", clarification: "كادر التنظيم والتنسيق الميداني بالأسواق والفروع" }
      ];

      window.state.systemCategories = initial;
      try { localStorage.setItem("ostan_system_categories", JSON.stringify(initial)); } catch (e) {}
      return initial;
    }

    function renderSystemCategoriesManager() {
      const curUser = getCurrentUser();
      const container = document.getElementById("settings-categories-container");
      if (!container) return;

      if (!isMasterSuperAdmin(curUser)) {
        container.style.display = "none";
        return;
      }
      container.style.display = "flex";

      const tbody = document.getElementById("system-categories-table-body");
      if (!tbody) return;

      const categories = getSystemWideCategories();

      // Update Filter button active states
      document.querySelectorAll("#system-cat-section-filters button").forEach(btn => {
        btn.className = "btn btn-secondary";
      });
      const activeBtn = document.getElementById("btn-cat-filter-" + currentSystemCategoryFilter);
      if (activeBtn) activeBtn.className = "btn btn-primary";

      const filtered = categories.filter(c => {
        if (currentSystemCategoryFilter !== "ALL" && c.section !== currentSystemCategoryFilter) return false;
        return true;
      });

      const sectionBadgeColors = {
        "stock": "badge-primary",
        "orders": "badge-cyan",
        "tasks": "badge-amber",
        "employees": "badge-rose"
      };

      tbody.innerHTML = filtered.map(c => {
        // Calculate linked items count
        let count = 0;
        if (c.section === "stock" && window.state && window.state.stock) {
          count = window.state.stock.filter(s => s.category === c.name || s.category === c.id).length;
        } else if (c.section === "tasks" && window.state && window.state.tasks) {
          count = window.state.tasks.filter(t => t.category === c.name || t.category === c.id).length;
        } else if (c.section === "employees" && window.state && window.state.employees) {
          count = window.state.employees.filter(e => e.role === c.name || (e.jobTitle && e.jobTitle.includes(c.name))).length;
        } else if (c.section === "orders" && window.state && window.state.orders) {
          count = window.state.orders.filter(o => o.category === c.name).length;
        }

        const badgeClass = sectionBadgeColors[c.section] || "badge-secondary";

        return \`
          <tr>
            <td style="font-weight: 700; color: var(--text-main);">
              \${c.name}
            </td>
            <td>
              <span class="badge \${badgeClass}" style="font-size: 0.72rem; padding: 0.2rem 0.55rem;">
                \${c.sectionName || c.section}
              </span>
            </td>
            <td style="color: var(--text-muted); font-size: 0.78rem;">
              \${c.clarification || '-'}
            </td>
            <td style="text-align: center;">
              <strong style="color: #2563eb;">\${count}</strong> <span style="font-size: 0.7rem; color: var(--text-faint);">عنصر</span>
            </td>
            <td style="text-align: end;">
              <div style="display: inline-flex; gap: 0.3rem;">
                <button type="button" onclick="editSystemCategory('\${c.id}')" class="btn btn-ghost" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; color: #2563eb;" title="تعديل الفئة">
                  ✏️ تعديل
                </button>
                <button type="button" onclick="deleteSystemCategory('\${c.id}')" class="btn btn-ghost" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; color: #ef4444;" title="حذف الفئة">
                  🗑️ حذف
                </button>
              </div>
            </td>
          </tr>
        \`;
      }).join("");
    }
    window.renderSystemCategoriesManager = renderSystemCategoriesManager;

    function filterSystemCategories(sec) {
      currentSystemCategoryFilter = sec;
      renderSystemCategoriesManager();
    }
    window.filterSystemCategories = filterSystemCategories;

    function openSystemCategoryAddDialog() {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const sec = prompt(
        "اختر القسم التابع له الفئة الجديدة:\\n" +
        "1 - المخزون والمستودع (stock)\\n" +
        "2 - الطلبيات والتوريد (orders)\\n" +
        "3 - المهام والعمليات (tasks)\\n" +
        "4 - الكادر والموارد البشرية (employees)",
        "1"
      );

      const secMap = {
        "1": { key: "stock", label: "📦 المخزون والمستودع" },
        "2": { key: "orders", label: "📋 الطلبيات والتوريد" },
        "3": { key: "tasks", label: "✅ المهام والعمليات" },
        "4": { key: "employees", label: "👥 الكادر والموارد البشرية" }
      };

      const selectedSec = secMap[sec] || secMap["1"];

      const name = prompt(\`أدخل اسم الفئة الجديدة لقسم (\${selectedSec.label}):\`);
      if (!name || !name.trim()) return;

      const clarification = prompt("أدخل توضيحاً مختصراً لبيان استخدام هذه الفئة:", \`تصنيف خاص بقسم \${selectedSec.label}\`);

      const categories = getSystemWideCategories();
      const newCat = {
        id: "cat_" + selectedSec.key + "_" + Date.now(),
        section: selectedSec.key,
        sectionName: selectedSec.label,
        name: name.trim(),
        clarification: clarification ? clarification.trim() : ""
      };

      categories.push(newCat);
      window.state.systemCategories = categories;

      // Sync with stock categories if stock
      if (selectedSec.key === "stock") {
        window.state.stockCategories = window.state.stockCategories || [];
        window.state.stockCategories.push({ id: newCat.id, name: newCat.name });
        try { localStorage.setItem("ostan_stock_categories", JSON.stringify(window.state.stockCategories)); } catch (e) {}
        if (typeof renderCategoryOptions === "function") renderCategoryOptions();
      }

      try { localStorage.setItem("ostan_system_categories", JSON.stringify(categories)); } catch (e) {}

      renderSystemCategoriesManager();
      if (window.OstanStyle) window.OstanStyle.showToast("تمت الإضافة", \`تمت إضافة الفئة (\${newCat.name}) لقسم \${selectedSec.label}\`);
    }
    window.openSystemCategoryAddDialog = openSystemCategoryAddDialog;

    function editSystemCategory(catId) {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const categories = getSystemWideCategories();
      const cat = categories.find(c => c.id === catId);
      if (!cat) return;

      const newName = prompt(\`تعديل اسم الفئة (\${cat.name}):\`, cat.name);
      if (!newName || !newName.trim()) return;

      const newClar = prompt("تعديل التوضيح وبيان الاستخدام:", cat.clarification || "");

      const oldName = cat.name;
      cat.name = newName.trim();
      cat.clarification = newClar ? newClar.trim() : cat.clarification;

      // Propagate update across related items in state
      if (cat.section === "stock" && window.state && window.state.stock) {
        window.state.stock.forEach(s => {
          if (s.category === oldName || s.category === cat.id) s.category = cat.name;
        });
        if (window.state.stockCategories) {
          const sc = window.state.stockCategories.find(x => x.id === cat.id || x.name === oldName);
          if (sc) sc.name = cat.name;
          try { localStorage.setItem("ostan_stock_categories", JSON.stringify(window.state.stockCategories)); } catch (e) {}
        }
        if (typeof renderWarehouse === "function") renderWarehouse();
        if (typeof renderCategoryOptions === "function") renderCategoryOptions();
      }

      window.state.systemCategories = categories;
      try { localStorage.setItem("ostan_system_categories", JSON.stringify(categories)); } catch (e) {}
      saveState();

      renderSystemCategoriesManager();
      if (window.OstanStyle) window.OstanStyle.showToast("تم التعديل", \`تم تحديث الفئة إلى (\${cat.name})\`);
    }
    window.editSystemCategory = editSystemCategory;

    function deleteSystemCategory(catId) {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const categories = getSystemWideCategories();
      const cat = categories.find(c => c.id === catId);
      if (!cat) return;

      if (!confirm(\`⚠️ تأكيد المدير العام:\\nهل أنت متأكد من حذف فئة (\${cat.name}) من قسم (\${cat.sectionName || cat.section})؟\\nسيتم تحويل أو حماية العناصر المرتبطة بها.\`)) return;

      const updated = categories.filter(c => c.id !== catId);
      window.state.systemCategories = updated;

      // Reassign stock items to General if in stock
      if (cat.section === "stock" && window.state && window.state.stock) {
        window.state.stock.forEach(s => {
          if (s.category === cat.name || s.category === cat.id) s.category = "General";
        });
        if (window.state.stockCategories) {
          window.state.stockCategories = window.state.stockCategories.filter(x => x.id !== cat.id && x.name !== cat.name);
          try { localStorage.setItem("ostan_stock_categories", JSON.stringify(window.state.stockCategories)); } catch (e) {}
        }
        if (typeof renderWarehouse === "function") renderWarehouse();
        if (typeof renderCategoryOptions === "function") renderCategoryOptions();
      }

      try { localStorage.setItem("ostan_system_categories", JSON.stringify(updated)); } catch (e) {}
      saveState();

      renderSystemCategoriesManager();
      if (window.OstanStyle) window.OstanStyle.showToast("تم الحذف", \`تم حذف فئة (\${cat.name}) بنجاح\`);
    }
    window.deleteSystemCategory = deleteSystemCategory;
`;

if (!html.includes('function renderSystemCategoriesManager')) {
  html = html.replace('function openCategoryManagerModal() {', systemCatJs + '\n    function openCategoryManagerModal() {');
  console.log('✅ Injected system category and profile controllers into index.html');
}

// G. Update setModule views list to include "profile", and trigger profile render
html = html.replace(
  'const views = ["dashboard", "employees", "departments", "tasks", "reminders", "stock", "stock-requests", "orders", "orders", "reports", "audit-logs", "messages", "settings", "notification-logs"];',
  'const views = ["dashboard", "employees", "departments", "tasks", "reminders", "stock", "stock-requests", "orders", "reports", "audit-logs", "messages", "settings", "notification-logs", "profile"];'
);

html = html.replace(
  'if (mod === "orders") {\n        renderOrders();\n      }',
  `if (mod === "orders") {
        renderOrders();
      }
      if (mod === "profile") {
        renderUserProfileView();
      }
      if (mod === "settings") {
        if (typeof renderSuperAdminWaNumbersChart === "function") renderSuperAdminWaNumbersChart();
        if (typeof renderSystemCategoriesManager === "function") renderSystemCategoriesManager();
      }`
);

// getSectionAccess: ensure profile is accessible for logged in user
html = html.replace(
  'if (mod === "dashboard") return "accessible";',
  'if (mod === "dashboard" || mod === "profile") return "accessible";'
);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Successfully updated index.html\n');


// 2. UPDATE translation.js
const transPath = path.join(__dirname, '..', 'translation.js');
let transCode = fs.readFileSync(transPath, 'utf8').replace(/\r\n/g, '\n');

transCode = transCode.replace(
  'nav_stock_requests: "Stock Requests (Organizations)",',
  'nav_stock_requests: "Stock Requests",'
);

transCode = transCode.replace(
  'nav_stock_requests: "طلبات الصرف (للمؤسسات)",',
  'nav_stock_requests: "طلبات الصرف",'
);

transCode = transCode.replace(
  'requests_section_title: "Stock Requests (Organizations)",',
  'requests_section_title: "Stock Requests",'
);

transCode = transCode.replace(
  'requests_section_title: "طلبات صرف المواد (للمؤسسات والمنظمات)",',
  'requests_section_title: "طلبات صرف المواد والمعدات",'
);

fs.writeFileSync(transPath, transCode, 'utf8');
console.log('✅ Successfully updated translation.js\n');

console.log('=== IMPLEMENTATION COMPLETE ===');
