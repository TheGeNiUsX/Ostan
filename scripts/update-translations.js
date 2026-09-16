const fs = require('fs');
const path = require('path');

const enAdditions = `      company_brand_title: "Ostan Group",
      company_brand_subtitle: "ENTERPRISE OPERATIONS ERP",
      dash_exec_title: "Executive Operations Dashboard",
      dash_team_badge: "HR & Operations Team: Osama Al-Twaish (Director) - General Management",
      dash_active_accounts: "Active Accounts & National Staff",
      dash_active_verified: "Active & Verified",
      dash_staff_management: "Staff & Operations Management",
      dash_warnings: "Disciplinary Warnings",
      dash_warnings_desc: "View and manage all registered staff warnings",
      dash_deductions: "Financial Deductions",
      dash_deductions_desc: "View deductions and registered financial penalties",
      dash_advances: "Employee Advances & Loans",
      dash_advances_desc: "Track employee advances and repayment balances",
      dash_salary_raises: "Salary Increments & Payroll",
      dash_salary_raises_desc: "Track salary revisions and national payroll schedules",
      dash_assignments: "Temporary Assignments",
      dash_assignments_desc: "Assign and track operational duties and tasks",
      dash_replacements: "Replacements & Custody",
      dash_replacements_desc: "Manage asset custody, equipment, and staff handovers",
      dash_role_stats: "Statistics by Role",
      dash_role_pm: "Project Managers",
      dash_role_rm: "Regional Managers",
      dash_role_sup: "Supervisors",
      dash_role_oth: "Other Staff",
      dash_nat_distribution: "Nationality Distribution",
      dash_view_all: "View All >",
      dash_view_active: "View Active >",
      dash_view_alerts: "View Alerts >",
`;

const arAdditions = `      company_brand_title: "مجموعة أستان",
      company_brand_subtitle: "نظام إدارة العمليات الشامل ERP",
      dash_exec_title: "لوحة التحكم الإدارية",
      dash_team_badge: "فريق الموارد البشرية: أسامة طويش (مدير) - الإدارة العامة",
      dash_active_accounts: "الحسابات النشطة والكادر الوطني",
      dash_active_verified: "على رأس العمل ومسجلين",
      dash_staff_management: "إدارة الموظفين والعمليات",
      dash_warnings: "الإنذارات",
      dash_warnings_desc: "عرض وإدارة جميع الإنذارات المسجلة للموظفين",
      dash_deductions: "الخصومات",
      dash_deductions_desc: "عرض وإدارة الخصومات والجزاءات المسجلة",
      dash_advances: "السلف",
      dash_advances_desc: "عرض ومتابعة جميع السلف المستردة والمتبقية",
      dash_salary_raises: "زيادات الرواتب والرواتب",
      dash_salary_raises_desc: "عرض جميع الزيادات ومسيرات الرواتب",
      dash_assignments: "التكليفات المؤقتة",
      dash_assignments_desc: "عرض جميع التكليفات والمهام الميدانية",
      dash_replacements: "الاستبدالات والعهد",
      dash_replacements_desc: "عرض جميع عمليات استبدال العهد والمواد",
      dash_role_stats: "إحصاءات حسب الأدوار",
      dash_role_pm: "مدراء المشاريع",
      dash_role_rm: "مدراء المناطق",
      dash_role_sup: "المشرفين",
      dash_role_oth: "درجات أخرى",
      dash_nat_distribution: "توزيع الجنسيات",
      dash_view_all: "عرض الكل >",
      dash_view_active: "عرض النشطين >",
      dash_view_alerts: "عرض التنبيهات >",
`;

function patchFile(relPath) {
  const fPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fPath)) return;
  let code = fs.readFileSync(fPath, 'utf8');

  if (!code.includes('company_brand_title')) {
    code = code.replace(/(en:\s*\{[\r\n]+)/, `$1${enAdditions}`);
    code = code.replace(/(ar:\s*\{[\r\n]+)/, `$1${arAdditions}`);
    fs.writeFileSync(fPath, code, 'utf8');
    console.log(`✅ Patched ${relPath}`);
  } else {
    console.log(`ℹ️ Already patched ${relPath}`);
  }
}

patchFile('translation.js');
patchFile('public/translation.js');
