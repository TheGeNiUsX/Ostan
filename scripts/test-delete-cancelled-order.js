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

console.log('=== RUNNING TESTS: DELETE CANCELLED ORDER FUNCTIONALITY ===\n');

const engineCode = fs.readFileSync(path.join(__dirname, '..', 'orders-engine.js'), 'utf8');

// 1. Check code definitions
console.log('--- 1. Testing Code Definitions & Exports ---');
assert(engineCode.includes('function deleteOrder(orderId)'), 'deleteOrder function is defined');
assert(engineCode.includes('function deleteAllCancelledOrders()'), 'deleteAllCancelledOrders function is defined');
assert(engineCode.includes('window.deleteOrder = deleteOrder;'), 'deleteOrder is exported to window');
assert(engineCode.includes('window.deleteAllCancelledOrders = deleteAllCancelledOrders;'), 'deleteAllCancelledOrders is exported to window');

// 2. Check UI integration
console.log('\n--- 2. Testing UI Rendering Integration ---');
assert(engineCode.includes('onclick="deleteOrder(\'${o.id}\')"'), 'Row actions render delete button for cancelled orders');
assert(engineCode.includes('onclick="deleteOrder(\'${order.id}\')"'), 'Order details modal renders delete button for cancelled order');
assert(engineCode.includes('onclick="deleteAllCancelledOrders()"'), 'Batch delete banner renders deleteAllCancelledOrders button');
assert(engineCode.includes("title=\"${lang === 'ar' ? 'حذف الطلب الملغي نهائياً' : 'Delete Cancelled Order'}\""), 'Row button has bilingual tooltip');

// 3. Test functional behavior in mocked environment
console.log('\n--- 3. Testing Mocked State Deletion Logic ---');

// Mock DOM and window
const mockLocalStorage = {};
global.localStorage = {
  setItem: (k, v) => { mockLocalStorage[k] = v; },
  getItem: (k) => mockLocalStorage[k] || null
};

let toastMsg = null;
global.window = {
  state: {
    orders: [
      { id: 'ord-1', orderNumber: 'ORD-1001', status: 'CANCELLED', clientName: 'Client 1' },
      { id: 'ord-2', orderNumber: 'ORD-1002', status: 'PENDING', clientName: 'Client 2' },
      { id: 'ord-3', orderNumber: 'ORD-1003', status: 'CANCELLED', clientName: 'Client 3' },
      { id: 'ord-4', orderNumber: 'ORD-1004', status: 'DONE', clientName: 'Client 4' }
    ],
    stock: []
  },
  OstanStyle: {
    showToast: (t, m) => { toastMsg = { title: t, message: m }; }
  }
};

global.document = {
  documentElement: {
    getAttribute: (attr) => attr === 'lang' ? 'ar' : null
  },
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

global.confirm = () => true;

// Evaluate engine logic in isolated context
eval(engineCode);

// Test deleting an active order (should be rejected)
const initialCount = window.state.orders.length;
window.deleteOrder('ord-2'); // ord-2 is PENDING
assert(window.state.orders.some(o => o.id === 'ord-2'), 'Pending order cannot be deleted directly');
assert(window.state.orders.length === initialCount, 'Total orders count unchanged when trying to delete pending order');

// Test deleting a cancelled order
window.deleteOrder('ord-1'); // ord-1 is CANCELLED
assert(!window.state.orders.some(o => o.id === 'ord-1'), 'Cancelled order ord-1 was successfully removed');
assert(window.state.orders.length === initialCount - 1, 'Total orders count reduced by 1');
assert(JSON.parse(mockLocalStorage['ostan_orders']).length === initialCount - 1, 'localStorage updated with new orders list');

// Test batch deleting remaining cancelled orders
window.deleteAllCancelledOrders();
assert(!window.state.orders.some(o => o.status === 'CANCELLED'), 'All cancelled orders removed from state');
assert(window.state.orders.length === 2, 'Only non-cancelled orders remain (ord-2 and ord-4)');
assert(window.state.orders.some(o => o.id === 'ord-2'), 'Pending order ord-2 still preserved');
assert(window.state.orders.some(o => o.id === 'ord-4'), 'Done order ord-4 still preserved');

console.log(`\n=== DELETE CANCELLED ORDER RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
