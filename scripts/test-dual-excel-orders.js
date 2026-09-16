const fs = require('fs');
const path = require('path');

console.log('=== RUNNING SUITE: DUAL-FORMAT EXCEL ORDERS & CITY/SIZE/QTY COUNTING ===');

// Load orders-engine
const enginePath = path.join(__dirname, '..', 'orders-engine.js');
const engineCode = fs.readFileSync(enginePath, 'utf8');

// Set up mock window environment
const windowMock = {
  state: {
    stock: [
      { id: 'stock-tshirt-xl', name: 'تيشيرت مقاس XL', quantity: 50, threshold: 10 },
      { id: 'stock-tshirt-l', name: 'تيشيرت مقاس L', quantity: 30, threshold: 5 },
      { id: 'stock-tools', name: 'أدوات ومهمات عمل', quantity: 100, threshold: 15 }
    ],
    orders: []
  },
  OstanStyle: {
    showToast: (t, m) => console.log(`   [Toast] ${t}: ${m}`)
  },
  document: {
    addEventListener: () => {},
    documentElement: { getAttribute: () => 'ar' },
    getElementById: () => ({ style: {}, textContent: '', innerHTML: '', value: '' }),
    querySelectorAll: () => []
  }
};

const context = {
  window: windowMock,
  document: windowMock.document,
  console: console,
  parseInt: parseInt,
  isNaN: isNaN,
  Object: Object,
  String: String,
  Array: Array,
  Math: Math,
  Date: Date,
  Set: Set
};

// Execute engine in context
const vm = require('vm');
vm.createContext(context);
vm.runInContext(engineCode, context);

const parseDualFormatExcel = context.window.parseDualFormatExcel;

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

// =========================================================================
// TEST 1: FORM 1 (English Uniform Dispatch - Photo 1)
// =========================================================================
console.log('\n--- 1. Testing Form 1 (English Headers from User Photo 1) ---');
const sampleForm1Rows = [
  { "City": "JUBAIL", "SPV": "Mohamed Hasona Jubail Team", "Merchandiser Name": "Abdo Abdalla", "USER REF.#": "nadec.131", "T-shirt size": "XXL", "__EMPTY_5": 1, "Mobile": "593532219" },
  { "City": "JUBAIL", "SPV": "Mohamed Hasona Jubail Team", "Merchandiser Name": "Mohammad Mahmod", "USER REF.#": "nadec.047", "T-shirt size": "XXL", "__EMPTY_5": 2, "Mobile": "500756008" },
  { "City": "JUBAIL", "SPV": "Mohamed Hasona Jubail Team", "Merchandiser Name": "Youssef Abdelqawi", "USER REF.#": "nadec.061", "T-shirt size": "XL", "__EMPTY_5": 2, "Mobile": "531501204" },
  { "City": "JUBAIL", "SPV": "Mohamed Hasona Jubail Team", "Merchandiser Name": "Hamza Zafer", "USER REF.#": "nadec.067", "T-shirt size": "M", "__EMPTY_5": 1, "Mobile": "571270235" },
  { "City": "JUBAIL", "SPV": "Mohamed Hasona Jubail Team", "Merchandiser Name": "Khaled Saeed", "USER REF.#": "nadec.110", "T-shirt size": "L", "__EMPTY_5": 2, "Mobile": "581466805" },
  { "City": "HAFAR AL BATIN", "SPV": "Hisham Altairy Team", "Merchandiser Name": "Nawaf Al-Shammari", "USER REF.#": "nadec.051", "T-shirt size": "4XL", "__EMPTY_5": 2, "Mobile": "533353215" },
  { "City": "HAFAR AL BATIN", "SPV": "Hisham Altairy Team", "Merchandiser Name": "Mohamed Rassl", "USER REF.#": "nadec.083", "T-shirt size": "M", "__EMPTY_5": 0, "Mobile": "571769393" }, // Quantity 0
  { "City": "Khobar", "SPV": "Elsaeed abdullah Khobar Team", "Merchandiser Name": "MUHAMED SULAIMAN", "USER REF.#": "nadec.026", "T-shirt size": "XL", "__EMPTY_5": 2, "Mobile": "505637912" },
  { "City": "Khobar", "SPV": "Elsaeed abdullah Khobar Team", "Merchandiser Name": "Saleh Abdalla", "USER REF.#": "nadec.042", "T-shirt size": "3XL", "__EMPTY_5": 1, "Mobile": "552824813" }
];

const parsed1 = parseDualFormatExcel(sampleForm1Rows);

assert(parsed1 !== null, 'Form 1 parsed successfully');
assert(parsed1.totalRecords === 9, `Form 1 total records = 9 (actual: ${parsed1.totalRecords})`);
assert(parsed1.zeroQtyCount === 1, `Zero quantity count = 1 (actual: ${parsed1.zeroQtyCount})`);
assert(parsed1.netTotalQty === 13, `Net total items = 13 (excluding 0 qty) (actual: ${parsed1.netTotalQty})`);

// Sizing count checks:
assert(parsed1.countBySize["2XL"] === 3, `Count for 2XL (normalized from XXL) = 3 (actual: ${parsed1.countBySize["2XL"]})`);
assert(parsed1.countBySize["XL"] === 4, `Count for XL = 4 (actual: ${parsed1.countBySize["XL"]})`);
assert(parsed1.countBySize["M"] === 1, `Count for M = 1 (ignoring 0 qty row) (actual: ${parsed1.countBySize["M"]})`);
assert(parsed1.countBySize["L"] === 2, `Count for L = 2 (actual: ${parsed1.countBySize["L"]})`);
assert(parsed1.countBySize["4XL"] === 2, `Count for 4XL = 2 (actual: ${parsed1.countBySize["4XL"]})`);
assert(parsed1.countBySize["3XL"] === 1, `Count for 3XL = 1 (actual: ${parsed1.countBySize["3XL"]})`);

// City count checks:
assert(parsed1.countByCity["JUBAIL"].totalQty === 8, `Jubail total quantity = 8 (actual: ${parsed1.countByCity["JUBAIL"].totalQty})`);
assert(parsed1.countByCity["JUBAIL"].totalWorkers === 5, `Jubail total workers = 5 (actual: ${parsed1.countByCity["JUBAIL"].totalWorkers})`);
assert(parsed1.countByCity["HAFAR AL BATIN"].totalQty === 2, `Hafar Al Batin total quantity = 2 (actual: ${parsed1.countByCity["HAFAR AL BATIN"].totalQty})`);
assert(parsed1.countByCity["Khobar"].totalQty === 3, `Khobar total quantity = 3 (actual: ${parsed1.countByCity["Khobar"].totalQty})`);

// =========================================================================
// TEST 2: FORM 2 (Arabic Tools & Gear Dispatch - Photo 2)
// =========================================================================
console.log('\n--- 2. Testing Form 2 (Arabic Headers from User Photo 2) ---');
const sampleForm2Rows = [
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "مصطفى جمال", "المقاس": "", "عمود1": 2, "عمود2": "أدوات" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "مصعب", "المقاس": "", "عمود1": 1, "عمود2": "أدوات" },
  { "المدينة": "الدمام", "المشرف": "عبدالعزيز جمعه", "جوال المشرف": "559951071", "الاسم": "مصطفى عبدالعظيم", "المقاس": "L", "عمود1": 2, "عمود2": "أدوات" },
  { "المدينة": "الدمام", "المشرف": "عبدالعزيز جمعه", "جوال المشرف": "559951071", "الاسم": "عدنان خالد", "المقاس": "L", "عمود1": 2, "عمود2": "أدوات" },
  { "المدينة": "الدمام", "المشرف": "ايمن وافي", "جوال المشرف": "504629784", "الاسم": "المبرا عثمان", "المقاس": "XL", "عمود1": 2, "عمود2": "أدوات" },
  { "المدينة": "الدمام", "المشرف": "ايمن وافي", "جوال المشرف": "504629784", "الاسم": "عاطف محمود", "المقاس": "2XL", "عمود1": 2, "عمود2": "أدوات" },
  { "المدينة": "الاحساء", "المشرف": "بلال محمد", "جوال المشرف": "56557036", "الاسم": "محمد محمود", "المقاس": "4XL", "عمود1": 2, "عمود2": "أدوات" },
  { "المدينة": "الاحساء", "المشرف": "طلال طلعت", "جوال المشرف": "590986007", "الاسم": "عبدالله موسى", "المقاس": "2XL", "عمود1": 2, "عمود2": "أدوات" }
];

const parsed2 = parseDualFormatExcel(sampleForm2Rows);

assert(parsed2 !== null, 'Form 2 parsed successfully');
assert(parsed2.totalRecords === 8, `Form 2 total records = 8 (actual: ${parsed2.totalRecords})`);
assert(parsed2.netTotalQty === 15, `Form 2 net total items = 15 (actual: ${parsed2.netTotalQty})`);

// City count checks:
assert(parsed2.countByCity["الدمام"].totalQty === 11, `Dammam total quantity = 11 (actual: ${parsed2.countByCity["الدمام"].totalQty})`);
assert(parsed2.countByCity["الدمام"].totalWorkers === 6, `Dammam total workers = 6 (actual: ${parsed2.countByCity["الدمام"].totalWorkers})`);
assert(parsed2.countByCity["الاحساء"].totalQty === 4, `Al-Ahsa total quantity = 4 (actual: ${parsed2.countByCity["الاحساء"].totalQty})`);

// Size count checks:
assert(parsed2.countBySize["L"] === 4, `Count for L = 4 (actual: ${parsed2.countBySize["L"]})`);
assert(parsed2.countBySize["XL"] === 2, `Count for XL = 2 (actual: ${parsed2.countBySize["XL"]})`);
assert(parsed2.countBySize["2XL"] === 4, `Count for 2XL = 4 (actual: ${parsed2.countBySize["2XL"]})`);
assert(parsed2.countBySize["4XL"] === 2, `Count for 4XL = 2 (actual: ${parsed2.countBySize["4XL"]})`);
assert(parsed2.countBySize["Standard"] === 3, `Count for Standard (no size tools) = 3 (actual: ${parsed2.countBySize["Standard"]})`);

// =========================================================================
// TEST 3: LIVE STOCK DEDUCTION INTEGRATION
// =========================================================================
console.log('\n--- 3. Testing Live Inventory Stock Deduction on DONE ---');
const setOrderStatus = context.window.setOrderStatus;

// Create mock order in window.state.orders
context.window.state.orders = [
  {
    id: "ord-test-fulfillment",
    orderNumber: "ORD-9001",
    clientName: "توريد الدمام",
    status: "APPROVED",
    stockDeducted: false,
    items: [
      { stockId: "stock-tshirt-xl", itemName: "تيشيرت مقاس XL", size: "XL", quantity: 10 },
      { stockId: "stock-tshirt-l", itemName: "تيشيرت مقاس L", size: "L", quantity: 5 }
    ]
  }
];

// Mock confirm to return true
context.confirm = () => true;

// Trigger completion
setOrderStatus("ord-test-fulfillment", "DONE");

const updatedStockXL = context.window.state.stock.find(s => s.id === "stock-tshirt-xl");
const updatedStockL = context.window.state.stock.find(s => s.id === "stock-tshirt-l");
const completedOrder = context.window.state.orders.find(o => o.id === "ord-test-fulfillment");

assert(updatedStockXL.quantity === 40, `Stock XL deducted from 50 to 40 (actual: ${updatedStockXL.quantity})`);
assert(updatedStockL.quantity === 25, `Stock L deducted from 30 to 25 (actual: ${updatedStockL.quantity})`);
assert(completedOrder.status === "DONE", "Order status changed to DONE");
assert(completedOrder.stockDeducted === true, "Order flagged as stockDeducted = true");

// Test Rollback on Cancel
setOrderStatus("ord-test-fulfillment", "CANCELLED");
assert(updatedStockXL.quantity === 50, `Stock XL restored from 40 to 50 on cancel (actual: ${updatedStockXL.quantity})`);
assert(updatedStockL.quantity === 30, `Stock L restored from 25 to 30 on cancel (actual: ${updatedStockL.quantity})`);
assert(completedOrder.stockDeducted === false, "Order stockDeducted reset to false");

console.log(`\n=== SUITE SUMMARY: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
