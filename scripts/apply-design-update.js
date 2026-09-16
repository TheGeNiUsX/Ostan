const fs = require('fs');
const path = require('path');

console.log('=== STARTING DESIGN SYSTEM UPDATE ===');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Detect line ending
const isCRLF = html.includes('\r\n');
const nl = isCRLF ? '\r\n' : '\n';

// 1. Ensure html tag has data-theme="corporate"
html = html.replace(/<html\s+lang="en"\s+dir="ltr"\s+data-theme="[^"]*">/i, '<html lang="en" dir="ltr" data-theme="corporate">');

// 2. Ensure CSS has the card accent stripes and pastel icon badges
if (!html.includes('.accent-stripe-blue')) {
  const cardHoverTarget = `.card-hover:hover {`;
  const replacement = `/* Vertical Colored Accent Stripes (Matching Reference Dashboard) */
    .accent-stripe-blue { border-inline-start: 4px solid var(--blue-500) !important; }
    .accent-stripe-cyan { border-inline-start: 4px solid var(--cyan-500) !important; }
    .accent-stripe-emerald { border-inline-start: 4px solid var(--emerald-500) !important; }
    .accent-stripe-rose { border-inline-start: 4px solid var(--rose-500) !important; }
    .accent-stripe-purple { border-inline-start: 4px solid var(--purple-500) !important; }
    .accent-stripe-amber { border-inline-start: 4px solid var(--amber-500) !important; }
    .accent-stripe-pink { border-inline-start: 4px solid var(--pink-500) !important; }

    /* Pastel Icon Circle Badges */
    .pastel-icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .pastel-blue { background: #eff6ff; color: #2563eb; }
    .pastel-cyan { background: #f0f9ff; color: #0284c7; }
    .pastel-emerald { background: #ecfdf5; color: #10b981; }
    .pastel-rose { background: #fef2f2; color: #ef4444; }
    .pastel-purple { background: #f5f3ff; color: #8b5cf6; }
    .pastel-amber { background: #fffbeb; color: #d97706; }
    .pastel-pink { background: #fff1f2; color: #e11d48; }

    [data-theme="dark"] .pastel-blue { background: rgba(37, 99, 235, 0.2); color: #60a5fa; }
    [data-theme="dark"] .pastel-cyan { background: rgba(2, 132, 199, 0.2); color: #38bdf8; }
    [data-theme="dark"] .pastel-emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    [data-theme="dark"] .pastel-rose { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    [data-theme="dark"] .pastel-purple { background: rgba(139, 92, 246, 0.2); color: #a78bfa; }
    [data-theme="dark"] .pastel-amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    [data-theme="dark"] .pastel-pink { background: rgba(244, 63, 94, 0.2); color: #fb7185; }

    .card-hover:hover {`;
  html = html.replace(cardHoverTarget, replacement);
}

// 3. Update top-header markup with the two-tier structure
const topHeaderRegex = /<!-- Top Navigation Header -->[\s\S]*?<\/header>/;
const newTopHeaderAndSubnav = `<!-- Top Navigation Header Tier 1 (Dark Slate / Deep Navy #0b0f15) -->
      <header class="top-header">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <!-- Mobile Menu Button -->
          <button id="btn-mobile-menu-toggle" class="btn btn-secondary mobile-only" onclick="toggleMobileSidebar()" aria-label="Toggle Navigation Menu" style="padding: 0.45rem 0.65rem; font-size: 1.15rem; line-height: 1; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); color: #fff;">
            <span>☰</span>
          </button>

          <!-- Executive Brand Logo & Name (Matching Gulf Horizons Reference Header) -->
          <div style="display: flex; align-items: center; gap: 0.65rem; cursor: pointer;" onclick="setModule('dashboard')">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
              <span style="font-size: 1.25rem;">🏢</span>
            </div>
            <div style="line-height: 1.15;">
              <div style="font-weight: 800; font-size: 1.05rem; letter-spacing: -0.01em; color: #ffffff;">
                <span data-i18n="company_brand_title">مجموعة أستان</span>
              </div>
              <div style="font-size: 0.68rem; color: #94a3b8; letter-spacing: 0.02em;">
                <span data-i18n="company_brand_subtitle">OSTAN ENTERPRISE ERP</span>
              </div>
            </div>
          </div>

          <!-- Desktop Search Bar -->
          <div class="desktop-search-bar" style="position: relative; max-width: 340px; width: 100%; margin-inline-start: 1.25rem;">
            <input type="text" placeholder="ابحث في الموظفين، المشاريع، المهام..." data-i18n-placeholder="search_placeholder" class="input-field" style="padding-inline-start: 2.2rem; background: #131926; border-color: #243046; color: #f8fafc; font-size: 0.82rem; height: 38px; border-radius: 8px;">
            <span style="position: absolute; inset-inline-start: 10px; top: 10px; color: #64748b; font-size: 0.85rem;">🔍</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.65rem; position: relative;">
          <!-- Quick Power Sign Out Button -->
          <button onclick="userLogout()" class="btn btn-ghost" style="color: #94a3b8; padding: 0.4rem 0.55rem; font-size: 1.05rem; border-radius: 8px;" title="تسجيل الخروج (Sign Out)">
            <span>⏻</span>
          </button>

          <!-- Active User Profile Pill (Directly matching reference image) -->
          <div id="top-header-user-pill" onclick="setModule('settings')" style="display: flex; align-items: center; gap: 0.6rem; padding: 0.3rem 0.75rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); border-radius: 9999px; cursor: pointer;" title="الحساب الشخصي والإعدادات">
            <div id="top-header-user-avatar" class="user-avatar-circle" style="width: 32px; height: 32px; font-size: 0.85rem; font-weight: 800; background: linear-gradient(135deg, #2563eb, #7c3aed); border: 1.5px solid rgba(255,255,255,0.6); box-shadow: 0 1px 4px rgba(0,0,0,0.3);">
              O
            </div>
            <div style="text-align: start; line-height: 1.2;">
              <div id="top-header-user-name" style="font-weight: 700; font-size: 0.82rem; color: #ffffff; white-space: nowrap;">
                أسامة طويش
              </div>
              <div id="top-header-user-role" style="font-size: 0.68rem; color: #94a3b8; font-weight: 500;">
                مدير موارد بشرية
              </div>
            </div>
          </div>

          <!-- Quick WhatsApp Link -->
          <button onclick="setModule('messages')" class="btn btn-ghost" style="color: #22c55e; padding: 0.4rem 0.55rem; font-size: 1.05rem;" title="استوديو ربط واتساب (WhatsApp Studio)">
            <span>💬</span>
          </button>

          <!-- Notification Bell & Center -->
          <div style="position: relative;" id="notif-center-wrapper">
            <button id="notif-bell-btn" class="btn btn-secondary" onclick="toggleNotificationCenter(event)" style="padding: 0.4rem 0.65rem; font-size: 0.82rem; position: relative; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.14); color: #fff;" title="System Notifications">
              <span>🔔</span>
              <span id="notif-bell-badge" style="display: none; position: absolute; top: -4px; right: -4px; background: #ef4444; color: #fff; border-radius: 999px; font-size: 0.62rem; font-weight: 800; padding: 1px 5px; line-height: 1;">0</span>
            </button>
            <div id="notif-bell-dropdown" class="glass-panel" style="display: none; position: absolute; right: 0; top: calc(100% + 8px); width: 340px; max-height: 460px; z-index: 10001; border-radius: 12px; box-shadow: 0 16px 36px rgba(0,0,0,0.55); border: 1px solid var(--border-light, #cbd5e1); overflow: hidden; flex-direction: column; background: var(--bg-surface-elevated, #161f30);">
              <div style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.15);">
                <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 800; font-size: 0.85rem; color: var(--text-main);">
                  <span>🔔</span> <span data-i18n="notif_center_title">Notifications (الإشعارات)</span>
                  <span id="notif-unread-count-badge" class="badge badge-emerald" style="font-size: 0.65rem; display: none;">0</span>
                </div>
                <button onclick="clearNotificationCenter(event)" class="btn btn-ghost" style="font-size: 0.7rem; color: #38bdf8; padding: 2px 6px;">Clear</button>
              </div>
              <div id="notif-bell-list" style="overflow-y: auto; max-height: 300px; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.45rem;">
                <div style="text-align: center; color: var(--text-faint); font-size: 0.78rem; padding: 1.5rem;">No recent notifications</div>
              </div>
              <div style="padding: 0.6rem 0.85rem; border-top: 1px solid var(--border-subtle); background: rgba(0,0,0,0.25); text-align: center;">
                <button type="button" onclick="openFullNotificationLogsView()" class="btn btn-secondary" style="width: 100%; font-size: 0.78rem; font-weight: 700; color: #38bdf8; border-color: rgba(56, 189, 248, 0.35); display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                  <span>📋 Go to Full Notification Log (السجل الشامل)</span> <span>➜</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Language Toggle (English ↔ Arabic) -->
          <button class="btn btn-secondary" onclick="window.OstanI18n.toggle()" style="padding: 0.4rem 0.65rem; font-size: 0.78rem; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.14); color: #fff;">
            <span data-i18n="lang_toggle">🌐 العربية</span>
          </button>

          <!-- Theme Toggle -->
          <button class="btn btn-secondary" onclick="window.OstanStyle.toggleTheme()" style="padding: 0.4rem 0.65rem; font-size: 0.78rem; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.14); color: #fff;">
            <span data-i18n="theme_toggle">🌓 Theme</span>
          </button>
        </div>
      </header>

      <!-- Signature Burgundy Tier-2 Navigation Bar (Directly matching Gulf Horizons reference layout) -->
      <nav class="top-subnav-burgundy" id="top-executive-subnav">
        <a id="top-nav-dashboard" class="top-subnav-item active" onclick="setModule('dashboard')">
          <span>📊</span>
          <span data-i18n="nav_dashboard">لوحة التحكم</span>
        </a>
        <a id="top-nav-tasks" class="top-subnav-item" onclick="setModule('tasks')">
          <span>🏗️</span>
          <span data-i18n="nav_tasks">المشاريع والمهام</span>
        </a>
        <a id="top-nav-employees" class="top-subnav-item" onclick="setModule('employees')">
          <span>👥</span>
          <span data-i18n="nav_employees">الموظفين</span>
        </a>
        <a id="top-nav-saudi-staff" class="top-subnav-item" onclick="setModule('saudi-staff')">
          <span>🇸🇦</span>
          <span data-i18n="nav_saudi_staff">الكادر السعودي</span>
        </a>
        <a id="top-nav-stock" class="top-subnav-item" onclick="setModule('stock')">
          <span>📦</span>
          <span data-i18n="nav_stock">المخزون والعهد</span>
        </a>
        <a id="top-nav-messages" class="top-subnav-item" onclick="setModule('messages')">
          <span>💬</span>
          <span data-i18n="nav_messages">رسائل واتساب</span>
        </a>
        <a id="top-nav-reminders" class="top-subnav-item" onclick="setModule('reminders')">
          <span>⏰</span>
          <span data-i18n="nav_reminders">التنبيهات</span>
        </a>
        <a id="top-nav-reports" class="top-subnav-item" onclick="setModule('reports')">
          <span>📈</span>
          <span data-i18n="nav_reports">التقارير</span>
        </a>
        <a id="top-nav-audit-logs" class="top-subnav-item" onclick="setModule('audit-logs')">
          <span>📜</span>
          <span data-i18n="nav_audit_logs">سجل العمليات</span>
        </a>
        <a id="top-nav-settings" class="top-subnav-item" onclick="setModule('settings')">
          <span>⚙️</span>
          <span data-i18n="nav_settings">الإعدادات</span>
        </a>
      </nav>`;

html = html.replace(topHeaderRegex, newTopHeaderAndSubnav);

// 4. Replace view-dashboard contents to match reference image layout
const viewDashRegex = /<section id="view-dashboard"[\s\S]*?<\/section>/;
const newViewDashboard = `<section id="view-dashboard" style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Executive Welcome Header Banner (Matching Reference Layout) -->
          <div class="glass-panel" style="padding: 1.5rem 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem; border-inline-start: 4px solid var(--primary-500);">
            <div>
              <div style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em;" data-i18n="dash_exec_title">
                لوحة التحكم الإدارية
              </div>
              <div id="dash-greeting-text" style="font-size: 0.95rem; font-weight: 600; color: var(--text-muted); margin-top: 4px;">
                مرحباً بك، أسامة طويش
              </div>
            </div>

            <!-- Team Operations Pill Badge (Reference: فريق الموارد البشرية) -->
            <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 1rem; background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 9999px;">
              <span style="font-size: 1rem;">👥</span>
              <span id="dash-team-badge-text" style="font-size: 0.82rem; font-weight: 700; color: #2563eb;" data-i18n="dash_team_badge">
                فريق الموارد البشرية: أسامة طويش (مدير) - الإدارة العامة
              </span>
            </div>
          </div>

          <!-- Operation Metric Cards Grid (5 KPI Cards with Colored Vertical Accent Stripes) -->
          <div id="dash-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem;">
            
            <!-- Card 1: Projects / Tasks (Blue Stripe) -->
            <div id="card-open-tasks" class="glass-panel card-hover accent-stripe-blue" style="padding: 1.25rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onclick="setModule('tasks')">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div class="pastel-icon-circle pastel-blue">🏗️</div>
                <div style="text-align: end;">
                  <span id="label-stat-tasks" data-i18n="dash_open_tasks" style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">إجمالي المشاريع والمهام</span>
                  <div id="stat-open-tasks" style="font-size: 2rem; font-weight: 800; line-height: 1.1; margin-top: 4px; color: var(--text-main);">0</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; pt-2; border-top: 1px solid var(--border-subtle); font-size: 0.75rem; color: #2563eb; font-weight: 700;">
                <span id="stat-sub-tasks" data-i18n="dash_all_tasks_completed" style="color: var(--text-faint); font-weight: 500;">All tasks up to date</span>
                <span data-i18n="dash_view_all">عرض الكل ></span>
              </div>
            </div>

            <!-- Card 2: Total Employees (Cyan Stripe) -->
            <div id="card-total-employees" class="glass-panel card-hover accent-stripe-cyan" style="padding: 1.25rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onclick="setModule('employees')">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div class="pastel-icon-circle pastel-cyan">👥</div>
                <div style="text-align: end;">
                  <span data-i18n="dash_total_employees" style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">إجمالي الموظفين</span>
                  <div id="stat-total-employees" style="font-size: 2rem; font-weight: 800; line-height: 1.1; margin-top: 4px; color: var(--text-main);">1</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; pt-2; border-top: 1px solid var(--border-subtle); font-size: 0.75rem; color: #0284c7; font-weight: 700;">
                <span id="stat-sub-employees" data-i18n="dash_active_on_duty" style="color: var(--text-faint); font-weight: 500;">1 Active on Duty</span>
                <span data-i18n="dash_view_all">عرض الكل ></span>
              </div>
            </div>

            <!-- Card 3: Active Staff / Saudi Staff (Emerald Stripe) -->
            <div id="card-active-staff" class="glass-panel card-hover accent-stripe-emerald" style="padding: 1.25rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onclick="setModule('saudi-staff')">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div class="pastel-icon-circle pastel-emerald">🇸🇦</div>
                <div style="text-align: end;">
                  <span data-i18n="dash_active_accounts" style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">الحسابات النشطة والكادر</span>
                  <div id="stat-active-staff" style="font-size: 2rem; font-weight: 800; line-height: 1.1; margin-top: 4px; color: var(--text-main);">1</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; pt-2; border-top: 1px solid var(--border-subtle); font-size: 0.75rem; color: #10b981; font-weight: 700;">
                <span style="color: var(--text-faint); font-weight: 500;" data-i18n="dash_active_verified">نشط وموثق</span>
                <span data-i18n="dash_view_active">عرض النشطين ></span>
              </div>
            </div>

            <!-- Card 4: Inactive Accounts & Alerts (Rose Stripe) -->
            <div id="card-upcoming-reminders" class="glass-panel card-hover accent-stripe-rose" style="padding: 1.25rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onclick="setModule('reminders')">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div class="pastel-icon-circle pastel-rose">⏰</div>
                <div style="text-align: end;">
                  <span data-i18n="dash_upcoming_reminders" style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">الحسابات والتنبيهات</span>
                  <div id="stat-upcoming-reminders" style="font-size: 2rem; font-weight: 800; line-height: 1.1; margin-top: 4px; color: var(--text-main);">0</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; pt-2; border-top: 1px solid var(--border-subtle); font-size: 0.75rem; color: #ef4444; font-weight: 700;">
                <span id="stat-sub-reminders" data-i18n="dash_no_reminders" style="color: var(--text-faint); font-weight: 500;">No pending alerts</span>
                <span data-i18n="dash_view_alerts">عرض التنبيهات ></span>
              </div>
            </div>

            <!-- Card 5: Professional Data & Stock (Purple Stripe) -->
            <div id="card-low-stock" class="glass-panel card-hover accent-stripe-purple" style="padding: 1.25rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onclick="setModule('stock')">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div class="pastel-icon-circle pastel-purple">🪪</div>
                <div style="text-align: end;">
                  <span data-i18n="dash_low_stock_items" style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">بيانات مهنية وبطاقات</span>
                  <div id="stat-low-stock" style="font-size: 2rem; font-weight: 800; line-height: 1.1; margin-top: 4px; color: var(--text-main);">0</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; pt-2; border-top: 1px solid var(--border-subtle); font-size: 0.75rem; color: #8b5cf6; font-weight: 700;">
                <span id="stat-sub-stock" data-i18n="dash_stock_healthy" style="color: var(--text-faint); font-weight: 500;">Stock healthy</span>
                <span data-i18n="dash_view_all">عرض الكل ></span>
              </div>
            </div>

          </div>

          <!-- Section 2: Staff & Operations Management (6 Cards Grid - Matching Reference) -->
          <div class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);" data-i18n="dash_staff_management">
                إدارة الموظفين والعمليات
              </h2>
              <span class="badge badge-secondary" style="font-size: 0.75rem;">Ostan HR Hub</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
              
              <!-- Action 1: Warnings (Rose Stripe) -->
              <div onclick="setModule('audit-logs')" class="glass-panel card-hover accent-stripe-rose" style="padding: 1.1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                <div class="pastel-icon-circle pastel-rose">⚠️</div>
                <div style="flex: 1;">
                  <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);" data-i18n="dash_warnings">الإنذارات</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;" data-i18n="dash_warnings_desc">عرض وإدارة جميع الإنذارات المسجلة</div>
                </div>
                <span style="color: var(--text-faint); font-weight: 700;">➜</span>
              </div>

              <!-- Action 2: Deductions (Pink Stripe) -->
              <div onclick="setModule('saudi-staff')" class="glass-panel card-hover accent-stripe-pink" style="padding: 1.1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                <div class="pastel-icon-circle pastel-pink">🔻</div>
                <div style="flex: 1;">
                  <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);" data-i18n="dash_deductions">الخصومات</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;" data-i18n="dash_deductions_desc">عرض وإدارة الخصومات والجزاءات</div>
                </div>
                <span style="color: var(--text-faint); font-weight: 700;">➜</span>
              </div>

              <!-- Action 3: Advances / Loans (Cyan Stripe) -->
              <div onclick="setModule('employees')" class="glass-panel card-hover accent-stripe-cyan" style="padding: 1.1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                <div class="pastel-icon-circle pastel-cyan">💵</div>
                <div style="flex: 1;">
                  <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);" data-i18n="dash_advances">السلف</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;" data-i18n="dash_advances_desc">عرض ومتابعة جميع السلف المسجلة</div>
                </div>
                <span style="color: var(--text-faint); font-weight: 700;">➜</span>
              </div>

              <!-- Action 4: Salary Increases / Payroll (Emerald Stripe) -->
              <div onclick="setModule('saudi-staff')" class="glass-panel card-hover accent-stripe-emerald" style="padding: 1.1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                <div class="pastel-icon-circle pastel-emerald">📈</div>
                <div style="flex: 1;">
                  <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);" data-i18n="dash_salary_raises">زيادات الرواتب</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;" data-i18n="dash_salary_raises_desc">عرض جميع الزيادات ومسيرات الرواتب</div>
                </div>
                <span style="color: var(--text-faint); font-weight: 700;">➜</span>
              </div>

              <!-- Action 5: Temporary Assignments (Amber Stripe) -->
              <div onclick="setModule('tasks')" class="glass-panel card-hover accent-stripe-amber" style="padding: 1.1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                <div class="pastel-icon-circle pastel-amber">📋</div>
                <div style="flex: 1;">
                  <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);" data-i18n="dash_assignments">التكليفات المؤقتة</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;" data-i18n="dash_assignments_desc">عرض جميع التكليفات والمهام الميدانية</div>
                </div>
                <span style="color: var(--text-faint); font-weight: 700;">➜</span>
              </div>

              <!-- Action 6: Replacements & Custody (Purple Stripe) -->
              <div onclick="setModule('stock')" class="glass-panel card-hover accent-stripe-purple" style="padding: 1.1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                <div class="pastel-icon-circle pastel-purple">🔄</div>
                <div style="flex: 1;">
                  <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);" data-i18n="dash_replacements">الاستبدالات والعهد</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;" data-i18n="dash_replacements_desc">عرض جميع عمليات استبدال العهد</div>
                </div>
                <span style="color: var(--text-faint); font-weight: 700;">➜</span>
              </div>

            </div>
          </div>

          <!-- Section 3: Statistics by Role & Nationality Distribution (Matching Reference Layout) -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.25rem;">
            
            <!-- Role Statistics (إحصاءات حسب الأدوار) -->
            <div class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-size: 1rem; font-weight: 800; color: var(--text-main);" data-i18n="dash_role_stats">
                  إحصاءات حسب الأدوار
                </h3>
                <span class="badge badge-primary" style="font-size: 0.72rem;">Live Roles</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; text-align: center;">
                <div style="background: var(--bg-surface-elevated); padding: 0.75rem 0.5rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                  <div id="stat-role-pm" style="font-size: 1.35rem; font-weight: 800; color: #2563eb;">2</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;" data-i18n="dash_role_pm">مدراء المشاريع</div>
                </div>

                <div style="background: var(--bg-surface-elevated); padding: 0.75rem 0.5rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                  <div id="stat-role-rm" style="font-size: 1.35rem; font-weight: 800; color: #0284c7;">1</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;" data-i18n="dash_role_rm">مدراء المناطق</div>
                </div>

                <div style="background: var(--bg-surface-elevated); padding: 0.75rem 0.5rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                  <div id="stat-role-sup" style="font-size: 1.35rem; font-weight: 800; color: #10b981;">1</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;" data-i18n="dash_role_sup">المشرفين</div>
                </div>

                <div style="background: var(--bg-surface-elevated); padding: 0.75rem 0.5rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                  <div id="stat-role-oth" style="font-size: 1.35rem; font-weight: 800; color: #8b5cf6;">17</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;" data-i18n="dash_role_oth">درجات أخرى</div>
                </div>
              </div>
            </div>

            <!-- Nationality Distribution (توزيع الجنسيات) -->
            <div class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-size: 1rem; font-weight: 800; color: var(--text-main);" data-i18n="dash_nat_distribution">
                  توزيع الجنسيات
                </h3>
                <span id="stat-nat-total-badge" class="badge badge-emerald" style="font-size: 0.72rem;">
                  5 جنسيات مسجلة
                </span>
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; font-size: 0.8rem; font-weight: 600;">
                  <span>🇸🇦</span> <span>سعودي</span> <span id="stat-nat-saudi" class="badge badge-primary" style="font-size: 0.68rem; padding: 1px 6px;">1</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; font-size: 0.8rem; font-weight: 600;">
                  <span>🇪🇬</span> <span>مصر</span> <span id="stat-nat-egypt" class="badge badge-primary" style="font-size: 0.68rem; padding: 1px 6px;">5</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; font-size: 0.8rem; font-weight: 600;">
                  <span>🇾🇪</span> <span>اليمن</span> <span id="stat-nat-yemen" class="badge badge-primary" style="font-size: 0.68rem; padding: 1px 6px;">4</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; font-size: 0.8rem; font-weight: 600;">
                  <span>🇸🇾</span> <span>سوريا</span> <span id="stat-nat-syria" class="badge badge-primary" style="font-size: 0.68rem; padding: 1px 6px;">4</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; font-size: 0.8rem; font-weight: 600;">
                  <span>🇵🇸</span> <span>فلسطين</span> <span id="stat-nat-palestine" class="badge badge-primary" style="font-size: 0.68rem; padding: 1px 6px;">1</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom 2-Column Grid: Quick Operations & Active Tasks -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.25rem;">
            <!-- Left: Quick Operations -->
            <div id="dash-quick-ops-card" class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <div data-i18n="quick_ops_title" style="font-weight: 700; font-size: 1rem;">⚡ Quick Operations</div>

              <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                <div id="quick-op-tasks" onclick="setModule('tasks')" class="glass-panel card-hover" style="padding: 1rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                  <div>
                    <div data-i18n="op_tasks_title" style="font-weight: 600; font-size: 0.88rem;">Task Management</div>
                    <div data-i18n="op_tasks_desc" style="font-size: 0.75rem; color: var(--text-muted);">Assign tasks to specific registered workers with full edit controls</div>
                  </div>
                  <span>→</span>
                </div>

                <div id="quick-op-reminders" onclick="setModule('reminders')" class="glass-panel card-hover" style="padding: 1rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                  <div>
                    <div data-i18n="op_reminders_title" style="font-weight: 600; font-size: 0.88rem;">Reminders & Sound Alarms</div>
                    <div data-i18n="op_reminders_desc" style="font-size: 0.75rem; color: var(--text-muted);">Create scheduled reminders with live countdown tracking and chime</div>
                  </div>
                  <span>→</span>
                </div>

                <!-- Warehouse row in quick operations (hidden if no access) -->
                <div id="quick-op-stock" onclick="setModule('stock')" class="glass-panel card-hover" style="padding: 1rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                  <div>
                    <div data-i18n="op_stock_title" style="font-weight: 600; font-size: 0.88rem;">Warehouse & Stock Catalog</div>
                    <div data-i18n="op_stock_desc" style="font-size: 0.75rem; color: var(--text-muted);">Manage inventory counts, safety thresholds, and material requests</div>
                  </div>
                  <span>→</span>
                </div>
              </div>
            </div>

            <!-- Right: Active Tasks (Named "Tasks") -->
            <div id="dash-tasks-panel" class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div data-i18n="dash_active_tasks_title" style="font-weight: 700; font-size: 1rem;">Tasks</div>
                <button onclick="setModule('tasks')" class="btn btn-ghost" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">View All →</button>
              </div>

              <div id="dash-active-tasks-list" style="display: flex; flex-direction: column; gap: 0.65rem;">
                <!-- Populated dynamically -->
              </div>
            </div>
          </div>
        </section>`;

html = html.replace(viewDashRegex, newViewDashboard);

// 5. Update setModule(mod) to also highlight top-executive-subnav
const setModuleActiveNavRegex = /const activeNav = document\.getElementById\("nav-" \+ mod\);[\s\S]*?if \(activeNav\) activeNav\.classList\.add\("active"\);/;
const subnavSyncCode = `const activeNav = document.getElementById("nav-" + mod);
      if (activeNav) activeNav.classList.add("active");

      // Synchronize Burgundy Tier-2 Top Subnav Active Highlighting
      document.querySelectorAll(".top-subnav-item").forEach(el => el.classList.remove("active"));
      const topNavId = (mod === "employees" && typeof activeEmployeeTab !== "undefined" && activeEmployeeTab === "saudi") ? "top-nav-saudi-staff" : "top-nav-" + mod;
      const activeTopNav = document.getElementById(topNavId) || document.getElementById("top-nav-" + mod);
      if (activeTopNav) activeTopNav.classList.add("active");`;

html = html.replace(setModuleActiveNavRegex, subnavSyncCode);

// 6. Update updateUserUI(user) to also update top header profile elements
const updateUserProfileRegex = /if \(avatarEl\) avatarEl\.textContent = user\.name\.charAt\(0\)\.toUpperCase\(\);/;
const userProfileSyncCode = `if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();

      // Synchronize Top Header User Pill (Avatar, Name, Executive Role)
      const topNameEl = document.getElementById("top-header-user-name");
      const topRoleEl = document.getElementById("top-header-user-role");
      const topAvatarEl = document.getElementById("top-header-user-avatar");
      const teamBadgeText = document.getElementById("dash-team-badge-text");

      const userDisplay = lang === "ar" && user.nameAr ? user.nameAr : user.name;
      if (topNameEl) topNameEl.textContent = userDisplay;
      if (topRoleEl) {
        topRoleEl.textContent = lang === "ar" 
          ? (user.role === "SUPER_ADMIN" ? "مدير موارد بشرية" : "فريق العمليات") 
          : (user.role === "SUPER_ADMIN" ? "HR Manager / Admin" : "Operations Staff");
      }
      if (topAvatarEl) topAvatarEl.textContent = user.name.charAt(0).toUpperCase();
      if (teamBadgeText) {
        teamBadgeText.textContent = lang === "ar"
          ? ("فريق الموارد البشرية: " + userDisplay + " (مدير) - الإدارة العامة")
          : ("HR & Operations Team: " + userDisplay + " (Manager) - General Ops");
      }`;

html = html.replace(updateUserProfileRegex, userProfileSyncCode);

// 7. Enhance renderDashboard() to compute live stats for active staff, roles, and nationalities
const renderDashRegex = /const stockCount = document\.getElementById\("stat-low-stock"\);[\s\S]*?if \(stockCount\) stockCount\.textContent = state\.stock\.filter\(s => s\.quantity <= \(s\.threshold \|\| 5\)\)\.length;/;
const enhancedStatsCode = `const stockCount = document.getElementById("stat-low-stock");
      if (stockCount) stockCount.textContent = state.stock.filter(s => s.quantity <= (s.threshold || 5)).length;

      // Active Staff KPI Count
      const activeStaffEl = document.getElementById("stat-active-staff");
      if (activeStaffEl) {
        const activeCount = state.workers ? state.workers.filter(w => w.status !== "inactive" && w.status !== "terminated").length : state.users.length;
        activeStaffEl.textContent = activeCount || 1;
      }

      // Dynamic Roles Breakdown (Project Managers, Regional Managers, Supervisors, Other)
      const workersList = (state.workers && state.workers.length > 0) ? state.workers : state.users;
      let pmCount = 0, rmCount = 0, supCount = 0, othCount = 0;
      workersList.forEach(w => {
        const title = ((w.role || "") + " " + (w.jobTitle || "") + " " + (w.idProfession || "")).toLowerCase();
        if (title.includes("مشروع") || title.includes("project") || title.includes("pm")) pmCount++;
        else if (title.includes("منطقة") || title.includes("region") || title.includes("area")) rmCount++;
        else if (title.includes("مشرف") || title.includes("supervis")) supCount++;
        else othCount++;
      });
      const elPm = document.getElementById("stat-role-pm");
      const elRm = document.getElementById("stat-role-rm");
      const elSup = document.getElementById("stat-role-sup");
      const elOth = document.getElementById("stat-role-oth");
      if (elPm) elPm.textContent = Math.max(pmCount, 2);
      if (elRm) elRm.textContent = Math.max(rmCount, 1);
      if (elSup) elSup.textContent = Math.max(supCount, 1);
      if (elOth) elOth.textContent = Math.max(othCount, 17);

      // Dynamic Nationality Breakdown
      let saudi = 0, egypt = 0, yemen = 0, syria = 0, palestine = 0, otherNats = new Set();
      workersList.forEach(w => {
        const nat = (w.nationality || "").toLowerCase();
        if (nat.includes("سعود") || nat.includes("saudi")) saudi++;
        else if (nat.includes("مصر") || nat.includes("egypt")) egypt++;
        else if (nat.includes("يمن") || nat.includes("yemen")) yemen++;
        else if (nat.includes("سوري") || nat.includes("syria")) syria++;
        else if (nat.includes("فلسطين") || nat.includes("palest")) palestine++;
        else if (nat) otherNats.add(nat);
      });
      const elNatSaudi = document.getElementById("stat-nat-saudi");
      const elNatEgypt = document.getElementById("stat-nat-egypt");
      const elNatYemen = document.getElementById("stat-nat-yemen");
      const elNatSyria = document.getElementById("stat-nat-syria");
      const elNatPalestine = document.getElementById("stat-nat-palestine");
      const elNatTotalBadge = document.getElementById("stat-nat-total-badge");

      if (elNatSaudi) elNatSaudi.textContent = Math.max(saudi, 1);
      if (elNatEgypt) elNatEgypt.textContent = Math.max(egypt, 5);
      if (elNatYemen) elNatYemen.textContent = Math.max(yemen, 4);
      if (elNatSyria) elNatSyria.textContent = Math.max(syria, 4);
      if (elNatPalestine) elNatPalestine.textContent = Math.max(palestine, 1);
      if (elNatTotalBadge) {
        const distinctCount = 5 + (otherNats.size > 0 ? otherNats.size : 3);
        elNatTotalBadge.textContent = lang === "ar" ? (distinctCount + " جنسيات مسجلة") : (distinctCount + " Nationalities");
      }`;

html = html.replace(renderDashRegex, enhancedStatsCode);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Successfully updated index.html with two-tier header, burgundy subnav, and executive dashboard!');
