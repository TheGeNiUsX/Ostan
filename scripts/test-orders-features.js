// scripts/test-orders-features.js
// Automated verification for the 5 user requirements

const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("RUNNING COMPREHENSIVE TESTS FOR ORDERS & PERMISSIONS");
console.log("==================================================\n");

// 1. DICTIONARY VERIFICATION
console.log("--- 1. Testing English & Arabic Dictionaries ---");
const translationCode = fs.readFileSync(path.join(__dirname, "../translation.js"), "utf8");

// Mock environment to load translation.js
const mockWindow = {};
const mockDoc = {
  documentElement: { getAttribute: () => "en", setAttribute: () => {} },
  querySelectorAll: () => [],
  addEventListener: () => {}
};
const evalTranslation = new Function("window", "document", "localStorage", translationCode);
evalTranslation(mockWindow, mockDoc, { getItem: () => "en", setItem: () => {} });

const i18n = mockWindow.OstanI18n;
assert(i18n, "OstanI18n should be loaded");

const requiredKeys = [
  "orders_filter_all",
  "orders_filter_pending",
  "orders_filter_approved",
  "orders_filter_done",
  "orders_filter_cancelled",
  "orders_search_placeholder",
  "orders_bulk_delete_cancelled",
  "orders_col_recipient",
  "orders_col_sizes_breakdown",
  "orders_col_total_qty",
  "orders_col_priority",
  "orders_col_status",
  "orders_col_actions",
  "stock_size_label",
  "stock_project_label",
  "stock_project_badge",
  "stock_size_badge",
  "order_stock_rollback_notice",
  "perm_sec_orders",
  "perm_orders_view",
  "perm_orders_create",
  "perm_orders_excel",
  "perm_orders_approve",
  "perm_orders_done",
  "perm_orders_cancel",
  "perm_orders_delete"
];

for (const key of requiredKeys) {
  const enVal = i18n.t(key, "en");
  const arVal = i18n.t(key, "ar");
  assert(enVal && enVal !== key, `Key [${key}] must exist in English dictionary (got: "${enVal}")`);
  assert(arVal && arVal !== key, `Key [${key}] must exist in Arabic dictionary (got: "${arVal}")`);
}
console.log(`✓ All ${requiredKeys.length} dictionary keys verified in both English and Arabic!\n`);

// 2. STRICT SIZE MATCHING & DEDUCTION ISOLATION
console.log("--- 2. Testing Strict Size & Project Isolation ---");

// Mock browser window and state for orders-engine.js
global.window = {
  state: {
    stock: [
      { id: "item-2xl", name: "بلوزة - نادك", size: "2XL", projectName: "نادك", quantity: 8, minAlert: 5 },
      { id: "item-l", name: "بلوزة - نادك", size: "L", projectName: "نادك", quantity: 10, minAlert: 5 },
      { id: "item-sadafco", name: "بلوزة - سدافكو", size: "Standard", projectName: "سدافكو", quantity: 12, minAlert: 5 }
    ],
    orders: [],
    users: [
      { id: "super-1", name: "Super Admin", role: "SUPER_ADMIN", email: "waseem.tw@hotmail.com" },
      { id: "worker-1", name: "Operator", role: "EMPLOYEE", permissions: { orders: { view: true, create: true, excel: false, approve: false, done: false, cancel: false, delete: false } } }
    ]
  },
  OstanStyle: {
    showToast: (t, m, type) => console.log(`  [Toast] ${t}: ${m} (${type || 'info'})`)
  }
};
global.document = {
  documentElement: { getAttribute: () => "ar" },
  getElementById: (id) => ({ value: "", innerHTML: "", checked: false, style: {}, classList: { add: () => {}, remove: () => {} } }),
  querySelectorAll: () => [],
  addEventListener: () => {}
};
global.getCurrentUser = () => window.state.users[0];
global.isMasterSuperAdmin = (u) => u && (u.role === "SUPER_ADMIN" || u.email === "waseem.tw@hotmail.com");
global.saveState = () => {};
global.renderWarehouse = () => {};
global.renderDashboard = () => {};
global.syncStockItemToFirestore = (item) => {
  // console.log(`  [Firestore Sync] Item ${item.id} qty: ${item.quantity}`);
};
global.confirm = () => true;

// Load orders-engine.js
const ordersEngineCode = fs.readFileSync(path.join(__dirname, "../orders-engine.js"), "utf8");
eval(ordersEngineCode);

// Test size matching helper logic
assert(typeof window.setOrderStatus === "function", "window.setOrderStatus must be exposed");

// Test order with Size L for "بلوزة - نادك"
const orderL = {
  id: "ORD-TEST-L",
  orderNumber: "ORD-1001",
  clientName: "شركة نادك",
  projectName: "نادك",
  status: "APPROVED",
  items: [
    { stockId: "item-l", itemName: "بلوزة - نادك", size: "L", projectName: "نادك", quantity: 2 }
  ]
};
window.state.orders = [orderL];

// Complete the order (DONE)
console.log("Setting order to DONE...");
window.setOrderStatus("ORD-TEST-L", "DONE");

const item2XL = window.state.stock.find(s => s.id === "item-2xl");
const itemL = window.state.stock.find(s => s.id === "item-l");
const itemSadafco = window.state.stock.find(s => s.id === "item-sadafco");

console.log(`Item 2XL qty: ${item2XL.quantity} (expected: 8)`);
console.log(`Item L qty: ${itemL.quantity} (expected: 8)`);
console.log(`Item Sadafco qty: ${itemSadafco.quantity} (expected: 12)`);

assert.strictEqual(item2XL.quantity, 8, "Size 2XL must NEVER be deducted when ordering Size L!");
assert.strictEqual(itemL.quantity, 8, "Size L should be deducted from 10 to 8!");
assert.strictEqual(itemSadafco.quantity, 12, "Other projects (سدافكو) must remain untouched!");
assert.strictEqual(orderL.stockDeducted, true, "Order stockDeducted must be true!");
console.log("✓ Strict size & project isolation passed!\n");

// 3. STOCK ROLLBACK ON DELETING COMPLETED ORDER
console.log("--- 3. Testing Stock Rollback on Deleting Completed Order ---");
console.log("Deleting completed order ORD-TEST-L as Super Admin...");
window.deleteOrder("ORD-TEST-L");

console.log(`After deletion, Item L qty: ${itemL.quantity} (expected: 10 restored)`);
console.log(`After deletion, Item 2XL qty: ${item2XL.quantity} (expected: 8 untouched)`);

assert.strictEqual(itemL.quantity, 10, "Size L stock must be restored from 8 back to 10 upon order deletion!");
assert.strictEqual(item2XL.quantity, 8, "Size 2XL stock must remain 8!");
assert.strictEqual(window.state.orders.length, 0, "Order must be removed from state.orders!");
console.log("✓ Stock rollback on deletion passed!\n");

// 4. GRANULAR PERMISSIONS GATING
console.log("--- 4. Testing Granular Permissions Gating ---");

// Test with restricted user
const restrictedWorker = window.state.users[1];
global.getCurrentUser = () => restrictedWorker;

let deleteCalled = false;
const orderToDelete = {
  id: "ORD-BLOCKED",
  orderNumber: "ORD-9999",
  status: "APPROVED",
  items: [{ stockId: "item-l", quantity: 1 }]
};
window.state.orders = [orderToDelete];

// Check permissions with hasUserPermission
// Simulate hasUserPermission from index.html
function hasUserPermission(sectionKey, action, user = getCurrentUser()) {
  if (!user) return false;
  if (isMasterSuperAdmin(user)) return true;
  if (user.permissions && user.permissions[sectionKey]) {
    if (typeof user.permissions[sectionKey][action] !== "undefined") {
      return !!user.permissions[sectionKey][action];
    }
  }
  return false;
}
global.hasUserPermission = hasUserPermission;

// Attempt delete with worker who lacks delete permission
window.deleteOrder("ORD-BLOCKED");
assert.strictEqual(window.state.orders.length, 1, "Delete must be blocked when user lacks orders.delete permission!");
console.log("✓ Delete successfully blocked by permission check!");

// Attempt status change to DONE with worker who lacks done permission
window.setOrderStatus("ORD-BLOCKED", "DONE");
assert.strictEqual(orderToDelete.status, "APPROVED", "Status change to DONE must be blocked without orders.done permission!");
console.log("✓ Status change to DONE successfully blocked by permission check!");

// Attempt status change to CANCELLED with worker who lacks cancel permission
window.setOrderStatus("ORD-BLOCKED", "CANCELLED");
assert.strictEqual(orderToDelete.status, "APPROVED", "Status change to CANCELLED must be blocked without orders.cancel permission!");
console.log("✓ Status change to CANCELLED successfully blocked by permission check!");

// Now grant cancel permission to worker
restrictedWorker.permissions.orders.cancel = true;
window.setOrderStatus("ORD-BLOCKED", "CANCELLED");
assert.strictEqual(orderToDelete.status, "CANCELLED", "Order should be cancelled after granting orders.cancel!");
console.log("✓ Order cancellation succeeded after granting permission!");

console.log("\n==================================================");
console.log("ALL AUTOMATED TESTS PASSED SUCCESSFULLY! (100%)");
console.log("==================================================");
