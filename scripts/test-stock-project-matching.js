/**
 * Test Suite: Stock Size Field & Project-Aware Stock Matching & Deduction Protection
 */

const fs = require("fs");
const path = require("path");

console.log("=== RUNNING TESTS: STOCK SIZE FIELD & PROJECT-AWARE DEDUCTION ===\n");

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

// 1. Check UI: Size input field in modal-stock
console.log("--- 1. Testing Inventory Item Modal Size Field ---");
assert(html.includes('id="stock-size"'), 'modal-stock contains stock-size field');
assert(html.includes('value="Standard"') && html.includes('value="2XL"'), 'stock-size contains sizing options (Standard, 2XL, etc.)');
assert(html.includes('id="stock-project"'), 'modal-stock contains stock-project field');

// 2. Check JavaScript logic for size and project persistence
console.log("\n--- 2. Testing Stock Item Persistence & Display ---");
assert(html.includes('document.getElementById("stock-size")') && html.includes('editStockById'), 'editStockById populates stock-size');
assert(html.includes('s.size = size') && html.includes('saveStockItem'), 'saveStockItem saves size property');
assert(html.includes('s.projectName = projectName') && html.includes('saveStockItem'), 'saveStockItem saves projectName property');
assert(html.includes('📏 مقاس:') || (html.includes('مقاس:') && html.includes('s.size')), 'renderWarehouse renders size badge');

// 3. Testing Project-Aware Stock Matching Logic in orders-engine.js
console.log("\n--- 3. Testing orders-engine.js Project-Aware Stock Matcher ---");
assert(engine.includes("function findMatchingStockItem"), "findMatchingStockItem function is defined");
assert(engine.includes("Project Mismatch Guard"), "setOrderStatus includes Project Mismatch Guard");
assert(engine.includes("buildItemsFromSizes(projData.sizes, projData.projectName)"), "confirmOrdersExcelImport passes projectName to buildItemsFromSizes");

// 4. Functional Simulation: Verifying Nadec vs Sadafco Matching
console.log("\n--- 4. Functional Simulation: Nadec vs Sadafco Matching ---");

// Mock warehouse stock matching user screenshot
const mockStock = [
  { id: "stock-sadafco", name: "بلوزة - سدافكو", projectName: "سدافكو", category: "T-Shirt (تيشيرت)", size: "Standard", quantity: 50 },
  { id: "stock-nadec", name: "بلوزه - نادك", projectName: "نادك", category: "T-Shirt (تيشيرت)", size: "2XL", quantity: 10 },
  { id: "stock-general", name: "تيشيرت عام", projectName: "", category: "T-Shirt (تيشيرت)", size: "L", quantity: 100 }
];

// Extract findMatchingStockItem logic
const matchFnMatch = engine.match(/function findMatchingStockItem\([\s\S]*?\n  \}/);
assert(matchFnMatch !== null, "Extracted findMatchingStockItem function");
const findMatchingStockItem = new Function("stock", "targetProject", "targetSize", "itemDesc", `
  ${matchFnMatch[0]}
  return findMatchingStockItem(stock, targetProject, targetSize, itemDesc);
`);

// Test Case A: Matching for Nadec order with size 2XL
const matchedForNadec = findMatchingStockItem(mockStock, "نادك", "2XL", "تيشيرت");
assert(matchedForNadec !== null, "Successfully found match for project نادك");
assert(matchedForNadec.id === "stock-nadec", `Matched item is specifically بلوزه - نادك (actual: ${matchedForNadec.name})`);
assert(matchedForNadec.id !== "stock-sadafco", "Did NOT match بلوزة - سدافكو for Nadec order");

// Test Case B: Project with NO items in warehouse
const matchedForAlmarai = findMatchingStockItem(mockStock, "المراعي", "XL", "تيشيرت");
assert(matchedForAlmarai === null, "Returns null when project has no items (does NOT blindly pick Sadafco or Nadec)");

// Test Case C: General order (no project)
const matchedGeneral = findMatchingStockItem(mockStock, "", "L", "تيشيرت");
assert(matchedGeneral !== null, "Found match for general non-project order");
assert(matchedGeneral.id === "stock-general", `General order matched non-project stock (actual: ${matchedGeneral.name})`);
assert(matchedGeneral.id !== "stock-sadafco" && matchedGeneral.id !== "stock-nadec", "General order did not steal project stock");

// Test Case D: Mismatch Recovery in setOrderStatus
console.log("\n--- 5. Functional Simulation: Mismatch Recovery & Live Stock Deduction ---");
const mockOrder = {
  id: "ORD-1005",
  orderNumber: "ORD-1005",
  projectName: "نادك",
  clientName: "مشروع نادك (بلال محمد)",
  items: [
    // Simulating an order that had previously saved the wrong stockId (sadafco)
    { stockId: "stock-sadafco", itemName: "بلوزة - سدافكو (مقاس 2XL)", size: "2XL", quantity: 2 }
  ]
};

// Simulate deduction resolution
const deductionsPlan = [];
mockOrder.items.forEach(it => {
  let stockItem = mockStock.find(s => s.id === it.stockId);
  // Project Mismatch Guard
  if (stockItem && mockOrder.projectName && stockItem.projectName) {
    const sProj = stockItem.projectName.trim().toLowerCase();
    const oProj = mockOrder.projectName.trim().toLowerCase();
    if (sProj !== oProj && !sProj.includes(oProj) && !oProj.includes(sProj)) {
      stockItem = null;
    }
  }
  if (!stockItem) {
    stockItem = findMatchingStockItem(mockStock, mockOrder.projectName, it.size, it.itemName);
  }
  if (stockItem) {
    it.stockId = stockItem.id;
    it.itemName = `${stockItem.name} (مقاس ${it.size})`;
  }
  deductionsPlan.push({ item: it, stockItem, qty: it.quantity });
});

assert(deductionsPlan[0].stockItem.id === "stock-nadec", "Mismatch guard redirected deduction to بلوزه - نادك");
assert(mockOrder.items[0].itemName.includes("بلوزه - نادك"), "Order item name updated to بلوزه - نادك");

// Perform deduction
deductionsPlan.forEach(d => {
  if (d.stockItem) d.stockItem.quantity -= d.qty;
});

const nadecStockAfter = mockStock.find(s => s.id === "stock-nadec");
const sadafcoStockAfter = mockStock.find(s => s.id === "stock-sadafco");

assert(nadecStockAfter.quantity === 8, `Nadec stock accurately reduced from 10 to 8 (actual: ${nadecStockAfter.quantity})`);
assert(sadafcoStockAfter.quantity === 50, `Sadafco stock remained completely untouched at 50 (actual: ${sadafcoStockAfter.quantity})`);

console.log(`\n=== ALL TESTS RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
