const fs = require('fs');
const path = require('path');

console.log('=== IMPLEMENTING INVENTORY ORDERS SECTION ===');

const translationPath = path.join(__dirname, '..', 'translation.js');
const indexPath = path.join(__dirname, '..', 'index.html');

// =========================================================================
// 1. UPDATE TRANSLATION.JS
// =========================================================================
let transCode = fs.readFileSync(translationPath, 'utf8');

const enOrdersKeys = `      nav_orders: "Orders & Fulfillment",
      orders_section_title: "Inventory Orders & Material Fulfillment",
      orders_section_desc: "Create, track, and fulfill material supply orders with automated stock deduction.",
      btn_create_order: "+ Create New Order",
      btn_import_orders_excel: "📥 Import Orders (Excel)",
      btn_download_orders_template: "📄 Sample Excel Template",
      order_stat_total: "Total Orders",
      order_stat_pending: "Pending Review",
      order_stat_approved: "Approved",
      order_stat_done: "Completed & Dispatched",
      order_status_pending: "Pending",
      order_status_approved: "Approved",
      order_status_done: "Completed / Dispatched",
      order_status_cancelled: "Cancelled",
      order_col_num: "Order #",
      order_col_client: "Client / Project",
      order_col_items: "Items & Quantities",
      order_col_date: "Date",
      order_col_priority: "Priority",
      order_col_status: "Status",
      order_col_actions: "Actions",
      order_action_approve: "✓ Approve",
      order_action_done: "📦 Mark as Done (Deduct Stock)",
      order_action_cancel: "✕ Cancel",
      order_action_details: "👁️ Details",
      order_priority_normal: "Normal",
      order_priority_high: "High",
      order_priority_urgent: "Urgent",
      modal_create_order_title: "Create New Material Supply Order",
      modal_import_orders_title: "Batch Import Orders via Excel",
      modal_order_details_title: "Order Fulfillment & Dispatch Receipt",
      order_field_num: "Order Number",
      order_field_client: "Client / Project Name *",
      order_field_requester: "Requester Name",
      order_field_priority: "Priority",
      order_field_items: "Requested Stock Items",
      order_field_select_item: "Select item from warehouse...",
      order_field_qty: "Quantity",
      order_field_notes: "Notes & Instructions",
      btn_add_order_item: "+ Add Another Item",
      btn_save_order: "Submit Order",
      order_deduct_note: "ℹ️ Marking this order as DONE will automatically deduct the item quantities from live warehouse stock.",`;

const arOrdersKeys = `      nav_orders: "الطلبيات وأوامر الصرف",
      orders_section_title: "إدارة الطلبيات وتوريد المواد",
      orders_section_desc: "إنشاء ومتابعة أوامر الصرف والتوريد مع الخصم التلقائي المباشر من المخزون.",
      btn_create_order: "+ إنشاء طلب جديد",
      btn_import_orders_excel: "📥 استيراد طلبات (إكسل)",
      btn_download_orders_template: "📄 نموذج إكسل تجريبي",
      order_stat_total: "إجمالي أوامر الصرف",
      order_stat_pending: "بانتظار الموافقة",
      order_stat_approved: "معتمدة للتجهيز",
      order_stat_done: "مكتملة ومصروفة من المستودع",
      order_status_pending: "قيد المراجعة",
      order_status_approved: "معتمد",
      order_status_done: "مكتمل / تم الصرف",
      order_status_cancelled: "ملغي",
      order_col_num: "رقم الطلب",
      order_col_client: "الجهة / المشروع",
      order_col_items: "الأصناف والكميات",
      order_col_date: "التاريخ",
      order_col_priority: "الأولوية",
      order_col_status: "الحالة",
      order_col_actions: "الإجراءات",
      order_action_approve: "✓ اعتماد",
      order_action_done: "📦 صرف واكتمال (خصم من المخزون)",
      order_action_cancel: "✕ إلغاء",
      order_action_details: "👁️ التفاصيل",
      order_priority_normal: "عادي",
      order_priority_high: "عالي",
      order_priority_urgent: "عاجل جداً",
      modal_create_order_title: "إنشاء أمر صرف وتوريد جديد",
      modal_import_orders_title: "استيراد طلبات مجمعة من ملف إكسل",
      modal_order_details_title: "سند صرف وتوريد المواد",
      order_field_num: "رقم أمر الصرف",
      order_field_client: "اسم العميل / المشروع المستلم *",
      order_field_requester: "مقدم الطلب",
      order_field_priority: "درجة الأهمية",
      order_field_items: "الأصناف والمواد المطلوبة",
      order_field_select_item: "اختر الصنف من المخزون...",
      order_field_qty: "الكمية المطلوبة",
      order_field_notes: "ملاحظات وتعليمات الصرف",
      btn_add_order_item: "+ إضافة مادة أخرى",
      btn_save_order: "تأكيد وإصدار الطلب",
      order_deduct_note: "ℹ️ عند تحويل الطلب إلى (مكتمل / تم الصرف) سيتم خصم الكميات تلقائياً وبشكل فوري من المخزون المتوفر.",`;

// Add to EN dictionary
if (!transCode.includes('nav_orders:')) {
  transCode = transCode.replace(/(nav_stock_requests:\s*"Stock Requests",\r?\n)/, `$1${enOrdersKeys}\r\n`);
  console.log('✅ Added EN translation keys for Orders');
}

// Add to AR dictionary
if (!transCode.includes('nav_orders: "الطلبيات وأوامر الصرف"')) {
  transCode = transCode.replace(/(nav_stock_requests:\s*"طلبات الصرف",\r?\n)/, `$1${arOrdersKeys}\r\n`);
  console.log('✅ Added AR translation keys for Orders');
}

fs.writeFileSync(translationPath, transCode, 'utf8');
console.log('✅ translation.js updated');

// =========================================================================
// 2. UPDATE INDEX.HTML
// =========================================================================
let html = fs.readFileSync(indexPath, 'utf8');

// A. Add Orders link in Sidebar under group-inventory
const sidebarStockRequestsRegex = /(<a id="nav-stock-requests"[\s\S]*?<\/a>)/;
const sidebarOrdersLink = `$1
          <a id="nav-orders" class="nav-item" onclick="setModule('orders')">
            <span style="display: flex; align-items: center; gap: 0.6rem;">
              <span>📋</span>
              <span data-i18n="nav_orders">Orders</span>
            </span>
          </a>`;

if (!html.includes('id="nav-orders"') && sidebarStockRequestsRegex.test(html)) {
  html = html.replace(sidebarStockRequestsRegex, sidebarOrdersLink);
  console.log('✅ Added nav-orders to sidebar');
}

// B. Add Orders in Top Subnav Bar after top-nav-stock
const topNavStockRegex = /(<a id="top-nav-stock"[\s\S]*?<\/a>)/;
const topNavOrdersLink = `$1
        <a id="top-nav-orders" class="top-subnav-item" onclick="setModule('orders')">
          <span>📋</span>
          <span data-i18n="nav_orders">الطلبيات</span>
        </a>`;

if (!html.includes('id="top-nav-orders"') && topNavStockRegex.test(html)) {
  html = html.replace(topNavStockRegex, topNavOrdersLink);
  console.log('✅ Added top-nav-orders to top subnav bar');
}

// C. Add "orders" to views array in setModule
html = html.replace(
  /const views = \["dashboard", "employees", "departments", "tasks", "reminders", "stock", "stock-requests",/g,
  'const views = ["dashboard", "employees", "departments", "tasks", "reminders", "stock", "stock-requests", "orders",'
);

// D. Add Section markup for view-orders
const viewOrdersMarkup = `
        <!-- =====================================================================
             VIEW: ORDERS & INVENTORY FULFILLMENT (WITH LIVE STOCK DEDUCTION)
             ===================================================================== -->
        <section id="view-orders" style="display: none; flex-direction: column; gap: 1.25rem;">
          <div class="glass-panel" style="padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 data-i18n="orders_section_title" style="font-size: 1.3rem; font-weight: 800;">Inventory Orders & Material Fulfillment</h2>
              <p data-i18n="orders_section_desc" style="font-size: 0.82rem; color: var(--text-muted);">Create, track, and fulfill material supply orders with automated stock deduction.</p>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn btn-secondary" onclick="downloadOrdersExcelSample()" title="Download Excel template for batch orders">
                <span data-i18n="btn_download_orders_template">📄 Sample Excel Template</span>
              </button>
              <button class="btn btn-secondary" onclick="openOrdersExcelImportModal()" title="Upload completed Excel spreadsheet">
                <span data-i18n="btn_import_orders_excel">📥 Import Orders (Excel)</span>
              </button>
              <button class="btn btn-primary" onclick="openCreateOrderModal()">
                <span data-i18n="btn_create_order">+ Create New Order</span>
              </button>
            </div>
          </div>

          <!-- Orders Metric Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem;">
            <div class="glass-panel accent-stripe-blue" style="padding: 1.15rem; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;" data-i18n="order_stat_total">Total Orders</div>
                <div id="stat-orders-total" style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin-top: 4px;">0</div>
              </div>
              <div class="pastel-icon-circle pastel-blue">📦</div>
            </div>

            <div class="glass-panel accent-stripe-amber" style="padding: 1.15rem; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;" data-i18n="order_stat_pending">Pending Review</div>
                <div id="stat-orders-pending" style="font-size: 1.75rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">0</div>
              </div>
              <div class="pastel-icon-circle pastel-amber">⏳</div>
            </div>

            <div class="glass-panel accent-stripe-cyan" style="padding: 1.15rem; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;" data-i18n="order_stat_approved">Approved</div>
                <div id="stat-orders-approved" style="font-size: 1.75rem; font-weight: 800; color: #0284c7; margin-top: 4px;">0</div>
              </div>
              <div class="pastel-icon-circle pastel-cyan">✓</div>
            </div>

            <div class="glass-panel accent-stripe-emerald" style="padding: 1.15rem; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;" data-i18n="order_stat_done">Completed & Dispatched</div>
                <div id="stat-orders-done" style="font-size: 1.75rem; font-weight: 800; color: #10b981; margin-top: 4px;">0</div>
              </div>
              <div class="pastel-icon-circle pastel-emerald">🚀</div>
            </div>
          </div>

          <!-- Orders Filters & Search Bar -->
          <div class="glass-panel" style="padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;" id="orders-status-filters">
              <button onclick="filterOrdersByStatus('ALL')" class="btn btn-primary" id="order-filter-btn-ALL" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">All Orders</button>
              <button onclick="filterOrdersByStatus('PENDING')" class="btn btn-secondary" id="order-filter-btn-PENDING" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Pending (معلق)</button>
              <button onclick="filterOrdersByStatus('APPROVED')" class="btn btn-secondary" id="order-filter-btn-APPROVED" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Approved (معتمد)</button>
              <button onclick="filterOrdersByStatus('DONE')" class="btn btn-secondary" id="order-filter-btn-DONE" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Done (مكتمل / مصروف)</button>
              <button onclick="filterOrdersByStatus('CANCELLED')" class="btn btn-secondary" id="order-filter-btn-CANCELLED" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Cancelled (ملغي)</button>
            </div>

            <div style="position: relative; min-width: 240px; flex: 1; max-width: 380px;">
              <input type="text" id="orders-search-input" oninput="handleOrdersSearch(this.value)" placeholder="Search by Order #, Client, Project, or Item..." class="input-field" style="height: 36px; font-size: 0.82rem; padding-inline-start: 2rem;">
              <span style="position: absolute; inset-inline-start: 10px; top: 9px; color: var(--text-faint); font-size: 0.85rem;">🔍</span>
            </div>
          </div>

          <!-- Orders Matrix Table -->
          <div class="glass-panel" style="padding: 1.25rem; overflow-x: auto;">
            <div id="orders-table-container"></div>
          </div>
        </section>`;

if (!html.includes('id="view-orders"')) {
  html = html.replace('<section id="view-stock-requests"', viewOrdersMarkup + '\n\n        <section id="view-stock-requests"');
  console.log('✅ Added view-orders markup');
}

// E. Add Modals for Create Order, Excel Import, and Order Details
const modalsMarkup = `
  <!-- =========================================================================
       MODAL: CREATE NEW ORDER (MANUAL CREATION)
       ========================================================================= -->
  <div id="modal-create-order" class="hud-modal-overlay" style="display: none;" onclick="if(event.target===this) closeCreateOrderModal()">
    <div class="hud-modal-box" style="max-width: 650px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <h3 data-i18n="modal_create_order_title" style="font-weight: 800; font-size: 1.15rem; color: var(--text-main);">Create New Material Supply Order</h3>
        <button onclick="closeCreateOrderModal()" class="btn btn-ghost" style="font-size: 1.2rem; padding: 0.2rem 0.5rem;">✕</button>
      </div>

      <form id="form-create-order" onsubmit="handleSaveManualOrder(event)" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div>
            <label data-i18n="order_field_num" style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Order Number</label>
            <input id="order-input-number" type="text" readonly class="input-field" style="background: var(--bg-surface-elevated); font-weight: 700; color: #38bdf8;">
          </div>
          <div>
            <label data-i18n="order_field_priority" style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Priority</label>
            <select id="order-input-priority" class="input-field">
              <option value="NORMAL">Normal (عادي)</option>
              <option value="HIGH">High (عالي)</option>
              <option value="URGENT">Urgent (عاجل جداً)</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div>
            <label data-i18n="order_field_client" style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Client / Project Name *</label>
            <input id="order-input-client" type="text" required placeholder="e.g. Riyadh Metro Project / شركة الأفق" class="input-field">
          </div>
          <div>
            <label data-i18n="order_field_requester" style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Requester Name</label>
            <input id="order-input-requester" type="text" placeholder="e.g. Eng. Khalid Al-Otaibi" class="input-field">
          </div>
        </div>

        <!-- Line Items Repeater -->
        <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.85rem; background: var(--bg-surface-elevated);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
            <label data-i18n="order_field_items" style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">Requested Stock Items</label>
            <button type="button" onclick="addOrderLineItem()" class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
              <span data-i18n="btn_add_order_item">+ Add Another Item</span>
            </button>
          </div>

          <div id="order-line-items-container" style="display: flex; flex-direction: column; gap: 0.65rem; max-height: 220px; overflow-y: auto;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <div>
          <label data-i18n="order_field_notes" style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Notes & Instructions</label>
          <textarea id="order-input-notes" rows="2" placeholder="Specific site delivery instructions, driver details, or dispatch remarks..." class="input-field" style="resize: vertical;"></textarea>
        </div>

        <div style="padding: 0.65rem; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: var(--radius-md); font-size: 0.75rem; color: #38bdf8;">
          <span data-i18n="order_deduct_note">ℹ️ Marking this order as DONE will automatically deduct the item quantities from live warehouse stock.</span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem;">
          <button type="button" onclick="closeCreateOrderModal()" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">
            <span data-i18n="btn_save_order">Submit Order</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- =========================================================================
       MODAL: EXCEL BATCH IMPORT FOR ORDERS
       ========================================================================= -->
  <div id="modal-orders-excel-import" class="hud-modal-overlay" style="display: none;" onclick="if(event.target===this) closeOrdersExcelImportModal()">
    <div class="hud-modal-box" style="max-width: 600px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <h3 data-i18n="modal_import_orders_title" style="font-weight: 800; font-size: 1.15rem; color: var(--text-main);">Batch Import Orders via Excel</h3>
        <button onclick="closeOrdersExcelImportModal()" class="btn btn-ghost" style="font-size: 1.2rem; padding: 0.2rem 0.5rem;">✕</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <p style="font-size: 0.82rem; color: var(--text-muted);">Upload a completed Excel file (.xlsx, .xls) containing order entries with client names, stock item names, and quantities.</p>

        <div style="display: flex; justify-content: flex-start;">
          <button onclick="downloadOrdersExcelSample()" class="btn btn-secondary" style="font-size: 0.78rem;">
            📄 Download Sample Orders Template (.xlsx)
          </button>
        </div>

        <div id="orders-excel-dropzone" style="border: 2px dashed var(--border-strong); border-radius: var(--radius-lg); padding: 2rem 1.5rem; text-align: center; cursor: pointer; background: var(--bg-surface-elevated);" onclick="document.getElementById('orders-excel-file-input').click()">
          <input type="file" id="orders-excel-file-input" accept=".xlsx, .xls, .csv" style="display: none;" onchange="handleOrdersExcelFileSelected(event)">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📊</div>
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);" id="orders-excel-dropzone-label">Click or Drag & Drop Orders Excel File here</div>
          <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 4px;">Supports .xlsx, .xls, .csv</div>
        </div>

        <div id="orders-excel-preview-container" style="display: none; max-height: 200px; overflow-y: auto; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.75rem;">
          <!-- Preview list -->
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem;">
          <button onclick="closeOrdersExcelImportModal()" class="btn btn-secondary">Close</button>
          <button id="btn-confirm-orders-import" onclick="confirmOrdersExcelImport()" class="btn btn-primary" style="display: none;">
            Import Orders Now
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       MODAL: ORDER DETAILS & DISPATCH SLIP
       ========================================================================= -->
  <div id="modal-order-details" class="hud-modal-overlay" style="display: none;" onclick="if(event.target===this) closeOrderDetailsModal()">
    <div class="hud-modal-box" style="max-width: 620px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <h3 data-i18n="modal_order_details_title" style="font-weight: 800; font-size: 1.15rem; color: var(--text-main);">Order Fulfillment & Dispatch Receipt</h3>
        <button onclick="closeOrderDetailsModal()" class="btn btn-ghost" style="font-size: 1.2rem; padding: 0.2rem 0.5rem;">✕</button>
      </div>

      <div id="order-details-content">
        <!-- Rendered dynamically -->
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
        <button onclick="window.print()" class="btn btn-secondary" style="font-size: 0.8rem;">
          🖨️ Print Dispatch Slip
        </button>
        <button onclick="closeOrderDetailsModal()" class="btn btn-primary">
          Close
        </button>
      </div>
    </div>
  </div>`;

if (!html.includes('id="modal-create-order"')) {
  html = html.replace('</body>', modalsMarkup + '\n</body>');
  console.log('✅ Added Orders Modals markup');
}

// F. Add JavaScript Controller Logic before </body>
const ordersControllerScript = `
  <script>
    // =========================================================================
    // INVENTORY ORDERS & LIVE STOCK TRACKING ENGINE
    // =========================================================================
    let currentOrdersFilterStatus = "ALL";
    let currentOrdersSearchQuery = "";
    let parsedExcelOrders = [];

    // Ensure state.orders exists
    if (!state.orders) {
      try {
        const savedOrders = localStorage.getItem("ostan_orders");
        state.orders = savedOrders ? JSON.parse(savedOrders) : [];
      } catch (e) {
        state.orders = [];
      }
    }

    // Helper: generate next sequential Order Number
    function getNextOrderNumber() {
      const existing = (state.orders || []).map(o => {
        const m = (o.orderNumber || "").match(/\\d+/);
        return m ? parseInt(m[0], 10) : 0;
      });
      const maxNum = existing.length > 0 ? Math.max(...existing) : 1000;
      return "ORD-" + (maxNum + 1);
    }

    function renderOrders(filterStatus, searchQuery) {
      if (filterStatus) currentOrdersFilterStatus = filterStatus;
      if (typeof searchQuery === "string") currentOrdersSearchQuery = searchQuery.toLowerCase().trim();

      const container = document.getElementById("orders-table-container");
      if (!container) return;

      const lang = document.documentElement.getAttribute("lang") || "en";
      const orders = state.orders || [];

      // Update KPI counters
      const elTotal = document.getElementById("stat-orders-total");
      const elPending = document.getElementById("stat-orders-pending");
      const elApproved = document.getElementById("stat-orders-approved");
      const elDone = document.getElementById("stat-orders-done");

      const countTotal = orders.length;
      const countPending = orders.filter(o => o.status === "PENDING").length;
      const countApproved = orders.filter(o => o.status === "APPROVED").length;
      const countDone = orders.filter(o => o.status === "DONE").length;

      if (elTotal) elTotal.textContent = countTotal;
      if (elPending) elPending.textContent = countPending;
      if (elApproved) elApproved.textContent = countApproved;
      if (elDone) elDone.textContent = countDone;

      // Filter status buttons active state
      document.querySelectorAll("#orders-status-filters button").forEach(btn => {
        btn.className = "btn btn-secondary";
      });
      const activeBtn = document.getElementById("order-filter-btn-" + currentOrdersFilterStatus);
      if (activeBtn) activeBtn.className = "btn btn-primary";

      // Filter list
      let filtered = orders.filter(o => {
        if (currentOrdersFilterStatus !== "ALL" && o.status !== currentOrdersFilterStatus) return false;
        if (currentOrdersSearchQuery) {
          const matchNum = (o.orderNumber || "").toLowerCase().includes(currentOrdersSearchQuery);
          const matchClient = (o.clientName || "").toLowerCase().includes(currentOrdersSearchQuery);
          const matchProject = (o.projectName || "").toLowerCase().includes(currentOrdersSearchQuery);
          const matchItem = (o.items || []).some(i => (i.itemName || "").toLowerCase().includes(currentOrdersSearchQuery));
          if (!matchNum && !matchClient && !matchProject && !matchItem) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div style="padding: 3rem 1rem; text-align: center; color: var(--text-faint);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📦</div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-muted);">
              \${lang === "ar" ? "لا توجد أوامر صرف مطابقة." : "No matching orders found."}
            </div>
            <div style="font-size: 0.8rem; margin-top: 4px;">
              \${lang === "ar" ? "يمكنك إنشاء طلب جديد أو استيراد ملف إكسل بالأوامر المطلوبة." : "Create a new order manually or import an Excel spreadsheet."}
            </div>
          </div>\`;
        return;
      }

      container.innerHTML = \`
        <div class="table-responsive-wrapper">
          <table class="matrix-table" style="min-width: 780px;">
            <thead>
              <tr>
                <th>\${lang === "ar" ? "رقم الطلب" : "Order #"}</th>
                <th>\${lang === "ar" ? "الجهة / المشروع" : "Client / Project"}</th>
                <th>\${lang === "ar" ? "الأصناف المطلوبة" : "Items & Quantities"}</th>
                <th>\${lang === "ar" ? "الأولوية" : "Priority"}</th>
                <th>\${lang === "ar" ? "التاريخ" : "Date"}</th>
                <th>\${lang === "ar" ? "الحالة" : "Status"}</th>
                <th style="text-align: end;">\${lang === "ar" ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              \${filtered.map(o => {
                const totalQty = (o.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
                const priorityBadge = o.priority === "URGENT" 
                  ? '<span class="badge badge-rose">عاجل جداً</span>'
                  : o.priority === "HIGH"
                  ? '<span class="badge badge-amber">عالي</span>'
                  : '<span class="badge badge-secondary">عادي</span>';

                const statusBadge = o.status === "DONE"
                  ? '<span class="badge badge-emerald">✓ تم الصرف واكتمال</span>'
                  : o.status === "APPROVED"
                  ? '<span class="badge badge-cyan">معتمد للتجهيز</span>'
                  : o.status === "CANCELLED"
                  ? '<span class="badge badge-rose">ملغي</span>'
                  : '<span class="badge badge-amber">قيد المراجعة</span>';

                const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

                return \`
                  <tr>
                    <td style="font-weight: 800; color: #2563eb;">\${o.orderNumber || o.id}</td>
                    <td>
                      <div style="font-weight: 700; color: var(--text-main);">\${o.clientName || o.projectName || "عميل عام"}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">\${o.requester ? ('طالب المواد: ' + o.requester) : ''}</div>
                    </td>
                    <td>
                      <div style="display: flex; flex-direction: column; gap: 2px;">
                        \${(o.items || []).slice(0, 3).map(it => \`
                          <div style="font-size: 0.8rem;">
                            <span style="font-weight: 600; color: var(--text-main);">\${it.itemName}</span>: 
                            <strong style="color: #2563eb;">\${it.quantity}</strong>
                          </div>
                        \`).join("")}
                        \${(o.items || []).length > 3 ? \`<span style="font-size: 0.72rem; color: var(--text-faint);">+\${o.items.length - 3} أصناف أخرى</span>\` : ''}
                      </div>
                    </td>
                    <td>\${priorityBadge}</td>
                    <td style="font-size: 0.78rem; color: var(--text-muted);">\${dateStr}</td>
                    <td>
                      \${statusBadge}
                      \${o.stockDeducted ? '<div style="font-size: 0.68rem; color: #10b981; margin-top: 2px;">✓ تم خصم المخزون</div>' : ''}
                    </td>
                    <td style="text-align: end;">
                      <div style="display: inline-flex; align-items: center; gap: 0.35rem;">
                        \${o.status === "PENDING" ? \`
                          <button onclick="setOrderStatus('\${o.id}', 'APPROVED')" class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.72rem; color: #0284c7;" title="Approve Order">
                            ✓ اعتماد
                          </button>
                          <button onclick="setOrderStatus('\${o.id}', 'CANCELLED')" class="btn btn-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; color: #ef4444;" title="Cancel Order">
                            ✕ إلغاء
                          </button>
                        \` : ''}

                        \${o.status === "APPROVED" ? \`
                          <button onclick="setOrderStatus('\${o.id}', 'DONE')" class="btn btn-primary" style="padding: 0.25rem 0.65rem; font-size: 0.72rem; background: #059669;" title="Fulfill order and deduct items from warehouse inventory">
                            📦 تم الصرف والخصم
                          </button>
                          <button onclick="setOrderStatus('\${o.id}', 'CANCELLED')" class="btn btn-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; color: #ef4444;" title="Cancel Order">
                            ✕ إلغاء
                          </button>
                        \` : ''}

                        <button onclick="openOrderDetails('\${o.id}')" class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;" title="View Details / Print Slip">
                          👁️ سند
                        </button>
                      </div>
                    </td>
                  </tr>
                \`;
              }).join("")}
            </tbody>
          </table>
        </div>\`;
    }
    window.renderOrders = renderOrders;

    function filterOrdersByStatus(status) {
      renderOrders(status, currentOrdersSearchQuery);
    }
    window.filterOrdersByStatus = filterOrdersByStatus;

    function handleOrdersSearch(val) {
      renderOrders(currentOrdersFilterStatus, val);
    }
    window.handleOrdersSearch = handleOrdersSearch;

    // Line item builder in modal
    let manualOrderLineItems = [];

    function openCreateOrderModal() {
      const numInput = document.getElementById("order-input-number");
      const clientInput = document.getElementById("order-input-client");
      const reqInput = document.getElementById("order-input-requester");
      const notesInput = document.getElementById("order-input-notes");
      const priorityInput = document.getElementById("order-input-priority");

      if (numInput) numInput.value = getNextOrderNumber();
      if (clientInput) clientInput.value = "";
      if (reqInput) {
        const u = getCurrentUser();
        reqInput.value = u ? u.name : "Admin";
      }
      if (notesInput) notesInput.value = "";
      if (priorityInput) priorityInput.value = "NORMAL";

      // Reset items and seed 1 row
      manualOrderLineItems = [{ stockId: "", quantity: 1 }];
      renderOrderLineItemRows();

      const modal = document.getElementById("modal-create-order");
      if (modal) modal.style.display = "flex";
    }
    window.openCreateOrderModal = openCreateOrderModal;

    function closeCreateOrderModal() {
      const modal = document.getElementById("modal-create-order");
      if (modal) modal.style.display = "none";
    }
    window.closeCreateOrderModal = closeCreateOrderModal;

    function addOrderLineItem() {
      manualOrderLineItems.push({ stockId: "", quantity: 1 });
      renderOrderLineItemRows();
    }
    window.addOrderLineItem = addOrderLineItem;

    function removeOrderLineItem(index) {
      if (manualOrderLineItems.length <= 1) {
        manualOrderLineItems[0] = { stockId: "", quantity: 1 };
      } else {
        manualOrderLineItems.splice(index, 1);
      }
      renderOrderLineItemRows();
    }
    window.removeOrderLineItem = removeOrderLineItem;

    function renderOrderLineItemRows() {
      const container = document.getElementById("order-line-items-container");
      if (!container) return;
      const stock = state.stock || [];

      container.innerHTML = manualOrderLineItems.map((item, idx) => \`
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <select class="input-field" style="flex: 2; font-size: 0.82rem;" onchange="manualOrderLineItems[\${idx}].stockId = this.value; validateOrderStockLimit(\${idx}, this.value)">
            <option value="">-- اختر مادة من المخزون --</option>
            \${stock.map(s => \`
              <option value="\${s.id}" \${item.stockId === s.id ? 'selected' : ''}>
                \${s.name} (المتوفر بالمستودع: \${s.quantity})
              </option>
            \`).join("")}
          </select>

          <input type="number" min="1" class="input-field" style="width: 90px; font-size: 0.82rem;" value="\${item.quantity || 1}" onchange="manualOrderLineItems[\${idx}].quantity = parseInt(this.value, 10) || 1">

          <button type="button" onclick="removeOrderLineItem(\${idx})" class="btn btn-ghost" style="color: #ef4444; padding: 0.35rem 0.5rem;" title="Remove line">
            ✕
          </button>
        </div>
      \`).join("");
    }

    function validateOrderStockLimit(idx, stockId) {
      const s = (state.stock || []).find(x => x.id === stockId);
      if (s && s.quantity <= 0) {
        if (window.OstanStyle) window.OstanStyle.showToast("تنبيه المخزون", \`الصنف \${s.name} غير متوفر حالياً بالمستودع (الكمية 0)!\`, "warning");
      }
    }
    window.validateOrderStockLimit = validateOrderStockLimit;

    function handleSaveManualOrder(e) {
      e.preventDefault();
      const num = document.getElementById("order-input-number").value.trim();
      const client = document.getElementById("order-input-client").value.trim();
      const requester = document.getElementById("order-input-requester").value.trim();
      const priority = document.getElementById("order-input-priority").value;
      const notes = document.getElementById("order-input-notes").value.trim();

      // Collect line items
      const validItems = [];
      const stock = state.stock || [];
      manualOrderLineItems.forEach(line => {
        if (line.stockId) {
          const s = stock.find(x => x.id === line.stockId);
          validItems.push({
            stockId: line.stockId,
            itemName: s ? s.name : "مادة غير محددة",
            quantity: Math.max(1, parseInt(line.quantity, 10) || 1)
          });
        }
      });

      if (validItems.length === 0) {
        alert("يرجى اختيار مادة واحدة على الأقل من المخزون لإصدار الطلب.");
        return;
      }

      const newOrder = {
        id: "ord-" + Date.now(),
        orderNumber: num,
        clientName: client,
        requester: requester,
        priority: priority,
        notes: notes,
        items: validItems,
        status: "PENDING",
        stockDeducted: false,
        createdAt: new Date().toISOString()
      };

      state.orders = state.orders || [];
      state.orders.unshift(newOrder);

      try {
        localStorage.setItem("ostan_orders", JSON.stringify(state.orders));
      } catch (err) {}

      closeCreateOrderModal();
      renderOrders();

      if (window.OstanStyle) {
        window.OstanStyle.showToast("تم إنشاء الطلب بنجاح", \`تم تسجيل أمر الصرف \${num} بنجاح وحفظه في النظام.\`);
      }
    }
    window.handleSaveManualOrder = handleSaveManualOrder;

    // LIVE STOCK DEDUCTION WORKFLOW
    function setOrderStatus(orderId, newStatus) {
      const order = (state.orders || []).find(o => o.id === orderId);
      if (!order) return;

      const lang = document.documentElement.getAttribute("lang") || "en";

      if (newStatus === "DONE") {
        const itemSummary = (order.items || []).map(i => \`• \${i.itemName}: \${i.quantity}\`).join("\\n");
        const confirmMsg = lang === "ar"
          ? \`هل أنت متأكد من تسليم أمر الصرف (\${order.orderNumber}) وخصم المواد التالية من المخزون؟\\n\\n\${itemSummary}\`
          : \`Confirm completion of order \${order.orderNumber} and deduct items from warehouse inventory?\\n\\n\${itemSummary}\`;

        if (!confirm(confirmMsg)) return;

        // Perform live deduction from state.stock
        let deductedSummary = [];
        (order.items || []).forEach(it => {
          const stockItem = (state.stock || []).find(s => s.id === it.stockId || s.name.toLowerCase() === it.itemName.toLowerCase());
          if (stockItem) {
            const oldQty = stockItem.quantity;
            stockItem.quantity = Math.max(0, stockItem.quantity - Number(it.quantity));
            deductedSummary.push(\`\${stockItem.name} (\${oldQty} ➔ \${stockItem.quantity})\`);

            // Low stock threshold check
            if (stockItem.quantity <= (stockItem.threshold || 5)) {
              if (window.OstanStyle) {
                window.OstanStyle.showToast("⚠️ تنبيه نقص المخزون", \`الصنف \${stockItem.name} وصل للحد الأدنى (\${stockItem.quantity} متبقي)!\`, "warning");
              }
            }
          }
        });

        order.status = "DONE";
        order.stockDeducted = true;
        order.completedAt = new Date().toISOString();

        // Save state and refresh both warehouse and orders
        saveState();
        renderWarehouse();
        renderDashboard();
        renderOrders();
        updateCounts();

        try {
          localStorage.setItem("ostan_orders", JSON.stringify(state.orders));
        } catch (e) {}

        if (window.OstanStyle) {
          window.OstanStyle.showToast("تم الصرف وخصم المخزون", \`تم اكتمال الطلب \${order.orderNumber} وخصم الكميات من المستودع بنجاح!\`);
        }
        return;
      }

      // If cancelling an order that already had stock deducted, restore it!
      if (newStatus === "CANCELLED" && order.stockDeducted) {
        (order.items || []).forEach(it => {
          const stockItem = (state.stock || []).find(s => s.id === it.stockId || s.name.toLowerCase() === it.itemName.toLowerCase());
          if (stockItem) {
            stockItem.quantity += Number(it.quantity);
          }
        });
        order.stockDeducted = false;
        saveState();
        renderWarehouse();
        renderDashboard();
        updateCounts();
      }

      order.status = newStatus;
      try {
        localStorage.setItem("ostan_orders", JSON.stringify(state.orders));
      } catch (e) {}

      renderOrders();
      if (window.OstanStyle) {
        window.OstanStyle.showToast("تحديث حالة الطلب", \`تم تغيير حالة الطلب \${order.orderNumber} إلى \${newStatus}\`);
      }
    }
    window.setOrderStatus = setOrderStatus;

    // View Order Details Modal
    function openOrderDetails(orderId) {
      const order = (state.orders || []).find(o => o.id === orderId);
      if (!order) return;
      const lang = document.documentElement.getAttribute("lang") || "en";

      const container = document.getElementById("order-details-content");
      if (!container) return;

      const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-US") : "-";

      container.innerHTML = \`
        <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.85rem; margin-bottom: 1rem;">
            <div>
              <div style="font-size: 1.2rem; font-weight: 800; color: #2563eb;">سند صرف مواد: \${order.orderNumber || order.id}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">تاريخ الإنشاء: \${dateStr}</div>
            </div>
            <span class="badge \${order.status === 'DONE' ? 'badge-emerald' : order.status === 'APPROVED' ? 'badge-cyan' : 'badge-amber'}" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">
              \${order.status}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; font-size: 0.85rem; margin-bottom: 1rem;">
            <div>
              <strong style="color: var(--text-muted);">الجهة / المستلم:</strong>
              <div style="font-weight: 700; color: var(--text-main); margin-top: 2px;">\${order.clientName || "-"}</div>
            </div>
            <div>
              <strong style="color: var(--text-muted);">طالب المواد:</strong>
              <div style="font-weight: 700; color: var(--text-main); margin-top: 2px;">\${order.requester || "-"}</div>
            </div>
            <div>
              <strong style="color: var(--text-muted);">الأولوية:</strong>
              <div style="margin-top: 2px;">\${order.priority || "NORMAL"}</div>
            </div>
            <div>
              <strong style="color: var(--text-muted);">حالة خصم المخزون:</strong>
              <div style="margin-top: 2px; font-weight: 700; color: \${order.stockDeducted ? '#10b981' : '#f59e0b'};">
                \${order.stockDeducted ? "✓ تم الخصم المباشر من المستودع" : "⏳ بانتظار الاعتماد والصرف"}
              </div>
            </div>
          </div>

          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">الأصناف والكميات:</div>
          <table class="matrix-table" style="width: 100%; margin-bottom: 1rem;">
            <thead>
              <tr>
                <th>اسم المادة</th>
                <th>الكمية</th>
                <th>حالة التوريد</th>
              </tr>
            </thead>
            <tbody>
              \${(order.items || []).map(it => \`
                <tr>
                  <td style="font-weight: 700;">\${it.itemName}</td>
                  <td><strong style="color: #2563eb;">\${it.quantity}</strong></td>
                  <td>\${order.stockDeducted ? '<span style="color: #10b981;">✓ مصروف</span>' : 'قيد التجهيز'}</td>
                </tr>
              \`).join("")}
            </tbody>
          </table>

          \${order.notes ? \`
            <div style="font-size: 0.8rem; padding: 0.65rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <strong>ملاحظات:</strong> \${order.notes}
            </div>
          \` : ''}
        </div>
      \`;

      const modal = document.getElementById("modal-order-details");
      if (modal) modal.style.display = "flex";
    }
    window.openOrderDetails = openOrderDetails;

    function closeOrderDetailsModal() {
      const modal = document.getElementById("modal-order-details");
      if (modal) modal.style.display = "none";
    }
    window.closeOrderDetailsModal = closeOrderDetailsModal;

    // =========================================================================
    // EXCEL BATCH IMPORT & SAMPLE DOWNLOAD
    // =========================================================================
    function downloadOrdersExcelSample() {
      if (typeof XLSX === "undefined") {
        alert("XLSX library is loading, please try again in a moment.");
        return;
      }

      const sampleData = [
        {
          "رقم الطلب": "ORD-1005",
          "العميل أو المشروع": "مشروع حي النرجس",
          "اسم الصنف": "سترة سلامة عاكسة",
          "الكمية": 10,
          "الأولوية": "عالي",
          "مقدم الطلب": "م. فهد الحربي",
          "ملاحظات": "صرف عاجل لموقع العمل"
        },
        {
          "رقم الطلب": "ORD-1006",
          "العميل أو المشروع": "فرع جدة الرئيسي",
          "اسم الصنف": "خوذة أمان بيضاء",
          "الكمية": 5,
          "الأولوية": "عادي",
          "مقدم الطلب": "سعد الدوسري",
          "ملاحظات": "تزويد المستودع الفرعي"
        },
        {
          "رقم الطلب": "ORD-1007",
          "العميل أو المشروع": "إدارة الصيانة والتشغيل",
          "اسم الصنف": "حذاء سلامة مقاس 42",
          "الكمية": 3,
          "الأولوية": "عاجل جداً",
          "مقدم الطلب": "عمر القحطاني",
          "ملاحظات": "طلب تبديل تالف"
        }
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders_Sample");
      XLSX.writeFile(wb, "ostan_orders_batch_sample.xlsx");
    }
    window.downloadOrdersExcelSample = downloadOrdersExcelSample;

    function openOrdersExcelImportModal() {
      parsedExcelOrders = [];
      const label = document.getElementById("orders-excel-dropzone-label");
      const btn = document.getElementById("btn-confirm-orders-import");
      const preview = document.getElementById("orders-excel-preview-container");

      if (label) label.textContent = "Click or Drag & Drop Orders Excel File here";
      if (btn) btn.style.display = "none";
      if (preview) { preview.style.display = "none"; preview.innerHTML = ""; }

      const modal = document.getElementById("modal-orders-excel-import");
      if (modal) modal.style.display = "flex";
    }
    window.openOrdersExcelImportModal = openOrdersExcelImportModal;

    function closeOrdersExcelImportModal() {
      const modal = document.getElementById("modal-orders-excel-import");
      if (modal) modal.style.display = "none";
    }
    window.closeOrdersExcelImportModal = closeOrdersExcelImportModal;

    function handleOrdersExcelFileSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

          if (!json || json.length === 0) {
            alert("الملف المرفوع فارغ أو لا يحتوي على بيانات صالحة.");
            return;
          }

          // Parse rows into orders
          const ordersMap = {};
          const stock = state.stock || [];

          json.forEach((row, idx) => {
            const rawNum = row["رقم الطلب"] || row["Order No"] || row["Order Number"] || row["Order"] || ("ORD-IMP-" + (idx + 1));
            const client = row["العميل أو المشروع"] || row["العميل"] || row["المشروع"] || row["Client"] || row["Project"] || "عميل عام";
            const itemName = row["اسم الصنف"] || row["المادة"] || row["الصنف"] || row["Item Name"] || row["Item"] || "";
            const qty = Math.max(1, parseInt(row["الكمية"] || row["Quantity"] || row["Qty"] || 1, 10));
            const priority = (String(row["الأولوية"] || row["Priority"] || "").toLowerCase().includes("عاجل") || String(row["الأولوية"] || "").toLowerCase().includes("urgent")) ? "URGENT" : "NORMAL";
            const requester = row["مقدم الطلب"] || row["Requester"] || "Excel Import";
            const notes = row["ملاحظات"] || row["Notes"] || "";

            if (!itemName) return;

            // Match to stock
            const matchedStock = stock.find(s => s.name.trim().toLowerCase() === itemName.trim().toLowerCase());
            const stockId = matchedStock ? matchedStock.id : "";

            if (!ordersMap[rawNum]) {
              ordersMap[rawNum] = {
                id: "ord-imp-" + Date.now() + "-" + idx,
                orderNumber: rawNum,
                clientName: client,
                requester: requester,
                priority: priority,
                notes: notes,
                items: [],
                status: "PENDING",
                stockDeducted: false,
                createdAt: new Date().toISOString()
              };
            }

            ordersMap[rawNum].items.push({
              stockId: stockId,
              itemName: itemName,
              quantity: qty
            });
          });

          parsedExcelOrders = Object.values(ordersMap);

          if (parsedExcelOrders.length === 0) {
            alert("لم يتم العثور على أوامر صالحة في الملف. يرجى التأكد من تطابق أسماء الأعمدة مع النموذج التجريبي.");
            return;
          }

          // Show preview
          const label = document.getElementById("orders-excel-dropzone-label");
          const btn = document.getElementById("btn-confirm-orders-import");
          const preview = document.getElementById("orders-excel-preview-container");

          if (label) label.textContent = \`✓ تم فحص الملف: \${file.name} (\${parsedExcelOrders.length} أوامر جاهزة للاستيراد)\`;
          if (btn) {
            btn.style.display = "inline-flex";
            btn.textContent = \`تأكيد استيراد \${parsedExcelOrders.length} أوامر صرف\`;
          }

          if (preview) {
            preview.style.display = "block";
            preview.innerHTML = \`
              <div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-main);">معاينة الأوامر المستخرجة:</div>
              <ul style="font-size: 0.75rem; padding-inline-start: 1.25rem; display: flex; flex-direction: column; gap: 4px;">
                \${parsedExcelOrders.map(o => \`
                  <li>
                    <strong>\${o.orderNumber}</strong> - \${o.clientName} (\${o.items.map(i => i.itemName + ' × ' + i.quantity).join(', ')})
                  </li>
                \`).join("")}
              </ul>\`;
          }

        } catch (err) {
          console.error("Excel parse error:", err);
          alert("حدث خطأ أثناء قراءة ملف الإكسل: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }
    window.handleOrdersExcelFileSelected = handleOrdersExcelFileSelected;

    function confirmOrdersExcelImport() {
      if (!parsedExcelOrders || parsedExcelOrders.length === 0) return;

      state.orders = state.orders || [];
      parsedExcelOrders.forEach(o => state.orders.unshift(o));

      try {
        localStorage.setItem("ostan_orders", JSON.stringify(state.orders));
      } catch (e) {}

      const count = parsedExcelOrders.length;
      parsedExcelOrders = [];
      closeOrdersExcelImportModal();
      renderOrders();

      if (window.OstanStyle) {
        window.OstanStyle.showToast("تم الاستيراد بنجاح", \`تم استيراد \${count} أمر صرف بنجاح إلى سجل الطلبيات.\`);
      }
    }
    window.confirmOrdersExcelImport = confirmOrdersExcelImport;

    // Synchronize Orders into initial page render
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        if (state.activeModule === "orders") {
          renderOrders();
        }
      }, 500);
    });
  </script>`;

if (!html.includes('INVENTORY ORDERS & LIVE STOCK TRACKING ENGINE')) {
  html = html.replace('</body>', ordersControllerScript + '\n</body>');
  console.log('✅ Injected Orders Controller script');
}

// G. Hook into setModule(mod) to automatically call renderOrders() when mod === 'orders'
const setModuleHookRegex = /state\.activeModule = mod;/;
const setModuleWithOrders = `state.activeModule = mod;

      if (mod === "orders") {
        renderOrders();
      }`;

if (!html.includes('if (mod === "orders") { renderOrders(); }')) {
  html = html.replace(setModuleHookRegex, setModuleWithOrders);
  console.log('✅ Hooked renderOrders into setModule');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ index.html updated successfully with complete Orders feature!');
