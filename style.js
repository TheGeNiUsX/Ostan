/**
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
      toast.style.cssText = `
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
      `;
      toast.innerHTML = `
        <div style="font-size: 1.3rem; line-height: 1;">🔔</div>
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 0.9rem; color: #38bdf8;">${title}</div>
          <div style="font-size: 0.78rem; color: #cbd5e1; margin-top: 2px;">${body}</div>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1rem; padding: 0 4px;">✕</button>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 5000);
    },
    init: function () {
      // Force default to light corporate theme on first load of this design version
      const versionKey = "ostan_theme_v2";
      let savedTheme = localStorage.getItem("ostan_theme");
      if (!localStorage.getItem(versionKey)) {
        savedTheme = "light";
        localStorage.setItem("ostan_theme", "light");
        localStorage.setItem(versionKey, "true");
      } else if (!savedTheme) {
        savedTheme = "light";
      }

      this.setTheme(savedTheme);

      const onDomReady = () => {
        updateThemeButtonUI();
        // Default sidebar to collapsed so it gives a clean full-screen dashboard
        const savedCollapsed = localStorage.getItem("ostan_sidebar_collapsed");
        const shouldCollapse = savedCollapsed === null ? true : (savedCollapsed === "true");
        const appShell = document.getElementById("app-shell-root") || document.querySelector(".app-shell");
        if (appShell && shouldCollapse) {
          appShell.classList.add("sidebar-collapsed");
        }
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onDomReady);
      } else {
        onDomReady();
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
