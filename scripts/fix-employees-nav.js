const fs = require('fs');
const path = require('path');

console.log('=== FIXING EMPLOYEES & SAUDI STAFF NAVIGATION ===');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Update top-nav-employees in top subnav bar
html = html.replace(
  /<a id="top-nav-employees" class="top-subnav-item"[^>]*onclick="[^"]*"[^>]*>/,
  '<a id="top-nav-employees" class="top-subnav-item" onclick="setModule(\'employees\', \'all\')">'
);

// 2. Update nav-employees in sidebar
html = html.replace(
  /<a id="nav-employees" class="nav-item"[^>]*onclick="[^"]*"[^>]*>/,
  '<a id="nav-employees" class="nav-item" onclick="setModule(\'employees\', \'all\')">'
);

// 3. Update setModule(mod) signature and body to support subTab
const oldSetModuleRegex = /function setModule\(mod\)\s*\{[\s\S]*?if \(mod === "saudi-staff"\)\s*\{[\s\S]*?setModule\("employees"\);[\s\S]*?setEmployeeViewTab\("saudi"\);[\s\S]*?return;\s*\}[\s\S]*?state\.activeModule = mod;/;

const newSetModule = `function setModule(mod, subTab) {
      if (typeof window !== "undefined" && window.innerWidth <= 900) {
        closeMobileSidebar();
      }

      if (mod === "saudi-staff") {
        const access = getSectionAccess("saudi-staff");
        if (access === "locked") {
          document.getElementById("modal-section-locked").style.display = "flex";
          return;
        }
        if (access === "hidden") {
          return;
        }
        setModule("employees", "saudi");
        return;
      }

      const access = getSectionAccess(mod);
      if (access === "locked") {
        document.getElementById("modal-section-locked").style.display = "flex";
        if (state.activeModule && getSectionAccess(state.activeModule) !== "accessible") {
          setModule("dashboard");
        }
        return;
      }
      if (access === "hidden") {
        if (state.activeModule === mod || (state.activeModule && getSectionAccess(state.activeModule) !== "accessible")) {
          setModule("dashboard");
        }
        return;
      }

      state.activeModule = mod;

      // When switching to employees module, switch sub-view to requested tab (default "all")
      if (mod === "employees") {
        const targetTab = subTab || "all";
        setEmployeeViewTab(targetTab);
      }`;

if (oldSetModuleRegex.test(html)) {
  html = html.replace(oldSetModuleRegex, newSetModule);
  console.log('✅ Updated setModule(mod, subTab) implementation');
} else {
  console.error('❌ Could not find oldSetModuleRegex');
}

// 4. Update setEmployeeViewTab to also update top-nav-employees and top-nav-saudi-staff
const oldNavUpdateRegex = /const navSaudi = document\.getElementById\("nav-saudi-staff"\);[\s\S]*?const navEmp = document\.getElementById\("nav-employees"\);[\s\S]*?if \(state\.activeModule === "employees"\)\s*\{[\s\S]*?navSaudi\.classList\.remove\("active"\);\s*\}\s*\}/;

const newNavUpdate = `const navSaudi = document.getElementById("nav-saudi-staff");
      const navEmp = document.getElementById("nav-employees");
      const topNavSaudi = document.getElementById("top-nav-saudi-staff");
      const topNavEmp = document.getElementById("top-nav-employees");

      if (tab === "saudi") {
        if (navSaudi) navSaudi.classList.add("active");
        if (navEmp) navEmp.classList.remove("active");
        if (topNavSaudi) topNavSaudi.classList.add("active");
        if (topNavEmp) topNavEmp.classList.remove("active");
      } else {
        if (navEmp) navEmp.classList.add("active");
        if (navSaudi) navSaudi.classList.remove("active");
        if (topNavEmp) topNavEmp.classList.add("active");
        if (topNavSaudi) topNavSaudi.classList.remove("active");
      }`;

if (oldNavUpdateRegex.test(html)) {
  html = html.replace(oldNavUpdateRegex, newNavUpdate);
  console.log('✅ Updated setEmployeeViewTab nav highlighting for both sidebar and top subnav');
} else {
  console.error('❌ Could not find oldNavUpdateRegex');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ index.html written successfully');
