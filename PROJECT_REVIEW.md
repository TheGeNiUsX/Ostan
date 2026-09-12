# Ostan (أستان) — Project Savior & Master Knowledge Base
> **Project Savior Status:** 🟢 ACTIVE & UP TO DATE  
> **Last Updated:** September 12, 2026 (or current session)  
> **Target Audience:** Any AI Assistant (Google Antigravity, Claude, ChatGPT) or Engineer working on Ostan.  
> **Instruction for AI:** Read this document FIRST when beginning or resuming work. This file is the single source of truth for architecture, current status, recent fixes, known bugs, and the WhatsApp gateway lifecycle. Always update this file whenever new features or fixes are implemented.

---

## ⚡ Emergency Handoff & Quick Context (For Any AI Resuming Work)

If your context window was reset, pruned, or you are a new AI taking over:
1. **What is Ostan?** An enterprise-grade Operations, Staff Management, Task Dispatch, Inventory, and WhatsApp Automation platform for Saudi businesses with native dual-language (English LTR & Arabic RTL) support.
2. **How is the app hosted?**
   - **Frontend:** Hosted live at `https://thegeniusx.github.io` (and locally via Next.js at `localhost:3000` / standalone `index.html`).
   - **Backend WhatsApp Gateway:** Hosted on Render (`https://ostan-whatsapp-gateway.onrender.com`), with local/LAN fallback (`server/whatsapp-gateway.mjs` on port `5001`).
   - **Cloud Sync & Data Bus:** Google Cloud Firestore (Project `ostan-75a0c`).
   - **Relational Database:** PostgreSQL with Prisma ORM.
3. **What was the latest critical bug fixed?**
   - **The Problem:** When pairing a phone via WhatsApp Studio, the number linked successfully, then immediately vanished, followed by continuous flickering of `"⏳ Establishing WebSocket connection..."` and `"🔌 Not Connected"`. After about 60 seconds, the number would reappear. Furthermore, dispatching messages displayed: `⚠️ WhatsApp is not connected on the background gateway for this account`.
   - **The Root Cause:** In Baileys multi-device pairing, after scanning the QR code, WhatsApp MD servers perform a key handshake and emit code `515` (`restartRequired`), temporarily setting `session.status = 'connecting'` and `connected: false`. In `index.html`, condition 2 treated `connected === false` as a full disconnection, wiping `curSession.phone = ""` and resetting localStorage. Polling then alternated between `"connecting"` and `"disconnected"`. Additionally, `waQrTimerInterval` kept running while linked and restarted the socket at 0s, and the pre-flight dispatch check lacked a Firestore fallback for remote users (e.g. on GitHub Pages).
   - **The Resolution:** 
     1. Updated `handleLiveWhatsAppSnapshot` in `index.html`: if `hasPhone` is true, status is treated as linked even while `connecting` / syncing; the phone number is NEVER wiped. Condition 2 (reset) only triggers on explicit `loggedOut` or true unpaired states.
     2. Stopped `waQrTimerInterval` as soon as a phone is linked so it cannot trigger socket restarts mid-session.
     3. Added a Cloud Firestore fallback to the pre-flight check in `startWhatsAppCloudApiDispatch`, allowing remote users on GitHub Pages to seamlessly dispatch via the Cloud Firestore Outbox even if direct HTTP to the gateway fails.
     4. Optimized `server/whatsapp-gateway.mjs`: fast restart delay (600ms), `paired: true` flag synced to Firestore, auto-reconnect of saved sessions on gateway boot, and increased message send retry wait to 12s.

---

## 🏛️ Core Architecture & Tech Stack

| Component | Technology | Role & Behavior |
| :--- | :--- | :--- |
| **Frontend Shell** | Next.js 14+ (App Router) & Standalone HUD (`index.html`) | Full-screen responsive dashboard, zero-dependency vanilla JS core, CSS design tokens. |
| **Styling Engine** | `style.js` + Vanilla CSS Tokens | Dark/Light theme switching, dynamic CSS variables, glassmorphism, pulse indicators, Arabic typography (`Cairo`, `Inter`). |
| **Internationalization** | `translation.js` | Instant 1-click Arabic (RTL) / English (LTR) layout and dictionary swap without page reload. |
| **WhatsApp Engine** | `@whiskeysockets/baileys` v7.0.0-rc14 (`server/whatsapp-gateway.mjs`) | Multi-device companion WebSocket socket, Multi-User isolated session storage, QR generation, direct dispatch. |
| **Cloud Bus & Fallback** | Firebase Firestore (`ostan-75a0c`) | Outbox queue (`whatsappOutbox`), real-time session status (`whatsappSessions`), remote commands (`whatsappRequests`, `systemSettings/whatsapp_commands`), persistent credentials backup (`whatsappAuth`). |
| **Database** | PostgreSQL + Prisma ORM (`prisma/schema.prisma`) | Secure relational storage for Users, Roles, Tasks, Reminders, Stock, and Audit logs. |
| **Seed & Auth** | Custom Session Tokens + Bcrypt | 5 RBAC roles (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `EMPLOYEE`, `STOCK_MANAGER`). |

---

## 📱 WhatsApp Gateway Subsystem & Lifecyle

### 1. Dual-Path Architecture (Local HTTP + Cloud Firestore Bus)
Because Ostan users may access the app from localhost, LAN, or remote internet (`thegeniusx.github.io`):
- **Local/LAN Users:** Connect directly to `http://localhost:5001` or `http://<LAN_IP>:5001` via REST API (`/api/status`, `/api/send`, `/api/restart`, `/api/logout`).
- **Remote / Cloud Users (Widely Users):**
  - Communicate with the gateway asynchronously via Cloud Firestore!
  - **Status & QR:** Monitored via real-time Firestore listener on `whatsappSessions/{userId}`.
  - **Commands (Restart, Refresh, Logout):** Dispatched via `whatsappRequests/{userId}` or `systemSettings/whatsapp_commands`.
  - **Message Dispatch:** Remote client pushes to `whatsappOutbox/{msgId}` with `status: "pending"`. The gateway's real-time outbox listener picks it up, dispatches through Baileys, and updates `status: "sent"` with `messageId`.

### 2. Multi-User Session Isolation
- Each user (e.g. `u-osama`, `adel`, `faisal`) has their own distinct session:
  - Auth files stored in `whatsapp_sessions/user_{cleanUserId}/`
  - Firestore live state document: `whatsappSessions/{cleanUserId}`
  - Auth backup for ephemeral cloud restarts: `whatsappAuth/{cleanUserId}`
  - Super Admin audit trail: `whatsappAuditRegistry/{cleanPhone}`

### 3. QR Pairing & The Baileys Handshake Sequence
When a user scans the QR code:
1. `sock.ev.on('creds.update')` fires with `state.creds.me.id`.
2. Phone number is parsed from credentials (`session.phone = id.split(':')[0]`).
3. WhatsApp MD servers close the initial pairing socket with `statusCode: 515 (restartRequired)`.
4. The gateway restarts the socket with saved credentials after 600ms (`startWhatsAppSocketForUser`).
5. **CRITICAL:** While the authenticated persistent socket connects (3–15 seconds):
   - `session.phone` is ALREADY VALID.
   - `index.html` receives `{ status: "connecting", phone: "966...", paired: true }`.
   - The UI MUST show `Linked: +966... (Syncing session...)` and NOT wipe the number or show QR.
6. Once `connection === 'open'`, status becomes `connected`, indicator turns green `Linked: +966... (Active)`.

---

## 👥 Seed Testing Accounts & Roles

| Role | Email | Password | Name (EN / AR) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **`SUPER_ADMIN`** | `superadmin@ostan.internal` | `SuperAdmin123!` | Tariq Al-Otaibi / طارق العتيبي | Protected root administrator (mapped to `u-osama`) |
| **`ADMIN`** | `admin@ostan.internal` | `Admin123!` | Sara Al-Mansoor / سارة المنصور | Users, departments, settings |
| **`MANAGER`** | `manager@ostan.internal` | `Manager123!` | Khalid Al-Ghamdi / خالد الغامدي | Operations, tasks, requisitions |
| **`EMPLOYEE`** | `employee@ostan.internal` | `Employee123!` | Faisal Al-Harbi / فيصل الحربي | Tasks & reminders |
| **`STOCK_MANAGER`** | `stock@ostan.internal` | `Stock123!` | Reem Al-Dosari / ريم الدوسري | Warehouse inventory & stock thresholds |

---

## 🗺️ Key File Map & Responsibilities

- **`index.html`**:
  - The primary user dashboard.
  - Contains WhatsApp Pairing Studio, Message Composer, Dynamic Variables (`{name}`, `{role}`, `{company}`), Dispatch Runner Modal with anti-ban random delays and human stop points.
  - Key functions: `handleLiveWhatsAppSnapshot()`, `startWhatsAppCloudApiDispatch()`, `sendSingleMetaWhatsAppMessage()`, `startWhatsAppQRTimer()`, `stopWhatsAppQRTimer()`.
- **`server/whatsapp-gateway.mjs`**:
  - Standalone Node.js Baileys gateway service.
  - Multi-user companion socket manager, Cloud Firestore sync, Outbox listener, and REST API.
- **`render.yaml` & `Dockerfile`**:
  - Cloud deployment configuration for Render (service: `ostan-whatsapp-gateway`, persistent disk: `/app/whatsapp_sessions`).
- **`style.js`**:
  - Styling tokens, CSS variables, theme switching (Light / Dark), UI toasts, modal helpers.
- **`translation.js`**:
  - Master English and Arabic dictionary with complete coverage for UI strings.
- **`prisma/schema.prisma`**:
  - PostgreSQL database schema with models for User, Role, Department, Task, Reminder, StockItem, AuditLog.
- **`scripts/update-build-version.mjs`**:
  - Increments patch version in `version.json` and embeds build info in `index.html`.

---

## 🛠️ Operational Commands Reference

| Action | Command | Purpose |
| :--- | :--- | :--- |
| **Run Web App** | `npm run dev` | Starts Next.js dashboard at `http://localhost:3000` |
| **Run WhatsApp Gateway** | `npm run whatsapp` | Starts Baileys gateway on port 5001 (`server/whatsapp-gateway.mjs`) |
| **Seed Database** | `npm run db:seed` | Populates PostgreSQL with standard seed accounts |
| **Push Database Schema** | `npm run db:push` | Syncs Prisma schema with database |
| **Bump Build Version** | `npm run version:bump` | Increments patch version in `version.json` |

---

## 📝 Rules for Future AI Contributors

1. **Never wipe `curSession.phone`** when `status === 'connecting'` or during code `515` reconnects. Once paired, retain the phone number until the user explicitly logs out or unpairs from mobile.
2. **Always support remote clients:** Any new WhatsApp feature must function both via direct HTTP (for local users) AND via Firebase Cloud Firestore (for remote users on GitHub Pages or custom domains).
3. **Keep this file (`PROJECT_REVIEW.md`) updated:** Whenever adding an endpoint, modifying gateway behavior, changing roles, or fixing connection issues, document it in this file.
4. **Automatic Git Commit & Push (Mandatory):** Accept all code changes by default and automatically commit and push them to GitHub (`origin main`) whenever work is done or updated, ensuring GitHub Pages and the repository are always in sync.
