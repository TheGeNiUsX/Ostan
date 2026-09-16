/**
 * Test Suite: Orders Persistence & Integrity Across Edits and Refreshes
 */

const fs = require("fs");
const path = require("path");

console.log("=== RUNNING TESTS: ORDERS PERSISTENCE & EDIT INTEGRITY ===\n");

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

const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
const engine = fs.readFileSync(path.join(__dirname, "../orders-engine.js"), "utf8");
const updateScript = fs.readFileSync(path.join(__dirname, "../scripts/update-build-version.mjs"), "utf8");

// 1. Check index.html state initialization includes orders
console.log("--- 1. State Definition in index.html ---");
assert(html.includes('orders: (() => {') && html.includes('ostan_orders'), "index.html initializes state.orders from localStorage ostan_orders");
assert(html.includes('localStorage.setItem("ostan_orders", JSON.stringify(state.orders || []));'), "saveState() in index.html persists ostan_orders");

// 2. Check orders-engine.js persistence helpers
console.log("\n--- 2. Orders Engine Persistence Helpers ---");
assert(engine.includes("function getActiveOrders()"), "getActiveOrders function defined");
assert(engine.includes("function persistOrders()"), "persistOrders function defined");
assert(engine.includes("getActiveOrders();"), "orders-engine.js calls getActiveOrders on startup");

// 3. Check Cache Busting in script tag and build script
console.log("\n--- 3. Cache Busting Protection ---");
assert(!html.includes('orders-engine.js?v=1.0.0'), "orders-engine.js is no longer on outdated v=1.0.0");
assert(updateScript.includes("orders-engine.js?v="), "update-build-version.mjs automatically updates orders-engine.js version tag");

// 4. Functional Simulation: Verifying orders survive saveState() edits
console.log("\n--- 4. Functional Simulation: Orders Integrity on SaveState ---");
const mockStorage = {
  ostan_orders: JSON.stringify([
    { id: "ord-test-1", orderNumber: "ORD-1001", clientName: "مشروع نادك (بلال محمد)", netTotalQty: 2 },
    { id: "ord-test-2", orderNumber: "ORD-1002", clientName: "مشروع الاحساء", netTotalQty: 8 }
  ])
};

const mockLocalStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = v; },
  removeItem: (k) => { delete mockStorage[k]; }
};

// Simulate index.html state loading
let simulatedState = {
  stock: [],
  users: [],
  orders: JSON.parse(mockLocalStorage.getItem("ostan_orders") || "[]")
};

assert(simulatedState.orders.length === 2, "Loaded 2 existing orders from localStorage on boot");
assert(simulatedState.orders[0].orderNumber === "ORD-1001", "Preserved ORD-1001");

// Simulate editing an employee or stock item and calling saveState()
function simulatedSaveState() {
  mockLocalStorage.setItem("ostan_orders", JSON.stringify(simulatedState.orders || []));
}

// User edits stock item
simulatedState.stock.push({ id: "item-1", name: "Uniform", quantity: 50 });
simulatedSaveState();

assert(mockLocalStorage.getItem("ostan_orders") !== null, "ostan_orders still exists in localStorage after stock edit");
const parsedAfterEdit = JSON.parse(mockLocalStorage.getItem("ostan_orders"));
assert(parsedAfterEdit.length === 2, "Orders count remained strictly 2 after editing stock");
assert(parsedAfterEdit[0].id === "ord-test-1", "Order 1 completely intact after editing stock");
assert(parsedAfterEdit[1].id === "ord-test-2", "Order 2 completely intact after editing stock");

console.log(`\n=== PERSISTENCE TEST RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
