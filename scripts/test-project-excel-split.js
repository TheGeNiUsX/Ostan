const fs = require('fs');
const path = require('path');

console.log('=== RUNNING TESTS: EXCEL PROJECT NAME ADAPTATION & ORDER SEPARATION ===\n');

const enginePath = path.join(__dirname, '..', 'orders-engine.js');
const engineCode = fs.readFileSync(enginePath, 'utf8');

// Set up mock window and DOM environment
const mockContainer = { innerHTML: '' };
const windowMock = {
  state: {
    stock: [
      { id: 'stock-tshirt', name: 'تيشيرت زي موحد', quantity: 100, threshold: 10 }
    ],
    orders: []
  },
  OstanStyle: {
    showToast: (t, m) => console.log(`   [Toast] ${t}: ${m}`)
  },
  document: {
    addEventListener: () => {},
    documentElement: { getAttribute: () => 'ar' },
    getElementById: (id) => {
      if (id === 'orders-table-container') return mockContainer;
      return { style: {}, textContent: '', innerHTML: '', value: '' };
    },
    querySelector: (sel) => {
      return null; // fallback to default mode
    },
    querySelectorAll: () => []
  },
  localStorage: {
    setItem: () => {},
    getItem: () => null
  }
};

const context = {
  window: windowMock,
  document: windowMock.document,
  localStorage: windowMock.localStorage,
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

const vm = require('vm');
vm.createContext(context);
vm.runInContext(engineCode, context);

const parseDualFormatExcel = context.window.parseDualFormatExcel;
const renderOrders = context.window.renderOrders;

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

// 1. Exact dataset matching User Screenshot 1
console.log('--- 1. Testing Dataset Matching Screenshot 1 (Dammam + Al-Ahsa with "نادك") ---');
const screenshot1Rows = [
  // 21 Rows for Dammam (supervisor: عمرو محمد, عبدالعزيز جمعه, ايمن وافي)
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "مصطفي جمال", "المقاس": "", "عمود1": 2, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "مصعب", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "محمد التريدي", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "فوزي حسني", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "نزار احمد", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "محمد عبدالرحمن", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "بدر محمد", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "محمد احمد", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "وليد", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "طارق عمر", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "صالح الشبيب", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "حمد محمد", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "صالح", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عمرو محمد", "جوال المشرف": "560445345", "الاسم": "محمد احمد محمود", "المقاس": "", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عبدالعزيز جمعه", "جوال المشرف": "559951071", "الاسم": "مصطفي عبدالعظيم", "المقاس": "L", "عمود1": 2, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عبدالعزيز جمعه", "جوال المشرف": "559951071", "الاسم": "عدنان خالد", "المقاس": "L", "عمود1": 2, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "عبدالعزيز جمعه", "جوال المشرف": "559951071", "الاسم": "ايمن مامون", "المقاس": "L", "عمود1": 2, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "ايمن وافي", "جوال المشرف": "504629784", "الاسم": "المبرا عثمان", "المقاس": "XL", "عمود1": 2, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "ايمن وافي", "جوال المشرف": "504629784", "الاسم": "عاطف محمود", "المقاس": "2XL", "عمود1": 2, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "ايمن وافي", "جوال المشرف": "504629784", "الاسم": "عبدالمجيد", "المقاس": "2XL", "عمود1": 2, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الدمام", "المشرف": "ايمن وافي", "جوال المشرف": "504629784", "الاسم": "محمد علي الناجي", "المقاس": "XL", "عمود1": 1, "عمود2": "أدوات", "المشروع": "" },

  // 5 Rows for Al-Ahsa (row for ادهم فيصل has المشروع: "نادك")
  { "المدينة": "الاحساء", "المشرف": "بلال محمد", "جوال المشرف": "56557036", "الاسم": "محمد محمود", "المقاس": "4XL", "عمود1": 2, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الاحساء", "المشرف": "بلال محمد", "جوال المشرف": "56557036", "الاسم": "ادهم فيصل", "المقاس": "2XL", "عمود1": 2, "عمود2": "أدوات", "المشروع": "نادك" },
  { "المدينة": "الاحساء", "المشرف": "بلال محمد", "جوال المشرف": "56557036", "الاسم": "ادهم الشرقاوي", "المقاس": "2XL", "عمود1": 2, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الاحساء", "المشرف": "طلال طلعت", "جوال المشرف": "590986007", "الاسم": "عبدالله موسي", "المقاس": "2XL", "عمود1": 2, "عمود2": "أدوات", "المشروع": "" },
  { "المدينة": "الاحساء", "المشرف": "طلال طلعت", "جوال المشرف": "590986007", "الاسم": "حسن محمد سعد", "المقاس": "XL", "عمود1": 2, "عمود2": "أدوات", "المشروع": "" }
];

const parsed = parseDualFormatExcel(screenshot1Rows);

assert(parsed !== null, 'Screenshot 1 Excel file parsed successfully');
assert(parsed.totalRecords === 26, `Total records = 26 (actual: ${parsed.totalRecords})`);
assert(parsed.netTotalQty === 38, `Net total items = 38 (actual: ${parsed.netTotalQty})`);
assert(parsed.distinctProjectNames.includes("نادك"), 'Project "نادك" recognized from "المشروع" column');

// Verify Project Breakdown
const projNadec = parsed.countByProject["نادك"];
assert(projNadec !== undefined, 'countByProject contains "نادك"');
assert(projNadec.totalWorkers === 5, `Project Nadec has 5 workers (actual: ${projNadec.totalWorkers})`);
assert(projNadec.totalQty === 10, `Project Nadec has 10 pieces (actual: ${projNadec.totalQty})`);
assert(projNadec.displayProjectName === "مشروع نادك", `Project Nadec display title is "مشروع نادك"`);

// 2. Testing Order Creation & Separation
context.window.parsedOrdersBatchData = parsed;
context.window.confirmOrdersExcelImport();

const orders = context.window.state.orders;
console.log(`Created ${orders.length} orders from the file.`);
assert(orders.length === 2, `File was separated into 2 distinct orders (actual: ${orders.length})`);

const nadecOrder = orders.find(o => o.projectName === "نادك" || (o.clientName && o.clientName.includes("نادك")));
const dammamOrder = orders.find(o => o.city && o.city.includes("الدمام"));

assert(nadecOrder !== undefined, 'Order for Project Nadec exists');
assert(nadecOrder.netTotalQty === 10, `Nadec order quantity = 10 (actual: ${nadecOrder.netTotalQty})`);
assert(dammamOrder !== undefined, 'Order for Dammam exists');
assert(dammamOrder.netTotalQty === 28, `Dammam order quantity = 28 (actual: ${dammamOrder.netTotalQty})`);

// 3. Testing Red Marked Box Display: "مشروع نادك"
console.log('\n--- 3. Testing Red Marked Box Display (مشروع نادك instead of مدينة) ---');
console.log('Nadec order clientName:', nadecOrder.clientName);
assert(nadecOrder.clientName.includes("مشروع نادك"), 'Client name contains "مشروع نادك"');

// Run renderOrders and verify HTML output in the table
renderOrders();
const tableContainer = context.document.getElementById('orders-table-container');
const htmlOutput = tableContainer.innerHTML;

assert(htmlOutput.includes('مشروع نادك'), 'Rendered table contains "مشروع نادك"');
assert(htmlOutput.includes('بلال محمد / طلال طلعت'), 'Rendered table contains Nadec supervisors "بلال محمد / طلال طلعت"');
assert(htmlOutput.includes('مشروع الدمام'), 'Rendered table contains "مشروع الدمام"');
assert(htmlOutput.includes('عمرو محمد / عبدالعزيز جمعه / ايمن وافي'), 'Rendered table contains Dammam supervisors');

// 4. Testing Multi-Project File (2 Explicit Projects: نادك and المراعي)
console.log('\n--- 4. Testing Multi-Project Separation (نادك and المراعي) ---');
const twoProjectsRows = [
  { "المدينة": "الرياض", "المشرف": "خالد العتيبي", "الاسم": "موظف 1", "المقاس": "L", "عمود1": 2, "المشروع": "المراعي" },
  { "المدينة": "الرياض", "المشرف": "خالد العتيبي", "الاسم": "موظف 2", "المقاس": "XL", "عمود1": 3, "المشروع": "المراعي" },
  { "المدينة": "جدة", "المشرف": "سعيد الغامدي", "الاسم": "موظف 3", "المقاس": "2XL", "عمود1": 2, "المشروع": "نادك" },
  { "المدينة": "جدة", "المشرف": "سعيد الغامدي", "الاسم": "موظف 4", "المقاس": "M", "عمود1": 1, "المشروع": "نادك" }
];

const parsedTwo = parseDualFormatExcel(twoProjectsRows);
assert(parsedTwo.distinctProjectNames.length === 2, `2 distinct projects detected: ${parsedTwo.distinctProjectNames.join(', ')}`);
assert(parsedTwo.projectsList.length === 2, 'projectsList has 2 entries');

context.window.state.orders = [];
context.window.parsedOrdersBatchData = parsedTwo;
context.window.confirmOrdersExcelImport();

const multiOrders = context.window.state.orders;
assert(multiOrders.length === 2, `Created 2 separate orders for 2 projects (actual: ${multiOrders.length})`);
assert(multiOrders.some(o => o.clientName.includes("مشروع المراعي")), 'Created order for "مشروع المراعي"');
assert(multiOrders.some(o => o.clientName.includes("مشروع نادك")), 'Created order for "مشروع نادك"');

console.log(`\n=== ALL TESTS RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
