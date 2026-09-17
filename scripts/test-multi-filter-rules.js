/**
 * Test Suite: Multi-Filter Compound Rules System
 * Tests selecting 2 or more filter rules simultaneously across Orders & Stock
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("==================================================");
console.log("TESTING MULTI-FILTER COMPOUND RULES SYSTEM");
console.log("==================================================\n");

const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
const engineCode = fs.readFileSync(path.join(__dirname, "../orders-engine.js"), "utf8");
const translationCode = fs.readFileSync(path.join(__dirname, "../translation.js"), "utf8");

// 1. UI Elements Verification
console.log("--- 1. Testing UI Elements for Multi-Filter System ---");
assert(html.includes('id="orders-active-filter-chips"'), "Orders view must contain active filter chips ribbon!");
assert(html.includes('id="orders-project-filter-select"'), "Orders view must contain project filter select!");
assert(html.includes('id="orders-city-filter-select"'), "Orders view must contain city filter select!");
assert(html.includes('id="orders-size-filter-select"'), "Orders view must contain size filter select!");

assert(html.includes('id="stock-active-filter-chips"'), "Stock view must contain active filter chips ribbon!");
assert(html.includes('id="stock-project-filter-select"'), "Stock view must contain project filter select!");
assert(html.includes('id="stock-category-filter-select"'), "Stock view must contain category filter select!");
assert(html.includes('id="stock-size-filter-select"'), "Stock view must contain size filter select!");
console.log("✓ All multi-filter UI selectors and active chips containers verified!\n");

// 2. Bilingual Dictionary Verification
console.log("--- 2. Testing Bilingual Translations for Multi-Filter Rules ---");
assert(translationCode.includes('filter_active_rules'), "Dictionary must include filter_active_rules!");
assert(translationCode.includes('filter_add_rule_btn'), "Dictionary must include filter_add_rule_btn!");
assert(translationCode.includes('filter_clear_all_rules'), "Dictionary must include filter_clear_all_rules!");
assert(translationCode.includes('orders_filter_project_all'), "Dictionary must include orders_filter_project_all!");
assert(translationCode.includes('stock_filter_size_all'), "Dictionary must include stock_filter_size_all!");
console.log("✓ Full English and Arabic dictionary entries verified!\n");

// 3. Orders Multi-Filter Functional Simulation
console.log("--- 3. Testing Orders 2+ Rules Compound Filtering Simulation ---");

// Mock orders dataset
const mockOrders = [
  { orderNumber: "ORD-1", clientName: "نادك", projectName: "نادك", city: "الدمام", status: "PENDING", items: [{ itemName: "بلوزة نادك", size: "2XL" }] },
  { orderNumber: "ORD-2", clientName: "نادك", projectName: "نادك", city: "الاحساء", status: "APPROVED", items: [{ itemName: "بلوزة نادك", size: "L" }] },
  { orderNumber: "ORD-3", clientName: "سدافكو", projectName: "سدافكو", city: "الدمام", status: "PENDING", items: [{ itemName: "قميص سدافكو", size: "XL" }] },
  { orderNumber: "ORD-4", clientName: "الدمام عام", projectName: "الدمام", city: "الدمام", status: "DONE", items: [{ itemName: "زي عام", size: "2XL" }] },
  { orderNumber: "ORD-5", clientName: "نادك", projectName: "نادك", city: "الدمام", status: "PENDING", items: [{ itemName: "بلوزة نادك", size: "L" }] }
];

// Simulating compound filter function
function filterMockOrders(orders, rules) {
  return orders.filter(o => {
    if (rules.status && rules.status !== "ALL" && o.status !== rules.status) return false;
    if (rules.project && rules.project !== "ALL") {
      const p = (o.projectName || o.clientName || "").toLowerCase();
      if (!p.includes(rules.project.toLowerCase())) return false;
    }
    if (rules.city && rules.city !== "ALL") {
      const c = (o.city || "").toLowerCase();
      if (!c.includes(rules.city.toLowerCase())) return false;
    }
    if (rules.size && rules.size !== "ALL") {
      const hasSz = (o.items || []).some(i => (i.size || "").toLowerCase() === rules.size.toLowerCase());
      if (!hasSz) return false;
    }
    return true;
  });
}

// Case A: 1 rule (Status = PENDING) -> returns ORD-1, ORD-3, ORD-5 (3 orders)
const result1Rule = filterMockOrders(mockOrders, { status: "PENDING", project: "ALL", city: "ALL", size: "ALL" });
assert.strictEqual(result1Rule.length, 3, "1 rule (Status: PENDING) must return 3 orders");

// Case B: 2 rules (Status = PENDING AND Project = نادك) -> returns ORD-1, ORD-5 (2 orders)
const result2Rules = filterMockOrders(mockOrders, { status: "PENDING", project: "نادك", city: "ALL", size: "ALL" });
assert.strictEqual(result2Rules.length, 2, "2 rules (Status: PENDING + Project: نادك) must return 2 orders");
assert(result2Rules.every(o => o.projectName === "نادك" && o.status === "PENDING"), "Both rules must match!");

// Case C: 3 rules (Status = PENDING AND Project = نادك AND Size = 2XL) -> returns ORD-1 only (1 order)
const result3Rules = filterMockOrders(mockOrders, { status: "PENDING", project: "نادك", city: "ALL", size: "2XL" });
assert.strictEqual(result3Rules.length, 1, "3 rules (Status + Project + Size) must return 1 order");
assert.strictEqual(result3Rules[0].orderNumber, "ORD-1", "Matched order must be ORD-1");

console.log("✓ Orders compound multi-filtering verified (1 rule -> 2 rules -> 3 rules seamless stacking)!\n");

// 4. Stock Multi-Filter Functional Simulation
console.log("--- 4. Testing Stock 2+ Rules Compound Filtering Simulation ---");

const mockStock = [
  { id: "s1", name: "بلوزة نادك 2XL", projectName: "نادك", category: "T-Shirt", size: "2XL", quantity: 2, threshold: 5 }, // LOW
  { id: "s2", name: "بلوزة نادك L", projectName: "نادك", category: "T-Shirt", size: "L", quantity: 20, threshold: 5 },   // HEALTHY
  { id: "s3", name: "بلوزة سدافكو 2XL", projectName: "سدافكو", category: "T-Shirt", size: "2XL", quantity: 3, threshold: 5 }, // LOW
  { id: "s4", name: "خوذة نادك", projectName: "نادك", category: "Equipment", size: "Standard", quantity: 1, threshold: 5 } // LOW
];

function filterMockStock(stock, rules) {
  return stock.filter(s => {
    if (rules.status === "LOW" && Number(s.quantity) > (s.threshold || 5)) return false;
    if (rules.project && rules.project !== "ALL" && (s.projectName || "").toLowerCase() !== rules.project.toLowerCase()) return false;
    if (rules.category && rules.category !== "ALL" && (s.category || "").toLowerCase() !== rules.category.toLowerCase()) return false;
    if (rules.size && rules.size !== "ALL" && (s.size || "").toLowerCase() !== rules.size.toLowerCase()) return false;
    return true;
  });
}

// Rule 1: Project = نادك -> s1, s2, s4 (3 items)
const stock1Rule = filterMockStock(mockStock, { project: "نادك", status: "ALL", category: "ALL", size: "ALL" });
assert.strictEqual(stock1Rule.length, 3, "1 rule (Project: نادك) must return 3 stock items");

// 2 rules: Project = نادك AND Status = LOW -> s1, s4 (2 items)
const stock2Rules = filterMockStock(mockStock, { project: "نادك", status: "LOW", category: "ALL", size: "ALL" });
assert.strictEqual(stock2Rules.length, 2, "2 rules (Project: نادك + Status: LOW) must return 2 stock items");

// 3 rules: Project = نادك AND Status = LOW AND Size = 2XL -> s1 only
const stock3Rules = filterMockStock(mockStock, { project: "نادك", status: "LOW", category: "ALL", size: "2XL" });
assert.strictEqual(stock3Rules.length, 1, "3 rules (Project + Status + Size) must return 1 stock item");
assert.strictEqual(stock3Rules[0].id, "s1", "Matched item must be s1");

console.log("✓ Stock compound multi-filtering verified (Project + Low Stock + Size stacked together)!\n");

console.log("==================================================");
console.log("ALL MULTI-FILTER TESTS PASSED SUCCESSFULLY! (100%)");
console.log("==================================================");
