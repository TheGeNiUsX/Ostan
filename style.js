/**
 * Ostan Style, Sound Synthesizer & Toast Alert Utilities
 */

(function () {
  // Web Audio Synthesizer for Reminder Alarm & Notification Chimes
  function playSoundChime(freq1 = 659.25, freq2 = 880) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Tone 1
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

      // Tone 2
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

  window.OstanStyle = {
    playChime: playSoundChime,
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
    showToast: function (title, body) {
      playSoundChime(587.33, 880);
      const toast = document.createElement("div");
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10000;
        background: linear-gradient(135deg, rgba(26, 34, 52, 0.95), rgba(15, 23, 42, 0.98));
        border: 1px solid rgba(56, 189, 248, 0.35);
        border-radius: 12px;
        padding: 1rem 1.25rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        gap: 0.85rem;
        max-width: 400px;
        color: #f8fafc;
        animation: fadeIn 0.25s ease-out;
      `;
      toast.innerHTML = `
        <div style="font-size: 1.4rem; line-height: 1;">⚡</div>
        <div style="flex: 1;">
          <div style="font-weight: 800; font-size: 0.92rem; color: #38bdf8;">${title}</div>
          <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">${body}</div>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 1.1rem; padding: 0 4px;">✕</button>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 6000);
    },
    init: function () {
      const savedTheme = localStorage.getItem("ostan_theme") || "dark";
      this.setTheme(savedTheme);
    },
  };

  window.OstanStyle.init();
})();
