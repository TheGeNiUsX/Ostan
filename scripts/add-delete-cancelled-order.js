const fs = require('fs');
const path = require('path');

const enginePath = path.join(__dirname, '..', 'orders-engine.js');
let code = fs.readFileSync(enginePath, 'utf8');

// 1. Add banner above table in renderOrders
const oldTableStart = '    container.innerHTML = `\n      <div class="table-responsive-wrapper">';
const newTableStart = `    container.innerHTML = \`
      \${currentOrdersFilterStatus === "CANCELLED" && filtered.length > 0 ? \`
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 1rem; margin-bottom: 0.85rem; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-md);">
          <div style="font-size: 0.82rem; color: #dc2626; font-weight: 700;">
            ⚠️ \${lang === "ar" ? \`يوجد \${filtered.length} طلبات ملغية في الأرشيف\` : \`There are \${filtered.length} cancelled orders in archive\`}
          </div>
          <button onclick="deleteAllCancelledOrders()" class="btn btn-ghost" style="color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); background: #fff; font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.75rem;">
            🗑️ \${lang === "ar" ? "حذف كافة الطلبات الملغية" : "Delete All Cancelled Orders"}
          </button>
        </div>
      \` : ''}
      <div class="table-responsive-wrapper">`;

if (code.includes(oldTableStart)) {
  code = code.replace(oldTableStart, newTableStart);
  console.log('1. Added Cancelled Orders banner in renderOrders');
} else {
  console.log('WARNING: oldTableStart not matched');
}

// 2. Add Delete button in row actions for CANCELLED orders
const oldActionsRow = `                      <button onclick="openOrderDetails('\${o.id}')" class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;" title="View Details / Print Slip">
                        👁️ سند
                      </button>`;

const newActionsRow = `                      \${o.status === "CANCELLED" ? \`
                        <button onclick="deleteOrder('\${o.id}')" class="btn btn-ghost" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25); background: rgba(239, 68, 68, 0.06); font-weight: 700;" title="\${lang === 'ar' ? 'حذف الطلب الملغي نهائياً' : 'Delete Cancelled Order'}">
                          🗑️ \${lang === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      \` : ''}

                      <button onclick="openOrderDetails('\${o.id}')" class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;" title="View Details / Print Slip">
                        👁️ سند
                      </button>`;

if (code.includes(oldActionsRow)) {
  code = code.replace(oldActionsRow, newActionsRow);
  console.log('2. Added Delete button in row actions for CANCELLED orders');
} else {
  console.log('WARNING: oldActionsRow not matched');
}

// 3. Add deleteOrder and deleteAllCancelledOrders functions after setOrderStatus
const oldSetOrderStatusEnd = `    renderOrders();
    if (window.OstanStyle) {
      window.OstanStyle.showToast("تحديث حالة الطلب", \`تم تغيير حالة الطلب \${order.orderNumber} إلى \${newStatus}\`);
    }
  }`;

const newFunctions = `    renderOrders();
    if (window.OstanStyle) {
      window.OstanStyle.showToast("تحديث حالة الطلب", \`تم تغيير حالة الطلب \${order.orderNumber} إلى \${newStatus}\`);
    }
  }

  // Delete Cancelled Order
  function deleteOrder(orderId) {
    const orders = (window.state && window.state.orders) ? window.state.orders : [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const lang = document.documentElement.getAttribute("lang") || "en";

    // Enforce business rule: only cancelled orders can be deleted
    if (order.status !== "CANCELLED") {
      const msg = lang === "ar"
        ? "لا يمكن حذف الطلب إلا بعد إلغائه! يرجى إلغاء الطلب أولاً."
        : "Only cancelled orders can be deleted! Please cancel the order first.";
      if (window.OstanStyle) window.OstanStyle.showToast("تنبيه", msg, "warning");
      else alert(msg);
      return;
    }

    const confirmMsg = lang === "ar"
      ? \`هل أنت متأكد من حذف الطلب الملغي (\${order.orderNumber || order.id}) نهائياً من النظام؟\\nهذا الإجراء لا يمكن التراجع عنه.\`
      : \`Are you sure you want to permanently delete cancelled order (\${order.orderNumber || order.id})?\\nThis action cannot be undone.\`;

    if (!confirm(confirmMsg)) return;

    // Safety rollback if needed
    if (order.stockDeducted) {
      const stock = window.state.stock || [];
      (order.items || []).forEach(it => {
        let stockItem = it.stockId ? stock.find(s => s.id === it.stockId) : null;
        if (!stockItem && it.itemName) stockItem = stock.find(s => s.name.trim().toLowerCase() === it.itemName.trim().toLowerCase());
        if (stockItem) stockItem.quantity += Number(it.quantity) || 0;
      });
      order.stockDeducted = false;
      if (typeof saveState === "function") saveState();
      if (typeof renderWarehouse === "function") renderWarehouse();
    }

    window.state.orders = orders.filter(o => o.id !== orderId);

    try {
      localStorage.setItem("ostan_orders", JSON.stringify(window.state.orders));
    } catch (e) {}

    closeOrderDetailsModal();
    renderOrders();
    if (typeof updateCounts === "function") updateCounts();

    const successMsg = lang === "ar"
      ? \`تم حذف الطلب الملغي (\${order.orderNumber || order.id}) بنجاح.\`
      : \`Cancelled order (\${order.orderNumber || order.id}) has been deleted successfully.\`;

    if (window.OstanStyle) {
      window.OstanStyle.showToast(lang === "ar" ? "تم الحذف" : "Deleted", successMsg);
    }
  }

  // Delete All Cancelled Orders
  function deleteAllCancelledOrders() {
    const orders = (window.state && window.state.orders) ? window.state.orders : [];
    const cancelledOrders = orders.filter(o => o.status === "CANCELLED");
    if (cancelledOrders.length === 0) return;

    const lang = document.documentElement.getAttribute("lang") || "en";
    const confirmMsg = lang === "ar"
      ? \`هل أنت متأكد من حذف كافة الطلبيات الملغية (\${cancelledOrders.length} طلب) نهائياً من النظام؟\`
      : \`Are you sure you want to permanently delete all \${cancelledOrders.length} cancelled orders?\`;

    if (!confirm(confirmMsg)) return;

    window.state.orders = orders.filter(o => o.status !== "CANCELLED");

    try {
      localStorage.setItem("ostan_orders", JSON.stringify(window.state.orders));
    } catch (e) {}

    renderOrders();
    if (typeof updateCounts === "function") updateCounts();

    const successMsg = lang === "ar"
      ? \`تم حذف \${cancelledOrders.length} طلب ملغي نهائياً.\`
      : \`Successfully deleted \${cancelledOrders.length} cancelled orders.\`;

    if (window.OstanStyle) {
      window.OstanStyle.showToast(lang === "ar" ? "تم الحذف" : "Deleted", successMsg);
    }
  }`;

if (code.includes(oldSetOrderStatusEnd)) {
  code = code.replace(oldSetOrderStatusEnd, newFunctions);
  console.log('3. Added deleteOrder & deleteAllCancelledOrders functions');
} else {
  console.log('WARNING: oldSetOrderStatusEnd not matched');
}

// 4. In openOrderDetails, add delete button in modal header
const oldDetailsHeader = `          <div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #2563eb;">سند صرف وتوريد: \${order.orderNumber || order.id}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">تاريخ الإنشاء: \${dateStr} | \${order.clientName || ''}</div>
          </div>
          <span class="badge \${order.status === 'DONE' ? 'badge-emerald' : order.status === 'APPROVED' ? 'badge-cyan' : 'badge-amber'}" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">
            \${order.status}
          </span>`;

const newDetailsHeader = `          <div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #2563eb;">سند صرف وتوريد: \${order.orderNumber || order.id}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">تاريخ الإنشاء: \${dateStr} | \${order.clientName || ''}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            \${order.status === "CANCELLED" ? \`
              <button onclick="deleteOrder('\${order.id}')" class="btn btn-ghost" style="color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); background: rgba(239, 68, 68, 0.05); font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.65rem;" title="Delete Cancelled Order">
                🗑️ \${lang === 'ar' ? 'حذف هذا الطلب الملغي' : 'Delete Cancelled Order'}
              </button>
            \` : ''}
            <span class="badge \${order.status === 'DONE' ? 'badge-emerald' : order.status === 'APPROVED' ? 'badge-cyan' : order.status === 'CANCELLED' ? 'badge-rose' : 'badge-amber'}" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">
              \${order.status === 'CANCELLED' ? (lang === 'ar' ? 'ملغي' : 'CANCELLED') : order.status}
            </span>
          </div>`;

if (code.includes(oldDetailsHeader)) {
  code = code.replace(oldDetailsHeader, newDetailsHeader);
  console.log('4. Added Delete button in openOrderDetails modal header');
} else {
  console.log('WARNING: oldDetailsHeader not matched');
}

// 5. Export to window
const oldExports = '  window.setOrderStatus = setOrderStatus;';
const newExports = `  window.setOrderStatus = setOrderStatus;
  window.deleteOrder = deleteOrder;
  window.deleteAllCancelledOrders = deleteAllCancelledOrders;`;

if (code.includes(oldExports)) {
  code = code.replace(oldExports, newExports);
  console.log('5. Added deleteOrder and deleteAllCancelledOrders exports');
} else {
  console.log('WARNING: oldExports not matched');
}

// Write to orders-engine.js and public/orders-engine.js
fs.writeFileSync(enginePath, code, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'public', 'orders-engine.js'), code, 'utf8');
console.log('Successfully written to orders-engine.js and public/orders-engine.js');
