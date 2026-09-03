/**
 * Ostan WhatsApp Auto-Sender Content Script
 * Automatically detects pre-filled messages and clicks the Send button inside WhatsApp Web.
 */

(function () {
  console.log("[Ostan Auto-Sender] Extension loaded on WhatsApp Web.");

  // Check if current URL is an automated dispatch (contains text parameter)
  const isDispatchUrl = window.location.href.includes("text=") || window.location.href.includes("send?phone=");

  // Create floating status pill HUD on the page
  const hud = document.createElement("div");
  hud.id = "ostan-auto-sender-hud";
  hud.style.cssText = `
    position: fixed;
    top: 14px;
    right: 18px;
    z-index: 9999999;
    background: #111827;
    color: #ffffff;
    border: 1px solid rgba(37, 211, 102, 0.4);
    border-radius: 999px;
    padding: 8px 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
    font-weight: 700;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    pointer-events: none;
  `;
  hud.innerHTML = `
    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #25D366; box-shadow: 0 0 8px #25D366;"></span>
    <span id="ostan-hud-text">${isDispatchUrl ? "⚡ Ostan: Preparing automated dispatch..." : "🟢 Ostan Auto-Sender: Active & Ready"}</span>
  `;
  document.body.appendChild(hud);

  function updateHud(text, color = "#25D366") {
    const textEl = document.getElementById("ostan-hud-text");
    if (textEl) textEl.textContent = text;
    hud.style.borderColor = color;
  }

  if (!isDispatchUrl) {
    // Regular browsing in WhatsApp Web
    return;
  }

  let attempts = 0;
  const maxAttempts = 90; // Wait up to 45 seconds for WhatsApp Web chat to fully initialize
  let hasSent = false;

  function findSendButton() {
    return (
      document.querySelector('button[aria-label="Send"]') ||
      document.querySelector('button[aria-label="إرسال"]') ||
      document.querySelector('span[data-icon="send"]')?.closest("button") ||
      document.querySelector('span[data-icon="wds-ic-send-filled"]')?.closest("button") ||
      document.querySelector('footer button:has(span[data-icon="send"])') ||
      document.querySelector('div[contenteditable="true"][data-tab="10"]')?.closest("footer")?.querySelector('button:last-child')
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

    const sendBtn = findSendButton();
    const inputField = findMessageInput();

    // Check if input box has content and send button is rendered
    const hasText = inputField && inputField.textContent && inputField.textContent.trim().length > 0;

    if (sendBtn && (hasText || attempts > 15)) {
      clearInterval(pollInterval);
      hasSent = true;

      updateHud("⚡ Ostan: Clicking Send button...", "#10b981");

      // Give WhatsApp a brief moment (800ms) to ensure state synchronization
      setTimeout(() => {
        try {
          // 1. Focus input
          if (inputField) {
            inputField.focus();
          }

          // 2. Click send button
          sendBtn.click();
          console.log("[Ostan Auto-Sender] Clicked Send button successfully!");

          // 3. Trigger Enter keypress as a robust backup
          if (inputField) {
            const enterEvent = new KeyboardEvent("keydown", {
              key: "Enter",
              code: "Enter",
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true
            });
            inputField.dispatchEvent(enterEvent);
          }

          updateHud("✅ Message Sent Successfully! Closing tab in 2s...", "#25D366");

          // Automatically close the popup tab after 2.5 seconds
          setTimeout(() => {
            try {
              window.close();
            } catch (e) {
              console.log("[Ostan Auto-Sender] Tab cannot auto-close (browser rule), leaving open.");
            }
          }, 2500);
        } catch (err) {
          console.error("[Ostan Auto-Sender] Error clicking send:", err);
          updateHud("⚠️ Error auto-clicking. Please click send.", "#f59e0b");
        }
      }, 800);
    } else {
      updateHud(`⏳ Ostan: Waiting for chat to load (${Math.round((attempts / 2))}s)...`, "#f59e0b");
    }

    if (attempts >= maxAttempts) {
      clearInterval(pollInterval);
      updateHud("⚠️ Timeout waiting for chat. Please click Send manually.", "#ef4444");
    }
  }, 500);
})();
