/**
 * Ostan WhatsApp Auto-Sender Content Script (v2.1.0)
 * - Session-storage deduplication: strictly prevents sending duplicate messages to the same contact
 * - Reload-aware: cleanly handles queue reloads across different recipients
 * - Intercepts api.whatsapp.com and forces web.whatsapp.com without desktop app
 */

(function () {
  console.log("[Ostan Auto-Sender v2.1.0] Loaded on:", window.location.href);

  // 1. If loaded on api.whatsapp.com, redirect to web.whatsapp.com
  if (window.location.hostname === "api.whatsapp.com") {
    const urlParams = new URLSearchParams(window.location.search);
    const phone = urlParams.get("phone") || "";
    const text = urlParams.get("text") || "";
    if (phone) {
      window.location.href = `https://web.whatsapp.com/send/?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`;
      return;
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const targetPhone = urlParams.get("phone") || "";
  const targetText = urlParams.get("text") || "";

  // Floating status pill HUD
  let hud = document.getElementById("ostan-auto-sender-hud");
  if (!hud) {
    hud = document.createElement("div");
    hud.id = "ostan-auto-sender-hud";
    hud.style.cssText = `
      position: fixed;
      top: 14px;
      right: 18px;
      z-index: 99999999;
      background: #111827;
      color: #ffffff;
      border: 2px solid #25D366;
      border-radius: 999px;
      padding: 8px 18px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 25px rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      pointer-events: none;
    `;
    hud.innerHTML = `
      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #25D366; box-shadow: 0 0 8px #25D366;"></span>
      <span id="ostan-hud-text">${targetPhone ? `⚡ Ostan Auto-Sender: Preparing ${targetPhone}...` : "🟢 Ostan Auto-Sender: Ready"}</span>
    `;
    document.body.appendChild(hud);
  }

  function updateHud(text, color = "#25D366") {
    const textEl = document.getElementById("ostan-hud-text");
    if (textEl) textEl.textContent = text;
    if (hud) hud.style.borderColor = color;
  }

  if (!targetPhone) {
    return;
  }

  // Session-storage deduplication: guarantees a contact never receives the same text twice in this session
  const cleanPhone = targetPhone.replace(/[^0-9]/g, "");
  const sendKey = `ostan_sent_${cleanPhone}_${encodeURIComponent(targetText.substring(0, 20))}`;
  if (sessionStorage.getItem(sendKey)) {
    console.log("[Ostan Auto-Sender] Already dispatched to this contact in this session. Guard active.");
    updateHud(`✅ Already sent to ${targetPhone}. Waiting for next recipient...`, "#25D366");
    return;
  }

  let attempts = 0;
  const maxAttempts = 120;
  let hasSent = false;

  function findSendButton() {
    return (
      document.querySelector('button[aria-label="Send"]') ||
      document.querySelector('button[aria-label="إرسال"]') ||
      document.querySelector('span[data-icon="send"]')?.closest("button") ||
      document.querySelector('span[data-icon="wds-ic-send-filled"]')?.closest("button") ||
      document.querySelector('span[data-icon="send-light"]')?.closest("button") ||
      document.querySelector('footer button:has(span[data-icon="send"])') ||
      document.querySelector('div[contenteditable="true"][data-tab="10"]')?.closest("footer")?.querySelector("button:last-child")
    );
  }

  function findMessageInput() {
    return (
      document.querySelector('div[contenteditable="true"][data-tab="10"]') ||
      document.querySelector('div[contenteditable="true"][role="textbox"]') ||
      document.querySelector('footer div[contenteditable="true"]')
    );
  }

  const pollInterval = setInterval(() => {
    attempts++;

    if (hasSent) {
      clearInterval(pollInterval);
      return;
    }

    // Auto-click intermediate buttons if present
    const actionBtn = document.getElementById("action-button");
    if (actionBtn && actionBtn.offsetParent !== null) {
      updateHud("⚡ Clicking 'Continue to Chat'...", "#10b981");
      actionBtn.click();
    }

    const useWebLink = document.querySelector('a[href*="web.whatsapp.com"]') || document.querySelector('#fallback_block a');
    if (useWebLink && useWebLink.offsetParent !== null) {
      updateHud("⚡ Clicking 'use WhatsApp Web'...", "#10b981");
      useWebLink.click();
    }

    const sendBtn = findSendButton();
    const inputField = findMessageInput();
    const hasText = inputField && inputField.textContent && inputField.textContent.trim().length > 0;

    if (sendBtn && (hasText || attempts > 10)) {
      clearInterval(pollInterval);
      hasSent = true;
      sessionStorage.setItem(sendKey, "true");

      updateHud(`⚡ Sending message to ${targetPhone}...`, "#10b981");

      setTimeout(() => {
        try {
          if (inputField) {
            inputField.focus();
          }

          // Single Send click (No duplicate Enter events)
          sendBtn.click();
          console.log(`[Ostan Auto-Sender] Single Send click executed for ${targetPhone}!`);

          updateHud(`✅ Sent to ${targetPhone}! Waiting for next recipient...`, "#25D366");
        } catch (err) {
          console.error("[Ostan Auto-Sender] Error clicking send:", err);
          updateHud("⚠️ Please click Send manually.", "#f59e0b");
        }
      }, 700);
    } else {
      updateHud(`⏳ Loading chat for ${targetPhone} (${Math.round(attempts / 2)}s)...`, "#f59e0b");
    }

    if (attempts >= maxAttempts) {
      clearInterval(pollInterval);
      updateHud("⚠️ Timeout. Please click Send manually.", "#ef4444");
    }
  }, 500);
})();
