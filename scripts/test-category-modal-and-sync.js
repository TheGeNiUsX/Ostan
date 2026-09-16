const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  }
}

console.log('=== RUNNING TESTS: CATEGORY MODAL FORM, SYNC & SUBMIT REQUESTS ===\n');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const trans = fs.readFileSync(path.join(__dirname, '..', 'translation.js'), 'utf8');

// 1. Check prompt removal
console.log('--- 1. Verification of Zero Prompt Dialogs ---');
assert(!html.includes('prompt('), 'Completely 0 occurrences of prompt() in index.html');

// 2. Check sidebar and top navigation naming
console.log('\n--- 2. Navigation Naming: Submit Requests (No Organizations) ---');
assert(html.includes('id="nav-stock-requests"'), 'nav-stock-requests element exists');
assert(html.includes('<span data-i18n="nav_stock_requests">Submit Requests</span>'), 'nav-stock-requests has "Submit Requests"');
assert(html.includes('<span data-i18n="nav_stock_requests">تقديم طلبات الصرف</span>'), 'top-nav-stock-requests has "تقديم طلبات الصرف"');
assert(trans.includes('nav_stock_requests: "Submit Requests",'), 'English translation has "Submit Requests"');
assert(trans.includes('nav_stock_requests: "تقديم طلبات الصرف",'), 'Arabic translation has "تقديم طلبات الصرف"');

// 3. Modal Form Structure
console.log('\n--- 3. Executive Modal Form #modal-system-category-form ---');
assert(html.includes('id="modal-system-category-form"'), 'modal-system-category-form exists');
assert(html.includes('id="syscat-section-cards"'), 'Section cards container exists');
assert(html.includes('value="stock" checked'), 'Warehouse (stock) section option exists');
assert(html.includes('value="orders"'), 'Orders section option exists');
assert(html.includes('value="tasks"'), 'Tasks section option exists');
assert(html.includes('value="employees"'), 'Employees section option exists');
assert(html.includes('id="syscat-name-input"'), 'Category name input exists');
assert(html.includes('id="syscat-clarification-input"'), 'Clarification & scope textarea exists');
assert(html.includes('id="syscat-submit-btn"'), 'Save category submit button exists');

// 4. Test Stock Categories Unification & Sync
console.log('\n--- 4. Stock Categories Unified Sync Logic ---');
assert(html.includes('function getStoredStockCategories()'), 'getStoredStockCategories defined');
assert(html.includes('const stockCats = sys.filter(c => c.section === "stock");'), 'getStoredStockCategories filters system categories for stock');
assert(html.includes('renderCategoryOptions();') && html.includes('openStockHUD'), 'openStockHUD invokes renderCategoryOptions() on every open');
assert(html.includes('renderCategoryOptions(s.category);') && html.includes('editStockById'), 'editStockById invokes renderCategoryOptions() on open');

// 5. Functional Simulation of Handlers
console.log('\n--- 5. Functional Behavior Simulation ---');
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = v; }
};

const domElements = {
  'modal-system-category-form': { style: { display: 'none' } },
  'syscat-edit-id': { value: '' },
  'syscat-name-input': { value: '', focus: () => {} },
  'syscat-clarification-input': { value: '' },
  'syscat-modal-title': { textContent: '' },
  'syscat-modal-subtitle': { textContent: '' },
  'syscat-submit-btn': { textContent: '' },
  'stock-category': { innerHTML: '', options: [], value: '' },
  'stock-icon': { innerHTML: '', options: [], value: '' },
  'stock-edit-id': { value: '' },
  'stock-name': { value: '' },
  'stock-qty': { value: '10' },
  'stock-threshold': { value: '5' },
  'modal-stock': { style: { display: 'none' } },
  'modal-stock-heading': { textContent: '' }
};

global.document = {
  getElementById: (id) => domElements[id] || null,
  querySelector: (sel) => {
    if (sel.includes('input[name=\'syscat_section_radio\']:checked')) {
      return { value: global.selectedSectionRadio || 'stock' };
    }
    return null;
  },
  querySelectorAll: () => []
};

global.window = {
  state: {
    stock: [],
    systemCategories: []
  },
  OstanStyle: { showToast: () => {} }
};

// Extract and test getSystemWideCategories, getStoredStockCategories, renderCategoryOptions
eval(`
  function getCurrentUser() {
    return { id: 'usr-super', role: 'SUPER_ADMIN', email: 'admin@ostan.sa' };
  }
  function isMasterSuperAdmin() { return true; }
  function hasUserPermission() { return true; }
  function removeStockImage() {}
  function saveState() {}
  function renderSystemCategoriesManager() {}
  function renderWarehouse() {}
  function renderIconOptions() {}
  function renderCategoryManagerList() {}
  function setSysCatSelectedSection() {}
  function closeSystemCategoryModal() {
    domElements['modal-system-category-form'].style.display = 'none';
  }
  let currentSystemCategoryFilter = "ALL";

  ${html.match(/function getSystemWideCategories\(\) \{[\s\S]*?return initial;\s*\}/)[0]}

  ${html.match(/function getStoredStockCategories\(\) \{[\s\S]*?return \[[\s\S]*?\];\s*\}/)[0]}

  ${html.match(/function renderCategoryOptions\(selectedVal\) \{[\s\S]*?window\.renderCategoryOptions = renderCategoryOptions;/)[0]}

  ${html.match(/function openSystemCategoryAddDialog\(\) \{[\s\S]*?window\.openSystemCategoryAddDialog = openSystemCategoryAddDialog;/)[0]}

  ${html.match(/function handleSaveSystemCategoryForm\(e\) \{[\s\S]*?window\.handleSaveSystemCategoryForm = handleSaveSystemCategoryForm;/)[0]}

  ${html.match(/function openStockHUD\(\) \{[\s\S]*?document\.getElementById\("modal-stock"\)\.style\.display = "flex";\s*\}/)[0]}
`);

// Step A: Initial categories
const initialCats = getSystemWideCategories();
assert(initialCats.length >= 16, `System wide categories initialized with ${initialCats.length} categories`);

// Step B: Open Add Dialog
openSystemCategoryAddDialog();
assert(domElements['modal-system-category-form'].style.display === 'flex', 'openSystemCategoryAddDialog() opens modal-system-category-form');

// Step C: Save "T-Shirt (تيشيرت)" for stock
domElements['syscat-name-input'].value = 'T-Shirt (تيشيرت)';
domElements['syscat-clarification-input'].value = 'ملابس وتيشيرتات ميدانية للمشاريع';
global.selectedSectionRadio = 'stock';

handleSaveSystemCategoryForm({ preventDefault: () => {} });
assert(domElements['modal-system-category-form'].style.display === 'none', 'Modal closed after save');

const sysAfterAdd = getSystemWideCategories();
const addedTshirt = sysAfterAdd.find(c => c.name === 'T-Shirt (تيشيرت)');
assert(addedTshirt, 'T-Shirt (تيشيرت) saved in system categories');
assert(addedTshirt.section === 'stock', 'T-Shirt belongs to stock section');

// Step D: Open Stock HUD and verify dropdown options
openStockHUD();
assert(domElements['modal-stock'].style.display === 'flex', 'openStockHUD opens modal-stock');
assert(domElements['stock-category'].innerHTML.includes('value="T-Shirt (تيشيرت)"'), 'Category dropdown HTML contains value="T-Shirt (تيشيرت)"');
assert(domElements['stock-category'].innerHTML.includes('>T-Shirt (تيشيرت)</option>'), 'Category dropdown HTML displays T-Shirt (تيشيرت)');

console.log(`\n=== ALL FUNCTIONAL TESTS RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
