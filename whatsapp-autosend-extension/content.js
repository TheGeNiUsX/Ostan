/**
 * Ostan WhatsApp Auto-Sender Content Script (v1.1.0)
 * Prevents opening the Windows Desktop app by forcing WhatsApp Web directly in the browser,
 * clicks "use WhatsApp Web" if a landing screen appears, and auto-clicks the Send button.
 */

(function () {
  console.log("[Ostan Auto-Sender] Initialized on:", window.location.href);

  // 1. If loaded on api.whatsapp.com, immediately redirect to web.whatsapp.com so Windows Desktop app never opens!
  if (window.location.hostname === "api.whatsapp.com") {
    const urlParams = new URLSearchParams(window.location.search);
    const phone = urlParams.get("phone") || "";
    const text = urlParams.get("text") || "";
    if (phone) {
      console.log("[Ostan Auto-Sender] Intercepted api.whatsapp.com, redirecting to web.whatsapp.com...");
      window.location.href = `https://web.whatsapp.com/send/?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`;
      return;
    }
  }

  // Check if current URL is an automated dispatch (contains text parameter)
  const isDispatchUrl = window.location.href.includes("text=") || window.location.href.includes("phone=");

  // Create floating status pill HUD
  const hud = document.createElement("div");
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
    <span id="ostan-hud-text">${isDispatchUrl ? "⚡ Ostan Auto-Sender: Initializing..." : "🟢 Ostan Auto-Sender: Ready"}</span>
  `;
  document.body.appendChild(hud);

  function updateHud(text, color = "#25D366") {
    const textEl = document.getElementById("ostan-hud-text");
    if (textEl) textEl.textContent = text;
    hud.style.borderColor = color;
  }

  if (!isDispatchUrl) {
    return;
  }

  let attempts = 0;
  const maxAttempts = 120; // 60 seconds maximum polling
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

    const sendBtn = findSendButton();
    const inputField = findMessageInput();

    const hasText = inputField && inputField.textContent && inputField.textContent.trim().length > 0;

    if (sendBtn && (hasText || attempts > 10)) {
      clearInterval(pollInterval);
      hasSent = true;

      updateHud("⚡ Clicking Send button...", "#10b981");

      setTimeout(() => {
        try {
          if (inputField) {
            inputField.focus();
          }

          // 1. Click Send button
          sendBtn.click();
          console.log("[Ostan Auto-Sender] Send button clicked successfully!");

          // 2. Dispatch Enter key events as a reliable backup
          if (inputField) {
            const down = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true });
            const press = new KeyboardEvent("keypress", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true });
            const up = new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true });
            inputField.dispatchEvent(down);
            inputField.dispatchEvent(press);
            inputField.dispatchEvent(up);
          }

          updateHud("✅ Message Sent! Closing tab in 2s...", "#25D366");

          // Auto-close tab after 2.5 seconds
          setTimeout(() => {
            try {
              window.close();
            } catch (e) {}
          }, 2500);
        } catch (err) {
          console.error("[Ostan Auto-Sender] Error clicking send:", err);
          updateHud("⚠️ Please click Send manually.", "#f59e0b");
        }
      }, 700);
    } else {
      updateHud(`⏳ Waiting for WhatsApp chat (${Math.round(attempts / 2)}s)...`, "#f59e0b");
    }

    if (attempts >= maxAttempts) {
      clearInterval(pollInterval);
      updateHud("⚠️ Timeout. Please click Send manually.", "#ef4444");
    }
  }, 500);
})();
