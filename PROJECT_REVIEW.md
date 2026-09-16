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
   - **Frontend:** Hosted live at `https://thegeniusx.github.io/Ostan/` (and locally via Next.js at `localhost:3000` / standalone `index.html`).
   - **Backend WhatsApp Gateway:** Hosted on Render (`https://ostan-whatsapp-gateway.onrender.com`), with local/LAN fallback (`server/whatsapp-gateway.mjs` on port `5001`).
   - **Cloud Sync & Data Bus:** Google Cloud Firestore (Project `ostan-75a0c`).
   - **Relational Database:** PostgreSQL with Prisma ORM.
3. **What were the latest critical bugs fixed?**
   - **Bug A — Disappearing Phone & WebSocket Loading Flicker:**
     - **Cause:** Baileys multi-device pairing emits code `515` (`restartRequired`) upon QR scan, temporarily setting `status = 'connecting'` and `connected: false`. In `index.html`, `connected === false` was checked prematurely, wiping `curSession.phone = ""` and clearing localStorage.
     - **Fix:** Preserved paired phone session across handshake reconnects; stopped QR countdown timer upon pairing; added Firestore fallback to pre-flight dispatch check.
   - **Bug B — Rapid Unlinking & Linking Loop (50+ Duplicate Notifications):**
     - **Cause:** When a previous logout/reset was performed, `loggedOut: true` was saved to Firestore with `{ merge: true }` and stale `whatsappRequests` were left undeleted. Because `syncSessionStateToFirestore` never explicitly cleared `loggedOut: false`, the document perpetually retained `loggedOut: true`. When Firestore snapshots arrived, `index.html` unlinked the session; then subsequent `/api/status` polls reconnected it, creating an infinite oscillate-and-toast loop.
     - **Fix:** 
       1. Prioritized `hasPhone` in `index.html`: if a phone is paired, it CANNOT be unlinked by an errant `loggedOut` flag. Explicit unpair only occurs when no phone is present.
       2. Explicitly sync `loggedOut: false` in `server/whatsapp-gateway.mjs` whenever a user has an active session.
       3. Automatically delete processed documents from `whatsappRequests` so old commands never re-execute.
       4. Added toast deduplication (`curSession._lastNotifiedPhone`) so "WhatsApp Connected!" only toasts once per session.

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

## 🎨 Executive Corporate Design System (Inspired by Reference ERP)

In September 2026, Ostan's UI was elevated to an executive corporate dashboard inspired by leading Middle Eastern enterprise ERPs (Gulf Horizons Group reference layout):
1. **Two-Tier Header Structure**:
   - **Tier 1 (Top Bar - Deep Charcoal / Navy `#0b0f15`)**:
     - Right: Company Brand Mark ("مجموعة أستان" / "OSTAN ENTERPRISE ERP") with architectural building glyph.
     - Center: Sleek dark search bar (`ابحث في الموظفين، المشاريع، المهام...`).
     - Left: Direct Power Logout (`⏻`), Active User Profile Pill (Avatar + Name "أسامة طويش" + Role "مدير موارد بشرية" / "HR Manager"), direct WhatsApp link (`💬`), Notifications Bell (`🔔`) with unread badge, and Language Toggle (`🌐 العربية`).
   - **Tier 2 (Burgundy / Wine Maroon Strip `#3b0910` - `#54111d`)**:
     - Horizontal module navigation bar stretching across the app:
       - 📊 لوحة التحكم (Dashboard)
       - 🏗️ المشاريع والمهام (Tasks)
       - 👥 الموظفين (Employees)
       - 🇸🇦 الكادر السعودي (Saudi Staff)
       - 📦 المخزون والعهد (Stock)
       - 💬 رسائل واتساب (WhatsApp Studio)
       - ⏰ التنبيهات (Reminders)
       - 📈 التقارير (Reports)
       - 📜 سجل العمليات (Audit Logs)
       - ⚙️ الإعدادات (Settings)
     - Active tab highlights with bright white text, subtle pill background, and active dot indicator.
2. **Surfaces & Color Palette**:
   - **App Canvas:** Cool light corporate slate (`#f4f6fa` / `#f8fafc`).
   - **Panels & Cards:** Pure crisp white (`#ffffff`) surfaces with subtle slate borders (`#e2e8f0`) and soft executive box shadows.
   - **Vertical Colored Accent Stripes (`border-inline-start: 4px solid ...`)**:
     - Blue `#2563eb`: Projects & Tasks
     - Cyan `#0284c7`: Total Employees & Advances
     - Emerald `#10b981`: Active Staff, National Staff & Payroll Increases
     - Rose `#ef4444`: Inactive Accounts, Warnings & Alerts
     - Purple `#8b5cf6`: Professional Badges, Stock & Custody Replacements
     - Pink `#f43f5e`: Deductions & Penalties
     - Amber `#f59e0b`: Temporary Assignments & Duties
3. **Executive Dashboard Sections**:
   - **Executive Welcome Banner:** "لوحة التحكم الإدارية" + "مرحباً بك، [اسم المستخدم]" + شارة حالة تشغيل النظام ("System Active & Operational").
   - **Top 4 Primary Metric Cards:** Total Employees (Cyan `#0284c7`), Open Tasks (Blue `#2563eb`), Upcoming Reminders (Rose `#ef4444`), Low Stock Items (Purple `#8b5cf6`).
   - **Quick Operations ("⚡ Quick Operations"):** Task Management, Reminders & Alarms, Warehouse & Stock Catalog.
   - **Active Tasks Panel ("Tasks"):** Real-time list of assigned tasks and status toggles.
   - *(Note: Cleaned up and removed unneeded sections as requested: Nationality Distribution, Staff Management action cards, and Role Statistics).*
4. **Fluid Collapsible Navigation Sidebar**:
   - 3-slashes toggle button (`☰`) in the top header.
   - Controls `.sidebar-collapsed` with smooth CSS grid transition (`grid-template-columns: 280px 1fr` ➔ `0px 1fr`).
   - Default state is collapsed to give full screen width; user preference remembered in `localStorage`.
5. **Brand Mark & User Profile Pill**:
   - Brand mark: Signature Ostan orbital vector mark + "Ostan" text only (removed "enterprise" and long titles).
   - User profile pill: Merged with name, avatar, role, and Door Exit with Arrow SVG icon for direct sign out.
6. **3-State Theme Management**:
   - Interactive Theme Button with active state display: `☀️ Light`, `🌙 Dark`, `🖥️ System` (with Arabic translations: `☀️ فاتح`, `🌙 داكن`, `🖥️ النظام`).
   - Cycles through modes on click, with complete Light Theme consistency across all views (white surfaces, subtle borders, slate typography).
   - Sidebar collapse eliminates content jamming: when `.sidebar-collapsed` is active, `.app-sidebar` applies `width: 0 !important; visibility: hidden !important; overflow: hidden !important;` so no text or floating icons bleed through, and `.main-wrapper` smoothly expands full width.
   - Fixed `.brand-logo-box` dimension clamping (`32px` width/height) to prevent SVG blowout.
   - Implemented `ostan_theme_v2` migration so existing browsers automatically default to the executive Light Theme on initial visit.
   - Restored full sidebar navigation layout styles (`.nav-item`, `.nav-sections-container`, `.nav-group-wrapper`, `.nav-section-title`): all items now stack vertically with proper margins, icons, and hover states, preventing inline wrapping.
   - Merged sidebar footer profile and sign-out button into a unified executive card featuring the user's avatar, name, badge, and a Door Exit with Arrow SVG logout button.

---

## 📝 Rules for Future AI Contributors

1. **Never wipe `curSession.phone`** when `status === 'connecting'` or during code `515` reconnects. Once paired, retain the phone number until the user explicitly logs out or unpairs from mobile.
2. **Always support remote clients:** Any new WhatsApp feature must function both via direct HTTP (for local users) AND via Firebase Cloud Firestore (for remote users on GitHub Pages or custom domains).
3. **Keep this file (`PROJECT_REVIEW.md`) updated:** Whenever adding an endpoint, modifying gateway behavior, changing roles, or fixing connection issues, document it in this file.
4. **Automatic Git Commit & Push (Mandatory):** Accept all code changes by default and automatically commit and push them to GitHub (`origin main`) whenever work is done or updated, ensuring GitHub Pages and the repository are always in sync.
5. **Preserve Corporate Design Integrity:** When adding new views or modal components, use the established executive white card styling (`glass-panel`), subtle borders (`var(--border-subtle)`), and appropriate color accent stripes matching the design tokens.

