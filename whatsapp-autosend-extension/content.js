/**
 * Ostan WhatsApp Auto-Sender Engine (v3.0.0)
 * 
 * Features:
 * - Autonomous Queue Runner directly inside WhatsApp Web
 * - Zero Popup Blocker issues (tab navigates itself across all recipients)
 * - Real Anti-Ban delay countdown between contacts
 * - Strictly prevents duplicate sending
 * - Live HUD on screen showing progress and countdown
 */

(function () {
  console.log("[Ostan Auto-Sender v3.0] Initialized on:", window.location.href);

  // 1. If loaded on api.whatsapp.com, redirect to web.whatsapp.com
  if (window.location.hostname === "api.whatsapp.com") {
    const urlParams = new URLSearchParams(window.location.search);
    const phone = urlParams.get("phone") || "";
    const text = urlParams.get("text") || "";
    if (phone) {
      window.location.href = `https://web.whatsapp.com/send/?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}${window.location.hash || ""}`;
      return;
    }
  }

  // 2. Check for Queue payload in URL hash (#ostan_queue=...)
  if (window.location.hash && window.location.hash.includes("ostan_queue=")) {
    try {
      const rawHash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(rawHash);
      const encodedPayload = hashParams.get("ostan_queue");
      if (encodedPayload) {
        const decoded = JSON.parse(decodeURIComponent(encodedPayload));
        if (decoded && Array.isArray(decoded.items) && decoded.items.length > 0) {
          sessionStorage.setItem("ostan_active_queue", JSON.stringify(decoded));
          console.log("[Ostan Auto-Sender] Received and stored new dispatch queue:", decoded);
          // Clean hash from URL for cleaner display
          try {
            history.replaceState(null, "", window.location.pathname + window.location.search);
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error("[Ostan Auto-Sender] Failed to parse ostan_queue hash:", err);
    }
  }

  // 3. Create or get floating status HUD
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
      padding: 8px 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 25px rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      gap: 10px;
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

  // 4. Check if there is an active queue running
  let queue = null;
  try {
    const rawQueue = sessionStorage.getItem("ostan_active_queue");
    if (rawQueue) {
      queue = JSON.parse(rawQueue);
    }
  } catch (e) {
    queue = null;
  }

  // If no queue, check if single dispatch URL
  const urlParams = new URLSearchParams(window.location.search);
  const singlePhone = urlParams.get("phone") || "";
  const singleText = urlParams.get("text") || "";

  if (!queue && !singlePhone) {
    return;
  }

  let attempts = 0;
  const maxAttempts = 120;
  let hasSentThisItem = false;

  const currentItem = queue && Array.isArray(queue.items) ? queue.items[queue.currentIndex || 0] : { phone: singlePhone, text: singleText, name: singlePhone };
  const currentIndex = queue ? (queue.currentIndex || 0) : 0;
  const totalItems = queue ? queue.items.length : 1;
  const delaySecs = (queue && queue.delay) ? parseInt(queue.delay, 10) : 10;

  // De-duplication key
  const dedupeKey = `ostan_sent_idx_${currentIndex}_${currentItem.phone}`;
  if (sessionStorage.getItem(dedupeKey)) {
    console.log(`[Ostan Auto-Sender] Item ${currentIndex} already dispatched.`);
    if (queue && currentIndex + 1 < totalItems) {
      startQueueCountdown(queue, currentIndex);
    }
    return;
  }

  const pollInterval = setInterval(() => {
    attempts++;

    if (hasSentThisItem) {
      clearInterval(pollInterval);
      return;
    }

    // Auto-click intermediate buttons
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
      hasSentThisItem = true;
      sessionStorage.setItem(dedupeKey, "true");

      updateHud(`⚡ [${currentIndex + 1}/${totalItems}] Sending to ${currentItem.name || currentItem.phone}...`, "#10b981");

      setTimeout(() => {
        try {
          if (inputField) {
            inputField.focus();
          }

          // Click Send ONCE
          sendBtn.click();
          console.log(`[Ostan Auto-Sender] Successfully sent to ${currentItem.name || currentItem.phone}!`);

          // If there is a queue with more recipients, start the delay timer for next recipient!
          if (queue && currentIndex + 1 < totalItems) {
            startQueueCountdown(queue, currentIndex);
          } else {
            sessionStorage.removeItem("ostan_active_queue");
            updateHud(`🎉 Queue Finished! All ${totalItems} contacts sent successfully!`, "#25D366");
          }
        } catch (err) {
          console.error("[Ostan Auto-Sender] Error sending message:", err);
          updateHud("⚠️ Please click Send manually.", "#f59e0b");
        }
      }, 800);
    } else {
      updateHud(`⏳ [${currentIndex + 1}/${totalItems}] Loading ${currentItem.name || currentItem.phone} (${Math.round(attempts / 2)}s)...`, "#f59e0b");
    }

    if (attempts >= maxAttempts) {
      clearInterval(pollInterval);
      updateHud(`⚠️ Timeout for ${currentItem.name || currentItem.phone}.`, "#ef4444");
      if (queue && currentIndex + 1 < totalItems) {
        startQueueCountdown(queue, currentIndex);
      }
    }
  }, 500);

  function startQueueCountdown(activeQueue, currentIdx) {
    let remaining = delaySecs;
    const nextItem = activeQueue.items[currentIdx + 1];

    updateHud(`✅ Sent! Waiting ${remaining}s... Next: ${nextItem.name || nextItem.phone}`, "#10b981");

    const timer = setInterval(() => {
      remaining--;
      updateHud(`⏳ Anti-Ban Delay: ${remaining}s... Next: ${nextItem.name || nextItem.phone} [${currentIdx + 2}/${totalItems}]`, "#10b981");

      if (remaining <= 0) {
        clearInterval(timer);
        activeQueue.currentIndex = currentIdx + 1;
        sessionStorage.setItem("ostan_active_queue", JSON.stringify(activeQueue));

        updateHud(`🚀 Loading next recipient: ${nextItem.name || nextItem.phone}...`, "#25D366");

        // Navigate the same tab to the next contact (Never blocked by popup blockers!)
        const cleanPhone = nextItem.phone.replace(/[^0-9]/g, "");
        window.location.href = `https://web.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(nextItem.text || "")}`;
      }
    }, 1000);
  }
})();
