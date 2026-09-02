# Ostan — Project Review & Persistent Context

## 📌 Terminology & UI Glossary
- **Sections**: Refers to the **Left Navigation Sidebar** area and its module/navigation categories (e.g., Overview, Organization, Operations, Inventory, Security, System).

## 🧭 Next.js Dashboard Routes (localhost:3000)
- `/tasks`: **Tasks & Worker Assignments** (Active page shown in screenshot)
- `/reminders`: **Reminders & Alerts**
- `/workers` / `/employees`: **Workers & Staff Management**
- `/stock`: **Stock & Inventory Catalog**
- `/settings`: **System Settings**
- `/audit-logs`: **Audit Trail & Logs**

---

## 1. Executive Summary & Purpose

Ostan is an enterprise-grade internal business management system engineered for high security, granular role and permission access controls, dual-language operations (English and Arabic with native RTL/LTR support), and a modular domain architecture.

---

## 2. Core Architecture & Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 14+ (App Router) | Server-first rendering, React Server Components (RSC), route handlers |
| **Language** | TypeScript | Strict type safety across database models, auth, and UI |
| **Styling & Runtime** | Vanilla CSS Tokens & Modules + `style.js` + `translation.js` | Custom CSS variables, dark/light themes, RTL logical properties, Chrome runtime |
| **Database** | PostgreSQL + Prisma ORM | Relational schema with foreign keys, indexes, and auditability |
| **Authentication** | Custom Session Tokens / Bcrypt | Secure HTTP-only cookies, password hashing (10 rounds) |
| **Authorization** | RBAC + Permission Overrides | 5 distinct roles with user-level grant/revoke overrides |
| **Internationalization** | Built-in Dual-Engine | English (`en`, LTR) & Arabic (`ar`, RTL) with `Cairo` & `Inter` fonts |

---

## 3. Operations & Module Capabilities

1. **Full-Screen HUD (`index.html`, Next.js App Shell)**:
   - True edge-to-edge layout filling 100vw and 100vh.
   - All status counters initialize cleanly to `0` and update dynamically in real-time.
2. **Translation & Arabic Localization (`translation.js`)**:
   - Exhaustive dictionary covering all modules, cards, status badges, buttons, modals, labels, and placeholders.
   - 1-click language toggle switching the entire application layout between English (LTR) and Arabic (RTL).
3. **Reminders Module**:
   - Create, edit (✏️), and toggle reminders.
   - Real-time scheduled alarm engine with in-app audio chime synthesizer and toast notification alerts.
4. **Workers & Staff Module**:
   - Register and edit (✏️) workers with Name, Responsibility/Job Title, System Role, and Phone.
   - Dynamic integration with task assignment dropdowns.
5. **Task Assignment to Workers**:
   - Assign and edit (✏️) tasks dispatched directly to registered workers.
   - Multi-column Kanban board (To Do, In Progress, Completed) with status progression controls.
6. **Warehouse & Stock Management**:
   - Add, edit (✏️), adjust quantities, and monitor low-stock thresholds.

---

## 4. User Roles & Hierarchy

The system defines 5 fundamental roles:
1. **`SUPER_ADMIN`**: Protected root administrator.
2. **`ADMIN`**: User, department, and settings administrator.
3. **`MANAGER`**: Department operations, team task visibility, and stock requisitions.
4. **`EMPLOYEE`**: Assigned tasks and personal reminders.
5. **`STOCK_MANAGER`**: Full stock, categories, and threshold controls.

---

## 5. Seed Accounts for Testing

| Role | Email | Password | Name (EN / AR) | Protection |
| :--- | :--- | :--- | :--- | :--- |
| **`SUPER_ADMIN`** | `superadmin@ostan.internal` | `SuperAdmin123!` | Tariq Al-Otaibi / طارق العتيبي | **Protected** |
| **`ADMIN`** | `admin@ostan.internal` | `Admin123!` | Sara Al-Mansoor / سارة المنصور | Standard |
| **`MANAGER`** | `manager@ostan.internal` | `Manager123!` | Khalid Al-Ghamdi / خالد الغامدي | Standard |
| **`EMPLOYEE`** | `employee@ostan.internal` | `Employee123!` | Faisal Al-Harbi / فيصل الحربي | Standard |
| **`STOCK_MANAGER`** | `stock@ostan.internal` | `Stock123!` | Reem Al-Dosari / ريم الدوسري | Standard |
