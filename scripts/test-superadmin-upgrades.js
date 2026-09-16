const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== RUNNING TESTS: SUPER ADMIN CONTROLS, INVENTORY UPGRADES & UI SCALING ===\n');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const engineCode = fs.readFileSync(path.join(__dirname, '..', 'orders-engine.js'), 'utf8');

// 1. UI Enlargement & Modal Dimensions
console.log('--- 1. Testing UI Sizing & Modal Dimensions ---');
assert(html.includes('id="modal-orders-excel-import"') && html.includes('max-width: 980px; width: 94vw;'), 'modal-orders-excel-import enlarged to 980px / 94vw');
assert(html.includes('id="modal-order-details"') && html.includes('max-width: 960px; width: 94vw;'), 'modal-order-details enlarged to 960px / 94vw');
assert(html.includes('id="modal-stock"') && html.includes('max-width: 680px; width: 92vw;'), 'modal-stock enlarged to 680px / 92vw');
assert(engineCode.includes('grid-template-columns: repeat(4, 1fr)'), 'Excel batch preview renders 4-column wide telemetry bar');
assert(engineCode.includes('maxHeight = "none"'), 'Excel batch preview eliminates restrictive inner scroll cutoff');

// 2. Completed Orders Deletion (Super Admin Only)
console.log('\n--- 2. Testing Completed Orders Deletion Restriction ---');
assert(engineCode.includes('// Business Rule: Completed orders (DONE) can ONLY be deleted by Super Admin!'), 'Business rule documentation comment present');
assert(engineCode.includes('o.status === "DONE" && (typeof isMasterSuperAdmin === "function" && isMasterSuperAdmin('), 'Completed order row action displays delete button exclusively for Super Admin');
assert(engineCode.includes('order.status === "DONE" && (typeof isMasterSuperAdmin === "function" && isMasterSuperAdmin('), 'Completed order details modal displays delete button exclusively for Super Admin');

// Test functional behavior in mock environment
const mockState = {
  orders: [
    { id: 'ord-done-1', orderNumber: 'ORD-9001', status: 'DONE', netTotalQty: 50 },
    { id: 'ord-can-1', orderNumber: 'ORD-9002', status: 'CANCELLED', netTotalQty: 10 },
    { id: 'ord-pen-1', orderNumber: 'ORD-9003', status: 'PENDING', netTotalQty: 20 }
  ],
  stock: []
};

global.window = {
  state: mockState,
  OstanStyle: { showToast: () => {} }
};
global.localStorage = { setItem: () => {}, getItem: () => null };
global.document = {
  documentElement: { getAttribute: () => 'ar' },
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
global.confirm = () => true;

eval(engineCode);

// Test non-superadmin deleting completed order
global.getCurrentUser = () => ({ name: 'Staff User', role: 'EMPLOYEE', email: 'staff@ostan.sa' });
global.isMasterSuperAdmin = () => false;

window.deleteOrder('ord-done-1');
assert(window.state.orders.some(o => o.id === 'ord-done-1'), 'Non-superadmin cannot delete completed order');

// Test Super Admin deleting completed order
global.getCurrentUser = () => ({ name: 'Osama Al-Twaish', role: 'SUPER_ADMIN', email: 'waseem.tw@hotmail.com' });
global.isMasterSuperAdmin = () => true;

window.deleteOrder('ord-done-1');
assert(!window.state.orders.some(o => o.id === 'ord-done-1'), 'Super Admin successfully deleted completed order');

// Cancelled order can still be deleted
window.deleteOrder('ord-can-1');
assert(!window.state.orders.some(o => o.id === 'ord-can-1'), 'Cancelled order successfully deleted');

// 3. Stock Requests Under Orders & for Organizations
console.log('\n--- 3. Testing Navigation Structure & Organizations ---');
const navStockIdx = html.indexOf('id="nav-stock"');
const navOrdersIdx = html.indexOf('id="nav-orders"');
const navStockReqIdx = html.indexOf('id="nav-stock-requests"');

assert(navStockIdx < navOrdersIdx, 'nav-stock precedes nav-orders');
assert(navOrdersIdx < navStockReqIdx, 'nav-orders precedes nav-stock-requests (Stock Requests is UNDER Orders)');
assert(html.includes('Stock Requests (Organizations)'), 'nav-stock-requests label updated to Stock Requests (Organizations)');
assert(html.includes('id="top-nav-stock-requests"'), 'top-nav-stock-requests present in top burgundy bar');

// 4. Project Name Field in Add/Edit Inventory Item
console.log('\n--- 4. Testing Project Name Field in Stock Item ---');
assert(html.includes('id="stock-project"'), 'stock-project input field exists in modal-stock');
assert(html.includes('Project Name / اسم المشروع'), 'Project Name label present in English and Arabic');
assert(html.includes('s.projectName ?'), 'renderWarehouse displays project name badge');

// 5. Dynamic Categories and Fallback Icons Management
console.log('\n--- 5. Testing Dynamic Categories & Fallback Icons ---');
assert(html.includes('id="modal-stock-category-manager"'), 'Category manager modal exists');
assert(html.includes('id="modal-stock-icon-manager"'), 'Icon manager modal exists');
assert(html.includes('id="btn-manage-categories"'), 'Manage categories button exists');
assert(html.includes('id="btn-manage-icons"'), 'Manage icons button exists');
assert(html.includes('function openCategoryManagerModal'), 'openCategoryManagerModal defined');
assert(html.includes('function handleAddCategory'), 'handleAddCategory defined');
assert(html.includes('function handleEditCategory'), 'handleEditCategory defined');
assert(html.includes('function handleDeleteCategory'), 'handleDeleteCategory defined');
assert(html.includes('function openIconManagerModal'), 'openIconManagerModal defined');
assert(html.includes('function handleAddIcon'), 'handleAddIcon defined');
assert(html.includes('function handleDeleteIcon'), 'handleDeleteIcon defined');

console.log(`\n=== SUPER ADMIN UPGRADES RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
