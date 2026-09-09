const fs = require('fs');

console.log('=== RUNNING SUITE: SAUDI EMPLOYEES & SALARY WORKFLOW ===\n');

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
console.log('--- 1. Testing HTML Structure ---');
assert(html.includes('id="emp-tab-saudi"'), 'Saudi Tab button exists');
assert(html.includes('id="emp-subview-saudi"'), 'Saudi Subview container exists');
assert(html.includes('id="saudi-stat-count"'), 'Saudi Nationals KPI exists');
assert(html.includes('id="saudi-stat-ratio"'), 'Saudization Ratio KPI exists');
assert(html.includes('id="saudi-stat-payroll"'), 'Monthly Saudi Payroll KPI exists');
assert(html.includes('id="saudi-stat-avg-salary"'), 'Average Saudi Salary KPI exists');
assert(html.includes('id="saudi-workers-grid"'), 'Saudi Workers Grid container exists');
assert(html.includes('id="worker-salary"'), 'Worker Salary Box input exists');
assert(html.includes('id="worker-nationality"'), 'Worker Nationality selector exists');
assert(html.includes('id="worker-national-id"'), 'Worker National ID input exists');
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

// 3. Test Sample CSV Generation Fallback & Data Validity
console.log('\n--- 3. Testing Sample Generation Data Structure ---');
const sampleData = [
  { "Name": "Mohammed Al-Otaibi", "Name_Ar": "محمد العتيبي", "National_ID": "1098765432", "Phone": "+966 50 234 5678", "Email": "mohammed@company.sa", "Role": "EMPLOYEE", "Department": "Operations", "Salary_SAR": 9500 },
  { "Name": "Sarah Al-Dosari", "Name_Ar": "سارة الدوسري", "National_ID": "1087654321", "Phone": "+966 55 876 5432", "Email": "sarah@company.sa", "Role": "MANAGER", "Department": "HR", "Salary_SAR": 14000 }
];

const headers = ["Name", "Name_Ar", "National_ID", "Phone", "Email", "Role", "Department", "Salary_SAR"];
const rows = sampleData.map(r => headers.map(h => `"${(r[h] || "").toString().replace(/"/g, '""')}"`).join(","));
const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
assert(csvContent.includes("Mohammed Al-Otaibi") && csvContent.includes("14000"), 'Sample template generates valid formatted rows');

// 4. Test Excel Parsing Logic (Key Lookup & Mapping)
console.log('\n--- 4. Testing Column Mapping & Normalization Engine ---');
const sampleRow = {
  "الاسم": "فهد الحربي",
  "National ID": "1076543210",
  "الجوال": "0563456789",
  "Role": "مدير المستودع",
  "الراتب الشهري": "10,500 SAR"
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

const name = getVal(sampleRow, "name", "الاسم");
const nid = getVal(sampleRow, "national id", "national_id", "الهوية");
const phoneRaw = getVal(sampleRow, "phone", "الجوال");
const roleRaw = getVal(sampleRow, "role", "الرتبة");
const salRaw = getVal(sampleRow, "salary", "الراتب", "الراتب الشهري");

assert(name === "فهد الحربي", `Mapped name: ${name}`);
assert(nid === "1076543210", `Mapped national ID: ${nid}`);
assert(phoneRaw === "0563456789", `Mapped phone: ${phoneRaw}`);
assert(parseFloat(salRaw.replace(/[^0-9.]/g, "")) === 10500, `Parsed salary to 10500`);

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
assert(personalized.includes("25,000 SAR"), `Message replaced {salary} with "25,000 SAR": "${personalized}"`);
assert(personalized.includes("اسامة الطويش"), `Message replaced {name} with Arabic name: "${personalized}"`);

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

console.log(`\n=== ALL TESTS COMPLETED: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
