/**
 * Ostan Full-Screen Design System, HUD & Audio Alert Engine for Google Chrome
 */

(function () {
  const styleElement = document.createElement("style");
  styleElement.id = "ostan-fullscreen-styles";
  styleElement.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');

    :root {
      --bg-app: #0b0f19;
      --bg-surface: #111827;
      --bg-surface-elevated: #1a2234;
      --bg-surface-hover: #222d42;
      --bg-card: rgba(26, 34, 52, 0.75);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-strong: rgba(255, 255, 255, 0.16);

      --primary-500: #007aff;
      --primary-600: #0062cc;
      --primary-glow: rgba(0, 122, 255, 0.25);

      --emerald-500: #10b981;
      --amber-500: #f59e0b;
      --rose-500: #f43f5e;
      --cyan-500: #06b6d4;

      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-faint: #64748b;

      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 16px;
      --radius-full: 9999px;
      --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);
    }

    [data-theme="light"] {
      --bg-app: #f1f5f9;
      --bg-surface: #ffffff;
      --bg-surface-elevated: #f8fafc;
      --bg-surface-hover: #e2e8f0;
      --bg-card: rgba(255, 255, 255, 0.9);
      --border-subtle: #e2e8f0;
      --border-strong: #cbd5e1;

      --text-main: #0f172a;
      --text-muted: #64748b;
      --text-faint: #94a3b8;
      --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.08);
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-app);
      color: var(--text-main);
      -webkit-font-smoothing: antialiased;
    }

    [dir="rtl"] body {
      font-family: 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Modal / HUD Backdrop */
    .hud-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      animation: fadeIn 0.15s ease-out;
    }

    .hud-modal-box {
      width: 100%;
      max-width: 520px;
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      box-shadow: var(--shadow-lg);
      animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Floating Alert Notification */
    .hud-toast-alert {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 999;
      min-width: 340px;
      max-width: 420px;
      background: linear-gradient(135deg, #1e1b4b, #312e81);
      border: 2px solid #818cf8;
      border-radius: 14px;
      padding: 1rem 1.25rem;
      color: #ffffff;
      box-shadow: 0 10px 40px rgba(99, 102, 241, 0.5);
      animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      gap: 0.85rem;
      align-items: flex-start;
    }

    [dir="rtl"] .hud-toast-alert {
      right: auto;
      left: 24px;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.55rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #007aff;
      color: #fff;
    }
    .btn-primary:hover {
      background: #0062cc;
    }
    .btn-secondary {
      background: var(--bg-surface-elevated);
      color: var(--text-main);
      border-color: var(--border-subtle);
    }
    .btn-secondary:hover {
      background: var(--bg-surface-hover);
    }
    .btn-danger {
      background: rgba(244, 63, 94, 0.15);
      color: var(--rose-500);
      border-color: rgba(244, 63, 94, 0.3);
    }

    .input-field {
      width: 100%;
      padding: 0.65rem 0.85rem;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-size: 0.9rem;
      outline: none;
      font-family: inherit;
    }
    .input-field:focus {
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.6rem;
      font-size: 0.72rem;
      font-weight: 700;
      border-radius: var(--radius-full);
      white-space: nowrap;
    }
    .badge-primary { background: rgba(0, 122, 255, 0.15); color: #60a5fa; border: 1px solid rgba(0, 122, 255, 0.3); }
    .badge-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-rose { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }
  `;
  document.head.appendChild(styleElement);

  // Web Audio Synthesizer for Reminder Alarm Chime
  function playReminderChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Note 1 (E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      // Note 2 (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.9);
    } catch (e) {
      console.warn("Audio chime not supported or blocked by user gesture:", e);
    }
  }

  // Global Ostan Chrome Helper Object
  window.OstanStyle = {
    playChime: playReminderChime,
    setTheme: function (theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("ostan_theme", theme);
    },
    toggleTheme: function () {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      const next = cur === "dark" ? "light" : "dark";
      this.setTheme(next);
      return next;
    },
    setLanguage: function (lang) {
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
      localStorage.setItem("ostan_locale", lang);
    },
    toggleLanguage: function () {
      const cur = document.documentElement.getAttribute("lang") || "en";
      const next = cur === "en" ? "ar" : "en";
      this.setLanguage(next);
      return next;
    },
    showToast: function (title, body) {
      playReminderChime();
      const toast = document.createElement("div");
      toast.className = "hud-toast-alert";
      toast.innerHTML = `
        <div style="font-size:1.6rem; line-height:1;">⏰</div>
        <div style="flex:1;">
          <div style="font-weight:800; font-size:1rem; margin-bottom:2px;">${title}</div>
          <div style="font-size:0.85rem; opacity:0.9;">${body}</div>
        </div>
        <button onclick="this.parentElement.remove()" style="background:none; border:none; color:#fff; cursor:pointer; font-size:1.1rem; opacity:0.7;">✕</button>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 10000);
    },
    init: function () {
      const savedTheme = localStorage.getItem("ostan_theme") || "dark";
      const savedLang = localStorage.getItem("ostan_locale") || "en";
      this.setTheme(savedTheme);
      this.setLanguage(savedLang);
    },
  };

  window.OstanStyle.init();
})();
