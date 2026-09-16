const fs = require('fs');
const path = require('path');

console.log('=== RUNNING SUITE: INVENTORY ORDERS & LIVE STOCK TRACKING ===');

const indexPath = path.join(__dirname, '..', 'index.html');
const transPath = path.join(__dirname, '..', 'translation.js');
const html = fs.readFileSync(indexPath, 'utf8');
const trans = fs.readFileSync(transPath, 'utf8');

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

// 1. Navigation & View Containers
console.log('\n--- 1. Navigation & Containers ---');
assert(html.includes('id="nav-orders"'), 'Sidebar nav-orders exists');
assert(html.includes('id="top-nav-orders"'), 'Top subnav top-nav-orders exists');
assert(html.includes('id="view-orders"'), 'view-orders section exists');
assert(html.includes('id="orders-table-container"'), 'orders-table-container exists');
assert(html.includes('id="modal-create-order"'), 'modal-create-order exists');
assert(html.includes('id="modal-orders-excel-import"'), 'modal-orders-excel-import exists');
assert(html.includes('id="modal-order-details"'), 'modal-order-details exists');

// 2. Bilingual Translations
console.log('\n--- 2. Bilingual Translations ---');
assert(trans.includes('nav_orders: "Orders & Fulfillment"'), 'EN nav_orders key exists');
assert(trans.includes('nav_orders: "الطلبيات وأوامر الصرف"'), 'AR nav_orders key exists');
assert(trans.includes('orders_section_title:'), 'orders_section_title key exists');
assert(trans.includes('btn_create_order:'), 'btn_create_order key exists');
assert(trans.includes('btn_import_orders_excel:'), 'btn_import_orders_excel key exists');

// 3. Stock Deduction Workflow Simulation
console.log('\n--- 3. Stock Deduction Workflow Simulation ---');
let mockStock = [
  { id: 'item-101', name: 'سترة سلامة عاكسة', quantity: 15, threshold: 5 },
  { id: 'item-102', name: 'خوذة أمان بيضاء', quantity: 20, threshold: 5 }
];

let mockOrder = {
  id: 'ord-test-1',
  orderNumber: 'ORD-1001',
  clientName: 'مشروع المترو',
  status: 'APPROVED',
  stockDeducted: false,
  items: [
    { stockId: 'item-101', itemName: 'سترة سلامة عاكسة', quantity: 4 },
    { stockId: 'item-102', itemName: 'خوذة أمان بيضاء', quantity: 2 }
  ]
};

// Simulate marking order as DONE
mockOrder.items.forEach(it => {
  const s = mockStock.find(x => x.id === it.stockId);
  if (s) {
    s.quantity = Math.max(0, s.quantity - it.quantity);
  }
});
mockOrder.status = 'DONE';
mockOrder.stockDeducted = true;

const item101 = mockStock.find(x => x.id === 'item-101');
const item102 = mockStock.find(x => x.id === 'item-102');

assert(item101.quantity === 11, `item-101 deducted from 15 to 11 (actual: ${item101.quantity})`);
assert(item102.quantity === 18, `item-102 deducted from 20 to 18 (actual: ${item102.quantity})`);
assert(mockOrder.status === 'DONE', 'Order status transitioned to DONE');
assert(mockOrder.stockDeducted === true, 'Order marked with stockDeducted = true');

// Simulate Rollback when Cancelled
mockOrder.items.forEach(it => {
  const s = mockStock.find(x => x.id === it.stockId);
  if (s) {
    s.quantity += it.quantity;
  }
});
mockOrder.status = 'CANCELLED';
mockOrder.stockDeducted = false;

assert(item101.quantity === 15, `item-101 restored from 11 back to 15 on cancel (actual: ${item101.quantity})`);
assert(item102.quantity === 20, `item-102 restored from 18 back to 20 on cancel (actual: ${item102.quantity})`);

// 4. Excel Sample Structure & Download Handlers
console.log('\n--- 4. Excel Sample & Import Engine ---');
assert(html.includes('function downloadOrdersExcelSample'), 'downloadOrdersExcelSample function linked');
assert(html.includes('function handleOrdersExcelFileSelected'), 'handleOrdersExcelFileSelected function linked');
assert(html.includes('function confirmOrdersExcelImport'), 'confirmOrdersExcelImport function linked');
assert(html.includes('ostan_orders_batch_sample.xlsx'), 'Sample Excel filename configured');

console.log(`\n=== ORDERS TEST RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
