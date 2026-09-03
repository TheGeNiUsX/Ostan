/**
 * Ostan WhatsApp Auto-Sender Content Script (v2.0.0)
 * - Prevents double-sending to the same contact
 * - Supports continuous multi-recipient queue navigation in the same tab
 * - Intercepts api.whatsapp.com and forces web.whatsapp.com without desktop app
 */

(function () {
  console.log("[Ostan Auto-Sender v2.0.0] Active and monitoring.");

  // 1. If loaded on api.whatsapp.com, immediately redirect to web.whatsapp.com so Windows Desktop app never opens!
  if (window.location.hostname === "api.whatsapp.com") {
    const urlParams = new URLSearchParams(window.location.search);
    const phone = urlParams.get("phone") || "";
    const text = urlParams.get("text") || "";
    if (phone) {
      window.location.href = `https://web.whatsapp.com/send/?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`;
      return;
    }
  }

  // Create floating status pill HUD
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
      <span id="ostan-hud-text">🟢 Ostan Auto-Sender: Ready</span>
    `;
    document.body.appendChild(hud);
  }

  function updateHud(text, color = "#25D366") {
    const textEl = document.getElementById("ostan-hud-text");
    if (textEl) textEl.textContent = text;
    if (hud) hud.style.borderColor = color;
  }

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

  let lastSentSignature = "";
  let isSendingInProgress = false;
  let currentAttempt = 0;

  // Continuous loop to support queue navigation across multiple contacts in the same tab
  setInterval(() => {
    // Check for intermediate landing pages ("Continue to Chat" or "use WhatsApp Web")
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

    const urlParams = new URLSearchParams(window.location.search);
    const phone = urlParams.get("phone") || "";
    const text = urlParams.get("text") || "";

    if (!phone) {
      return;
    }

    const currentSignature = `${phone}:::${text}`;

    // Already sent to this contact with this text?
    if (currentSignature === lastSentSignature) {
      return;
    }

    if (isSendingInProgress) {
      return;
    }

    currentAttempt++;

    const sendBtn = findSendButton();
    const inputField = findMessageInput();
    const hasText = inputField && inputField.textContent && inputField.textContent.trim().length > 0;

    if (sendBtn && (hasText || currentAttempt > 10)) {
      isSendingInProgress = true;
      updateHud(`⚡ Sending message to ${phone}...`, "#10b981");

      setTimeout(() => {
        try {
          if (inputField) {
            inputField.focus();
          }

          // Click Send button ONCE (Do NOT fire Enter key afterwards to prevent double sending!)
          sendBtn.click();
          lastSentSignature = currentSignature;
          console.log(`[Ostan Auto-Sender] Message successfully sent to ${phone}!`);

          updateHud(`✅ Sent to ${phone}! Waiting for next recipient...`, "#25D366");

          // Reset sending flag after delay to allow next queued recipient to process
          setTimeout(() => {
            isSendingInProgress = false;
            currentAttempt = 0;
          }, 3000);
        } catch (err) {
          console.error("[Ostan Auto-Sender] Error clicking send:", err);
          isSendingInProgress = false;
          updateHud("⚠️ Error auto-clicking. Please click send.", "#f59e0b");
        }
      }, 700);
    } else {
      updateHud(`⏳ Loading contact ${phone} (${Math.round(currentAttempt / 2)}s)...`, "#f59e0b");
    }
  }, 500);
})();
