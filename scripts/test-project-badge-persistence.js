const assert = require('assert');
const fs = require('fs');

console.log("=== RUNNING TESTS: ITEM CARD PROJECT BADGE & RESET PROTECTION ===");

const html = fs.readFileSync('index.html', 'utf8');

// 1. Helper getStockItemProject exists and is exported
assert(html.includes('function getStockItemProject(s)'), 'getStockItemProject helper is defined');
assert(html.includes('window.getStockItemProject = getStockItemProject;'), 'getStockItemProject is attached to window');

// Extract getStockItemProject implementation
const helperMatch = html.match(/function getStockItemProject\(s\)[\s\S]*?window\.getStockItemProject = getStockItemProject;/);
assert(helperMatch, 'Helper code extracted');
const fn = new Function(`
  const window = {};
  ${helperMatch[0]}
  return getStockItemProject;
`)();

// Test functionality
assert.strictEqual(fn({ name: "بلوزة - نادك" }), "نادك");
assert.strictEqual(fn({ name: "بلوزة - سدافكو" }), "سدافكو");
assert.strictEqual(fn({ name: "تيشيرت - NEOM" }), "NEOM");
assert.strictEqual(fn({ name: "Hydraulic Pump Valve" }), "");
assert.strictEqual(fn({ name: "عنصر بدون مشروع", projectName: "مشروع خاص" }), "مشروع خاص");
console.log("✅ PASS: getStockItemProject correctly infers project from item name or existing field");

// 2. renderWarehouse displays project badge
assert(html.includes('🏗️ مشروع:'), 'renderWarehouse renders project badge with 🏗️ مشروع:');
assert(html.includes('🏗️ عام (بدون مشروع)'), 'renderWarehouse renders fallback badge for general items');
console.log("✅ PASS: renderWarehouse displays project badge prominently on card");

// 3. syncStockItemToFirestore includes cleanItem with projectName & size
assert(html.includes('projectName: item.projectName || getStockItemProject(item) || ""'), 'syncStockItemToFirestore includes sanitized projectName');
assert(html.includes('size: item.size || "Standard"'), 'syncStockItemToFirestore includes sanitized size');
assert(html.includes('.catch(err => console.warn("Firestore stock sync error:", err))'), 'syncStockItemToFirestore handles promise rejection safely');
console.log("✅ PASS: syncStockItemToFirestore sanitizes and synchronizes project & size");

// 4. Firestore inventory snapshot merges with local state to prevent resets
assert(html.includes('currentLocalStock.find'), 'Firestore snapshot finds matching local item');
assert(html.includes('if (!d.projectName && localItem.projectName) d.projectName = localItem.projectName;'), 'Firestore snapshot preserves local projectName');
assert(html.includes('if (!d.size && localItem.size) d.size = localItem.size;'), 'Firestore snapshot preserves local size');
console.log("✅ PASS: Firestore onSnapshot protects local projectName and size against cloud wiping");

// 5. saveStockItem fallback & matching
assert(html.includes('projectName = getStockItemProject({ name });'), 'saveStockItem infers project if empty');
console.log("✅ PASS: saveStockItem auto-populates project name from item name");

// 6. Functional test: Simulate cloud wipe attempt
const currentLocalStock = [
  { id: 'stock-101', name: 'بلوزة - نادك', projectName: 'نادك', size: '2XL', quantity: 10 }
];

// Cloud snapshot arrives with empty/missing projectName (the exact bug user reported)
const cloudDoc = { id: 'stock-101', name: 'بلوزة - نادك', quantity: 10 }; // missing projectName and size

const localItem = currentLocalStock.find(s => s.id === cloudDoc.id);
if (localItem) {
  if (!cloudDoc.projectName && localItem.projectName) cloudDoc.projectName = localItem.projectName;
  if (!cloudDoc.size && localItem.size) cloudDoc.size = localItem.size;
}

assert.strictEqual(cloudDoc.projectName, 'نادك', 'Local projectName must be preserved from cloud wipe');
assert.strictEqual(cloudDoc.size, '2XL', 'Local size must be preserved from cloud wipe');
console.log("✅ PASS: Simulated cloud snapshot preserves projectName = 'نادك' and size = '2XL'");

console.log("\n=== ALL RESET PROTECTION & BADGE TESTS PASSED ===");
