const fs = require('fs');
const path = require('path');

console.log('=== FIXING CRLF REPLACEMENTS ===\n');

// 1. UPDATE index.html
const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8').replace(/\r\n/g, '\n');

// A. Update Stock Form with Project Name and Super Admin Buttons
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
  console.log('✅ 1. Replaced stock form part with project name and admin buttons');
} else {
  console.warn('⚠️ 1. oldStockFormPart still not matched');
}

// B. Reorder Sidebar
const oldSidebarInv = `        <!-- INVENTORY -->
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

const newSidebarInv = `        <!-- INVENTORY -->
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

if (html.includes(oldSidebarInv)) {
  html = html.replace(oldSidebarInv, newSidebarInv);
  console.log('✅ 2. Replaced sidebar inventory order');
} else {
  console.warn('⚠️ 2. oldSidebarInv not matched');
}

// C. Top subnav
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
  console.log('✅ 3. Replaced top subnav items');
} else {
  console.warn('⚠️ 3. oldTopSubnav not matched');
}

fs.writeFileSync(indexPath, html, 'utf8');


// 2. UPDATE orders-engine.js
const enginePath = path.join(__dirname, '..', 'orders-engine.js');
let engineCode = fs.readFileSync(enginePath, 'utf8').replace(/\r\n/g, '\n');

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
  console.log('✅ 4. Replaced Excel Preview with 1-look executive layout');
} else {
  console.warn('⚠️ 4. oldExcelPreviewBlock not matched');
}

fs.writeFileSync(enginePath, engineCode, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'public', 'orders-engine.js'), engineCode, 'utf8');

console.log('\n=== FIX SCRIPT FINISHED ===');
