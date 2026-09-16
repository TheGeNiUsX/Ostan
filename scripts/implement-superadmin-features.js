const fs = require('fs');
const path = require('path');

console.log('=== STARTING IMPLEMENTATION: SUPER ADMIN & UI UPGRADES ===\n');

// 1. UPDATE index.html
const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// A. Enlarge Modals (Batch Import, Order Details, Stock Item)
html = html.replace(
  '<div id="modal-orders-excel-import" class="hud-modal-overlay" style="display: none;" onclick="if(event.target===this) closeOrdersExcelImportModal()">\n    <div class="hud-modal-box" style="max-width: 600px;">',
  '<div id="modal-orders-excel-import" class="hud-modal-overlay" style="display: none;" onclick="if(event.target===this) closeOrdersExcelImportModal()">\n    <div class="hud-modal-box" style="max-width: 980px; width: 94vw; max-height: 90vh; overflow-y: auto;">'
);

html = html.replace(
  '<div id="modal-order-details" class="hud-modal-overlay" style="display: none;" onclick="if(event.target===this) closeOrderDetailsModal()">\n    <div class="hud-modal-box" style="max-width: 620px;">',
  '<div id="modal-order-details" class="hud-modal-overlay" style="display: none;" onclick="if(event.target===this) closeOrderDetailsModal()">\n    <div class="hud-modal-box" style="max-width: 960px; width: 94vw; max-height: 90vh; overflow-y: auto;">'
);

html = html.replace(
  '  <!-- STOCK ITEM MODAL (ADD & EDIT WITH PICTURES & 4 CATEGORIES) -->\n  <div id="modal-stock" class="hud-modal-overlay" style="display: none;">\n    <div class="hud-modal-box">',
  '  <!-- STOCK ITEM MODAL (ADD & EDIT WITH PICTURES & DYNAMIC CATEGORIES) -->\n  <div id="modal-stock" class="hud-modal-overlay" style="display: none;">\n    <div class="hud-modal-box" style="max-width: 680px; width: 92vw;">'
);

// B. Add Project Name Field + Super Admin Category & Icon Controls in modal-stock
const oldStockFormPart = `        <div>
          <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Item Name *</label>
          <input id="stock-name" type="text" required placeholder="e.g. Hydraulic Pump Valve" class="input-field">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Category *</label>
            <select id="stock-category" class="input-field">
              <option value="General">General (عام)</option>
              <option value="Equipment">Equipment (معدات)</option>
              <option value="Tools">Tools (أدوات وعدد)</option>
              <option value="Consumables">Consumables (مواد استهلاكية)</option>
            </select>
          </div>
          <div>
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Fallback Icon</label>
            <select id="stock-icon" class="input-field">
              <option value="⚙️">⚙️ Machinery Part</option>
              <option value="🔧">🔧 Tool Kit</option>
              <option value="🦺">🦺 Safety Vest</option>
              <option value="⚡">⚡ Electrical Unit</option>
              <option value="🛢️">🛢️ Oil / Fuel Drum</option>
              <option value="📦">📦 General Box</option>
            </select>
          </div>
        </div>`;

const newStockFormPart = `        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Item Name / اسم الصنف *</label>
            <input id="stock-name" type="text" required placeholder="e.g. Hydraulic Pump Valve / زي موحد" class="input-field">
          </div>
          <div>
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Project Name / اسم المشروع</label>
            <input id="stock-project" type="text" placeholder="e.g. مشروع نادك / مشروع الدمام / NEOM" class="input-field">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Category / الفئة *</label>
              <button type="button" id="btn-manage-categories" onclick="openCategoryManagerModal()" class="btn btn-ghost" style="padding: 1px 6px; font-size: 0.72rem; color: #2563eb; display: none;" title="Manage Categories (Super Admin Only)">
                ⚙️ إدارة الفئات
              </button>
            </div>
            <select id="stock-category" class="input-field">
              <option value="General">General (عام)</option>
              <option value="Equipment">Equipment (معدات)</option>
              <option value="Tools">Tools (أدوات وعدد)</option>
              <option value="Consumables">Consumables (مواد استهلاكية)</option>
            </select>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Fallback Icon / الأيقونة</label>
              <button type="button" id="btn-manage-icons" onclick="openIconManagerModal()" class="btn btn-ghost" style="padding: 1px 6px; font-size: 0.72rem; color: #2563eb; display: none;" title="Add Icon (Super Admin Only)">
                + إضافة أيقونة
              </button>
            </div>
            <select id="stock-icon" class="input-field">
              <option value="⚙️">⚙️ Machinery Part</option>
              <option value="🔧">🔧 Tool Kit</option>
              <option value="🦺">🦺 Safety Vest</option>
              <option value="⚡">⚡ Electrical Unit</option>
              <option value="🛢️">🛢️ Oil / Fuel Drum</option>
              <option value="📦">📦 General Box</option>
            </select>
          </div>
        </div>`;

if (html.includes(oldStockFormPart)) {
  html = html.replace(oldStockFormPart, newStockFormPart);
  console.log('✅ Stock form updated with Project Name and Super Admin buttons');
} else {
  console.warn('⚠️ oldStockFormPart not matched in index.html');
}

// C. Reorder Sidebar: Stock & Inventory -> Orders & Fulfillment -> Stock Requests (Organizations)
const oldInventoryGroup = `        <!-- INVENTORY -->
        <div id="group-inventory" class="nav-group-wrapper">
          <div class="nav-section-title" data-i18n="nav_group_inv">INVENTORY</div>
          <a id="nav-stock" class="nav-item" onclick="setModule('stock')">
            <span style="display: flex; align-items: center; gap: 0.6rem;">
              <span>📦</span>
              <span data-i18n="nav_stock">Stock & Inventory</span>
            </span>
          </a>
          <a id="nav-stock-requests" class="nav-item" onclick="setModule('stock-requests')">
            <span style="display: flex; align-items: center; gap: 0.6rem;">
              <span>📄</span>
              <span data-i18n="nav_stock_requests">Stock Requests</span>
            </span>
          </a>
          <a id="nav-orders" class="nav-item" onclick="setModule('orders')">
            <span style="display: flex; align-items: center; gap: 0.6rem;">
              <span>📋</span>
              <span data-i18n="nav_orders">Orders</span>
            </span>
          </a>
        </div>`;

const newInventoryGroup = `        <!-- INVENTORY -->
        <div id="group-inventory" class="nav-group-wrapper">
          <div class="nav-section-title" data-i18n="nav_group_inv">INVENTORY</div>
          <a id="nav-stock" class="nav-item" onclick="setModule('stock')">
            <span style="display: flex; align-items: center; gap: 0.6rem;">
              <span>📦</span>
              <span data-i18n="nav_stock">Stock & Inventory</span>
            </span>
          </a>
          <a id="nav-orders" class="nav-item" onclick="setModule('orders')">
            <span style="display: flex; align-items: center; gap: 0.6rem;">
              <span>📋</span>
              <span data-i18n="nav_orders">Orders & Fulfillment</span>
            </span>
          </a>
          <a id="nav-stock-requests" class="nav-item" onclick="setModule('stock-requests')">
            <span style="display: flex; align-items: center; gap: 0.6rem;">
              <span>📄</span>
              <span data-i18n="nav_stock_requests">Stock Requests (Organizations)</span>
            </span>
          </a>
        </div>`;

if (html.includes(oldInventoryGroup)) {
  html = html.replace(oldInventoryGroup, newInventoryGroup);
  console.log('✅ Sidebar reordered: Stock Requests is now under Orders & Fulfillment');
} else {
  console.warn('⚠️ oldInventoryGroup not matched in index.html');
}

// D. Add top-nav-stock-requests to top burgundy bar
const oldTopSubnav = `        <a id="top-nav-stock" class="top-subnav-item" onclick="setModule('stock')">
          <span>📦</span>
          <span data-i18n="nav_stock">المخزون والعهد</span>
        </a>
        <a id="top-nav-orders" class="top-subnav-item" onclick="setModule('orders')">
          <span>📋</span>
          <span data-i18n="nav_orders">الطلبيات</span>
        </a>`;

const newTopSubnav = `        <a id="top-nav-stock" class="top-subnav-item" onclick="setModule('stock')">
          <span>📦</span>
          <span data-i18n="nav_stock">المخزون والعهد</span>
        </a>
        <a id="top-nav-orders" class="top-subnav-item" onclick="setModule('orders')">
          <span>📋</span>
          <span data-i18n="nav_orders">الطلبيات والتوريد</span>
        </a>
        <a id="top-nav-stock-requests" class="top-subnav-item" onclick="setModule('stock-requests')">
          <span>📄</span>
          <span data-i18n="nav_stock_requests">طلبات الصرف (للمؤسسات)</span>
        </a>`;

if (html.includes(oldTopSubnav)) {
  html = html.replace(oldTopSubnav, newTopSubnav);
  console.log('✅ Top subnav updated with Stock Requests (Organizations)');
} else {
  console.warn('⚠️ oldTopSubnav not matched');
}

// E. Add Category Manager & Icon Manager Modals before </body>
const managerModalsHtml = `
  <!-- MODAL: CATEGORY MANAGER (SUPER ADMIN ONLY) -->
  <div id="modal-stock-category-manager" class="hud-modal-overlay" style="display: none; z-index: 10001;" onclick="if(event.target===this) closeCategoryManagerModal()">
    <div class="hud-modal-box" style="max-width: 540px; width: 92vw;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">⚙️ إدارة فئات المخزون (Super Admin)</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">إضافة، تعديل وحذف تصنيفات المواد بالمستودع</p>
        </div>
        <button onclick="closeCategoryManagerModal()" class="btn btn-ghost" style="font-size: 1.2rem; padding: 0.2rem 0.5rem;">✕</button>
      </div>

      <!-- Add Category Form -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; align-items: center;">
        <input type="text" id="new-category-name" placeholder="اسم الفئة الجديدة (مثال: زي موحد / Uniforms)..." class="input-field" style="flex: 1; font-size: 0.82rem;">
        <button type="button" onclick="handleAddCategory()" class="btn btn-primary" style="padding: 0.4rem 0.85rem; font-size: 0.8rem; white-space: nowrap;">
          + إضافة فئة
        </button>
      </div>

      <!-- Categories List -->
      <div id="category-manager-list" style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.65rem;">
        <!-- Rendered dynamically -->
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
        <button onclick="closeCategoryManagerModal()" class="btn btn-secondary">إغلاق</button>
      </div>
    </div>
  </div>

  <!-- MODAL: FALLBACK ICON MANAGER (SUPER ADMIN ONLY) -->
  <div id="modal-stock-icon-manager" class="hud-modal-overlay" style="display: none; z-index: 10001;" onclick="if(event.target===this) closeIconManagerModal()">
    <div class="hud-modal-box" style="max-width: 500px; width: 92vw;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">🎨 إدارة الأيقونات البديلة (Super Admin)</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">إضافة رموز تعبيرية وأيقونات جديدة للمواد</p>
        </div>
        <button onclick="closeIconManagerModal()" class="btn btn-ghost" style="font-size: 1.2rem; padding: 0.2rem 0.5rem;">✕</button>
      </div>

      <!-- Add Icon Form -->
      <div style="display: grid; grid-template-columns: 70px 1fr auto; gap: 0.5rem; margin-bottom: 1rem; align-items: center;">
        <input type="text" id="new-icon-emoji" placeholder="🥾" class="input-field" style="text-align: center; font-size: 1.3rem; padding: 0.3rem;" maxlength="4">
        <input type="text" id="new-icon-label" placeholder="الوصف (مثال: Safety Boots)..." class="input-field" style="font-size: 0.82rem;">
        <button type="button" onclick="handleAddIcon()" class="btn btn-primary" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; white-space: nowrap;">
          + إضافة
        </button>
      </div>

      <!-- Icons List -->
      <div id="icon-manager-list" style="max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.65rem;">
        <!-- Rendered dynamically -->
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
        <button onclick="closeIconManagerModal()" class="btn btn-secondary">إغلاق</button>
      </div>
    </div>
  </div>
`;

if (!html.includes('id="modal-stock-category-manager"')) {
  html = html.replace('</body>', managerModalsHtml + '\n</body>');
  console.log('✅ Added Category and Icon Manager modals');
}

// F. Update saveStockItem, editStockById, openStockHUD, renderWarehouse in index.html
const oldSaveStockItem = `      const name = document.getElementById("stock-name").value.trim();
      const category = document.getElementById("stock-category").value;`;

const newSaveStockItem = `      const name = document.getElementById("stock-name").value.trim();
      const projectName = document.getElementById("stock-project") ? document.getElementById("stock-project").value.trim() : "";
      const category = document.getElementById("stock-category").value;`;

html = html.replace(oldSaveStockItem, newSaveStockItem);

const oldSaveStockItemEdit = `        if (s) {
          s.name = name;
          s.category = category;`;

const newSaveStockItemEdit = `        if (s) {
          s.name = name;
          s.projectName = projectName;
          s.category = category;`;

html = html.replace(oldSaveStockItemEdit, newSaveStockItemEdit);

const oldSaveStockItemNew = `const newItem = { id: "stock-" + Date.now(), name, category, icon, imageUrl, quantity, threshold };`;
const newSaveStockItemNew = `const newItem = { id: "stock-" + Date.now(), name, projectName, category, icon, imageUrl, quantity, threshold };`;

html = html.replace(oldSaveStockItemNew, newSaveStockItemNew);

// Edit stock
const oldEditStock = `      document.getElementById("stock-name").value = s.name;
      document.getElementById("stock-category").value = s.category || "General";`;

const newEditStock = `      document.getElementById("stock-name").value = s.name;
      if (document.getElementById("stock-project")) document.getElementById("stock-project").value = s.projectName || "";
      renderCategoryOptions(s.category || "General");
      renderIconOptions(s.icon || "📦");
      document.getElementById("stock-category").value = s.category || "General";`;

html = html.replace(oldEditStock, newEditStock);

// Open Stock HUD
const oldOpenStockHUD = `      document.getElementById("stock-name").value = "";
      document.getElementById("stock-qty").value = "10";`;

const newOpenStockHUD = `      document.getElementById("stock-name").value = "";
      if (document.getElementById("stock-project")) document.getElementById("stock-project").value = "";
      renderCategoryOptions();
      renderIconOptions();
      document.getElementById("stock-qty").value = "10";`;

html = html.replace(oldOpenStockHUD, newOpenStockHUD);

// Warehouse card rendering: show Project Name badge
const oldWarehouseCardName = `<div style="font-weight: 700; font-size: 1rem; color: var(--text-main); margin-top: 0.75rem;">\${s.name}</div>`;
const newWarehouseCardName = `<div style="font-weight: 700; font-size: 1rem; color: var(--text-main); margin-top: 0.75rem;">\${s.name}</div>
              \${s.projectName ? \`<div style="font-size: 0.75rem; color: #2563eb; font-weight: 700; margin-top: 2px; display: flex; align-items: center; gap: 4px;"><span>🏗️</span> <span>\${s.projectName}</span></div>\` : ''}`;

html = html.replace(oldWarehouseCardName, newWarehouseCardName);

// G. Add Category and Icon Management Functions to index.html
const categoryFunctionsJs = `
    // =========================================================================
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
    }

    function getStoredStockIcons() {
      if (window.state && window.state.stockIcons && window.state.stockIcons.length > 0) {
        return window.state.stockIcons;
      }
      try {
        const saved = localStorage.getItem("ostan_stock_icons");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return [
        { icon: "⚙️", name: "Machinery Part" },
        { icon: "🔧", name: "Tool Kit" },
        { icon: "🦺", name: "Safety Vest" },
        { icon: "⚡", name: "Electrical Unit" },
        { icon: "🛢️", name: "Oil / Fuel Drum" },
        { icon: "📦", name: "General Box" }
      ];
    }

    function renderCategoryOptions(selectedVal) {
      const select = document.getElementById("stock-category");
      if (!select) return;
      const categories = getStoredStockCategories();
      window.state.stockCategories = categories;

      select.innerHTML = categories.map(c => \`
        <option value="\${c.id}" \${selectedVal === c.id ? 'selected' : ''}>\${c.name}</option>
      \`).join("");

      // Toggle Super Admin button
      const curUser = getCurrentUser();
      const isSuper = isMasterSuperAdmin(curUser);
      const btn = document.getElementById("btn-manage-categories");
      if (btn) btn.style.display = isSuper ? "inline-flex" : "none";
    }
    window.renderCategoryOptions = renderCategoryOptions;

    function renderIconOptions(selectedVal) {
      const select = document.getElementById("stock-icon");
      if (!select) return;
      const icons = getStoredStockIcons();
      window.state.stockIcons = icons;

      select.innerHTML = icons.map(i => \`
        <option value="\${i.icon}" \${selectedVal === i.icon ? 'selected' : ''}>\${i.icon} \${i.name}</option>
      \`).join("");

      // Toggle Super Admin button
      const curUser = getCurrentUser();
      const isSuper = isMasterSuperAdmin(curUser);
      const btn = document.getElementById("btn-manage-icons");
      if (btn) btn.style.display = isSuper ? "inline-flex" : "none";
    }
    window.renderIconOptions = renderIconOptions;

    function openCategoryManagerModal() {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) {
        alert("عذراً، إدارة وتعديل الفئات محصورة بالمدير العام فقط (Super Admin)!");
        return;
      }
      renderCategoryManagerList();
      const m = document.getElementById("modal-stock-category-manager");
      if (m) m.style.display = "flex";
    }
    window.openCategoryManagerModal = openCategoryManagerModal;

    function closeCategoryManagerModal() {
      const m = document.getElementById("modal-stock-category-manager");
      if (m) m.style.display = "none";
    }
    window.closeCategoryManagerModal = closeCategoryManagerModal;

    function renderCategoryManagerList() {
      const container = document.getElementById("category-manager-list");
      if (!container) return;
      const categories = getStoredStockCategories();

      container.innerHTML = categories.map((c, idx) => \`
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">
            \${c.name}
          </div>
          <div style="display: flex; gap: 0.35rem;">
            <button type="button" onclick="handleEditCategory('\${c.id}')" class="btn btn-ghost" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; color: #2563eb;" title="تعديل اسم الفئة">
              ✏️ تعديل
            </button>
            \${c.id !== "General" ? \`
              <button type="button" onclick="handleDeleteCategory('\${c.id}')" class="btn btn-ghost" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; color: #ef4444;" title="حذف الفئة">
                🗑️ حذف
              </button>
            \` : '<span style="font-size: 0.68rem; color: var(--text-faint); padding: 0.2rem 0.4rem;">أساسية</span>'}
          </div>
        </div>
      \`).join("");
    }

    function handleAddCategory() {
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
    window.handleDeleteCategory = handleDeleteCategory;

    function openIconManagerModal() {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) {
        alert("عذراً، إضافة الأيقونات محصورة بالمدير العام فقط (Super Admin)!");
        return;
      }
      renderIconManagerList();
      const m = document.getElementById("modal-stock-icon-manager");
      if (m) m.style.display = "flex";
    }
    window.openIconManagerModal = openIconManagerModal;

    function closeIconManagerModal() {
      const m = document.getElementById("modal-stock-icon-manager");
      if (m) m.style.display = "none";
    }
    window.closeIconManagerModal = closeIconManagerModal;

    function renderIconManagerList() {
      const container = document.getElementById("icon-manager-list");
      if (!container) return;
      const icons = getStoredStockIcons();

      container.innerHTML = icons.map((i, idx) => \`
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.45rem 0.75rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="font-size: 1.4rem;">\${i.icon}</span>
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">\${i.name}</span>
          </div>
          \${idx >= 6 ? \`
            <button type="button" onclick="handleDeleteIcon(\${idx})" class="btn btn-ghost" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; color: #ef4444;" title="حذف الأيقونة">
              🗑️
            </button>
          \` : '<span style="font-size: 0.68rem; color: var(--text-faint);">افتراضي</span>'}
        </div>
      \`).join("");
    }

    function handleAddIcon() {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const emojiInput = document.getElementById("new-icon-emoji");
      const labelInput = document.getElementById("new-icon-label");
      const emoji = emojiInput ? emojiInput.value.trim() : "";
      const label = labelInput ? labelInput.value.trim() : "";

      if (!emoji || !label) {
        alert("يرجى إدخال الرمز التعبيري (الأيقونة) والوصف.");
        return;
      }

      const icons = getStoredStockIcons();
      icons.push({ icon: emoji, name: label });

      window.state.stockIcons = icons;
      try { localStorage.setItem("ostan_stock_icons", JSON.stringify(icons)); } catch (e) {}

      if (emojiInput) emojiInput.value = "";
      if (labelInput) labelInput.value = "";
      renderIconManagerList();
      renderIconOptions();
      if (window.OstanStyle) window.OstanStyle.showToast("تمت الإضافة", \`تمت إضافة الأيقونة: \${emoji} \${label}\`);
    }
    window.handleAddIcon = handleAddIcon;

    function handleDeleteIcon(idx) {
      const curUser = getCurrentUser();
      if (!isMasterSuperAdmin(curUser)) return;

      const icons = getStoredStockIcons();
      if (idx < 0 || idx >= icons.length) return;

      const removed = icons.splice(idx, 1);
      window.state.stockIcons = icons;
      try { localStorage.setItem("ostan_stock_icons", JSON.stringify(icons)); } catch (e) {}

      renderIconManagerList();
      renderIconOptions();
      if (window.OstanStyle) window.OstanStyle.showToast("تم الحذف", "تمت إزالة الأيقونة بنجاح");
    }
    window.handleDeleteIcon = handleDeleteIcon;
`;

if (!html.includes('function openCategoryManagerModal')) {
  html = html.replace('function openStockHUD() {', categoryFunctionsJs + '\n    function openStockHUD() {');
  console.log('✅ Added category and icon management JS functions to index.html');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Successfully updated index.html\n');


// 2. UPDATE orders-engine.js and public/orders-engine.js
const enginePath = path.join(__dirname, '..', 'orders-engine.js');
let engineCode = fs.readFileSync(enginePath, 'utf8');

// A. Update deleteOrder to restrict DONE orders strictly to Super Admin
const oldDeleteOrderFunc = `  // Delete Cancelled Order
  function deleteOrder(orderId) {
    const orders = (window.state && window.state.orders) ? window.state.orders : [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const lang = document.documentElement.getAttribute("lang") || "en";

    // Enforce business rule: only cancelled orders can be deleted
    if (order.status !== "CANCELLED") {
      const msg = lang === "ar"
        ? "لا يمكن حذف الطلب إلا بعد إلغائه! يرجى إلغاء الطلب أولاً."
        : "Only cancelled orders can be deleted! Please cancel the order first.";
      if (window.OstanStyle) window.OstanStyle.showToast("تنبيه", msg, "warning");
      else alert(msg);
      return;
    }

    const confirmMsg = lang === "ar"
      ? \`هل أنت متأكد من حذف الطلب الملغي (\${order.orderNumber || order.id}) نهائياً من النظام؟\\nهذا الإجراء لا يمكن التراجع عنه.\`
      : \`Are you sure you want to permanently delete cancelled order (\${order.orderNumber || order.id})?\\nThis action cannot be undone.\`;

    if (!confirm(confirmMsg)) return;

    // Safety rollback if needed
    if (order.stockDeducted) {
      const stock = window.state.stock || [];
      (order.items || []).forEach(it => {
        let stockItem = it.stockId ? stock.find(s => s.id === it.stockId) : null;
        if (!stockItem && it.itemName) stockItem = stock.find(s => s.name.trim().toLowerCase() === it.itemName.trim().toLowerCase());
        if (stockItem) stockItem.quantity += Number(it.quantity) || 0;
      });
      order.stockDeducted = false;
      if (typeof saveState === "function") saveState();
      if (typeof renderWarehouse === "function") renderWarehouse();
    }

    window.state.orders = orders.filter(o => o.id !== orderId);

    try {
      localStorage.setItem("ostan_orders", JSON.stringify(window.state.orders));
    } catch (e) {}

    closeOrderDetailsModal();
    renderOrders();
    if (typeof updateCounts === "function") updateCounts();

    const successMsg = lang === "ar"
      ? \`تم حذف الطلب الملغي (\${order.orderNumber || order.id}) بنجاح.\`
      : \`Cancelled order (\${order.orderNumber || order.id}) has been deleted successfully.\`;

    if (window.OstanStyle) {
      window.OstanStyle.showToast(lang === "ar" ? "تم الحذف" : "Deleted", successMsg);
    }
  }`;

const newDeleteOrderFunc = `  // Delete Cancelled or Completed Order (Completed restricted strictly to Super Admin)
  function deleteOrder(orderId) {
    const orders = (window.state && window.state.orders) ? window.state.orders : [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const lang = document.documentElement.getAttribute("lang") || "en";
    const curUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    const isSuper = typeof isMasterSuperAdmin === "function" ? isMasterSuperAdmin(curUser) : (curUser && (curUser.role === "SUPER_ADMIN" || curUser.role === "superadmin"));

    // Business Rule: Completed orders (DONE) can ONLY be deleted by Super Admin!
    if (order.status === "DONE") {
      if (!isSuper) {
        const msg = lang === "ar"
          ? "عذراً، صلاحية حذف الطلبات المكتملة والمصروفة محصورة فقط بالمدير العام (Super Admin) لضمان سلامة المخزون والتدقيق المالي."
          : "Permission denied: Only Super Admin can delete completed orders.";
        if (window.OstanStyle) window.OstanStyle.showToast("صلاحية محظورة", msg, "warning");
        else alert(msg);
        return;
      }

      const confirmMsg = lang === "ar"
        ? \`⚠️ تنبيه المدير العام:\\nطلب الصرف رقم (\${order.orderNumber || order.id}) مكتمل وتم صرف كمياته من المخزون مسبقاً.\\n\\nهل أنت متأكد من حذف هذا السجل نهائياً؟\\nهذا الإجراء لا يمكن التراجع عنه.\`
        : \`⚠️ Super Admin Notice:\\nOrder (\${order.orderNumber || order.id}) is COMPLETED and items were already deducted from inventory.\\n\\nAre you sure you want to permanently delete this order record?\\nThis action cannot be undone.\`;

      if (!confirm(confirmMsg)) return;
    } else if (order.status === "CANCELLED") {
      const confirmMsg = lang === "ar"
        ? \`هل أنت متأكد من حذف الطلب الملغي (\${order.orderNumber || order.id}) نهائياً من النظام؟\\nهذا الإجراء لا يمكن التراجع عنه.\`
        : \`Are you sure you want to permanently delete cancelled order (\${order.orderNumber || order.id})?\\nThis action cannot be undone.\`;

      if (!confirm(confirmMsg)) return;
    } else {
      const msg = lang === "ar"
        ? "لا يمكن حذف الطلب وهو نشط! يرجى إلغاء الطلب أولاً قبل حذفه."
        : "Cannot delete an active order! Please cancel the order before deleting it.";
      if (window.OstanStyle) window.OstanStyle.showToast("تنبيه", msg, "warning");
      else alert(msg);
      return;
    }

    // Safety rollback if cancelled order had stock marked deducted
    if (order.stockDeducted && order.status === "CANCELLED") {
      const stock = window.state.stock || [];
      (order.items || []).forEach(it => {
        let stockItem = it.stockId ? stock.find(s => s.id === it.stockId) : null;
        if (!stockItem && it.itemName) stockItem = stock.find(s => s.name.trim().toLowerCase() === it.itemName.trim().toLowerCase());
        if (stockItem) stockItem.quantity += Number(it.quantity) || 0;
      });
      order.stockDeducted = false;
      if (typeof saveState === "function") saveState();
      if (typeof renderWarehouse === "function") renderWarehouse();
    }

    window.state.orders = orders.filter(o => o.id !== orderId);

    try {
      localStorage.setItem("ostan_orders", JSON.stringify(window.state.orders));
    } catch (e) {}

    closeOrderDetailsModal();
    renderOrders();
    if (typeof updateCounts === "function") updateCounts();

    const successMsg = lang === "ar"
      ? \`تم حذف الطلب (\${order.orderNumber || order.id}) بنجاح.\`
      : \`Order (\${order.orderNumber || order.id}) has been deleted successfully.\`;

    if (window.OstanStyle) {
      window.OstanStyle.showToast(lang === "ar" ? "تم الحذف" : "Deleted", successMsg);
    }
  }`;

if (engineCode.includes(oldDeleteOrderFunc)) {
  engineCode = engineCode.replace(oldDeleteOrderFunc, newDeleteOrderFunc);
  console.log('✅ Updated deleteOrder with Super Admin check for completed orders');
} else {
  console.warn('⚠️ oldDeleteOrderFunc not matched');
}

// B. In renderOrders, show delete button for DONE orders strictly when isSuper
const oldRowDoneButton = `                      \${o.status === "CANCELLED" ? \`
                        <button onclick="deleteOrder('\${o.id}')" class="btn btn-ghost" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25); background: rgba(239, 68, 68, 0.06); font-weight: 700;" title="\${lang === 'ar' ? 'حذف الطلب الملغي نهائياً' : 'Delete Cancelled Order'}">
                          🗑️ \${lang === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      \` : ''}`;

const newRowDoneButton = `                      \${o.status === "CANCELLED" ? \`
                        <button onclick="deleteOrder('\${o.id}')" class="btn btn-ghost" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25); background: rgba(239, 68, 68, 0.06); font-weight: 700;" title="\${lang === 'ar' ? 'حذف الطلب الملغي نهائياً' : 'Delete Cancelled Order'}">
                          🗑️ \${lang === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      \` : ''}

                      \${o.status === "DONE" && (typeof isMasterSuperAdmin === "function" && isMasterSuperAdmin(typeof getCurrentUser === "function" ? getCurrentUser() : null)) ? \`
                        <button onclick="deleteOrder('\${o.id}')" class="btn btn-ghost" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25); background: rgba(239, 68, 68, 0.06); font-weight: 700;" title="\${lang === 'ar' ? 'حذف الطلب المكتمل (صلاحية المدير العام)' : 'Delete Completed Order (Super Admin)'}">
                          🗑️ \${lang === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      \` : ''}`;

if (engineCode.includes(oldRowDoneButton)) {
  engineCode = engineCode.replace(oldRowDoneButton, newRowDoneButton);
  console.log('✅ Added Super Admin delete button for completed orders in table rows');
} else {
  console.warn('⚠️ oldRowDoneButton not matched');
}

// C. In openOrderDetails, show delete button for DONE orders strictly when isSuper
const oldModalHeaderDelete = `            \${order.status === "CANCELLED" ? \`
              <button onclick="deleteOrder('\${order.id}')" class="btn btn-ghost" style="color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); background: rgba(239, 68, 68, 0.05); font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.65rem;" title="Delete Cancelled Order">
                🗑️ \${lang === 'ar' ? 'حذف هذا الطلب الملغي' : 'Delete Cancelled Order'}
              </button>
            \` : ''}`;

const newModalHeaderDelete = `            \${order.status === "CANCELLED" ? \`
              <button onclick="deleteOrder('\${order.id}')" class="btn btn-ghost" style="color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); background: rgba(239, 68, 68, 0.05); font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.65rem;" title="Delete Cancelled Order">
                🗑️ \${lang === 'ar' ? 'حذف هذا الطلب الملغي' : 'Delete Cancelled Order'}
              </button>
            \` : (order.status === "DONE" && (typeof isMasterSuperAdmin === "function" && isMasterSuperAdmin(typeof getCurrentUser === "function" ? getCurrentUser() : null))) ? \`
              <button onclick="deleteOrder('\${order.id}')" class="btn btn-ghost" style="color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); background: rgba(239, 68, 68, 0.05); font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.65rem;" title="Delete Completed Order (Super Admin)">
                🗑️ \${lang === 'ar' ? 'حذف الطلب المكتمل' : 'Delete Order'}
              </button>
            \` : ''}`;

if (engineCode.includes(oldModalHeaderDelete)) {
  engineCode = engineCode.replace(oldModalHeaderDelete, newModalHeaderDelete);
  console.log('✅ Added Super Admin delete button in order details modal');
} else {
  console.warn('⚠️ oldModalHeaderDelete not matched');
}

// D. Improve Excel preview layout so user can see EVERYTHING in ONE LOOK without scrolling down!
const oldExcelPreviewBlock = `        if (preview) {
          preview.style.display = "block";
          preview.innerHTML = \`
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              <!-- Telemetry KPI Bar -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.5rem;">
                <div style="padding: 0.65rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
                  <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">إجمالي القطع المطلوب صرفها</div>
                  <div style="font-size: 1.35rem; font-weight: 800; color: #10b981;">\${parsed.netTotalQty} قطعة</div>
                </div>
                <div style="padding: 0.65rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
                  <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">عدد المدن / الفروع</div>
                  <div style="font-size: 1.35rem; font-weight: 800; color: #2563eb;">\${parsed.citiesList.length} مدن</div>
                </div>
                <div style="padding: 0.65rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
                  <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">إجمالي الكوادر المسجلين</div>
                  <div style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">\${parsed.totalRecords} موظف</div>
                </div>
                <div style="padding: 0.65rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
                  <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">طلبات معفاة (كمية 0)</div>
                  <div style="font-size: 1.35rem; font-weight: 800; color: #94a3b8;">\${parsed.zeroQtyCount}</div>
                </div>
              </div>

              <!-- 1. COUNT BY SIZE -->
              <div>
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--text-main); margin-bottom: 0.35rem;">
                  📏 توزيع وإحصاء المقاسات (Count by Size):
                </div>
                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                  \${Object.entries(parsed.countBySize).map(([sz, count]) => \`
                    <div style="padding: 0.3rem 0.65rem; background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 6px; font-size: 0.78rem;">
                      <strong style="color: #2563eb;">\${sz}:</strong> \${count} قطعة
                    </div>
                  \`).join("")}
                </div>
              </div>

              <!-- 2. COUNT BY CITY -->
              <div>
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--text-main); margin-bottom: 0.35rem;">
                  🏙️ توزيع المدن والكميات (Count by City):
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.35rem; max-height: 140px; overflow-y: auto;">
                  \${Object.values(parsed.countByCity).map(c => {
                    const sizesStr = Object.entries(c.sizes).map(([s, q]) => \`\${s}: \${q}\`).join(", ");
                    return \`
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.6rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.78rem;">
                        <div>
                          <strong style="color: var(--text-main);">\${c.city}</strong>
                          <span style="color: var(--text-muted); font-size: 0.72rem; margin-inline-start: 6px;">(\${c.totalWorkers} موظف)</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          <span style="font-size: 0.72rem; color: var(--text-muted);">\${sizesStr}</span>
                          <strong style="color: #10b981;">\${c.totalQty} قطعة</strong>
                        </div>
                      </div>
                    \`;
                  }).join("")}
                </div>
              </div>
            </div>
          \`;
        }`;

const newExcelPreviewBlock = `        // Compact dropzone into a sleek top banner so nothing gets pushed down
        const dropzone = document.getElementById("orders-excel-dropzone");
        if (dropzone) {
          dropzone.style.padding = "0.75rem 1rem";
          dropzone.style.display = "flex";
          dropzone.style.justifyContent = "space-between";
          dropzone.style.alignItems = "center";
        }

        if (preview) {
          preview.style.display = "block";
          preview.style.maxHeight = "none";
          preview.innerHTML = \`
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              <!-- Telemetry KPI Bar in 4 Columns -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.65rem;">
                <div style="padding: 0.75rem; background: rgba(16, 185, 129, 0.08); border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.25); text-align: center;">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">إجمالي القطع المطلوب صرفها</div>
                  <div style="font-size: 1.5rem; font-weight: 800; color: #10b981;">\${parsed.netTotalQty} <span style="font-size: 0.8rem; font-weight: 700;">قطعة</span></div>
                </div>
                <div style="padding: 0.75rem; background: rgba(37, 99, 235, 0.08); border-radius: var(--radius-md); border: 1px solid rgba(37, 99, 235, 0.25); text-align: center;">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">عدد المدن / الفروع</div>
                  <div style="font-size: 1.5rem; font-weight: 800; color: #2563eb;">\${parsed.citiesList.length} <span style="font-size: 0.8rem; font-weight: 700;">مدن</span></div>
                </div>
                <div style="padding: 0.75rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">إجمالي الكوادر المسجلين</div>
                  <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">\${parsed.totalRecords} <span style="font-size: 0.8rem; font-weight: 700;">موظف</span></div>
                </div>
                <div style="padding: 0.75rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">طلبات معفاة (كمية 0)</div>
                  <div style="font-size: 1.5rem; font-weight: 800; color: #94a3b8;">\${parsed.zeroQtyCount} <span style="font-size: 0.8rem; font-weight: 700;">طلب</span></div>
                </div>
              </div>

              <!-- 1. COUNT BY SIZE (Expansive visible layout with high clarity) -->
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.85rem;">
                <div style="font-weight: 800; font-size: 0.88rem; color: var(--text-main); margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                  <span>📏 توزيع وإحصاء المقاسات (Count by Size):</span>
                  <span style="font-size: 0.75rem; color: #2563eb; font-weight: 700;">\${Object.keys(parsed.countBySize).length} مقاسات مطلوبة</span>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                  \${Object.entries(parsed.countBySize).map(([sz, count]) => \`
                    <div style="padding: 0.4rem 0.85rem; background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 6px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                      <strong style="color: #2563eb;">\${sz}:</strong>
                      <span style="font-weight: 800; color: var(--text-main);">\${count} قطعة</span>
                    </div>
                  \`).join("")}
                </div>
              </div>

              <!-- 2. COUNT BY CITY (Compact horizontal cards or table) -->
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.85rem;">
                <div style="font-weight: 800; font-size: 0.88rem; color: var(--text-main); margin-bottom: 0.5rem;">
                  🏙️ توزيع المدن والكميات (Count by City):
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.5rem; max-height: 180px; overflow-y: auto;">
                  \${Object.values(parsed.countByCity).map(c => {
                    const sizesStr = Object.entries(c.sizes).map(([s, q]) => \`\${s}: \${q}\`).join(", ");
                    return \`
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.8rem;">
                        <div>
                          <strong style="color: var(--text-main); font-size: 0.85rem;">\${c.city}</strong>
                          <div style="color: var(--text-muted); font-size: 0.72rem; margin-top: 1px;">\${c.totalWorkers} موظف • \${sizesStr}</div>
                        </div>
                        <strong style="color: #10b981; font-size: 0.95rem; white-space: nowrap;">\${c.totalQty} قطعة</strong>
                      </div>
                    \`;
                  }).join("")}
                </div>
              </div>
            </div>
          \`;
        }`;

if (engineCode.includes(oldExcelPreviewBlock)) {
  engineCode = engineCode.replace(oldExcelPreviewBlock, newExcelPreviewBlock);
  console.log('✅ Upgraded Excel Preview into 1-look executive dashboard');
} else {
  console.warn('⚠️ oldExcelPreviewBlock not matched');
}

fs.writeFileSync(enginePath, engineCode, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'public', 'orders-engine.js'), engineCode, 'utf8');
console.log('✅ Successfully updated orders-engine.js and public/orders-engine.js\n');


// 3. UPDATE translation.js
const transPath = path.join(__dirname, '..', 'translation.js');
let transCode = fs.readFileSync(transPath, 'utf8');

transCode = transCode.replace(
  'nav_stock_requests: "Stock Requests",',
  'nav_stock_requests: "Stock Requests (Organizations)",'
);

transCode = transCode.replace(
  'nav_stock_requests: "طلبات الصرف",',
  'nav_stock_requests: "طلبات الصرف (للمؤسسات)",'
);

transCode = transCode.replace(
  'requests_section_title: "Material & Stock Requests",',
  'requests_section_title: "Stock Requests (Organizations)",'
);

transCode = transCode.replace(
  'requests_section_title: "طلبات صرف المواد والمعدات",',
  'requests_section_title: "طلبات صرف المواد (للمؤسسات والمنظمات)",'
);

fs.writeFileSync(transPath, transCode, 'utf8');
console.log('✅ Successfully updated translation.js\n');

console.log('=== IMPLEMENTATION COMPLETE ===');
