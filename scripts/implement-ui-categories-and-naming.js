const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
const transPath = path.join(__dirname, '..', 'translation.js');

let indexHtml = fs.readFileSync(indexPath, 'utf8');
let transJs = fs.readFileSync(transPath, 'utf8');

console.log('--- 1. Updating translation.js ---');
// Update nav_stock_requests and requests_section_title in translation.js
transJs = transJs.replace(
  /nav_stock_requests:\s*"Stock Requests",/g,
  'nav_stock_requests: "Submit Requests",'
);
transJs = transJs.replace(
  /nav_stock_requests:\s*"طلبات الصرف",/g,
  'nav_stock_requests: "تقديم طلبات الصرف",'
);
transJs = transJs.replace(
  /requests_section_title:\s*"Stock Requests",/g,
  'requests_section_title: "Submit Requests",'
);
transJs = transJs.replace(
  /requests_section_title:\s*"طلبات صرف المواد والمعدات",/g,
  'requests_section_title: "تقديم طلبات الصرف",'
);
fs.writeFileSync(transPath, transJs, 'utf8');
console.log('✅ Updated translation.js');

console.log('--- 2. Updating index.html navigation and section headings ---');
indexHtml = indexHtml.replace(
  /<span data-i18n="nav_stock_requests">Stock Requests<\/span>/g,
  '<span data-i18n="nav_stock_requests">Submit Requests</span>'
);
indexHtml = indexHtml.replace(
  /<span data-i18n="nav_stock_requests">طلبات الصرف<\/span>/g,
  '<span data-i18n="nav_stock_requests">تقديم طلبات الصرف</span>'
);
indexHtml = indexHtml.replace(
  /<h2 data-i18n="requests_section_title"[^>]*>[^<]*<\/h2>/g,
  '<h2 data-i18n="requests_section_title" style="font-size: 1.3rem; font-weight: 800;">Submit Requests</h2>'
);

console.log('--- 3. Updating openStockHUD to always call renderCategoryOptions() and renderIconOptions() ---');
indexHtml = indexHtml.replace(
  /function openStockHUD\(\) \{[\s\S]*?document\.getElementById\("modal-stock"\)\.style\.display = "flex";\s*\}/,
  `function openStockHUD() {
      if (!hasUserPermission("stock", "create")) {
        alert("Permission denied: You do not have permission to add warehouse items.");
        return;
      }
      document.getElementById("stock-edit-id").value = "";
      document.getElementById("stock-name").value = "";
      document.getElementById("stock-qty").value = "10";
      document.getElementById("stock-threshold").value = "5";
      const projInput = document.getElementById("stock-project");
      if (projInput) projInput.value = "";
      removeStockImage();
      renderCategoryOptions();
      renderIconOptions();
      document.getElementById("modal-stock-heading").textContent = "📦 Add Inventory Item";
      document.getElementById("modal-stock").style.display = "flex";
    }`
);

console.log('--- 4. Updating editStockById to call renderCategoryOptions(s.category) ---');
indexHtml = indexHtml.replace(
  /document\.getElementById\("stock-edit-id"\)\.value = s\.id;\s*document\.getElementById\("stock-name"\)\.value = s\.name;\s*document\.getElementById\("stock-category"\)\.value = s\.category \|\| "General";\s*document\.getElementById\("stock-icon"\)\.value = s\.icon \|\| "📦";/,
  `document.getElementById("stock-edit-id").value = s.id;
      document.getElementById("stock-name").value = s.name;
      renderCategoryOptions(s.category);
      renderIconOptions(s.icon || "📦");
      document.getElementById("stock-category").value = s.category || "General";
      document.getElementById("stock-icon").value = s.icon || "📦";`
);

console.log('--- 5. Updating getStoredStockCategories and renderCategoryOptions ---');
const oldStockCatSection = `    // =========================================================================
    // DYNAMIC CATEGORIES & FALLBACK ICONS (SUPER ADMIN ONLY)
    // =========================================================================
    function getStoredStockCategories() {
      if (window.state && window.state.stockCategories && window.state.stockCategories.length > 0) {
        return window.state.stockCategories;
      }
      try {
        const saved = localStorage.getItem("ostan_stock_categories");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return [
        { id: "General", name: "General (عام)" },
        { id: "Equipment", name: "Equipment (معدات)" },
        { id: "Tools", name: "Tools (أدوات وعدد)" },
        { id: "Consumables", name: "Consumables (مواد استهلاكية)" }
      ];
    }`;

const newStockCatSection = `    // =========================================================================
    // DYNAMIC CATEGORIES & FALLBACK ICONS (SUPER ADMIN ONLY)
    // =========================================================================
    function getStoredStockCategories() {
      // Single source of truth: pull directly from System-Wide Categories for section === 'stock'
      try {
        if (typeof getSystemWideCategories === "function") {
          const sys = getSystemWideCategories();
          const stockCats = sys.filter(c => c.section === "stock");
          if (stockCats && stockCats.length > 0) {
            return stockCats.map(c => ({
              id: c.id,
              name: c.name,
              clarification: c.clarification || ""
            }));
          }
        }
      } catch (e) {}

      if (window.state && window.state.stockCategories && window.state.stockCategories.length > 0) {
        return window.state.stockCategories;
      }
      try {
        const saved = localStorage.getItem("ostan_stock_categories");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return [
        { id: "cat_stock_gen", name: "General (عام)" },
        { id: "cat_stock_eq", name: "Equipment (معدات)" },
        { id: "cat_stock_tl", name: "Tools (أدوات وعدد)" },
        { id: "cat_stock_cs", name: "Consumables (مواد استهلاكية)" },
        { id: "cat_stock_un", name: "Uniforms (زي موحد)" }
      ];
    }`;

if (indexHtml.includes(oldStockCatSection)) {
  indexHtml = indexHtml.replace(oldStockCatSection, newStockCatSection);
  console.log('✅ Replaced getStoredStockCategories with unified system category loader');
} else {
  console.log('⚠️ Could not find exact oldStockCatSection text, checking regex replacement');
  indexHtml = indexHtml.replace(
    /function getStoredStockCategories\(\)\s*\{[\s\S]*?return \[\s*\{ id: "General", name: "General \(عام\)" \}[\s\S]*?\];\s*\}/,
    `function getStoredStockCategories() {
      try {
        if (typeof getSystemWideCategories === "function") {
          const sys = getSystemWideCategories();
          const stockCats = sys.filter(c => c.section === "stock");
          if (stockCats && stockCats.length > 0) {
            return stockCats.map(c => ({
              id: c.id,
              name: c.name,
              clarification: c.clarification || ""
            }));
          }
        }
      } catch (e) {}

      if (window.state && window.state.stockCategories && window.state.stockCategories.length > 0) {
        return window.state.stockCategories;
      }
      try {
        const saved = localStorage.getItem("ostan_stock_categories");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return [
        { id: "cat_stock_gen", name: "General (عام)" },
        { id: "cat_stock_eq", name: "Equipment (معدات)" },
        { id: "cat_stock_tl", name: "Tools (أدوات وعدد)" },
        { id: "cat_stock_cs", name: "Consumables (مواد استهلاكية)" },
        { id: "cat_stock_un", name: "Uniforms (زي موحد)" }
      ];
    }`
  );
}

// Update renderCategoryOptions to render values matching category names accurately and safely
indexHtml = indexHtml.replace(
  /function renderCategoryOptions\(selectedVal\) \{[\s\S]*?window\.renderCategoryOptions = renderCategoryOptions;/,
  `function renderCategoryOptions(selectedVal) {
      const select = document.getElementById("stock-category");
      if (!select) return;
      const categories = getStoredStockCategories();
      window.state.stockCategories = categories;

      select.innerHTML = categories.map(c => {
        const isSelected = selectedVal && (
          selectedVal === c.name || 
          selectedVal === c.id ||
          (selectedVal === "General" && c.name.startsWith("General")) ||
          (selectedVal === "Equipment" && c.name.startsWith("Equipment")) ||
          (selectedVal === "Tools" && c.name.startsWith("Tools")) ||
          (selectedVal === "Consumables" && c.name.startsWith("Consumables")) ||
          (selectedVal === "Uniforms" && c.name.startsWith("Uniforms"))
        );
        const safeName = typeof escapeHtml === "function" ? escapeHtml(c.name) : c.name;
        return \`<option value="\${safeName}" \${isSelected ? 'selected' : ''}>\${safeName}</option>\`;
      }).join("");

      // If a selectedVal was requested, set select value directly as fallback
      if (selectedVal) {
        const matchingOpt = Array.from(select.options).find(o => o.value === selectedVal || o.text === selectedVal || (selectedVal === 'General' && o.text.startsWith('General')));
        if (matchingOpt) select.value = matchingOpt.value;
      }

      // Toggle Super Admin button
      const curUser = getCurrentUser();
      const isSuper = isMasterSuperAdmin(curUser);
      const btn = document.getElementById("btn-manage-categories");
      if (btn) btn.style.display = isSuper ? "inline-flex" : "none";
    }
    window.renderCategoryOptions = renderCategoryOptions;`
);

console.log('--- 6. Replacing prompt() with Executive Modal Form (#modal-system-category-form) ---');
const oldCategoryCrudBlock = `    function openSystemCategoryAddDialog() {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const sec = prompt(
        "اختر القسم التابع له الفئة الجديدة:\\n" +
        "1 - المخزون والمستودع (stock)\\n" +
        "2 - الطلبيات والتوريد (orders)\\n" +
        "3 - المهام والعمليات (tasks)\\n" +
        "4 - الكادر والموارد البشرية (employees)",
        "1"
      );

      const secMap = {
        "1": { key: "stock", label: "📦 المخزون والمستودع" },
        "2": { key: "orders", label: "📋 الطلبيات والتوريد" },
        "3": { key: "tasks", label: "✅ المهام والعمليات" },
        "4": { key: "employees", label: "👥 الكادر والموارد البشرية" }
      };

      const selectedSec = secMap[sec] || secMap["1"];

      const name = prompt(\`أدخل اسم الفئة الجديدة لقسم (\${selectedSec.label}):\`);
      if (!name || !name.trim()) return;

      const clarification = prompt("أدخل توضيحاً مختصراً لبيان استخدام هذه الفئة:", \`تصنيف خاص بقسم \${selectedSec.label}\`);

      const categories = getSystemWideCategories();
      const newCat = {
        id: "cat_" + selectedSec.key + "_" + Date.now(),
        section: selectedSec.key,
        sectionName: selectedSec.label,
        name: name.trim(),
        clarification: clarification ? clarification.trim() : ""
      };

      categories.push(newCat);
      window.state.systemCategories = categories;

      // Sync with stock categories if stock
      if (selectedSec.key === "stock") {
        window.state.stockCategories = window.state.stockCategories || [];
        window.state.stockCategories.push({ id: newCat.id, name: newCat.name });
        try { localStorage.setItem("ostan_stock_categories", JSON.stringify(window.state.stockCategories)); } catch (e) {}
        if (typeof renderCategoryOptions === "function") renderCategoryOptions();
      }

      try { localStorage.setItem("ostan_system_categories", JSON.stringify(categories)); } catch (e) {}

      renderSystemCategoriesManager();
      if (window.OstanStyle) window.OstanStyle.showToast("تمت الإضافة", \`تمت إضافة الفئة (\${newCat.name}) لقسم \${selectedSec.label}\`);
    }
    window.openSystemCategoryAddDialog = openSystemCategoryAddDialog;

    function editSystemCategory(catId) {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const categories = getSystemWideCategories();
      const cat = categories.find(c => c.id === catId);
      if (!cat) return;

      const newName = prompt(\`تعديل اسم الفئة (\${cat.name}):\`, cat.name);
      if (!newName || !newName.trim()) return;

      const newClar = prompt("تعديل التوضيح وبيان الاستخدام:", cat.clarification || "");

      const oldName = cat.name;
      cat.name = newName.trim();
      cat.clarification = newClar ? newClar.trim() : cat.clarification;

      // Propagate update across related items in state
      if (cat.section === "stock" && window.state && window.state.stock) {
        window.state.stock.forEach(s => {
          if (s.category === oldName || s.category === cat.id) s.category = cat.name;
        });
        if (window.state.stockCategories) {
          const sc = window.state.stockCategories.find(x => x.id === cat.id || x.name === oldName);
          if (sc) sc.name = cat.name;
          try { localStorage.setItem("ostan_stock_categories", JSON.stringify(window.state.stockCategories)); } catch (e) {}
        }
        if (typeof renderWarehouse === "function") renderWarehouse();
        if (typeof renderCategoryOptions === "function") renderCategoryOptions();
      }

      window.state.systemCategories = categories;
      try { localStorage.setItem("ostan_system_categories", JSON.stringify(categories)); } catch (e) {}
      saveState();

      renderSystemCategoriesManager();
      if (window.OstanStyle) window.OstanStyle.showToast("تم التعديل", \`تم تحديث الفئة إلى (\${cat.name})\`);
    }
    window.editSystemCategory = editSystemCategory;

    function deleteSystemCategory(catId) {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const categories = getSystemWideCategories();
      const cat = categories.find(c => c.id === catId);
      if (!cat) return;

      if (!confirm(\`⚠️ تأكيد المدير العام:\\nهل أنت متأكد من حذف فئة (\${cat.name}) من قسم (\${cat.sectionName || cat.section})؟\\nسيتم تحويل أو حماية العناصر المرتبطة بها.\`)) return;

      const updated = categories.filter(c => c.id !== catId);
      window.state.systemCategories = updated;

      // Reassign stock items to General if in stock
      if (cat.section === "stock" && window.state && window.state.stock) {
        window.state.stock.forEach(s => {
          if (s.category === cat.name || s.category === cat.id) s.category = "General";
        });
        if (window.state.stockCategories) {
          window.state.stockCategories = window.state.stockCategories.filter(x => x.id !== cat.id && x.name !== cat.name);
          try { localStorage.setItem("ostan_stock_categories", JSON.stringify(window.state.stockCategories)); } catch (e) {}
        }
        if (typeof renderWarehouse === "function") renderWarehouse();
        if (typeof renderCategoryOptions === "function") renderCategoryOptions();
      }

      try { localStorage.setItem("ostan_system_categories", JSON.stringify(updated)); } catch (e) {}
      saveState();

      renderSystemCategoriesManager();
      if (window.OstanStyle) window.OstanStyle.showToast("تم الحذف", \`تم حذف فئة (\${cat.name}) بنجاح\`);
    }
    window.deleteSystemCategory = deleteSystemCategory;`;

const newCategoryCrudBlock = `    function openSystemCategoryAddDialog() {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      document.getElementById("syscat-edit-id").value = "";
      document.getElementById("syscat-name-input").value = "";
      document.getElementById("syscat-clarification-input").value = "";

      let defaultSec = "stock";
      if (currentSystemCategoryFilter && currentSystemCategoryFilter !== "ALL") {
        defaultSec = currentSystemCategoryFilter;
      }
      setSysCatSelectedSection(defaultSec);

      document.getElementById("syscat-modal-title").textContent = "🏷️ إضافة فئة جديدة للمشروع";
      document.getElementById("syscat-modal-subtitle").textContent = "تحديد القسم أو المشروع وبيان الاستخدام للتصنيف الجديد";
      document.getElementById("syscat-submit-btn").textContent = "💾 حفظ الفئة";

      const m = document.getElementById("modal-system-category-form");
      if (m) m.style.display = "flex";
      setTimeout(() => {
        const inp = document.getElementById("syscat-name-input");
        if (inp) inp.focus();
      }, 50);
    }
    window.openSystemCategoryAddDialog = openSystemCategoryAddDialog;

    function closeSystemCategoryModal() {
      const m = document.getElementById("modal-system-category-form");
      if (m) m.style.display = "none";
    }
    window.closeSystemCategoryModal = closeSystemCategoryModal;

    function setSysCatSelectedSection(secKey) {
      const radios = document.querySelectorAll("input[name='syscat_section_radio']");
      radios.forEach(r => {
        r.checked = (r.value === secKey);
        const card = r.closest(".syscat-choice-card");
        if (card) {
          if (r.checked) {
            card.style.borderColor = "#2563eb";
            card.style.background = "rgba(37, 99, 235, 0.08)";
          } else {
            card.style.borderColor = "var(--border-subtle)";
            card.style.background = "var(--bg-surface-elevated)";
          }
        }
      });
    }
    window.setSysCatSelectedSection = setSysCatSelectedSection;

    function handleSysCatSectionChange(val) {
      setSysCatSelectedSection(val);
    }
    window.handleSysCatSectionChange = handleSysCatSectionChange;

    function editSystemCategory(catId) {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const categories = getSystemWideCategories();
      const cat = categories.find(c => c.id === catId);
      if (!cat) return;

      document.getElementById("syscat-edit-id").value = cat.id;
      document.getElementById("syscat-name-input").value = cat.name;
      document.getElementById("syscat-clarification-input").value = cat.clarification || "";
      setSysCatSelectedSection(cat.section || "stock");

      document.getElementById("syscat-modal-title").textContent = "✏️ تعديل بيانات الفئة";
      document.getElementById("syscat-modal-subtitle").textContent = \`تعديل تفاصيل فئة (\${cat.name})\`;
      document.getElementById("syscat-submit-btn").textContent = "💾 حفظ التعديلات";

      const m = document.getElementById("modal-system-category-form");
      if (m) m.style.display = "flex";
      setTimeout(() => {
        const inp = document.getElementById("syscat-name-input");
        if (inp) inp.focus();
      }, 50);
    }
    window.editSystemCategory = editSystemCategory;

    function handleSaveSystemCategoryForm(e) {
      if (e) e.preventDefault();
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const editId = document.getElementById("syscat-edit-id").value.trim();
      const nameInput = document.getElementById("syscat-name-input");
      const name = nameInput ? nameInput.value.trim() : "";
      const clarInput = document.getElementById("syscat-clarification-input");
      const clarification = clarInput ? clarInput.value.trim() : "";

      const radioChecked = document.querySelector("input[name='syscat_section_radio']:checked");
      const secKey = radioChecked ? radioChecked.value : "stock";

      const secMap = {
        "stock": { key: "stock", label: "📦 المخزون والمستودع" },
        "orders": { key: "orders", label: "📋 الطلبيات والتوريد" },
        "tasks": { key: "tasks", label: "✅ المهام والعمليات" },
        "employees": { key: "employees", label: "👥 الكادر والموارد البشرية" }
      };
      const selectedSec = secMap[secKey] || secMap["stock"];

      if (!name) {
        alert("يرجى إدخال اسم الفئة.");
        return;
      }

      const categories = getSystemWideCategories();

      if (editId) {
        // Edit existing
        const cat = categories.find(c => c.id === editId);
        if (!cat) return;

        const oldName = cat.name;
        cat.name = name;
        cat.section = selectedSec.key;
        cat.sectionName = selectedSec.label;
        cat.clarification = clarification;

        // Propagate update across related items in state
        if (cat.section === "stock" && window.state && window.state.stock) {
          window.state.stock.forEach(s => {
            if (s.category === oldName || s.category === cat.id) s.category = cat.name;
          });
          if (typeof renderWarehouse === "function") renderWarehouse();
        }

        window.state.systemCategories = categories;
        try { localStorage.setItem("ostan_system_categories", JSON.stringify(categories)); } catch (err) {}
        saveState();

        renderSystemCategoriesManager();
        if (typeof renderCategoryOptions === "function") renderCategoryOptions();
        if (typeof renderCategoryManagerList === "function") renderCategoryManagerList();
        closeSystemCategoryModal();
        if (window.OstanStyle) window.OstanStyle.showToast("تم التعديل", \`تم تحديث الفئة إلى (\${cat.name})\`);
      } else {
        // Add new
        const newCat = {
          id: "cat_" + selectedSec.key + "_" + Date.now(),
          section: selectedSec.key,
          sectionName: selectedSec.label,
          name: name,
          clarification: clarification
        };

        categories.push(newCat);
        window.state.systemCategories = categories;
        try { localStorage.setItem("ostan_system_categories", JSON.stringify(categories)); } catch (err) {}
        saveState();

        renderSystemCategoriesManager();
        if (typeof renderCategoryOptions === "function") renderCategoryOptions();
        if (typeof renderCategoryManagerList === "function") renderCategoryManagerList();
        closeSystemCategoryModal();
        if (window.OstanStyle) window.OstanStyle.showToast("تمت الإضافة", \`تمت إضافة الفئة (\${newCat.name}) لقسم \${selectedSec.label}\`);
      }
    }
    window.handleSaveSystemCategoryForm = handleSaveSystemCategoryForm;

    function deleteSystemCategory(catId) {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const categories = getSystemWideCategories();
      const cat = categories.find(c => c.id === catId);
      if (!cat) return;

      if (!confirm(\`⚠️ تأكيد المدير العام:\\nهل أنت متأكد من حذف فئة (\${cat.name}) من قسم (\${cat.sectionName || cat.section})؟\\nسيتم تحويل أو حماية العناصر المرتبطة بها.\`)) return;

      const updated = categories.filter(c => c.id !== catId);
      window.state.systemCategories = updated;

      // Reassign stock items to General if in stock
      if (cat.section === "stock" && window.state && window.state.stock) {
        window.state.stock.forEach(s => {
          if (s.category === cat.name || s.category === cat.id) s.category = "General";
        });
        if (typeof renderWarehouse === "function") renderWarehouse();
      }

      try { localStorage.setItem("ostan_system_categories", JSON.stringify(updated)); } catch (e) {}
      saveState();

      renderSystemCategoriesManager();
      if (typeof renderCategoryOptions === "function") renderCategoryOptions();
      if (typeof renderCategoryManagerList === "function") renderCategoryManagerList();
      if (window.OstanStyle) window.OstanStyle.showToast("تم الحذف", \`تم حذف فئة (\${cat.name}) بنجاح\`);
    }
    window.deleteSystemCategory = deleteSystemCategory;`;

if (indexHtml.includes(oldCategoryCrudBlock)) {
  indexHtml = indexHtml.replace(oldCategoryCrudBlock, newCategoryCrudBlock);
  console.log('✅ Replaced category prompt CRUD with executive modal form handlers');
} else {
  console.error('❌ Could not find exact oldCategoryCrudBlock!');
  process.exit(1);
}

console.log('--- 7. Updating handleAddCategory, handleEditCategory, handleDeleteCategory in modal-stock-category-manager ---');
const oldModalStockCatCrud = `    function handleAddCategory() {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const input = document.getElementById("new-category-name");
      const name = input ? input.value.trim() : "";
      if (!name) {
        alert("يرجى إدخال اسم الفئة أولاً.");
        return;
      }

      const categories = getStoredStockCategories();
      const newId = "cat_" + Date.now();
      categories.push({ id: newId, name: name });

      window.state.stockCategories = categories;
      try { localStorage.setItem("ostan_stock_categories", JSON.stringify(categories)); } catch (e) {}

      if (input) input.value = "";
      renderCategoryManagerList();
      renderCategoryOptions();
      if (window.OstanStyle) window.OstanStyle.showToast("تمت الإضافة", \`تمت إضافة الفئة: \${name}\`);
    }
    window.handleAddCategory = handleAddCategory;

    function handleEditCategory(catId) {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const categories = getStoredStockCategories();
      const cat = categories.find(c => c.id === catId);
      if (!cat) return;

      const newName = prompt("أدخل الاسم الجديد للفئة:", cat.name);
      if (!newName || !newName.trim()) return;

      const oldName = cat.name;
      cat.name = newName.trim();

      // Update in state.stock
      if (window.state && window.state.stock) {
        window.state.stock.forEach(s => {
          if (s.category === cat.id || s.category === oldName) {
            s.category = cat.name;
          }
        });
      }

      window.state.stockCategories = categories;
      try { localStorage.setItem("ostan_stock_categories", JSON.stringify(categories)); } catch (e) {}

      saveState();
      renderWarehouse();
      renderCategoryManagerList();
      renderCategoryOptions();
      if (window.OstanStyle) window.OstanStyle.showToast("تم التعديل", \`تم تحديث الفئة إلى: \${cat.name}\`);
    }
    window.handleEditCategory = handleEditCategory;

    function handleDeleteCategory(catId) {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const categories = getStoredStockCategories();
      const cat = categories.find(c => c.id === catId);
      if (!cat) return;

      if (!confirm(\`هل أنت متأكد من حذف فئة (\${cat.name})؟\\nسيتم نقل الأصناف التابعة لها تلقائياً إلى الفئة العامة (General).\`)) return;

      const updated = categories.filter(c => c.id !== catId);
      window.state.stockCategories = updated;

      // Reassign affected stock items to General
      if (window.state && window.state.stock) {
        window.state.stock.forEach(s => {
          if (s.category === cat.id || s.category === cat.name) {
            s.category = "General";
          }
        });
      }

      try { localStorage.setItem("ostan_stock_categories", JSON.stringify(updated)); } catch (e) {}

      saveState();
      renderWarehouse();
      renderCategoryManagerList();
      renderCategoryOptions();
      if (window.OstanStyle) window.OstanStyle.showToast("تم الحذف", \`تم حذف فئة \${cat.name} بنجاح\`);
    }
    window.handleDeleteCategory = handleDeleteCategory;`;

const newModalStockCatCrud = `    function handleAddCategory() {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const input = document.getElementById("new-category-name");
      const name = input ? input.value.trim() : "";
      if (!name) {
        alert("يرجى إدخال اسم الفئة أولاً.");
        return;
      }

      const sysCats = getSystemWideCategories();
      const newCat = {
        id: "cat_stock_" + Date.now(),
        section: "stock",
        sectionName: "📦 المخزون والمستودع",
        name: name,
        clarification: "تصنيف تابع للمخزون والمستودع"
      };
      sysCats.push(newCat);
      window.state.systemCategories = sysCats;
      try { localStorage.setItem("ostan_system_categories", JSON.stringify(sysCats)); } catch (e) {}

      if (input) input.value = "";
      renderCategoryManagerList();
      renderCategoryOptions();
      if (typeof renderSystemCategoriesManager === "function") renderSystemCategoriesManager();
      if (window.OstanStyle) window.OstanStyle.showToast("تمت الإضافة", \`تمت إضافة الفئة: \${name}\`);
    }
    window.handleAddCategory = handleAddCategory;

    function handleEditCategory(catId) {
      editSystemCategory(catId);
    }
    window.handleEditCategory = handleEditCategory;

    function handleDeleteCategory(catId) {
      deleteSystemCategory(catId);
    }
    window.handleDeleteCategory = handleDeleteCategory;`;

if (indexHtml.includes(oldModalStockCatCrud)) {
  indexHtml = indexHtml.replace(oldModalStockCatCrud, newModalStockCatCrud);
  console.log('✅ Synchronized modal-stock-category-manager handlers with System Categories');
} else {
  console.error('❌ Could not find oldModalStockCatCrud!');
  process.exit(1);
}

console.log('--- 8. Appending #modal-system-category-form HTML before </body> ---');
const modalFormHtml = `
  <!-- MODAL: ADD / EDIT SYSTEM CATEGORY (SUPER ADMIN ONLY) -->
  <div id="modal-system-category-form" class="hud-modal-overlay" style="display: none; z-index: 10003;" onclick="if(event.target===this) closeSystemCategoryModal()">
    <div class="hud-modal-box" style="max-width: 540px; width: 92vw;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <h3 id="syscat-modal-title" style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">🏷️ إضافة فئة جديدة للمشروع</h3>
          <p id="syscat-modal-subtitle" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">تحديد القسم وبيان الاستخدام للتصنيف الجديد في النظام</p>
        </div>
        <button type="button" onclick="closeSystemCategoryModal()" class="btn btn-ghost" style="font-size: 1.2rem; padding: 0.2rem 0.5rem;">✕</button>
      </div>

      <form id="form-system-category" onsubmit="handleSaveSystemCategoryForm(event)" style="display: flex; flex-direction: column; gap: 1rem;">
        <input type="hidden" id="syscat-edit-id" value="">

        <!-- Section Choice Cards -->
        <div>
          <label style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 0.45rem;">
            القسم أو المشروع التابع له الفئة (Target Section / Module) *
          </label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.55rem;" id="syscat-section-cards">
            <label class="syscat-choice-card" style="display: flex; align-items: center; gap: 0.55rem; padding: 0.65rem 0.75rem; border: 1.5px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer; background: var(--bg-surface-elevated); transition: all 0.2s;">
              <input type="radio" name="syscat_section_radio" value="stock" checked onchange="handleSysCatSectionChange(this.value)" style="cursor: pointer;">
              <span style="font-size: 1.15rem;">📦</span>
              <div style="line-height: 1.2;">
                <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-main);">المخزون والمستودع</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Warehouse (stock)</div>
              </div>
            </label>

            <label class="syscat-choice-card" style="display: flex; align-items: center; gap: 0.55rem; padding: 0.65rem 0.75rem; border: 1.5px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer; background: var(--bg-surface-elevated); transition: all 0.2s;">
              <input type="radio" name="syscat_section_radio" value="orders" onchange="handleSysCatSectionChange(this.value)" style="cursor: pointer;">
              <span style="font-size: 1.15rem;">📋</span>
              <div style="line-height: 1.2;">
                <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-main);">الطلبيات والتوريد</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Orders & Fulfillment</div>
              </div>
            </label>

            <label class="syscat-choice-card" style="display: flex; align-items: center; gap: 0.55rem; padding: 0.65rem 0.75rem; border: 1.5px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer; background: var(--bg-surface-elevated); transition: all 0.2s;">
              <input type="radio" name="syscat_section_radio" value="tasks" onchange="handleSysCatSectionChange(this.value)" style="cursor: pointer;">
              <span style="font-size: 1.15rem;">✅</span>
              <div style="line-height: 1.2;">
                <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-main);">المهام والعمليات</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Tasks & Operations</div>
              </div>
            </label>

            <label class="syscat-choice-card" style="display: flex; align-items: center; gap: 0.55rem; padding: 0.65rem 0.75rem; border: 1.5px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer; background: var(--bg-surface-elevated); transition: all 0.2s;">
              <input type="radio" name="syscat_section_radio" value="employees" onchange="handleSysCatSectionChange(this.value)" style="cursor: pointer;">
              <span style="font-size: 1.15rem;">👥</span>
              <div style="line-height: 1.2;">
                <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-main);">الكادر والموارد البشرية</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">HR Roles & Staff</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Category Name -->
        <div>
          <label style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 4px;">
            اسم الفئة (Category Name) *
          </label>
          <input type="text" id="syscat-name-input" required placeholder="مثال: T-Shirt (تيشيرت) أو أدوات سلامة..." class="input-field" style="font-size: 0.85rem;">
        </div>

        <!-- Clarification & Scope -->
        <div>
          <label style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 4px;">
            التوضيح وبيان الاستخدام (Clarification & Scope)
          </label>
          <textarea id="syscat-clarification-input" rows="2" placeholder="بيان استخدام وتطبيق هذه الفئة بالقسم والعمليات الميدانية..." class="input-field" style="font-size: 0.82rem; resize: vertical;"></textarea>
        </div>

        <!-- Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem;">
          <button type="button" onclick="closeSystemCategoryModal()" class="btn btn-secondary">إلغاء</button>
          <button type="submit" id="syscat-submit-btn" class="btn btn-primary" style="padding: 0.5rem 1.25rem;">
            💾 حفظ الفئة
          </button>
        </div>
      </form>
    </div>
  </div>
`;

if (!indexHtml.includes('id="modal-system-category-form"')) {
  indexHtml = indexHtml.replace('</body>', `${modalFormHtml}\n</body>`);
  console.log('✅ Appended #modal-system-category-form to index.html');
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✅ Successfully updated index.html!');
