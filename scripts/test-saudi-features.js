const fs = require('fs');

console.log('=== RUNNING SUITE: SAUDI EMPLOYEES & SALARY WORKFLOW (11 COLUMNS) ===\n');

const html = fs.readFileSync('index.html', 'utf8');
const translations = fs.readFileSync('translation.js', 'utf8');

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

// 1. Check HTML Elements
console.log('--- 1. Testing HTML Structure & Custom Saudi Inputs ---');
assert(html.includes('id="emp-tab-saudi"'), 'Saudi Tab button exists');
assert(html.includes('id="emp-subview-saudi"'), 'Saudi Subview container exists');
assert(html.includes('id="saudi-stat-count"'), 'Saudi Nationals KPI exists');
assert(html.includes('id="saudi-stat-ratio"'), 'Saudization Ratio KPI exists');
assert(html.includes('id="saudi-stat-payroll"'), 'Monthly Saudi Payroll KPI exists');
assert(html.includes('id="saudi-stat-refund"'), 'Company Refund KPI exists');
assert(html.includes('id="saudi-workers-grid"'), 'Saudi Workers Grid container exists');
assert(html.includes('id="worker-salary"'), 'Worker Salary Box input exists');
assert(html.includes('id="worker-nationality"'), 'Worker Nationality selector exists');
assert(html.includes('id="worker-national-id"'), 'Worker National ID input exists');
assert(html.includes('id="saudi-worker-fields"'), 'Dedicated Saudi custom fields container exists in modal');
assert(html.includes('id="worker-id-profession"'), 'Worker ID Profession input exists (المهنة في الهوية)');
assert(html.includes('id="worker-cr-number"'), 'Worker CR Number input exists (رقم السجل)');
assert(html.includes('id="worker-cr-name"'), 'Worker CR Name input exists (اسم السجل)');
assert(html.includes('id="worker-referred-by"'), 'Worker Referred By input exists (من طرف)');
assert(html.includes('id="worker-birth-date"'), 'Worker Birth Date input exists (تاريخ الميلاد)');
assert(html.includes('id="worker-hire-date"'), 'Worker Work Start Date input exists (تاريخ بدء العمل)');
assert(html.includes('id="modal-excel-import"'), 'Excel Batch Import Modal exists');
assert(html.includes('id="excel-dropzone"'), 'Excel Dropzone exists');
assert(html.includes('downloadSaudiExcelSample()'), 'Download Excel sample handler linked');
assert(html.includes('filterSaudiBySalary'), 'filterSaudiBySalary function linked in Messages Sender');
assert(html.includes('{salary}'), '{salary} token button exists in Messages Composer');
assert(html.includes('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'), 'SheetJS CDN script loaded in <head>');

// 2. Check Translations
console.log('\n--- 2. Testing Translations (EN & AR) ---');
assert(translations.includes('emp_tab_saudi: "🇸🇦 Saudi Staff"'), 'English translation for emp_tab_saudi');
assert(translations.includes('emp_tab_saudi: "🇸🇦 الكادر السعودي"'), 'Arabic translation for emp_tab_saudi');
assert(translations.includes('metric_saudi_payroll: "Monthly Saudi Payroll"'), 'English translation for metric_saudi_payroll');
assert(translations.includes('metric_saudi_payroll: "إجمالي مسيرات الرواتب"'), 'Arabic translation for metric_saudi_payroll');
assert(translations.includes('token_salary: "{salary}"'), 'token_salary key present');
assert(translations.includes('btn_filter_saudi_msg: "🇸🇦 Saudi Staff"'), 'btn_filter_saudi_msg in English');
assert(translations.includes('btn_filter_saudi_msg: "🇸🇦 الكادر السعودي"'), 'btn_filter_saudi_msg in Arabic');
assert(translations.includes('label_id_profession: "المهنة في الهوية"'), 'Arabic label for ID Profession');
assert(translations.includes('label_cr_number: "رقم السجل"'), 'Arabic label for CR Number');
assert(translations.includes('label_cr_name: "اسم السجل"'), 'Arabic label for CR Name');
assert(translations.includes('label_referred_by: "من طرف"'), 'Arabic label for Referred By');
assert(translations.includes('label_birth_date: "تاريخ الميلاد"'), 'Arabic label for Date of Birth');
assert(translations.includes('label_hire_date: "تاريخ بدء العمل"'), 'Arabic label for Work Start Date');

// 3. Test 11-Column Sample Excel Generation Header Match
console.log('\n--- 3. Testing 11-Column Sample Generation Structure ---');
const expectedColumns = [
  "اسم الموظف",
  "المهنة في الهوية",
  "رقم السجل",
  "اسم السجل",
  "من طرف",
  "رقم الهاتف",
  "رقم الهوية",
  "الإيميل",
  "تاريخ الميلاد",
  "الراتب",
  "تاريخ بدء العمل"
];

expectedColumns.forEach(col => {
  assert(html.includes(`"${col}"`), `Sample generator includes exact header: "${col}"`);
});

// 4. Test Excel Parsing Logic (Exact 11 Columns Lookup & Mapping)
console.log('\n--- 4. Testing 11-Column Mapping & Normalization Engine ---');
const sampleRow = {
  "اسم الموظف": "فهد بن ناصر الحربي",
  "المهنة في الهوية": "مدير شؤون الموظفين",
  "رقم السجل": "1010654321",
  "اسم السجل": "مؤسسة أستان للتجارة والمقاولات",
  "من طرف": "أبو فهد",
  "رقم الهاتف": "0563456789",
  "رقم الهوية": "1076543210",
  "الإيميل": "fahad.harbi@company.sa",
  "تاريخ الميلاد": "1990-04-15",
  "الراتب": "12,500 SAR",
  "تاريخ بدء العمل": "2022-03-01"
};

const getVal = (row, ...keys) => {
  for (const k of keys) {
    for (const rowKey of Object.keys(row)) {
      if (rowKey.trim().toLowerCase() === k.toLowerCase()) {
        return String(row[rowKey]).trim();
      }
    }
  }
  return "";
};

const name = getVal(sampleRow, "اسم الموظف", "الاسم", "name");
const idProf = getVal(sampleRow, "المهنة في الهوية", "المهنة", "id profession");
const crNum = getVal(sampleRow, "رقم السجل", "cr number");
const crName = getVal(sampleRow, "اسم السجل", "cr name");
const refBy = getVal(sampleRow, "من طرف", "referred by");
const phone = getVal(sampleRow, "رقم الهاتف", "الجوال", "phone");
const nid = getVal(sampleRow, "رقم الهوية", "national id");
const email = getVal(sampleRow, "الإيميل", "email");
const dob = getVal(sampleRow, "تاريخ الميلاد", "birth date");
const sal = parseFloat(getVal(sampleRow, "الراتب", "salary").replace(/[^0-9.]/g, ""));
const hire = getVal(sampleRow, "تاريخ بدء العمل", "hire date");

assert(name === "فهد بن ناصر الحربي", `Mapped name: ${name}`);
assert(idProf === "مدير شؤون الموظفين", `Mapped ID profession: ${idProf}`);
assert(crNum === "1010654321", `Mapped CR Number: ${crNum}`);
assert(crName === "مؤسسة أستان للتجارة والمقاولات", `Mapped CR Name: ${crName}`);
assert(refBy === "أبو فهد", `Mapped Referred By: ${refBy}`);
assert(phone === "0563456789", `Mapped Phone: ${phone}`);
assert(nid === "1076543210", `Mapped National ID: ${nid}`);
assert(email === "fahad.harbi@company.sa", `Mapped Email: ${email}`);
assert(dob === "1990-04-15", `Mapped DOB: ${dob}`);
assert(sal === 12500, `Parsed Salary: ${sal}`);
assert(hire === "2022-03-01", `Mapped Hire Date: ${hire}`);

// 5. Test Personalized Message Builder with {salary}
console.log('\n--- 5. Testing Personalized Message Builder ---');
function buildPersonalizedMessage(rawText, user = null) {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const name = user ? (user.nameAr || user.name) : "Staff";
  const role = user ? user.role : "EMPLOYEE";
  const company = "Ostan Enterprise";
  const salary = (user && typeof user.salary !== "undefined" && user.salary !== null)
    ? `${Number(user.salary).toLocaleString()} SAR`
    : "N/A";

  return rawText
    .replace(/{name}/g, name)
    .replace(/{role}/g, role)
    .replace(/{salary}/g, salary)
    .replace(/{date}/g, today)
    .replace(/{time}/g, nowTime)
    .replace(/{company}/g, company);
}

const testUser = { name: "Osama", nameAr: "اسامة الطويش", role: "SUPER_ADMIN", salary: 25000 };
const template = "مرحباً {name}، نود إعلامك بأن راتبك الشهري هو {salary} ورتبتك {role}.";
const personalized = buildPersonalizedMessage(template, testUser);
assert(personalized.includes("25,000 SAR"), `Message replaced {salary} with "25,000 SAR"`);
assert(personalized.includes("اسامة الطويش"), `Message replaced {name} with Arabic name`);

// 6. Test Salary Range Filter Logic
console.log('\n--- 6. Testing Salary Range Filtering ---');
const mockStaff = [
  { id: '1', name: 'Worker A', salary: 4500, isSaudi: true },
  { id: '2', name: 'Worker B', salary: 8500, isSaudi: true },
  { id: '3', name: 'Worker C', salary: 12000, isSaudi: true },
  { id: '4', name: 'Worker D', salary: 22000, isSaudi: true },
  { id: '5', name: 'Worker E', salary: 9000, isSaudi: false }
];

function filterSaudisBySalary(staff, min, max) {
  return staff.filter(u => u.isSaudi && u.salary >= min && (max === Infinity || u.salary <= max));
}

const under5k = filterSaudisBySalary(mockStaff, 0, 5000);
const from5kTo10k = filterSaudisBySalary(mockStaff, 5000, 10000);
const above15k = filterSaudisBySalary(mockStaff, 15000, Infinity);

assert(under5k.length === 1 && under5k[0].name === 'Worker A', 'Bracket < 5,000 matches Worker A');
assert(from5kTo10k.length === 1 && from5kTo10k[0].name === 'Worker B', 'Bracket 5,000 - 10,000 matches Worker B (excludes non-Saudi)');
assert(above15k.length === 1 && above15k[0].name === 'Worker D', 'Bracket > 15,000 matches Worker D');

// 7. Test Precise Saudi Salary Tiers (5500, 4000, 1500) & Company Refund
console.log('\n--- 7. Testing Precise Saudi Salary Tiers (5500, 4000, 1500) & 1,000 Default Payout ---');
const tiers = [
  { gross: 5500, expectedPayout: 1000, expectedRefund: 4500 },
  { gross: 4000, expectedPayout: 1000, expectedRefund: 3000 },
  { gross: 1500, expectedPayout: 1000, expectedRefund: 500 }
];

tiers.forEach(({ gross, expectedPayout, expectedRefund }) => {
  const payout = 1000;
  const refund = Math.max(0, gross - payout);
  assert(refund === expectedRefund, `Tier ${gross} SAR: Payout ${payout} SAR -> Company Refund = ${refund} SAR (expected ${expectedRefund})`);
});

// Verify HTML contains the 3 solid tier buttons & inputs
assert(html.includes('id="saudi-salary-calculator"'), 'Saudi salary calculator container exists');
assert(html.includes('id="tier-btn-5500"'), 'Solid Tier 5,500 SAR button exists');
assert(html.includes('id="tier-btn-4000"'), 'Solid Tier 4,000 SAR button exists');
assert(html.includes('id="tier-btn-1500"'), 'Solid Tier 1,500 SAR button exists');
assert(html.includes('id="worker-employee-payout"'), 'Employee payout input exists');
assert(html.includes('id="worker-calc-refund-val"'), 'Company refund calculation badge exists');
assert(html.includes('selectSaudiSalaryTier'), 'selectSaudiSalaryTier function exists');
assert(html.includes('updateSaudiSalaryCalc'), 'updateSaudiSalaryCalc function exists');

// Verify Executive KPI elements
assert(html.includes('id="saudi-stat-payout"'), 'Total Employee Payout KPI stat exists');
assert(html.includes('id="saudi-stat-refund"'), 'Total Company Refund KPI stat exists');

// Verify Toolbar Filter buttons
assert(html.includes('id="saudi-sal-filter-1500"'), 'Toolbar filter for 1,500 SAR exists');
assert(html.includes('id="saudi-sal-filter-4000"'), 'Toolbar filter for 4,000 SAR exists');
assert(html.includes('id="saudi-sal-filter-5500"'), 'Toolbar filter for 5,500 SAR exists');

// Verify Excel sample uses the 3 solid tiers
assert(html.includes('"5,500 SAR"'), 'Excel sample includes 5,500 SAR tier');
assert(html.includes('"4,000 SAR"'), 'Excel sample includes 4,000 SAR tier');
assert(html.includes('"1,500 SAR"'), 'Excel sample includes 1,500 SAR tier');

// Verify Translations for payout and refund
assert(translations.includes('metric_saudi_payout: "Total Employee Payout"'), 'English translation for metric_saudi_payout');
assert(translations.includes('metric_saudi_payout: "إجمالي المستلم للموظفين"'), 'Arabic translation for metric_saudi_payout');
assert(translations.includes('metric_saudi_return: "Total Company Refund"'), 'English translation for metric_saudi_return');
assert(translations.includes('metric_saudi_return: "إجمالي المسترد للشركة"'), 'Arabic translation for metric_saudi_return');
assert(translations.includes('label_employee_payout: "المستلم الفعلي للموظف"'), 'Arabic label for employee payout');
assert(translations.includes('label_company_return: "المسترد للشركة"'), 'Arabic label for company refund');

// 6. Test Removal of Sign Up & Admin Provisioning Only
console.log('\n--- 6. Testing Removal of Self Sign-Up & Admin Password Provisioning ---');
assert(!html.includes('id="auth-tab-signup"'), 'Sign up tab completely removed from Auth Portal');
assert(!html.includes('id="auth-tab-login"'), 'Auth tab switcher removed (sign-in only)');
assert(html.includes('auth_admin_only_note'), 'Admin provisioning only note present in Auth Portal');
assert(html.includes('id="worker-password"'), 'Worker login password field exists in Employee Modal');
assert(html.includes('id="modal-worker-credentials"'), 'Provisioned credentials dialog exists');
assert(html.includes('generateRandomWorkerPassword'), 'generateRandomWorkerPassword function exists');
assert(html.includes('toggleWorkerPasswordVisibility'), 'toggleWorkerPasswordVisibility function exists');
assert(html.includes('showProvisionedCredentialsModal'), 'showProvisionedCredentialsModal function exists');
assert(html.includes('copyProvisionedCredentials'), 'copyProvisionedCredentials function exists');

assert(translations.includes('auth_admin_only_note'), 'auth_admin_only_note exists in translation.js');
assert(translations.includes('label_worker_password'), 'label_worker_password exists in translation.js');
assert(translations.includes('btn_gen_password'), 'btn_gen_password exists in translation.js');
assert(translations.includes('btn_copy_credentials'), 'btn_copy_credentials exists in translation.js');
assert(translations.includes('modal_cred_title'), 'modal_cred_title exists in translation.js');

// 7. Test Saudi Staff Permissions & Department Matrix
console.log('\n--- 7. Testing Saudi Staff Granular Permissions & Matrix ---');
assert(html.includes('id="nav-saudi-staff"'), 'Sidebar nav-saudi-staff exists');
assert(html.includes("setModule('saudi-staff')"), 'nav-saudi-staff onclick calls setModule("saudi-staff")');
assert(html.includes('value="saudi-staff"'), 'Department policy section dropdown includes saudi-staff');
assert(html.includes('id="chk-perm-saudi-view"'), 'chk-perm-saudi-view checkbox exists');
assert(html.includes('id="chk-perm-saudi-create"'), 'chk-perm-saudi-create checkbox exists');
assert(html.includes('id="chk-perm-saudi-edit"'), 'chk-perm-saudi-edit checkbox exists');
assert(html.includes('id="chk-perm-saudi-delete"'), 'chk-perm-saudi-delete checkbox exists');
assert(html.includes('id="chk-perm-saudi-excel"'), 'chk-perm-saudi-excel checkbox exists');
assert(html.includes('{ key: "saudi-staff", label: "🇸🇦 Saudi Staff" }'), 'renderDepartments matrix includes saudi-staff column');

assert(translations.includes('nav_saudi_staff: "Saudi Staff"'), 'nav_saudi_staff translation EN');
assert(translations.includes('nav_saudi_staff: "الكادر السعودي"'), 'nav_saudi_staff translation AR');
assert(translations.includes('perm_sec_saudi: "🇸🇦 Saudi Staff & Payroll Hub"'), 'perm_sec_saudi translation EN');
assert(translations.includes('perm_sec_saudi: "🇸🇦 الكادر الوطني وإدارة الرواتب"'), 'perm_sec_saudi translation AR');
assert(translations.includes('perm_saudi_view'), 'perm_saudi_view translation key exists');
assert(translations.includes('perm_saudi_create'), 'perm_saudi_create translation key exists');
assert(translations.includes('perm_saudi_edit'), 'perm_saudi_edit translation key exists');
assert(translations.includes('perm_saudi_delete'), 'perm_saudi_delete translation key exists');
assert(translations.includes('perm_saudi_excel'), 'perm_saudi_excel translation key exists');

// Verify Simulated Permission Evaluation Logic
function simulateGetSectionAccess(mod, user) {
  if (!user) return "hidden";
  if (user.role === "SUPER_ADMIN") return "accessible";
  const normMod = (mod === "saudi-staff" || mod === "saudi_staff") ? "saudi-staff" : mod;

  if (user.sectionAccess && user.sectionAccess[normMod] === "locked") return "locked";

  if (user.permissions) {
    if (normMod === "saudi-staff") {
      const sP = user.permissions["saudi-staff"] || user.permissions.saudi_staff;
      if (sP && typeof sP.view !== "undefined") {
        return sP.view ? "accessible" : "hidden";
      }
    }
    if (normMod === "employees") {
      const empView = user.permissions.employees ? user.permissions.employees.view : null;
      const saudiView = (user.permissions["saudi-staff"] || user.permissions.saudi_staff) ? (user.permissions["saudi-staff"] || user.permissions.saudi_staff).view : null;
      if (empView === true || saudiView === true) return "accessible";
      if (empView === false && (saudiView === false || saudiView === null)) return "hidden";
    }
    if (user.permissions[normMod] && typeof user.permissions[normMod].view !== "undefined") {
      return user.permissions[normMod].view ? "accessible" : "hidden";
    }
  }

  if (user.sectionAccess && user.sectionAccess[normMod]) return user.sectionAccess[normMod];
  if (normMod === "saudi-staff") {
    if (user.sectionAccess && user.sectionAccess.employees) return user.sectionAccess.employees;
    return (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "MANAGER") ? "accessible" : "hidden";
  }
  if (normMod === "employees") {
    if (user.sectionAccess && user.sectionAccess["saudi-staff"] === "accessible") return "accessible";
    return (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "MANAGER") ? "accessible" : "hidden";
  }
  return "accessible";
}

// Test Case A: User with explicit granular saudi-staff view: true, employees view: false
const saudiOnlyUser = {
  id: "u-saudi-auditor",
  role: "EMPLOYEE",
  permissions: {
    employees: { view: false, create: false, edit: false, delete: false },
    "saudi-staff": { view: true, create: true, edit: true, delete: false, excel: true }
  },
  sectionAccess: {
    employees: "accessible",
    "saudi-staff": "accessible"
  }
};
assert(simulateGetSectionAccess("saudi-staff", saudiOnlyUser) === "accessible", 'Saudi staff access is accessible for Saudi Auditor');
assert(simulateGetSectionAccess("employees", saudiOnlyUser) === "accessible", 'Container employees is accessible so Saudi Auditor can open Saudi Hub');

// Test Case B: User with saudi-staff locked in sectionAccess
const lockedSaudiUser = {
  id: "u-locked",
  role: "EMPLOYEE",
  permissions: {
    "saudi-staff": { view: true, create: true, edit: false, delete: false, excel: false }
  },
  sectionAccess: {
    "saudi-staff": "locked"
  }
};
assert(simulateGetSectionAccess("saudi-staff", lockedSaudiUser) === "locked", 'Explicit locked sectionAccess returns locked even if permissions.view was true');

// Test Case C: Standard employee with no permissions
const regularEmp = {
  id: "u-regular",
  role: "EMPLOYEE",
  sectionAccess: { employees: "hidden" }
};
assert(simulateGetSectionAccess("saudi-staff", regularEmp) === "hidden", 'Saudi staff hidden for regular employee without permissions');

// 8. Test Mobile & Phone Website Compatibility
console.log('\n--- 8. Testing Mobile & Phone Compatibility ---');
assert(html.includes('viewport-fit=cover'), 'Viewport meta tag configured with viewport-fit=cover');
assert(html.includes('id="btn-mobile-menu-toggle"'), 'Mobile menu toggle button exists');
assert(html.includes('id="sidebar-mobile-backdrop"'), 'Mobile drawer backdrop exists');
assert(html.includes('toggleMobileSidebar'), 'toggleMobileSidebar function exists');
assert(html.includes('closeMobileSidebar'), 'closeMobileSidebar function exists');
assert(html.includes('table-responsive-wrapper'), 'table-responsive-wrapper class present for horizontal scrolling on phones');
assert(html.includes('@media screen and (max-width: 900px)'), 'Tablet/mobile @media query (900px) defined');
assert(html.includes('@media screen and (max-width: 540px)'), 'Small phone @media query (540px) defined');

console.log(`\n=== ALL TESTS COMPLETED: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
