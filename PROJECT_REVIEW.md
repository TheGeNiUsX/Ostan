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
   - Fixed navigation toggle between Employees and Saudi Staff: `setModule(mod, subTab)` now automatically activates the requested sub-tab (defaulting to `'all'` when selecting Employees). Synchronized both top burgundy bar items (`top-nav-employees`, `top-nav-saudi-staff`) and sidebar items (`nav-employees`, `nav-saudi-staff`) inside `setEmployeeViewTab`, ensuring instant toggling between All Employees and Saudi Staff.
7. **Inventory Orders & Automated Live Stock Deduction**:
   - Added dedicated Orders Section (`view-orders`) accessible via sidebar (`nav-orders`) and top burgundy subnav (`top-nav-orders`).
   - Manual Order Creator (`openCreateOrderModal`) with dynamic line items, item selector from live warehouse inventory (`state.stock`), and stock limit validation.
   - Excel Batch Import Engine (`modal-orders-excel-import`) supporting `.xlsx`, `.xls`, `.csv` with intelligent dual-format template detection:
     - **Format 1 (English Uniform Dispatch):** Columns `City` | `SPV` | `Merchandiser Name` | `USER REF.#` | `T-shirt size` | `Quantity` | `Mobile`.
     - **Format 2 (Arabic Tools & Gear Dispatch):** Columns `المدينة` | `المشرف` | `جوال المشرف` | `الاسم` | `المقاس` | `عمود1 (الكمية)` | `عمود2 (الأدوات/البيان)`.
     - **Multi-Dimensional Counting & Aggregation Matrix:** Automatically breaks down every imported order by:
       - **City (المدينة):** Total workers and total units per city (e.g., Dammam, Jubail, Khobar, Hafar Al-Batin, Al-Ahsa).
       - **Size (المقاس):** Distribution matrix across sizes (`M`, `L`, `XL`, `2XL`, `3XL`, `4XL`, `5XL`, `Standard`) with size normalization (`XXL` ➔ `2XL`, `XXXL` ➔ `3XL`).
       - **Quantity (الكمية):** Net total items to dispatch, correctly filtering out rows with `0` quantity while preserving line records.
   - Live Inventory Deduction Workflow: when an order is marked as `DONE`, items are automatically deducted from `state.stock`, warehouse views update live, and low stock threshold alerts trigger automatically. Includes automatic inventory rollback if a completed order is cancelled.
   - Cancelled & Completed Order Deletion Governance (`deleteOrder` & `deleteAllCancelledOrders`):
      - Individual deletion directly from table row actions with red trash button (`🗑️ حذف`).
      - In-modal deletion button inside the Order Details slip for cancelled orders.
      - **Super Admin Restriction on Completed Orders:** Orders marked as `DONE` can ONLY be deleted by the Super Admin (`isMasterSuperAdmin(user)`). Non-superadmin users are restricted from deleting completed/dispatched records to preserve audit and inventory integrity.
      - Bulk deletion banner when viewing the Cancelled filter (`Cancelled (ملغي)`) allowing single-click cleanup of all archived/cancelled orders with confirmation and live localStorage persistence.
    - Order Details & Dispatch Receipt Modal (`modal-order-details`) with printable layout (`window.print()`).
8. **Inventory & Orders Architecture Upgrades**:
   - **Executive 1-Look UI Scaling:** Expanded modal widths (`#modal-orders-excel-import` ➔ `980px`, `#modal-order-details` ➔ `960px`, `#modal-stock` ➔ `680px`), converted batch Excel preview into a spacious 4-column telemetry dashboard with horizontal size badges and city cards, eliminating restrictive inner scrollbars so users see all telemetry at a glance without scrolling down.
   - **Stock Requests Positioning:** Reordered inventory navigation so `Stock Requests` is positioned directly under `Orders & Fulfillment` in both the primary sidebar and the top burgundy subnav bar (`#top-nav-stock-requests`), removing the word "Organizations" for clean executive terminology.
   - **Project Name Association:** Added `Project Name / اسم المشروع` (`#stock-project`) inside the Add/Edit Inventory Item modal with automated persistence (`s.projectName`) and visual badge indicators (`🏗️ {projectName}`) on warehouse cards.
   - **Super Admin Category & Fallback Icon Management:**
     - Dynamic category and fallback icon registry (`state.stockCategories` & `state.stockIcons`) with localStorage persistence.
     - Dedicated Category Manager (`#modal-stock-category-manager`) for Super Admin to add, rename, and delete categories (with automated item reassignment to General).
     - Dedicated Icon Manager (`#modal-stock-icon-manager`) for Super Admin to add custom emoji icons and labels. Non-superadmin access is strictly blocked.
9. **Super Admin System-Wide Category Governance & User Profile Experience**:
   - **System-Wide Categories Management in Settings (`view-settings`):** Added a dedicated, Super Admin-exclusive central management portal (`#settings-categories-container`) to manage categories across all sections of the project:
     - Clear section demarcation badges for `📦 المخزون والمستودع`, `📋 الطلبيات والتوريد`, `✅ المهام والعمليات`, `👥 الكادر والموارد البشرية`.
     - Full CRUD capabilities: adding new categories with section selection and usage clarification, editing category names (with automated propagation to existing items), and deleting categories with safety fallback reassignment.
     - Real-time linked items count computation per category.
   - **Hidden User Profile Page (`view-profile`):** Built an executive personal profile portal hidden from main navigation menus and accessible exclusively by clicking on the user's name or avatar in the sidebar footer or top header:
     - Displays comprehensive personnel, security clearance, account status, and session details.
     - Includes in-place profile editor modal (`#modal-edit-user-profile`) to update display name, mobile number, and password with real-time UI synchronization.
10. **Executive Category Modal UI, Single-Source Category Sync & "Submit Requests" Renaming**:
    - **Executive Category Form Modal (`#modal-system-category-form`):** Completely eradicated browser `prompt()` popup dialogs for category creation and editing. Implemented a modern modal dialog featuring 4 visual interactive radio cards for target module selection (`📦 المخزون والمستودع`, `📋 الطلبيات والتوريد`, `✅ المهام والعمليات`, `👥 الكادر والموارد البشرية`), category name text input, and clarification/scope textarea.
    - **Single Source of Truth for Warehouse Categories:** Unified `getStoredStockCategories()` to query directly from `getSystemWideCategories().filter(c => c.section === "stock")`. Automated dynamic option rendering in `openStockHUD()` and `editStockById()`, ensuring any category created in Whole Project Categories (e.g., `T-Shirt (تيشيرت)`) instantly appears in the Add/Edit Inventory Item modal (`#stock-category` select).
    - **Strict "Submit Requests" Section Naming:** Renamed the sidebar item, top subnav item, view heading, and localization keys (`nav_stock_requests`, `requests_section_title`) from "Stock Requests (Organizations)" strictly to **"Submit Requests"** (Arabic: **"تقديم طلبات الصرف"**), removing the word "Organizations" completely while maintaining its structural position under `Orders & Fulfillment`.
11. **Excel Project Recognition (`المشروع`), Multi-Project Order Separation & Display**:
    - **Adaptive Excel Project Column Parsing & Strict Row-Level Scoping:** Added intelligent detection for the `"المشروع"` (Project / Client) column in incoming Excel order files. Strict per-row scoping guarantees project names (e.g. `نادك`) are only applied to rows where the project is explicitly specified, preventing accidental city-wide leakage (e.g. counting strictly 1 worker / 2 pieces for Nadec instead of incorrectly grouping all 5 workers of Al-Ahsa into Nadec).
    - **Separate Orders for Distinct Projects & Non-Project City Rosters:** If an uploaded Excel file contains designated projects (e.g. `نادك`) alongside unassigned or different project rows, the system automatically separates them into independent orders:
      - Designated Project orders (e.g., `مشروع نادك (بلال محمد)` with 1 worker and 2 pieces).
      - Remaining city orders for unassigned rows (e.g., `مشروع الاحساء (بلال محمد / طلال طلعت)` with 4 workers and 8 pieces, and `مشروع الدمام` with 21 workers and 28 pieces).
    - **Executive Project Naming in City & Recipient Column:** When a project name exists in the Excel file, the order title dynamically displays **`مشروع [اسم المشروع]`** (e.g. `مشروع نادك (بلال محمد)`) accompanied by the regional city badge (`🏙️ الاحساء`).
12. **Orders Persistence Integrity & Dynamic Cache Busting**:
    - **Orders In-State Persistence:** Anchored `state.orders` directly in initial state loaded from `localStorage.getItem("ostan_orders")`. Integrated `ostan_orders` into `saveState()`, guaranteeing orders are never wiped or lost when editing other modules (such as staff, stock, settings, or categories) or reloading the browser.
    - **Single Source of Truth Helpers (`getActiveOrders` & `persistOrders`):** Unified all reads and writes to orders through synchronized helpers in `orders-engine.js` that automatically mirror state to `localStorage` and trigger global UI updates.
    - **Automated Cache Busting:** Bound `orders-engine.js?v={version}` in `index.html` to `update-build-version.mjs`, ensuring browsers immediately fetch the latest engine updates upon deployment without serving stale cached code.
13. **Inventory Item Size Field & Project-Aware Stock Deduction Matching**:
    - **Dedicated Size Selector in Warehouse Item Modal:** Added `Size / المقاس` dropdown (`#stock-size`) to the Add/Edit Inventory Item modal (`#modal-stock`) supporting Standard, S, M, L, XL, 2XL, 3XL, 4XL, 5XL. Fully integrated into `s.size` state persistence and displayed with an executive visual badge (`📏 مقاس: {size}`) on warehouse inventory cards.
    - **Project-Isolated Stock Matching Engine (`findMatchingStockItem`):** When importing Excel orders, clothing/uniform items are scoped strictly to matching project stock (e.g. order for project `نادك` matches item `بلوزه - نادك` with size `2XL`). Prevents accidental fallbacks to unrelated client items (such as `بلوزة - سدافكو`). If no item exists for that project, it safely sets `stockId: null` instead of stealing stock from another project.
    - **Fulfillment Mismatch Guard (`setOrderStatus("DONE")`):** Added a dynamic project guard at order completion time. If an existing order was previously mapped to an item belonging to a different project, the system automatically detects the mismatch, re-resolves the correct project stock item, warns the operator accurately in the confirmation popup, and cleanly deducts quantity exclusively from the true project stock item without altering unrelated client inventory.
14. **Item Card Project Badge Display & Cloud Reset Protection**:
    - **Prominent Project Badge on Warehouse Cards:** Added prominent badge indicators on each warehouse item card (`🏗️ مشروع: [اسم المشروع]` e.g. `🏗️ مشروع: نادك` or `🏗️ مشروع: سدافكو`, or fallback `🏗️ عام (بدون مشروع)`) alongside the size badge (`📏 مقاس: [المقاس]`).
    - **Intelligent Project Name Inference (`getStockItemProject`):** Automatically extracts project designation from the item title if not explicitly set (e.g., `بلوزة - نادك` ➔ `نادك`, `بلوزة - سدافكو` ➔ `سدافكو`), ensuring existing inventory immediately gains project association without manual re-entry.
    - **Cloud Snapshot Local Merge Protection:** Overcame Firestore `onSnapshot` cloud-wipe where incoming documents lacking recent properties (`projectName` or `size`) wiped local state. The sync listener now intelligently merges cloud telemetry with local records, preserving client and size mappings permanently across browser refreshes and cloud updates.
15. **Orders Stock Rollback, Strict Size Isolation, Bilingual Dictionary & Dedicated Permissions**:
    - **Stock Rollback on Deleting Completed Orders (`deleteOrder` & `deleteAllCancelledOrders`):**
      - When an order that has already deducted inventory (`order.stockDeducted === true`, whether marked `DONE` or `CANCELLED`) is permanently deleted by the Super Admin, all deducted quantities are automatically and reliably refunded back to available warehouse stock.
      - Stock levels are immediately re-synchronized live with Cloud Firestore (`syncStockItemToFirestore`), `state.stock` is persisted, and warehouse and dashboard views refresh dynamically.
    - **Strict Size Matching & Deduction Isolation (`findMatchingStockItem` & `setOrderStatus("DONE")`):**
      - Strictly isolates sizing so an order specifying Size `L` (e.g., `بلوزة - نادك (L)`) will **NEVER** deduct inventory from Size `2XL` (or any other size).
      - If exact size (e.g. `L`) is not available in warehouse stock for that project, the system raises a clear mismatch/out-of-stock warning rather than stealing units from adjacent sizes.
    - **Item Size & Project Badges in Order Creation Dropdown (`renderOrderLineItemRows`):**
      - In `#modal-create-order`, the warehouse item selector dropdown now explicitly displays size and project badges for each item: e.g. `بلوزة - نادك [مقاس: 2XL] [مشروع: نادك] (المتوفر بالمستودع: 8)` and `بلوزة - نادك [مقاس: L] [مشروع: نادك] (المتوفر بالمستودع: 10)`.
      - Selecting an item accurately binds both `size` and `projectName` to the order line items.
    - **Full Bilingual English/Arabic Dictionary (`translation.js`):**
      - Complete English & Arabic translation dictionaries for orders filters (`orders_filter_all`, `orders_filter_pending`, `orders_filter_approved`, `orders_filter_done`, `orders_filter_cancelled`), search placeholder, bulk delete banner, table headers, stock size labels, rollback notices, and permissions.
    - **Dedicated Granular Orders Permissions Card in Access Control (`index.html`):**
      - Added the dedicated 11th permissions module card `📋 Orders & Material Fulfillment` under "Departments & Access Control".
      - Provides 7 independent checkboxes: View Orders (`view`), Create Orders (`create`), Import Excel (`excel`), Approve Orders (`approve`), Complete & Deduct (`done`), Cancel Orders (`cancel`), Delete Orders (`delete`).
      - Governed at runtime through `hasUserPermission("orders", action, user)` across all UI buttons, modal launchers, and engine workflows.
16. **Orders Demand & Sizing Aggregation Matrix (`renderOrdersDemandSummary` & `computeOrdersDemand`)**:
    - **Total Needed per Item Type & Size:** Implemented an executive demand aggregation panel (`#orders-demand-summary-container`) located right above the orders filter and table view.
    - **Item & Project Categorization:** Automatically aggregates total required units grouped by distinct item types and projects (e.g. `بلوزة - نادك`, `تيشيرت - Khobar`), eliminating the need to manually compute totals across scattered city rows.
    - **Logical Size Progression:** Sizing is automatically sorted in natural progression (`M` ➔ `L` ➔ `XL` ➔ `2XL` ➔ `3XL` ➔ `4XL` ➔ `5XL`) with prominent badge cards showing individual size requirements.
    - **Live Warehouse Inventory Health Comparison:** Cross-references each required size against available live warehouse stock (`state.stock`), displaying green indicators (`✓ متوفر`) or red shortage alerts (`⚠️ عجز: -X`) so operators immediately know if stock is sufficient before approving dispatches.
    - **Combined Grand Sizes Ribbon & KPI Telemetry:** Displays total units needed across all orders, total active orders, distinct types, and a master sizing breakdown ribbon.
    - **Multi-Scope Flexibility:** Operators can toggle between `⚡ Active Demand (Pending + Approved)`, `🔍 Current View Filter`, and `🌐 All Orders`.
    - **Instant Copy & Collapse Controls:** Includes a single-click `📋 Copy Breakdown` button to copy a formatted report directly to the clipboard (ideal for sharing via WhatsApp with suppliers and team leads), plus collapsible state persistence (`ostan_orders_demand_collapsed`).
17. **Executive UI Modal for Order Fulfillment Warnings & Deletions (`#modal-order-fulfill-confirm`)**:
    - **Eradication of Native Browser `confirm()` Popups:** Replaced crude browser popup alerts (`thegeniusx.github.io says...`) with a custom, high-end executive modal UI matching Ostan's design language (`.hud-modal-overlay`, `.hud-modal-box`, `.glass-panel`).
    - **Order Fulfillment & Stock Deduction Modal (`openOrderFulfillConfirmModal`):**
      - Displays order number, client name, and total item count in an executive metadata pill bar.
      - Dynamic visual status badges per item showing exact stock availability (`✓ متوفر بالمستودع (X)`), live warehouse quantity, and requested dispatch quantity.
      - **Shortage & Unlinked Stock Warning Banner:** If any ordered size/item has insufficient stock or is unlinked to warehouse inventory, an amber/rose warning banner dynamically alerts the operator (`⚠️ تحذير عجز المخزون: يوجد عدد (X) صنف غير متوفر بالكمية المطلوبة...`), the icon switches to `⚠️`, and the button highlights with amber warning (`⚠️ تأكيد الصرف والمتابعة / Confirm & Proceed Anyway`).
      - If all items are in stock, displays a sleek emerald theme with `📦 تأكيد واكتمال الصرف / Confirm & Deduct Stock`.
    - **Universal Delete Modal Integration for Orders (`window.openConfirmDeleteModal`):**
      - Connected single-order deletions and bulk cancelled-orders deletions directly to the universal 2-step deletion modal.
18. **Executive Stock & Inventory Command Center with Live Project Tracking & Dedicated Low Stock Center**:
    - **Unbroken Alphanumeric Size Isolation (`2XL`, `2 XL`, `3XL`):** Completely solved the Arabic RTL bidirectional punctuation and digit reversal bug (`\ مقاس: 2` with `XL` flipped or separated). Every size badge across warehouse item cards, order dropdowns, demand summaries, and stock tables is now wrapped with `<bdi dir="ltr" style="unicode-bidi: isolate; font-weight: 800; display: inline-block;">${size}</bdi>`, guaranteeing `2XL` and `2 XL` render as a solid, unbroken left-to-right token without separation.
    - **Wider & Larger UI for Demand Breakdown Matrix:** Upgraded `#orders-demand-summary-container` to feature a spacious responsive grid (`minmax(170px, 1fr)`), high-visibility typography, interactive scope toggles, and visual inventory sufficiency progress meters.
    - **Executive Stock Telemetry Dashboard:** Introduced 4 top-level KPI telemetry summary cards (`#stat-stock-total-units`, `#stat-stock-total-items`, `#stat-stock-projects-count`, `#stat-stock-low-count`) displaying real-time aggregated warehouse metrics.
    - **Live Projects Tracking Panel (`#stock-projects-tracking-panel`):**
      - Tracks real-time stock balances grouped by individual projects (e.g. `نادك`, `سدافكو`, `الدمام`, `General`).
      - Interactive project filter pills and overview cards detailing total units, item count, and low-stock indicators per project.
      - Clicking any project pill or card instantly filters the inventory grid.
    - **Dedicated Low Stock Command Center (`#stock-low-command-center`):**
      - Whole dedicated part highlighting items requiring immediate attention and replenishment.
      - When inventory drops to or below threshold (`quantity <= threshold`), prominent amber/rose alert cards display the exact deficit (`نقص: X قطع`), current stock vs minimum limit, and a single-click Quick Restock button (`+ إضافة رصيد`).
      - Includes `📋 نسخ كشف النواقص / Copy Shortage List` to instantly copy a supplier-ready shortage report to clipboard for direct WhatsApp transmission.
      - Displays a healthy green confirmation state (`✅ كافة الأصناف بالمستودع ضمن الحدود الآمنة والمثالية`) when all stock levels are sufficient.
    - **Instant Quick Restock Modal / In-line Restock (`quickRestockStockItem`):** Operators can immediately add incoming units directly from the low-stock center or item cards without needing to open the full edit dialog.
19. **Universal Compound Multi-Filter Rule System (2+ Simultaneous Rules Across Modules)**:
    - **Multi-Rule Filtering Stacking:** Eradicated single-rule limitations where applying one filter wiped or restricted other dimensions. Operators can now stack 2, 3, or more rules simultaneously using compound `AND` logic:
      - **In Orders & Fulfillment (`#view-orders`):** Filter by Status (`Pending`, `Approved`, etc.) + Project (`نادك`, `سدافكو`) + City (`الدمام`, `الاحساء`) + Size (`2XL`, `L`, `M`) + Search.
      - **In Stock & Inventory (`#view-stock`):** Filter by Status (`Low Stock Only`) + Project (`نادك`) + Category (`T-Shirt`) + Size (`2XL`) + Search.
    - **Executive Active Filter Rules Ribbon (`Active Filter Chips`):**
      - Displays dynamic pill badges for each currently active rule: e.g. `[🏷️ الحالة: معلق ✕] [🏗️ المشروع: نادك ✕] [📏 المقاس: 2XL ✕]`.
      - Single-click removal button (`✕`) per chip to remove any individual rule while preserving the remaining criteria.
      - Includes quick one-click `Clear All Filters / مسح كافة الفلاتر` reset.
    - **Real-Time Cross-Module Sync:** Both the Orders Demand Breakdown Matrix and Warehouse Item Grid update dynamically based on the compound rules.
20. **Compact Landscape Inventory Cards & High-Density Grid (5+ Items Per Line)**:
    - **High-Density Desktop Grid Layout:** Redefined `#warehouse-grid` with `repeat(auto-fill, minmax(190px, 1fr))` and compact `0.65rem` gutters, enabling 5 to 8+ item cards to fit comfortably across desktop screens.
    - **Reduced Vertical Height ("In Length"):** Compressed vertical card height by over 50% (~180px down from ~380px), transitioning the card from an elongated vertical pillar into a sleek, wide-aspect landscape UI.
    - **Horizontal Telemetry & Full-Width Chart:** Streamlined stock quantity and minimum threshold into a single horizontal row, with the sufficiency progress bar chart expanding full-width to the right edge.
    - **Compact Controls & Badges:** Integrated a 44px thumbnail, single-line project and size tags with RTL/LTR isolation, and compact restock/edit/delete buttons.
21. **Universal Real-Time Cloud Firestore Shared Orders & Order Creator Clarification Under Charts**:
    - **Eradication of Local Browser Silos:** Integrated `collection("orders")` with real-time bidirectional Cloud Firestore listeners (`onSnapshot`, `syncOrderToFirestore`, `deleteOrderFromFirestore`). Orders are no longer trapped in a single user's local browser storage and are instantly synchronized across all devices and authorized users in real time.
    - **Granular Multi-User Visibility:** Any user granted `orders.view` permission (or having Admin / Super Admin role) has full shared access to view and track all company orders seamlessly.
    - **Persistent Order Creator Identity:** All manual orders and Excel batch imports automatically capture and record the creator's identity (`createdByName`, `createdByEmail`, `createdById`, `creatorName`).
    - **Clarification Pointing to the Creator Under Charts:**
      - **Orders Demand & Sizing Summary Matrix:** Embedded under each size's stock sufficiency progress bar chart a clarification showing who placed the orders (`👤 مقدم الطلب: [الاسم]` / `👤 By: [Name]`).
      - **Orders Table:** Embedded in the order number column a prominent badge displaying the creator.
      - **Warehouse Stock Inventory Cards:** Embedded under the stock sufficiency progress bar chart an active demand indicator (`👤 طلب بواسطة: [الاسم]`) whenever active orders exist for that SKU.

---

## 📝 Rules for Future AI Contributors

1. **Never wipe `curSession.phone`** when `status === 'connecting'` or during code `515` reconnects. Once paired, retain the phone number until the user explicitly logs out or unpairs from mobile.
2. **Always support remote clients:** Any new WhatsApp feature must function both via direct HTTP (for local users) AND via Firebase Cloud Firestore (for remote users on GitHub Pages or custom domains).
3. **Keep this file (`PROJECT_REVIEW.md`) updated:** Whenever adding an endpoint, modifying gateway behavior, changing roles, or fixing connection issues, document it in this file.
4. **Automatic Git Commit & Push (Mandatory):** Accept all code changes by default and automatically commit and push them to GitHub (`origin main`) whenever work is done or updated, ensuring GitHub Pages and the repository are always in sync.
5. **Preserve Corporate Design Integrity:** When adding new views or modal components, use the established executive white card styling (`glass-panel`), subtle borders (`var(--border-subtle)`), and appropriate color accent stripes matching the design tokens.
6. **Mandatory Bilingual English/Arabic Dictionary & Universal RTL/LTR Support:** For every new feature, view, modal, button, table column, telemetry metric, badge, or notification created or updated:
   - Maintain complete bilingual English (`en`) and Arabic (`ar`) translations in `translation.js` proactively without needing user reminders.
   - Ensure full visual layout and directional support for both RTL (`dir="rtl"`, Arabic) and LTR (`dir="ltr"`, English).
   - Whenever displaying clothing/item sizes (e.g. `2XL`, `3XL`, `2 XL`), alphanumeric codes, phone numbers, or order IDs in Arabic RTL text, **ALWAYS** wrap them with `<bdi dir="ltr">` or `<span dir="ltr">` with `unicode-bidi: isolate; display: inline-block;` so numbers never separate or invert (e.g. `2` becoming detached from `XL`).
7. **Universal Multi-Filter Compound Rules Support:** In all data-driven modules (Orders, Stock & Warehouse, Staff, Operations), never restrict the operator to a single mutually exclusive filter. Always allow combining 2 or more filter rules simultaneously (e.g. Status + Project + City + Category + Size) using compound `AND` logic, accompanied by an interactive Active Filter Rules ribbon (`Active Chips`) with individual rule removal (`✕`) and a 'Clear All' reset.


