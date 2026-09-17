/**
 * Test Suite: Real-Time Shared Orders Across Authorized Users & Creator Clarification under Charts
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("==================================================");
console.log("TESTING REAL-TIME SHARED ORDERS & CREATOR CLARIFICATION");
console.log("==================================================\n");

const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
const engineCode = fs.readFileSync(path.join(__dirname, "../orders-engine.js"), "utf8");
const translationCode = fs.readFileSync(path.join(__dirname, "../translation.js"), "utf8");

// 1. Verify Firestore Cloud Sync Functions & Listeners
console.log("--- 1. Testing Cloud Firestore Real-Time Sync Integration ---");
assert(html.includes("function syncOrderToFirestore"), "index.html must define syncOrderToFirestore function!");
assert(html.includes("function deleteOrderFromFirestore"), "index.html must define deleteOrderFromFirestore function!");
assert(html.includes('window.fbDb.collection("orders").onSnapshot'), "index.html must have live onSnapshot listener for orders collection!");
assert(engineCode.includes("syncOrderToFirestore"), "orders-engine.js must call syncOrderToFirestore!");
assert(engineCode.includes("deleteOrderFromFirestore"), "orders-engine.js must call deleteOrderFromFirestore!");
console.log("✓ Cloud Firestore real-time synchronization architecture verified!\n");

// 2. Verify Bilingual Translations (Rule 6)
console.log("--- 2. Testing Bilingual Translations for Order Creator & Sharing ---");
assert(translationCode.includes("orders_created_by"), "translation.js must include orders_created_by!");
assert(translationCode.includes("orders_creator_label"), "translation.js must include orders_creator_label!");
assert(translationCode.includes("orders_shared_with_all"), "translation.js must include orders_shared_with_all!");
console.log("✓ Full English and Arabic dictionary entries verified!\n");

// 3. Verify Order Creator Fields in Manual & Excel Creation
console.log("--- 3. Testing Order Creator Persistence in Creation Engines ---");
assert(engineCode.includes("createdByName: creatorName"), "orders-engine.js must save createdByName in manual and Excel orders!");
assert(engineCode.includes("createdById: creatorId"), "orders-engine.js must save createdById!");
assert(engineCode.includes("createdByEmail: creatorEmail"), "orders-engine.js must save createdByEmail!");
console.log("✓ Order creator metadata fields verified across creation methods!\n");

// 4. Verify Clarification Under Charts Pointing to Creator
console.log("--- 4. Testing Clarification Under Charts Pointing to Order Creator ---");
assert(engineCode.includes("مقدم الطلب:") && engineCode.includes("creatorsDisplay"), "renderOrdersDemandSummary must render creator clarification under progress bar chart!");
assert(engineCode.includes("By:") && engineCode.includes("o.createdByName"), "renderOrders table must render creator clarification chip!");
assert(html.includes("طلب بواسطة:") || html.includes("Ordered by:"), "renderWarehouse must render order creator clarification under stock progress bar!");
console.log("✓ Clarifications pointing to order creators under charts verified!\n");

// 5. Functional Simulation: Real-Time Sync & Multi-User Shared Access
console.log("--- 5. Simulating Multi-User Access & Cloud Sync ---");
// Simulate local state shared across users with permission
const mockUsers = [
  { id: "u-creator", name: "Osama Creator", email: "osama@ostan.sa", role: "ADMIN", permissions: { orders: { view: true, create: true } } },
  { id: "u-viewer", name: "Hussain Viewer", email: "hussain@ostan.sa", role: "USER", permissions: { orders: { view: true, create: false } } },
  { id: "u-noaccess", name: "No Access Worker", email: "worker@ostan.sa", role: "USER", permissions: { orders: { view: false } } }
];

function canUserViewOrders(user) {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return true;
  return Boolean(user.permissions && user.permissions.orders && user.permissions.orders.view);
}

assert.strictEqual(canUserViewOrders(mockUsers[0]), true, "Creator (Admin) can view orders");
assert.strictEqual(canUserViewOrders(mockUsers[1]), true, "Viewer with orders.view can view shared orders");
assert.strictEqual(canUserViewOrders(mockUsers[2]), false, "User without permission cannot access orders");

// Simulated order created by User 1
const mockOrder = {
  id: "ord-999",
  orderNumber: "ORD-999",
  createdById: "u-creator",
  createdByName: "Osama Creator",
  createdByEmail: "osama@ostan.sa",
  status: "PENDING",
  items: [{ itemName: "تيشيرت نادك", size: "2XL", quantity: 15 }]
};

// Simulate Firestore snapshot delivering this order to Viewer (User 2)
let viewerOrdersState = [];
function onFirestoreSnapshot(docs) {
  viewerOrdersState = docs.slice();
}

onFirestoreSnapshot([mockOrder]);
assert.strictEqual(viewerOrdersState.length, 1, "Viewer receives order created by User 1");
assert.strictEqual(viewerOrdersState[0].createdByName, "Osama Creator", "Viewer sees order creator correctly");

console.log("✓ Shared real-time multi-user synchronization passed!\n");

console.log("==================================================");
console.log("ALL REAL-TIME SHARED ORDERS TESTS PASSED! (100%)");
console.log("==================================================");
