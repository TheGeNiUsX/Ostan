const fs = require('fs');
const path = require('path');

console.log('=== APPLYING USER REFINEMENTS (5 REQUESTS) ===');

const indexPath = path.join(__dirname, '..', 'index.html');
const stylePath = path.join(__dirname, '..', 'style.js');
const pubStylePath = path.join(__dirname, '..', 'public', 'style.js');
const transPath = path.join(__dirname, '..', 'translation.js');
const pubTransPath = path.join(__dirname, '..', 'public', 'translation.js');

// 1. UPDATE style.js & public/style.js
const newStyleJs = `/**
 * Ostan Style, Sound Synthesizer & Toast Alert Utilities
 */

(function () {
  function playSoundChime(freq1 = 659.25, freq2 = 880) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.5);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq2, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio chime notice:", e);
    }
  }

  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function updateThemeButtonUI() {
    const btn = document.getElementById("theme-toggle-btn");
    const iconEl = document.getElementById("theme-btn-icon");
    const labelEl = document.getElementById("theme-btn-label");
    if (!btn) return;

    const mode = localStorage.getItem("ostan_theme") || "light";
    const lang = document.documentElement.getAttribute("lang") || "en";

    let icon = "☀️";
    let text = lang === "ar" ? "فاتح" : "Light";

    if (mode === "dark") {
      icon = "🌙";
      text = lang === "ar" ? "داكن" : "Dark";
    } else if (mode === "system") {
      icon = "🖥️";
      text = lang === "ar" ? "النظام" : "System";
    }

    if (iconEl) iconEl.textContent = icon;
    if (labelEl) labelEl.textContent = text;
  }

  function applyTheme(mode) {
    const effective = (mode === "system") ? getSystemTheme() : mode;
    document.documentElement.setAttribute("data-theme", effective);
    document.documentElement.setAttribute("data-theme-mode", mode);
    updateThemeButtonUI();
  }

  function toggleAppSidebar() {
    const appShell = document.getElementById("app-shell-root") || document.querySelector(".app-shell");
    if (!appShell) return;
    appShell.classList.toggle("sidebar-collapsed");
    const isCollapsed = appShell.classList.contains("sidebar-collapsed");
    try {
      localStorage.setItem("ostan_sidebar_collapsed", isCollapsed ? "true" : "false");
    } catch(e) {}
  }

  window.OstanStyle = {
    playChime: playSoundChime,
    toggleAppSidebar: toggleAppSidebar,
    updateThemeButtonUI: updateThemeButtonUI,
    setTheme: function (mode) {
      localStorage.setItem("ostan_theme", mode);
      applyTheme(mode);
    },
    toggleTheme: function () {
      const cur = localStorage.getItem("ostan_theme") || "light";
      const next = cur === "light" ? "dark" : cur === "dark" ? "system" : "light";
      this.setTheme(next);
      return next;
    },
    showToast: function (title, body) {
      playSoundChime(587.33, 880);
      document.querySelectorAll(".ostan-toast-alert").forEach(el => el.remove());

      window.systemNotificationHistory = window.systemNotificationHistory || [];
      try {
        if (!window.systemNotificationHistory.length) {
          const saved = localStorage.getItem("ostan_notifications_log");
          if (saved) window.systemNotificationHistory = JSON.parse(saved);
        }
      } catch(e) {}

      const notifItem = {
        id: "notif-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        title: title || "System Notification",
        body: body || "",
        type: "info",
        icon: "🔔",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        unread: true
      };

      window.systemNotificationHistory.unshift(notifItem);
      if (window.systemNotificationHistory.length > 200) window.systemNotificationHistory.pop();
      try {
        localStorage.setItem("ostan_notifications_log", JSON.stringify(window.systemNotificationHistory));
      } catch(e) {}

      if (typeof window.updateNotificationBellUI === "function") {
        try { window.updateNotificationBellUI(); } catch (e) {}
      }

      const toast = document.createElement("div");
      toast.className = "ostan-toast-alert";
      toast.style.cssText = \`
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10000;
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 0.9rem 1.2rem;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        gap: 0.85rem;
        max-width: 400px;
        color: #ffffff;
        animation: fadeIn 0.25s ease-out;
      \`;
      toast.innerHTML = \`
        <div style="font-size: 1.3rem; line-height: 1;">🔔</div>
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 0.9rem; color: #38bdf8;">\${title}</div>
          <div style="font-size: 0.78rem; color: #cbd5e1; margin-top: 2px;">\${body}</div>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1rem; padding: 0 4px;">✕</button>
      \`;
      document.body.appendChild(toast);
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 5000);
    },
    init: function () {
      const savedTheme = localStorage.getItem("ostan_theme") || "light";
      this.setTheme(savedTheme);

      // Restore or initialize sidebar collapse state
      const savedCollapsed = localStorage.getItem("ostan_sidebar_collapsed");
      const shouldCollapse = savedCollapsed === null ? true : (savedCollapsed === "true");
      const appShell = document.getElementById("app-shell-root") || document.querySelector(".app-shell");
      if (appShell && shouldCollapse) {
        appShell.classList.add("sidebar-collapsed");
      }

      if (window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
          if (localStorage.getItem("ostan_theme") === "system") {
            applyTheme("system");
          }
        });
      }
    }
  };

  window.toggleAppSidebar = toggleAppSidebar;
  window.updateThemeButtonUI = updateThemeButtonUI;
  window.OstanStyle.init();
})();
`;

fs.writeFileSync(stylePath, newStyleJs, 'utf8');
if (fs.existsSync(pubStylePath)) {
  fs.writeFileSync(pubStylePath, newStyleJs, 'utf8');
}
console.log('✅ Updated style.js with 3-state Theme Manager and Sidebar toggle');

// 2. UPDATE index.html
let html = fs.readFileSync(indexPath, 'utf8');

// Ensure html tag defaults to light
html = html.replace(/<html\s+lang="en"\s+dir="ltr"\s+data-theme="[^"]*">/i, '<html lang="en" dir="ltr" data-theme="light">');

// Update CSS rules for fluid sidebar toggle and complete Light Theme consistency
const cssReplacement = `    /* Edge-to-Edge Fluid Shell with Moveable Sidebar Interaction */
    .app-shell {
      display: grid;
      grid-template-columns: 280px 1fr;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      transition: grid-template-columns 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .app-shell.sidebar-collapsed {
      grid-template-columns: 0px 1fr;
    }

    .app-sidebar {
      background: var(--bg-surface);
      border-inline-end: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow-y: auto;
      user-select: none;
      width: 280px;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease, width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform, width;
      z-index: 30;
    }

    .app-shell.sidebar-collapsed .app-sidebar {
      width: 0;
      min-width: 0;
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
      border-inline-end: none;
    }

    [dir="ltr"] .app-shell.sidebar-collapsed .app-sidebar {
      transform: translateX(-100%);
    }
    [dir="rtl"] .app-shell.sidebar-collapsed .app-sidebar {
      transform: translateX(100%);
    }

    .main-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-app);
      min-width: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Light Mode Complete Consistency Across Every View */
    [data-theme="light"] {
      --bg-app: #f4f6fa;
      --bg-surface: #ffffff;
      --bg-surface-elevated: #f8fafc;
      --bg-surface-hover: #f1f5f9;
      --border-subtle: #e2e8f0;
      --border-strong: #cbd5e1;
      --text-main: #0f172a;
      --text-muted: #475569;
      --text-faint: #94a3b8;
      --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      --card-shadow-hover: 0 8px 20px -4px rgba(0, 0, 0, 0.08);
    }

    [data-theme="light"] .glass-panel {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
      color: #0f172a !important;
    }

    [data-theme="light"] .app-sidebar {
      background: #ffffff !important;
      border-inline-end: 1px solid #e2e8f0 !important;
    }

    [data-theme="light"] .nav-section-title {
      color: #64748b !important;
    }

    [data-theme="light"] .nav-item {
      color: #475569 !important;
    }

    [data-theme="light"] .nav-item:hover {
      background: #f1f5f9 !important;
      color: #0f172a !important;
    }

    [data-theme="light"] .nav-item.active {
      background: rgba(84, 17, 29, 0.08) !important;
      color: #54111d !important;
      border-inline-start: 3px solid #54111d !important;
    }

    [data-theme="light"] .input-field {
      background: #ffffff !important;
      border: 1px solid #cbd5e1 !important;
      color: #0f172a !important;
    }

    [data-theme="light"] .input-field:focus {
      border-color: #2563eb !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
    }

    [data-theme="light"] .btn-secondary {
      background: #ffffff !important;
      border: 1px solid #cbd5e1 !important;
      color: #1e293b !important;
    }

    [data-theme="light"] .btn-secondary:hover {
      background: #f8fafc !important;
      border-color: #94a3b8 !important;
    }

    [data-theme="light"] .btn-ghost {
      color: #475569 !important;
    }

    [data-theme="light"] .btn-ghost:hover {
      background: #f1f5f9 !important;
      color: #0f172a !important;
    }

    [data-theme="light"] .hud-modal-box {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      color: #0f172a !important;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15) !important;
    }

    [data-theme="light"] .matrix-table th {
      background: #f8fafc !important;
      color: #475569 !important;
      border-bottom: 1px solid #e2e8f0 !important;
    }

    [data-theme="light"] .matrix-table td {
      border-bottom: 1px solid #e2e8f0 !important;
      color: #0f172a !important;
    }

    [data-theme="light"] #notif-bell-dropdown {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12) !important;
      color: #0f172a !important;
    }
`;

// Replace shell and sidebar styles
html = html.replace(/\/\* Edge-to-Edge Grid Shell \*\/[\s\S]*?\.main-wrapper\s*\{[\s\S]*?\}/, cssReplacement);

// 3. Update top-header markup with:
// - 3-slashes toggle button
// - Logo + "Ostan" only (no enterprise text)
// - Merged user pill with Door Exit SVG
// - Theme toggle button with icon & state label
const topHeaderRegex = /<!-- Top Navigation Header Tier 1[\s\S]*?<\/header>/;
const newTopHeader = `<!-- Top Navigation Header Tier 1 (Dark Slate / Deep Navy #0b0f15) -->
      <header class="top-header">
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <!-- 3 Slashes Settings/Sidebar Toggle Button -->
          <button id="btn-mobile-menu-toggle" class="btn btn-ghost" onclick="toggleAppSidebar()" aria-label="Toggle Navigation Menu" title="Toggle Sidebar (تبديل القائمة الجانبية)" style="padding: 0.4rem 0.65rem; font-size: 1.25rem; line-height: 1; color: #ffffff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);">
            <span>☰</span>
          </button>

          <!-- Ostan Vector Brand Logo & Name (No Enterprise Text) -->
          <div style="display: flex; align-items: center; gap: 0.65rem; cursor: pointer;" onclick="setModule('dashboard')">
            <div class="brand-logo-box" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.6));">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <path d="M 50 10 A 40 40 0 1 1 18 78 A 32 32 0 1 0 50 20 A 30 30 0 0 1 76 34 A 40 40 0 0 0 50 10 Z" fill="#38bdf8" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="#818cf8" stroke-width="2.5" />
              </svg>
            </div>
            <span style="font-weight: 800; font-size: 1.35rem; letter-spacing: -0.02em; color: #ffffff;">Ostan</span>
          </div>

          <!-- Desktop Search Bar -->
          <div class="desktop-search-bar" style="position: relative; max-width: 320px; width: 100%; margin-inline-start: 1rem;">
            <input type="text" placeholder="Search across modules..." data-i18n-placeholder="search_placeholder" class="input-field" style="padding-inline-start: 2.2rem; background: #131926; border-color: #243046; color: #f8fafc; font-size: 0.82rem; height: 36px; border-radius: 8px;">
            <span style="position: absolute; inset-inline-start: 10px; top: 9px; color: #64748b; font-size: 0.85rem;">🔍</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.65rem; position: relative;">
          <!-- Merged User Profile Pill with Door Exit Arrow Icon -->
          <div id="top-header-user-pill" style="display: flex; align-items: center; gap: 0.55rem; padding: 0.25rem 0.45rem 0.25rem 0.75rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); border-radius: 9999px;">
            <div id="top-header-user-avatar" class="user-avatar-circle" style="width: 30px; height: 30px; font-size: 0.82rem; font-weight: 800; background: linear-gradient(135deg, #2563eb, #7c3aed); border: 1.5px solid rgba(255,255,255,0.6); box-shadow: 0 1px 3px rgba(0,0,0,0.3); cursor: pointer;" onclick="setModule('settings')">
              O
            </div>
            <div style="text-align: start; line-height: 1.2; cursor: pointer;" onclick="setModule('settings')">
              <div id="top-header-user-name" style="font-weight: 700; font-size: 0.82rem; color: #ffffff; white-space: nowrap;">Osama</div>
              <div id="top-header-user-role" style="font-size: 0.68rem; color: #94a3b8; font-weight: 500;">Admin</div>
            </div>
            <div style="width: 1px; height: 18px; background: rgba(255,255,255,0.2); margin-inline: 0.25rem;"></div>
            <!-- Door Exit with Arrow Icon (Merged with Name) -->
            <button onclick="userLogout()" class="btn btn-ghost" style="padding: 0.3rem 0.45rem; color: #f87171; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease;" title="Sign Out (تسجيل الخروج)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>

          <!-- Quick WhatsApp Link -->
          <button onclick="setModule('messages')" class="btn btn-ghost" style="color: #22c55e; padding: 0.4rem 0.55rem; font-size: 1.05rem;" title="WhatsApp Studio (استوديو واتساب)">
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

          <!-- 3-State Theme Toggle (Light / Dark / System) with Dynamic Label -->
          <button id="theme-toggle-btn" class="btn btn-secondary" onclick="window.OstanStyle.toggleTheme()" style="padding: 0.4rem 0.75rem; font-size: 0.78rem; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.14); color: #fff; display: inline-flex; align-items: center; gap: 0.4rem;" title="Switch Theme: Light / Dark / System (تبديل الثيم)">
            <span id="theme-btn-icon">☀️</span>
            <span id="theme-btn-label">Light</span>
          </button>
        </div>
      </header>`;

html = html.replace(topHeaderRegex, newTopHeader);

// 4. Update view-dashboard: remove the 3 unwanted sections and keep clean executive dashboard
const viewDashboardRegex = /<section id="view-dashboard"[\s\S]*?<\/section>/;
const cleanDashboardHtml = `<section id="view-dashboard" style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Executive Welcome Header Banner -->
          <div class="glass-panel" style="padding: 1.5rem 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem; border-inline-start: 4px solid var(--primary-500);">
            <div>
              <div style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em;" data-i18n="dash_exec_title">
                لوحة التحكم الإدارية
              </div>
              <div id="dash-greeting-text" style="font-size: 0.95rem; font-weight: 600; color: var(--text-muted); margin-top: 4px;">
                Good afternoon, Osama
              </div>
            </div>

            <!-- Operations Status Indicator -->
            <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 1rem; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 9999px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
              <span style="font-size: 0.82rem; font-weight: 700; color: #10b981;" data-i18n="system_status_operational">
                System Active & Operational
              </span>
            </div>
          </div>

          <!-- Operation Metric Cards Grid (4 Primary KPI Cards with Colored Accent Stripes) -->
          <div id="dash-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
            
            <!-- Card 1: Total Employees -->
            <div id="card-total-employees" class="glass-panel card-hover accent-stripe-cyan" style="padding: 1.25rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onclick="setModule('employees')">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div class="pastel-icon-circle pastel-cyan">👥</div>
                <div style="text-align: end;">
                  <span data-i18n="dash_total_employees" style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">Total Employees</span>
                  <div id="stat-total-employees" style="font-size: 2rem; font-weight: 800; line-height: 1.1; margin-top: 4px; color: var(--text-main);">1</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; pt-2; border-top: 1px solid var(--border-subtle); font-size: 0.75rem; color: #0284c7; font-weight: 700;">
                <span id="stat-sub-employees" data-i18n="dash_active_on_duty" style="color: var(--text-faint); font-weight: 500;">1 Active on Duty</span>
                <span data-i18n="dash_view_all">View All →</span>
              </div>
            </div>

            <!-- Card 2: Open Tasks -->
            <div id="card-open-tasks" class="glass-panel card-hover accent-stripe-blue" style="padding: 1.25rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onclick="setModule('tasks')">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div class="pastel-icon-circle pastel-blue">🏗️</div>
                <div style="text-align: end;">
                  <span id="label-stat-tasks" data-i18n="dash_open_tasks" style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">Open Tasks</span>
                  <div id="stat-open-tasks" style="font-size: 2rem; font-weight: 800; line-height: 1.1; margin-top: 4px; color: var(--text-main);">0</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; pt-2; border-top: 1px solid var(--border-subtle); font-size: 0.75rem; color: #2563eb; font-weight: 700;">
                <span id="stat-sub-tasks" data-i18n="dash_all_tasks_completed" style="color: var(--text-faint); font-weight: 500;">All tasks up to date</span>
                <span data-i18n="dash_view_all">View All →</span>
              </div>
            </div>

            <!-- Card 3: Upcoming Reminders -->
            <div id="card-upcoming-reminders" class="glass-panel card-hover accent-stripe-rose" style="padding: 1.25rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onclick="setModule('reminders')">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div class="pastel-icon-circle pastel-rose">⏰</div>
                <div style="text-align: end;">
                  <span data-i18n="dash_upcoming_reminders" style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">Upcoming Reminders</span>
                  <div id="stat-upcoming-reminders" style="font-size: 2rem; font-weight: 800; line-height: 1.1; margin-top: 4px; color: var(--text-main);">0</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; pt-2; border-top: 1px solid var(--border-subtle); font-size: 0.75rem; color: #ef4444; font-weight: 700;">
                <span id="stat-sub-reminders" data-i18n="dash_no_reminders" style="color: var(--text-faint); font-weight: 500;">No pending alerts</span>
                <span data-i18n="dash_view_alerts">View Alerts →</span>
              </div>
            </div>

            <!-- Card 4: Low Stock Items -->
            <div id="card-low-stock" class="glass-panel card-hover accent-stripe-purple" style="padding: 1.25rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onclick="setModule('stock')">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div class="pastel-icon-circle pastel-purple">📦</div>
                <div style="text-align: end;">
                  <span data-i18n="dash_low_stock_items" style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">Low Stock Items</span>
                  <div id="stat-low-stock" style="font-size: 2rem; font-weight: 800; line-height: 1.1; margin-top: 4px; color: var(--text-main);">0</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; pt-2; border-top: 1px solid var(--border-subtle); font-size: 0.75rem; color: #8b5cf6; font-weight: 700;">
                <span id="stat-sub-stock" data-i18n="dash_stock_healthy" style="color: var(--text-faint); font-weight: 500;">Stock healthy</span>
                <span data-i18n="dash_view_all">View All →</span>
              </div>
            </div>

          </div>

          <!-- Bottom 2-Column Grid: Quick Operations & Active Tasks -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.25rem;">
            <!-- Left: Quick Operations -->
            <div id="dash-quick-ops-card" class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <div data-i18n="quick_ops_title" style="font-weight: 700; font-size: 1rem; color: var(--text-main);">⚡ Quick Operations</div>

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
                <div data-i18n="dash_active_tasks_title" style="font-weight: 700; font-size: 1rem; color: var(--text-main);">Tasks</div>
                <button onclick="setModule('tasks')" class="btn btn-ghost" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">View All →</button>
              </div>

              <div id="dash-active-tasks-list" style="display: flex; flex-direction: column; gap: 0.65rem;">
                <!-- Populated dynamically -->
              </div>
            </div>
          </div>
        </section>`;

html = html.replace(viewDashboardRegex, cleanDashboardHtml);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Updated index.html successfully with brand, merged user pill, theme button, and clean dashboard!');

// 5. UPDATE translation.js & public/translation.js
function updateDictionary(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  const enKeys = `      theme_light: "Light",
      theme_dark: "Dark",
      theme_system: "System",
      system_status_operational: "System Active & Operational",
      auth_logout_door: "Sign Out",
`;

  const arKeys = `      theme_light: "فاتح",
      theme_dark: "داكن",
      theme_system: "النظام",
      system_status_operational: "النظام نشط ويعمل بكفاءة",
      auth_logout_door: "تسجيل الخروج",
`;

  if (!code.includes('theme_light:')) {
    code = code.replace(/(en:\s*\{[\r\n]+)/, `$1${enKeys}`);
    code = code.replace(/(ar:\s*\{[\r\n]+)/, `$1${arKeys}`);
  }

  // Ensure applyTranslations calls updateThemeButtonUI
  if (!code.includes('updateThemeButtonUI()')) {
    code = code.replace(/(applyTranslations\s*\([^\)]*\)\s*\{[\s\S]*?localStorage\.setItem\("ostan_locale",\s*targetLang\);)/, `$1\n    if (typeof window.updateThemeButtonUI === "function") { window.updateThemeButtonUI(); }`);
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log("✅ Updated " + filePath);
}

updateDictionary(transPath);
updateDictionary(pubTransPath);
console.log('=== USER REFINEMENTS COMPLETE ===');
