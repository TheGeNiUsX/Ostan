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

console.log('=== RUNNING TESTS: PROFILE PAGE, SYSTEM CATEGORIES & WORD REMOVAL ===\n');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const trans = fs.readFileSync(path.join(__dirname, '..', 'translation.js'), 'utf8');

// 1. Organization Word Removal
console.log('--- 1. Testing Removal of "Organization" Word ---');
assert(!html.includes('Stock Requests (Organizations)'), 'No "Stock Requests (Organizations)" in index.html');
assert(!html.includes('طلبات الصرف (للمؤسسات)'), 'No "طلبات الصرف (للمؤسسات)" in index.html');
assert(html.includes('<span data-i18n="nav_stock_requests">Stock Requests</span>'), 'Sidebar has clean "Stock Requests"');
assert(trans.includes('nav_stock_requests: "Stock Requests",'), 'Translation en has "Stock Requests"');
assert(trans.includes('nav_stock_requests: "طلبات الصرف",'), 'Translation ar has "طلبات الصرف"');

// 2. Hidden Profile Page Accessible via Pressing on Name
console.log('\n--- 2. Testing Hidden Profile Page Access ---');
assert(html.includes('id="view-profile"'), 'Hidden view-profile section exists');
assert(!html.includes('id="nav-profile"'), 'No nav-profile link in navigation (hidden from menus)');
assert(!html.includes('id="top-nav-profile"'), 'No top-nav-profile link in top bar (hidden from menus)');

assert(html.includes('onclick="setModule(\'profile\')"'), 'setModule("profile") is linked to user elements');
assert(html.includes('id="sidebar-user-name"') && html.includes('onclick="setModule(\'profile\')"'), 'Pressing on sidebar user name opens profile');
assert(html.includes('id="top-header-user-name"') && html.includes('onclick="setModule(\'profile\')"'), 'Pressing on top header user name opens profile');

assert(html.includes('function renderUserProfileView'), 'renderUserProfileView function defined');
assert(html.includes('id="modal-edit-user-profile"'), 'Profile edit modal exists');
assert(html.includes('function openProfileEditModal'), 'openProfileEditModal defined');
assert(html.includes('function handleSaveUserProfile'), 'handleSaveUserProfile defined');

// 3. System-Wide Category Management in System Settings (Super Admin Only)
console.log('\n--- 3. Testing System-Wide Category Management in Settings ---');
assert(html.includes('id="settings-categories-container"'), 'settings-categories-container exists in view-settings');
assert(html.includes('SUPER ADMIN ONLY'), 'Marked with SUPER ADMIN ONLY security badge');
assert(html.includes('function renderSystemCategoriesManager'), 'renderSystemCategoriesManager defined');
assert(html.includes('function filterSystemCategories'), 'filterSystemCategories defined');
assert(html.includes('function openSystemCategoryAddDialog'), 'openSystemCategoryAddDialog defined');
assert(html.includes('function editSystemCategory'), 'editSystemCategory defined');
assert(html.includes('function deleteSystemCategory'), 'deleteSystemCategory defined');

// Check sections coverage
assert(html.includes('sectionName: "📦 المخزون والمستودع"'), 'Stock & Warehouse section category included');
assert(html.includes('sectionName: "📋 الطلبيات والتوريد"'), 'Orders section category included');
assert(html.includes('sectionName: "✅ المهام والعمليات"'), 'Tasks section category included');
assert(html.includes('sectionName: "👥 الكادر والموارد البشرية"'), 'HR & Employees section category included');
assert(html.includes('clarification:'), 'Clarification field for which section category belongs to exists');

console.log(`\n=== ALL TESTS RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
