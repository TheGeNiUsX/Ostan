/**
 * Ostan Orders & Live Stock Tracking Engine
 * Dual-Format Excel Importer (English Uniform & Arabic Tools Forms)
 * City, Size & Quantity Counting & Analytics
 */

(function () {
  let currentOrdersFilterStatus = "ALL";
  let currentOrdersSearchQuery = "";
  let parsedOrdersBatchData = null;
  let manualOrderLineItems = [];

  // Normalizes sizing strings (e.g. XXL -> 2XL, XXXL -> 3XL)
  function normalizeSizeName(rawSize) {
    if (!rawSize) return "Standard";
    let s = String(rawSize).trim().toUpperCase();
    if (s === "XXL" || s === "2X" || s === "XX-LARGE") return "2XL";
    if (s === "XXXL" || s === "3X" || s === "XXX-LARGE") return "3XL";
    if (s === "XXXXL" || s === "4X") return "4XL";
    if (s === "XXXXXL" || s === "5X") return "5XL";
    if (s === "MED" || s === "MEDIUM") return "M";
    if (s === "LARGE") return "L";
    if (s === "SMALL") return "S";
    return s;
  }

  // Finds value from a row using multiple possible key names
  function getRowVal(row, possibleKeys) {
    const rowKeys = Object.keys(row);
    for (const pk of possibleKeys) {
      const target = pk.toLowerCase().trim();
      const foundKey = rowKeys.find(k => k.toLowerCase().trim() === target);
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
        const val = String(row[foundKey]).trim();
        if (val) return val;
      }
    }
    return "";
  }

  // Detects quantity column (handles named columns, Arabic columns, and unnamed columns next to size)
  function getRowQuantity(row, rowKeys, sizeKeyIdx) {
    // 1. Direct key search
    const directQty = getRowVal(row, ["عمود1", "الكمية", "عدد", "Quantity", "Qty", "Count", "amount", "pcs"]);
    if (directQty !== "") {
      const num = parseInt(directQty, 10);
      return isNaN(num) ? 1 : num;
    }

    // 2. Column next to size if index known
    if (sizeKeyIdx !== -1 && sizeKeyIdx + 1 < rowKeys.length) {
      const nextKey = rowKeys[sizeKeyIdx + 1];
      const val = row[nextKey];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        const num = parseInt(val, 10);
        if (!isNaN(num)) return num;
      }
    }

    // 3. Any numeric column with a number (e.g. 1, 2, 0)
    for (const k of rowKeys) {
      if (k.startsWith("__EMPTY") || k.includes("عمود") || k.toLowerCase().includes("qty")) {
        const val = row[k];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          const num = parseInt(val, 10);
          if (!isNaN(num)) return num;
        }
      }
    }

    return 1;
  }

  function parseDualFormatExcel(jsonRows) {
    if (!jsonRows || jsonRows.length === 0) return null;

    const firstRow = jsonRows[0];
    const rowKeys = Object.keys(firstRow);

    // Find key index for size
    const sizeKeyIdx = rowKeys.findIndex(k => {
      const lk = k.toLowerCase().trim();
      return lk.includes("size") || lk.includes("مقاس") || lk.includes("t-shirt");
    });

    // Detect Project column (المشروع / اسم المشروع / Project)
    const projectKey = rowKeys.find(k => {
      const lk = k.toLowerCase().trim();
      return lk.includes("مشروع") || lk.includes("المشروع") || lk.includes("project") || lk.includes("client") || lk.includes("العميل");
    });

    // Pass 1: Collect non-empty project names per city to resolve section/merged headers
    const cityToProjectMap = {};
    jsonRows.forEach(row => {
      let city = getRowVal(row, ["City", "city", "المدينة", "مدينة", "الموقع", "Location"]);
      if (!city) city = "المنطقة الرئيسية";
      city = city.trim();

      let pVal = "";
      if (projectKey && row[projectKey] != null) pVal = String(row[projectKey]).trim();
      if (!pVal) pVal = getRowVal(row, ["المشروع", "اسم المشروع", "مشروع", "Project", "Project Name", "Client", "العميل"]);
      if (pVal) {
        pVal = pVal.replace(/^مشروعs+/i, "").replace(/^Projects+/i, "").trim();
        if (pVal && !cityToProjectMap[city]) {
          cityToProjectMap[city] = pVal;
        }
      }
    });

    const roster = [];
    const countByCity = {};
    const countBySize = {};
    const countByProject = {};
    let netTotalQty = 0;
    let zeroQtyCount = 0;

    jsonRows.forEach((row, idx) => {
      // City (المدينة)
      let city = getRowVal(row, ["City", "city", "المدينة", "مدينة", "الموقع", "Location"]);
      if (!city) city = "المنطقة الرئيسية";
      city = city.trim();

      // Project (المشروع)
      let rowProj = "";
      if (projectKey && row[projectKey] != null) rowProj = String(row[projectKey]).trim();
      if (!rowProj) rowProj = getRowVal(row, ["المشروع", "اسم المشروع", "مشروع", "Project", "Project Name", "Client", "العميل"]);
      if (rowProj) {
        rowProj = rowProj.replace(/^مشروعs+/i, "").replace(/^Projects+/i, "").trim();
      }
      // If row has no explicit project, inherit from city block if known
      if (!rowProj && cityToProjectMap[city]) {
        rowProj = cityToProjectMap[city];
      }

      // Supervisor (المشرف)
      const spv = getRowVal(row, ["SPV", "Supervisor", "المشرف", "مشرف", "اسم المشرف", "Team", "الفريق"]);
      const spvPhone = getRowVal(row, ["جوال المشرف", "هاتف المشرف", "SPV Mobile", "Supervisor Mobile"]);

      // Merchandiser / Recipient (الاسم)
      let name = getRowVal(row, ["Merchandiser Name", "Merchandiser", "الاسم", "اسم الموظف", "Name", "Employee", "المستلم"]);
      if (!name) name = "موظف ميداني " + (idx + 1);

      // User Ref #
      const ref = getRowVal(row, ["USER REF.#", "USER REF", "Ref", "الرقم المرجعي", "كود"]);

      // Size (المقاس)
      const rawSize = getRowVal(row, ["T-shirt size", "Shirt size", "المقاس", "مقاس", "Size", "size"]);
      const size = normalizeSizeName(rawSize);

      // Quantity (الكمية / عمود1)
      const qty = getRowQuantity(row, rowKeys, sizeKeyIdx);

      // Category / Item description (عمود2 / الأدوات)
      let itemDesc = getRowVal(row, ["عمود2", "الصنف", "المادة", "الأدوات", "البيان", "Item Name", "Item", "Description"]);
      if (!itemDesc) {
        itemDesc = rawSize ? "تيشيرت / زي موحد" : "أدوات ومهمات";
      }

      // Mobile (الجوال)
      const mobile = getRowVal(row, ["Mobile", "Mobile Number", "الجوال", "الهاتف", "Phone", "رقم الجوال"]);

      // Record entry
      const rosterEntry = {
        index: idx + 1,
        city: city,
        projectName: rowProj,
        supervisor: spv,
        supervisorPhone: spvPhone,
        name: name,
        ref: ref,
        size: size,
        quantity: qty,
        itemDesc: itemDesc,
        mobile: mobile
      };
      roster.push(rosterEntry);

      if (qty <= 0) {
        zeroQtyCount++;
        return; // Skip 0 quantities from fulfillment totals
      }

      netTotalQty += qty;

      // 1. Group by City
      if (!countByCity[city]) {
        countByCity[city] = { city: city, projectName: rowProj, totalWorkers: 0, totalQty: 0, sizes: {}, spvs: new Set() };
      }
      countByCity[city].totalWorkers++;
      countByCity[city].totalQty += qty;
      countByCity[city].sizes[size] = (countByCity[city].sizes[size] || 0) + qty;
      if (spv) countByCity[city].spvs.add(spv);
      if (rowProj && !countByCity[city].projectName) countByCity[city].projectName = rowProj;

      // 2. Group by Project
      const projKey = rowProj ? rowProj : ("city_" + city);
      const displayTitle = rowProj ? ("مشروع " + rowProj) : ("مشروع " + city);
      if (!countByProject[projKey]) {
        countByProject[projKey] = {
          key: projKey,
          projectName: rowProj,
          displayProjectName: displayTitle,
          cities: new Set(),
          citiesMap: {},
          totalWorkers: 0,
          totalQty: 0,
          sizes: {},
          spvs: new Set(),
          roster: []
        };
      }
      countByProject[projKey].totalWorkers++;
      countByProject[projKey].totalQty += qty;
      countByProject[projKey].cities.add(city);
      countByProject[projKey].sizes[size] = (countByProject[projKey].sizes[size] || 0) + qty;
      if (spv) countByProject[projKey].spvs.add(spv);
      countByProject[projKey].roster.push(rosterEntry);

      if (!countByProject[projKey].citiesMap[city]) {
        countByProject[projKey].citiesMap[city] = { city: city, totalWorkers: 0, totalQty: 0, sizes: {} };
      }
      countByProject[projKey].citiesMap[city].totalWorkers++;
      countByProject[projKey].citiesMap[city].totalQty += qty;
      countByProject[projKey].citiesMap[city].sizes[size] = (countByProject[projKey].citiesMap[city].sizes[size] || 0) + qty;

      // 3. Group by Size
      countBySize[size] = (countBySize[size] || 0) + qty;
    });

    // Convert Sets to Arrays for clean serialization and iteration
    Object.values(countByProject).forEach(p => {
      p.cities = Array.from(p.cities);
      p.spvs = Array.from(p.spvs);
    });
    Object.values(countByCity).forEach(c => {
      c.spvs = Array.from(c.spvs);
    });

    const distinctProjectNames = Array.from(new Set(Object.values(countByProject).map(p => p.projectName).filter(Boolean)));

    return {
      roster: roster,
      countByCity: countByCity,
      countBySize: countBySize,
      countByProject: countByProject,
      projectsList: Object.keys(countByProject),
      distinctProjectNames: distinctProjectNames,
      netTotalQty: netTotalQty,
      totalRecords: roster.length,
      zeroQtyCount: zeroQtyCount,
      citiesList: Object.keys(countByCity),
      sizesList: Object.keys(countBySize)
    };
  }

  // Helper: generate next sequential Order Number
  function getNextOrderNumber() {
    const orders = (window.state && window.state.orders) ? window.state.orders : [];
    const existing = orders.map(o => {
      const m = (o.orderNumber || "").match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    });
    const maxNum = existing.length > 0 ? Math.max(...existing) : 1000;
    return "ORD-" + (maxNum + 1);
  }

  function renderOrders(filterStatus, searchQuery) {
    if (filterStatus) currentOrdersFilterStatus = filterStatus;
    if (typeof searchQuery === "string") currentOrdersSearchQuery = searchQuery.toLowerCase().trim();

    const container = document.getElementById("orders-table-container");
    if (!container) return;

    const lang = document.documentElement.getAttribute("lang") || "en";
    const orders = (window.state && window.state.orders) ? window.state.orders : [];

    // Update KPI counters
    const elTotal = document.getElementById("stat-orders-total");
    const elPending = document.getElementById("stat-orders-pending");
    const elApproved = document.getElementById("stat-orders-approved");
    const elDone = document.getElementById("stat-orders-done");

    const countTotal = orders.length;
    const countPending = orders.filter(o => o.status === "PENDING").length;
    const countApproved = orders.filter(o => o.status === "APPROVED").length;
    const countDone = orders.filter(o => o.status === "DONE").length;

    if (elTotal) elTotal.textContent = countTotal;
    if (elPending) elPending.textContent = countPending;
    if (elApproved) elApproved.textContent = countApproved;
    if (elDone) elDone.textContent = countDone;

    // Filter status buttons active state
    document.querySelectorAll("#orders-status-filters button").forEach(btn => {
      btn.className = "btn btn-secondary";
    });
    const activeBtn = document.getElementById("order-filter-btn-" + currentOrdersFilterStatus);
    if (activeBtn) activeBtn.className = "btn btn-primary";

    // Filter list
    let filtered = orders.filter(o => {
      if (currentOrdersFilterStatus !== "ALL" && o.status !== currentOrdersFilterStatus) return false;
      if (currentOrdersSearchQuery) {
        const matchNum = (o.orderNumber || "").toLowerCase().includes(currentOrdersSearchQuery);
        const matchClient = (o.clientName || "").toLowerCase().includes(currentOrdersSearchQuery);
        const matchCity = (o.city || "").toLowerCase().includes(currentOrdersSearchQuery);
        const matchItem = (o.items || []).some(i => (i.itemName || "").toLowerCase().includes(currentOrdersSearchQuery));
        const matchRoster = (o.roster || []).some(r => (r.name || "").toLowerCase().includes(currentOrdersSearchQuery) || (r.city || "").toLowerCase().includes(currentOrdersSearchQuery));
        if (!matchNum && !matchClient && !matchCity && !matchItem && !matchRoster) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 3rem 1rem; text-align: center; color: var(--text-faint);">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📦</div>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-muted);">
            ${lang === "ar" ? "لا توجد أوامر صرف مطابقة." : "No matching orders found."}
          </div>
          <div style="font-size: 0.8rem; margin-top: 4px;">
            ${lang === "ar" ? "يمكنك إنشاء طلب جديد أو استيراد ملف إكسل بالمدن والمقاسات." : "Create a new order manually or import an Excel spreadsheet."}
          </div>
        </div>`;
      return;
    }

    container.innerHTML = `
      ${currentOrdersFilterStatus === "CANCELLED" && filtered.length > 0 ? `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 1rem; margin-bottom: 0.85rem; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-md);">
          <div style="font-size: 0.82rem; color: #dc2626; font-weight: 700;">
            ⚠️ ${lang === "ar" ? `يوجد ${filtered.length} طلبات ملغية في الأرشيف` : `There are ${filtered.length} cancelled orders in archive`}
          </div>
          <button onclick="deleteAllCancelledOrders()" class="btn btn-ghost" style="color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); background: #fff; font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.75rem;">
            🗑️ ${lang === "ar" ? "حذف كافة الطلبات الملغية" : "Delete All Cancelled Orders"}
          </button>
        </div>
      ` : ''}
      <div class="table-responsive-wrapper">
        <table class="matrix-table" style="min-width: 820px;">
          <thead>
            <tr>
              <th>${lang === "ar" ? "رقم الطلب" : "Order #"}</th>
              <th>${lang === "ar" ? "المدينة والجهة المستلمة" : "City & Recipient"}</th>
              <th>${lang === "ar" ? "إحصاء المقاسات والكميات" : "Sizes & Quantity Breakdown"}</th>
              <th>${lang === "ar" ? "إجمالي الكمية" : "Total Qty"}</th>
              <th>${lang === "ar" ? "الأولوية" : "Priority"}</th>
              <th>${lang === "ar" ? "الحالة" : "Status"}</th>
              <th style="text-align: end;">${lang === "ar" ? "الإجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(o => {
              const totalQty = o.netTotalQty || (o.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
              const priorityBadge = o.priority === "URGENT" 
                ? '<span class="badge badge-rose">عاجل جداً</span>'
                : o.priority === "HIGH"
                ? '<span class="badge badge-amber">عالي</span>'
                : '<span class="badge badge-secondary">عادي</span>';

              const statusBadge = o.status === "DONE"
                ? '<span class="badge badge-emerald">✓ تم الصرف والخصم</span>'
                : o.status === "APPROVED"
                ? '<span class="badge badge-cyan">معتمد للتجهيز</span>'
                : o.status === "CANCELLED"
                ? '<span class="badge badge-rose">ملغي</span>'
                : '<span class="badge badge-amber">قيد المراجعة</span>';

              // Size pills
              let sizePills = "";
              if (o.countBySize && Object.keys(o.countBySize).length > 0) {
                sizePills = Object.entries(o.countBySize).map(([sz, q]) => `
                  <span style="display: inline-block; padding: 1px 6px; background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 4px; font-size: 0.72rem; color: #2563eb; font-weight: 700;">
                    ${sz}: ${q}
                  </span>
                `).join(" ");
              } else {
                sizePills = (o.items || []).map(it => `
                  <span style="display: inline-block; padding: 1px 6px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; font-size: 0.72rem;">
                    ${it.itemName}: ${it.quantity}
                  </span>
                `).join(" ");
              }

              // City badge
              const cityTag = o.city ? `<span class="badge badge-cyan" style="font-size: 0.65rem; padding: 1px 6px;">🏙️ ${o.city}</span>` : '';

              return `
                <tr>
                  <td style="font-weight: 800; color: #2563eb;">${o.orderNumber || o.id}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                      <strong style="color: var(--text-main); font-size: 0.9rem;">
                        ${(() => {
                          if (o.projectName) {
                            const pName = o.projectName.startsWith("مشروع") ? o.projectName : ("مشروع " + o.projectName);
                            const parenIdx = (o.clientName || "").indexOf("(");
                            const spvsPart = parenIdx !== -1 ? (" " + o.clientName.substring(parenIdx)) : "";
                            return pName + spvsPart;
                          }
                          return o.clientName || "طلب كادر الميدان";
                        })()}
                      </strong>
                      ${cityTag}
                    </div>
                    ${o.roster && o.roster.length > 0 ? `
                      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                        👥 يشمل ${o.roster.length} موظف ميداني مسجل
                      </div>
                    ` : ''}
                  </td>
                  <td>
                    <div style="display: flex; gap: 0.3rem; flex-wrap: wrap; max-width: 320px;">
                      ${sizePills}
                    </div>
                  </td>
                  <td>
                    <strong style="font-size: 0.95rem; color: #10b981;">${totalQty}</strong> <span style="font-size: 0.72rem; color: var(--text-muted);">قطعة</span>
                  </td>
                  <td>${priorityBadge}</td>
                  <td>
                    ${statusBadge}
                    ${o.stockDeducted ? '<div style="font-size: 0.65rem; color: #10b981; margin-top: 2px;">✓ تم خصم المخزون</div>' : ''}
                  </td>
                  <td style="text-align: end;">
                    <div style="display: inline-flex; align-items: center; gap: 0.35rem;">
                      ${o.status === "PENDING" ? `
                        <button onclick="setOrderStatus('${o.id}', 'APPROVED')" class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.72rem; color: #0284c7;" title="Approve Order">
                          ✓ اعتماد
                        </button>
                        <button onclick="setOrderStatus('${o.id}', 'CANCELLED')" class="btn btn-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; color: #ef4444;" title="Cancel Order">
                          ✕ إلغاء
                        </button>
                      ` : ''}

                      ${o.status === "APPROVED" ? `
                        <button onclick="setOrderStatus('${o.id}', 'DONE')" class="btn btn-primary" style="padding: 0.25rem 0.65rem; font-size: 0.72rem; background: #059669;" title="Fulfill order and deduct items from warehouse inventory">
                          📦 صرف واكتمال
                        </button>
                        <button onclick="setOrderStatus('${o.id}', 'CANCELLED')" class="btn btn-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; color: #ef4444;" title="Cancel Order">
                          ✕ إلغاء
                        </button>
                      ` : ''}

                      ${o.status === "CANCELLED" ? `
                        <button onclick="deleteOrder('${o.id}')" class="btn btn-ghost" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25); background: rgba(239, 68, 68, 0.06); font-weight: 700;" title="${lang === 'ar' ? 'حذف الطلب الملغي نهائياً' : 'Delete Cancelled Order'}">
                          🗑️ ${lang === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      ` : ''}

                      ${o.status === "DONE" && (typeof isMasterSuperAdmin === "function" && isMasterSuperAdmin(typeof getCurrentUser === "function" ? getCurrentUser() : null)) ? `
                        <button onclick="deleteOrder('${o.id}')" class="btn btn-ghost" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25); background: rgba(239, 68, 68, 0.06); font-weight: 700;" title="${lang === 'ar' ? 'حذف الطلب المكتمل (صلاحية المدير العام)' : 'Delete Completed Order (Super Admin)'}">
                          🗑️ ${lang === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      ` : ''}

                      <button onclick="openOrderDetails('${o.id}')" class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;" title="View Details / Print Slip">
                        👁️ سند
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>`;
  }

  function filterOrdersByStatus(status) {
    renderOrders(status, currentOrdersSearchQuery);
  }

  function handleOrdersSearch(val) {
    renderOrders(currentOrdersFilterStatus, val);
  }

  function openCreateOrderModal() {
    const numInput = document.getElementById("order-input-number");
    const clientInput = document.getElementById("order-input-client");
    const reqInput = document.getElementById("order-input-requester");
    const notesInput = document.getElementById("order-input-notes");
    const priorityInput = document.getElementById("order-input-priority");

    if (numInput) numInput.value = getNextOrderNumber();
    if (clientInput) clientInput.value = "";
    if (reqInput) {
      const u = typeof getCurrentUser === "function" ? getCurrentUser() : null;
      reqInput.value = u ? u.name : "Admin";
    }
    if (notesInput) notesInput.value = "";
    if (priorityInput) priorityInput.value = "NORMAL";

    manualOrderLineItems = [{ stockId: "", quantity: 1 }];
    renderOrderLineItemRows();

    const modal = document.getElementById("modal-create-order");
    if (modal) modal.style.display = "flex";
  }

  function closeCreateOrderModal() {
    const modal = document.getElementById("modal-create-order");
    if (modal) modal.style.display = "none";
  }

  function addOrderLineItem() {
    manualOrderLineItems.push({ stockId: "", quantity: 1 });
    renderOrderLineItemRows();
  }

  function removeOrderLineItem(index) {
    if (manualOrderLineItems.length <= 1) {
      manualOrderLineItems[0] = { stockId: "", quantity: 1 };
    } else {
      manualOrderLineItems.splice(index, 1);
    }
    renderOrderLineItemRows();
  }

  function renderOrderLineItemRows() {
    const container = document.getElementById("order-line-items-container");
    if (!container) return;
    const stock = (window.state && window.state.stock) ? window.state.stock : [];

    container.innerHTML = manualOrderLineItems.map((item, idx) => `
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <select class="input-field" style="flex: 2; font-size: 0.82rem;" onchange="window.manualOrderLineItems[${idx}].stockId = this.value; window.validateOrderStockLimit(${idx}, this.value)">
          <option value="">-- اختر مادة من المخزون --</option>
          ${stock.map(s => `
            <option value="${s.id}" ${item.stockId === s.id ? 'selected' : ''}>
              ${s.name} (المتوفر بالمستودع: ${s.quantity})
            </option>
          `).join("")}
        </select>

        <input type="number" min="1" class="input-field" style="width: 90px; font-size: 0.82rem;" value="${item.quantity || 1}" onchange="window.manualOrderLineItems[${idx}].quantity = parseInt(this.value, 10) || 1">

        <button type="button" onclick="removeOrderLineItem(${idx})" class="btn btn-ghost" style="color: #ef4444; padding: 0.35rem 0.5rem;" title="Remove line">
          ✕
        </button>
      </div>
    `).join("");
  }

  function validateOrderStockLimit(idx, stockId) {
    const s = (window.state && window.state.stock) ? window.state.stock.find(x => x.id === stockId) : null;
    if (s && s.quantity <= 0) {
      if (window.OstanStyle) window.OstanStyle.showToast("تنبيه المخزون", `الصنف ${s.name} غير متوفر حالياً بالمستودع (الكمية 0)!`, "warning");
    }
  }

  function handleSaveManualOrder(e) {
    e.preventDefault();
    const num = document.getElementById("order-input-number").value.trim();
    const client = document.getElementById("order-input-client").value.trim();
    const requester = document.getElementById("order-input-requester").value.trim();
    const priority = document.getElementById("order-input-priority").value;
    const notes = document.getElementById("order-input-notes").value.trim();

    const validItems = [];
    const stock = (window.state && window.state.stock) ? window.state.stock : [];
    manualOrderLineItems.forEach(line => {
      if (line.stockId) {
        const s = stock.find(x => x.id === line.stockId);
        validItems.push({
          stockId: line.stockId,
          itemName: s ? s.name : "مادة غير محددة",
          quantity: Math.max(1, parseInt(line.quantity, 10) || 1)
        });
      }
    });

    if (validItems.length === 0) {
      alert("يرجى اختيار مادة واحدة على الأقل من المخزون لإصدار الطلب.");
      return;
    }

    const newOrder = {
      id: "ord-" + Date.now(),
      orderNumber: num,
      clientName: client,
      requester: requester,
      priority: priority,
      notes: notes,
      items: validItems,
      status: "PENDING",
      stockDeducted: false,
      createdAt: new Date().toISOString()
    };

    window.state.orders = window.state.orders || [];
    window.state.orders.unshift(newOrder);

    try {
      localStorage.setItem("ostan_orders", JSON.stringify(window.state.orders));
    } catch (err) {}

    closeCreateOrderModal();
    renderOrders();

    if (window.OstanStyle) {
      window.OstanStyle.showToast("تم إنشاء الطلب بنجاح", `تم تسجيل أمر الصرف ${num} بنجاح وحفظه في النظام.`);
    }
  }

  // LIVE STOCK DEDUCTION WORKFLOW
  function setOrderStatus(orderId, newStatus) {
    const orders = (window.state && window.state.orders) ? window.state.orders : [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const lang = document.documentElement.getAttribute("lang") || "en";

    if (newStatus === "DONE") {
      const itemSummary = (order.items || []).map(i => `• ${i.itemName}: ${i.quantity}`).join("\n");
      const confirmMsg = lang === "ar"
        ? `هل أنت متأكد من تسليم أمر الصرف (${order.orderNumber}) وخصم المواد التالية من المخزون؟\n\n${itemSummary}`
        : `Confirm completion of order ${order.orderNumber} and deduct items from warehouse inventory?\n\n${itemSummary}`;

      if (!confirm(confirmMsg)) return;

      // Perform live deduction from state.stock
      const stock = window.state.stock || [];
      (order.items || []).forEach(it => {
        let stockItem = null;
        if (it.stockId) {
          stockItem = stock.find(s => s.id === it.stockId);
        }
        if (!stockItem && it.itemName) {
          stockItem = stock.find(s => s.name.trim().toLowerCase() === it.itemName.trim().toLowerCase());
        }
        if (!stockItem && it.size) {
          stockItem = stock.find(s => {
            const sn = s.name.toUpperCase();
            return sn.includes("مقاس " + it.size) || sn.includes("SIZE " + it.size) || sn.endsWith(" " + it.size);
          });
        }
        if (!stockItem && stock.length > 0) {
          stockItem = stock[0];
        }

        if (stockItem) {
          stockItem.quantity = Math.max(0, stockItem.quantity - Number(it.quantity));

          if (stockItem.quantity <= (stockItem.threshold || 5)) {
            if (window.OstanStyle) {
              window.OstanStyle.showToast("⚠️ تنبيه نقص المخزون", `الصنف ${stockItem.name} وصل للحد الأدنى (${stockItem.quantity} متبقي)!`, "warning");
            }
          }
        }
      });

      order.status = "DONE";
      order.stockDeducted = true;
      order.completedAt = new Date().toISOString();

      if (typeof saveState === "function") saveState();
      if (typeof renderWarehouse === "function") renderWarehouse();
      if (typeof renderDashboard === "function") renderDashboard();
      renderOrders();
      if (typeof updateCounts === "function") updateCounts();

      try {
        localStorage.setItem("ostan_orders", JSON.stringify(window.state.orders));
      } catch (e) {}

      if (window.OstanStyle) {
        window.OstanStyle.showToast("تم الصرف وخصم المخزون", `تم اكتمال الطلب ${order.orderNumber} وخصم الكميات من المستودع بنجاح!`);
      }
      return;
    }

    // If cancelling an order that already had stock deducted, restore it!
    if (newStatus === "CANCELLED" && order.stockDeducted) {
      const stock = window.state.stock || [];
      (order.items || []).forEach(it => {
        let stockItem = null;
        if (it.stockId) {
          stockItem = stock.find(s => s.id === it.stockId);
        }
        if (!stockItem && it.itemName) {
          stockItem = stock.find(s => s.name.trim().toLowerCase() === it.itemName.trim().toLowerCase());
        }
        if (!stockItem && it.size) {
          stockItem = stock.find(s => {
            const sn = s.name.toUpperCase();
            return sn.includes("مقاس " + it.size) || sn.includes("SIZE " + it.size) || sn.endsWith(" " + it.size);
          });
        }
        if (!stockItem && stock.length > 0) {
          stockItem = stock[0];
        }

        if (stockItem) {
          stockItem.quantity += Number(it.quantity);
        }
      });
      order.stockDeducted = false;
      if (typeof saveState === "function") saveState();
      if (typeof renderWarehouse === "function") renderWarehouse();
      if (typeof renderDashboard === "function") renderDashboard();
      if (typeof updateCounts === "function") updateCounts();
    }

    order.status = newStatus;
    try {
      localStorage.setItem("ostan_orders", JSON.stringify(window.state.orders));
    } catch (e) {}

    renderOrders();
    if (window.OstanStyle) {
      window.OstanStyle.showToast("تحديث حالة الطلب", `تم تغيير حالة الطلب ${order.orderNumber} إلى ${newStatus}`);
    }
  }

  // Delete Cancelled or Completed Order (Completed restricted strictly to Super Admin)
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
        ? `⚠️ تنبيه المدير العام:\nطلب الصرف رقم (${order.orderNumber || order.id}) مكتمل وتم صرف كمياته من المخزون مسبقاً.\n\nهل أنت متأكد من حذف هذا السجل نهائياً؟\nهذا الإجراء لا يمكن التراجع عنه.`
        : `⚠️ Super Admin Notice:\nOrder (${order.orderNumber || order.id}) is COMPLETED and items were already deducted from inventory.\n\nAre you sure you want to permanently delete this order record?\nThis action cannot be undone.`;

      if (!confirm(confirmMsg)) return;
    } else if (order.status === "CANCELLED") {
      const confirmMsg = lang === "ar"
        ? `هل أنت متأكد من حذف الطلب الملغي (${order.orderNumber || order.id}) نهائياً من النظام؟\nهذا الإجراء لا يمكن التراجع عنه.`
        : `Are you sure you want to permanently delete cancelled order (${order.orderNumber || order.id})?\nThis action cannot be undone.`;

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
      ? `تم حذف الطلب (${order.orderNumber || order.id}) بنجاح.`
      : `Order (${order.orderNumber || order.id}) has been deleted successfully.`;

    if (window.OstanStyle) {
      window.OstanStyle.showToast(lang === "ar" ? "تم الحذف" : "Deleted", successMsg);
    }
  }

  // Delete All Cancelled Orders
  function deleteAllCancelledOrders() {
    const orders = (window.state && window.state.orders) ? window.state.orders : [];
    const cancelledOrders = orders.filter(o => o.status === "CANCELLED");
    if (cancelledOrders.length === 0) return;

    const lang = document.documentElement.getAttribute("lang") || "en";
    const confirmMsg = lang === "ar"
      ? `هل أنت متأكد من حذف كافة الطلبيات الملغية (${cancelledOrders.length} طلب) نهائياً من النظام؟`
      : `Are you sure you want to permanently delete all ${cancelledOrders.length} cancelled orders?`;

    if (!confirm(confirmMsg)) return;

    window.state.orders = orders.filter(o => o.status !== "CANCELLED");

    try {
      localStorage.setItem("ostan_orders", JSON.stringify(window.state.orders));
    } catch (e) {}

    renderOrders();
    if (typeof updateCounts === "function") updateCounts();

    const successMsg = lang === "ar"
      ? `تم حذف ${cancelledOrders.length} طلب ملغي نهائياً.`
      : `Successfully deleted ${cancelledOrders.length} cancelled orders.`;

    if (window.OstanStyle) {
      window.OstanStyle.showToast(lang === "ar" ? "تم الحذف" : "Deleted", successMsg);
    }
  }

  // View Order Details Modal (with City Breakdown, Sizing Breakdown & Merchandiser Roster)
  function openOrderDetails(orderId) {
    const orders = (window.state && window.state.orders) ? window.state.orders : [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const lang = document.documentElement.getAttribute("lang") || "en";

    const container = document.getElementById("order-details-content");
    if (!container) return;

    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-US") : "-";
    const totalQty = order.netTotalQty || (order.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

    container.innerHTML = `
      <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
        <!-- Top Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.85rem; margin-bottom: 1rem;">
          <div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #2563eb;">سند صرف وتوريد: ${order.orderNumber || order.id}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">تاريخ الإنشاء: ${dateStr} | ${order.clientName || ''}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${order.status === "CANCELLED" ? `
              <button onclick="deleteOrder('${order.id}')" class="btn btn-ghost" style="color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); background: rgba(239, 68, 68, 0.05); font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.65rem;" title="Delete Cancelled Order">
                🗑️ ${lang === 'ar' ? 'حذف هذا الطلب الملغي' : 'Delete Cancelled Order'}
              </button>
            ` : (order.status === "DONE" && (typeof isMasterSuperAdmin === "function" && isMasterSuperAdmin(typeof getCurrentUser === "function" ? getCurrentUser() : null))) ? `
              <button onclick="deleteOrder('${order.id}')" class="btn btn-ghost" style="color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); background: rgba(239, 68, 68, 0.05); font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.65rem;" title="Delete Completed Order (Super Admin)">
                🗑️ ${lang === 'ar' ? 'حذف الطلب المكتمل' : 'Delete Order'}
              </button>
            ` : ''}
            <span class="badge ${order.status === 'DONE' ? 'badge-emerald' : order.status === 'APPROVED' ? 'badge-cyan' : order.status === 'CANCELLED' ? 'badge-rose' : 'badge-amber'}" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">
              ${order.status === 'CANCELLED' ? (lang === 'ar' ? 'ملغي' : 'CANCELLED') : order.status}
            </span>
          </div>
        </div>

        <!-- Summary Badges Bar -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; margin-bottom: 1rem;">
          <div style="padding: 0.65rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-muted);">إجمالي الكمية المطلوبة</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #10b981;">${totalQty} قطعة</div>
          </div>
          <div style="padding: 0.65rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-muted);">المدن المشمولة</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: #2563eb;">${order.countByCity ? Object.keys(order.countByCity).length : (order.city ? 1 : "-")}</div>
          </div>
          <div style="padding: 0.65rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-muted);">حالة خصم المستودع</div>
            <div style="font-size: 0.85rem; font-weight: 700; color: ${order.stockDeducted ? '#10b981' : '#f59e0b'}; margin-top: 4px;">
              ${order.stockDeducted ? "✓ تم الخصم" : "⏳ معلق"}
            </div>
          </div>
        </div>

        <!-- 1. SIZE BREAKDOWN MATRIX -->
        ${order.countBySize ? `
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">📏 إحصاء المقاسات (Count by Size):</div>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              ${Object.entries(order.countBySize).map(([sz, q]) => `
                <div style="padding: 0.35rem 0.75rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 0.78rem;">
                  <strong style="color: #2563eb;">${sz}:</strong> ${q} قطعة
                </div>
              `).join("")}
            </div>
          </div>
        ` : ''}

        <!-- 2. CITY BREAKDOWN TABLE -->
        ${order.countByCity && Object.keys(order.countByCity).length > 0 ? `
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">🏙️ توزيع المدن والكميات (Count by City):</div>
            <table class="matrix-table" style="width: 100%; font-size: 0.78rem;">
              <thead>
                <tr>
                  <th>المدينة</th>
                  <th>عدد الكوادر</th>
                  <th>توزيع المقاسات</th>
                  <th>إجمالي الكمية</th>
                </tr>
              </thead>
              <tbody>
                ${Object.values(order.countByCity).map(c => `
                  <tr>
                    <td style="font-weight: 700;">${c.city}</td>
                    <td>${c.totalWorkers} موظف</td>
                    <td>${Object.entries(c.sizes || {}).map(([s, q]) => `${s}:${q}`).join(", ")}</td>
                    <td><strong style="color: #10b981;">${c.totalQty} قطعة</strong></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- 3. DETAILED ROSTER -->
        ${order.roster && order.roster.length > 0 ? `
          <div style="margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">👥 كشف الكوادر المستلمين (${order.roster.length} موظف):</div>
            </div>
            <div style="max-height: 220px; overflow-y: auto; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
              <table class="matrix-table" style="width: 100%; font-size: 0.75rem;">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>اسم الموظف</th>
                    <th>المدينة</th>
                    <th>المشرف</th>
                    <th>الجوال</th>
                    <th>المقاس</th>
                    <th>الكمية</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.roster.map(r => `
                    <tr style="${r.quantity <= 0 ? 'opacity: 0.5;' : ''}">
                      <td>${r.index || '-'}</td>
                      <td style="font-weight: 700;">${r.name}</td>
                      <td>${r.city}</td>
                      <td>${r.supervisor || '-'}</td>
                      <td style="direction: ltr; text-align: start;">${r.mobile || '-'}</td>
                      <td><span class="badge badge-secondary">${r.size || '-'}</span></td>
                      <td><strong style="color: ${r.quantity > 0 ? '#10b981' : '#94a3b8'};">${r.quantity}</strong></td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    const modal = document.getElementById("modal-order-details");
    if (modal) modal.style.display = "flex";
  }

  function closeOrderDetailsModal() {
    const modal = document.getElementById("modal-order-details");
    if (modal) modal.style.display = "none";
  }

  // EXCEL BATCH IMPORT & SAMPLE DOWNLOAD
  function downloadOrdersExcelSample() {
    if (typeof XLSX === "undefined") {
      alert("XLSX library is loading, please try again in a moment.");
      return;
    }

    const sampleUniformData = [
      { "City": "JUBAIL", "SPV": "Mohamed Hasona Hassan Jubail Team", "Merchandiser Name": "Abdo Abdalla Alraad JUBAIL Eshhar", "USER REF.#": "nadec.131", "T-shirt size": "XXL", "Quantity": 1, "Mobile": "593532219", "المشروع": "نادك" },
      { "City": "JUBAIL", "SPV": "Mohamed Hasona Hassan Jubail Team", "Merchandiser Name": "Mohammad Mahmod Ali Jubail Eshhar", "USER REF.#": "nadec.047", "T-shirt size": "XXL", "Quantity": 2, "Mobile": "500756008" },
      { "City": "JUBAIL", "SPV": "Mohamed Hasona Hassan Jubail Team", "Merchandiser Name": "Youssef Abdelqawi Abdullah JUBAIL Eshhar", "USER REF.#": "nadec.061", "T-shirt size": "XL", "Quantity": 2, "Mobile": "531501204" },
      { "City": "JUBAIL", "SPV": "Mohamed Hasona Hassan Jubail Team", "Merchandiser Name": "Hamza Zafer Iqbal JUBAIL Eshhar", "USER REF.#": "nadec.067", "T-shirt size": "M", "Quantity": 1, "Mobile": "571270235" },
      { "City": "JUBAIL", "SPV": "Mohamed Hasona Hassan Jubail Team", "Merchandiser Name": "Khaled Saeed Ahmed JUBAIL Eshhar", "USER REF.#": "nadec.110", "T-shirt size": "L", "Quantity": 2, "Mobile": "581466805" },
      { "City": "HAFAR AL BATIN", "SPV": "Hisham Altairy Hafar AlBatin Team", "Merchandiser Name": "Nawaf Al-Shammari HAFAR AL BATIN", "USER REF.#": "nadec.051", "T-shirt size": "4XL", "Quantity": 2, "Mobile": "533353215" },
      { "City": "HAFAR AL BATIN", "SPV": "Hisham Altairy Hafar AlBatin Team", "Merchandiser Name": "Mohamed Rassl HAFAR AL BATIN Eshhar", "USER REF.#": "nadec.083", "T-shirt size": "M", "Quantity": 0, "Mobile": "571769393" },
      { "City": "Khobar", "SPV": "Elsaeed abdullah Khobar Team", "Merchandiser Name": "MUHAMED SULAIMAN NAIRIYAH Eshhar", "USER REF.#": "nadec.026", "T-shirt size": "XL", "Quantity": 2, "Mobile": "505637912" },
      { "City": "Khobar", "SPV": "Elsaeed abdullah Khobar Team", "Merchandiser Name": "Saleh Abdalla Maodom AL KHOBAR Eshhar", "USER REF.#": "nadec.042", "T-shirt size": "3XL", "Quantity": 1, "Mobile": "552824813" }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleUniformData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Uniform_Orders");
    XLSX.writeFile(wb, "ostan_orders_sample_uniform.xlsx");
  }

  function openOrdersExcelImportModal() {
    parsedOrdersBatchData = null;
    const label = document.getElementById("orders-excel-dropzone-label");
    const btn = document.getElementById("btn-confirm-orders-import");
    const preview = document.getElementById("orders-excel-preview-container");

    if (label) label.textContent = "Click or Drag & Drop Orders Excel File here (يدعم كلا النموذجين العربي والإنجليزي)";
    if (btn) btn.style.display = "none";
    if (preview) { preview.style.display = "none"; preview.innerHTML = ""; }

    const modal = document.getElementById("modal-orders-excel-import");
    if (modal) modal.style.display = "flex";
  }

  function closeOrdersExcelImportModal() {
    const modal = document.getElementById("modal-orders-excel-import");
    if (modal) modal.style.display = "none";
  }

  function handleOrdersExcelFileSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

        if (!json || json.length === 0) {
          alert("الملف المرفوع فارغ أو لا يحتوي على صفوف بيانات صالحة.");
          return;
        }

        const parsed = parseDualFormatExcel(json);
        if (!parsed || parsed.roster.length === 0) {
          alert("تعذر قراءة بيانات الأصناف. يرجى التأكد من تطابق الملف مع نماذج العمل.");
          return;
        }

        parsedOrdersBatchData = parsed;
        parsedOrdersBatchData.fileName = file.name;

        // Render Live Counting & Analytics Preview in Modal
        const label = document.getElementById("orders-excel-dropzone-label");
        const btn = document.getElementById("btn-confirm-orders-import");
        const preview = document.getElementById("orders-excel-preview-container");

        if (label) {
          label.textContent = `✓ تم فحص الملف بنجاح: ${file.name}`;
        }
        if (btn) {
          btn.style.display = "inline-flex";
          btn.textContent = `تأكيد استيراد الطلب (إجمالي ${parsed.netTotalQty} قطعة عبر ${parsed.citiesList.length} مدن)`;
        }

        // Compact dropzone into a sleek top banner so nothing gets pushed down
        const dropzone = document.getElementById("orders-excel-dropzone");
        if (dropzone) {
          dropzone.style.padding = "0.65rem 1rem";
          dropzone.style.display = "flex";
          dropzone.style.justifyContent = "space-between";
          dropzone.style.alignItems = "center";
        }

        if (preview) {
          preview.style.display = "block";
          preview.style.maxHeight = "none";
          preview.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              <!-- Telemetry KPI Bar in 4 Columns -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.65rem;">
                <div style="padding: 0.75rem; background: rgba(16, 185, 129, 0.08); border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.25); text-align: center;">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">إجمالي القطع المطلوب صرفها</div>
                  <div style="font-size: 1.5rem; font-weight: 800; color: #10b981;">${parsed.netTotalQty} <span style="font-size: 0.8rem; font-weight: 700;">قطعة</span></div>
                </div>
                <div style="padding: 0.75rem; background: rgba(37, 99, 235, 0.08); border-radius: var(--radius-md); border: 1px solid rgba(37, 99, 235, 0.25); text-align: center;">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">عدد المدن / الفروع</div>
                  <div style="font-size: 1.5rem; font-weight: 800; color: #2563eb;">${parsed.citiesList.length} <span style="font-size: 0.8rem; font-weight: 700;">مدن</span></div>
                </div>
                <div style="padding: 0.75rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">إجمالي الكوادر المسجلين</div>
                  <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">${parsed.totalRecords} <span style="font-size: 0.8rem; font-weight: 700;">موظف</span></div>
                </div>
                <div style="padding: 0.75rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">طلبات معفاة (كمية 0)</div>
                  <div style="font-size: 1.5rem; font-weight: 800; color: #94a3b8;">${parsed.zeroQtyCount} <span style="font-size: 0.8rem; font-weight: 700;">طلب</span></div>
                </div>
              </div>

              <!-- 1. COUNT BY SIZE (Expansive visible layout with high clarity) -->
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.85rem;">
                <div style="font-weight: 800; font-size: 0.88rem; color: var(--text-main); margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                  <span>📏 توزيع وإحصاء المقاسات (Count by Size):</span>
                  <span style="font-size: 0.75rem; color: #2563eb; font-weight: 700;">${Object.keys(parsed.countBySize).length} مقاسات مطلوبة</span>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                  ${Object.entries(parsed.countBySize).map(([sz, count]) => `
                    <div style="padding: 0.4rem 0.85rem; background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 6px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                      <strong style="color: #2563eb;">${sz}:</strong>
                      <span style="font-weight: 800; color: var(--text-main);">${count} قطعة</span>
                    </div>
                  `).join("")}
                </div>
              </div>

              <!-- 2. COUNT BY PROJECT (Displayed when projects exist) -->
              ${parsed.distinctProjectNames && parsed.distinctProjectNames.length > 0 ? `
                <div style="background: var(--bg-surface); border: 1.5px solid rgba(37, 99, 235, 0.25); border-radius: var(--radius-md); padding: 0.85rem;">
                  <div style="font-weight: 800; font-size: 0.88rem; color: #2563eb; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <span>🏗️ المشاريع المكتشفة في الملف (Detected Projects):</span>
                    <span class="badge badge-primary" style="font-size: 0.72rem;">${parsed.projectsList.length} مشاريع</span>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.5rem;">
                    ${Object.values(parsed.countByProject).map(p => `
                      <div style="padding: 0.55rem 0.75rem; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <strong style="color: var(--text-main); font-size: 0.88rem;">${p.displayProjectName}</strong>
                          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                            المدن: ${Array.from(p.cities).join('، ')} • ${p.totalWorkers} كادر
                          </div>
                        </div>
                        <span class="badge badge-emerald" style="font-size: 0.85rem; font-weight: 800;">${p.totalQty} قطعة</span>
                      </div>
                    `).join("")}
                  </div>
                </div>
              ` : ''}

              <!-- 3. COUNT BY CITY (Compact horizontal grid) -->
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.85rem;">
                <div style="font-weight: 800; font-size: 0.88rem; color: var(--text-main); margin-bottom: 0.5rem;">
                  🏙️ توزيع المدن والكميات (Count by City):
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.5rem; max-height: 180px; overflow-y: auto;">
                  ${Object.values(parsed.countByCity).map(c => {
                    const sizesStr = Object.entries(c.sizes).map(([s, q]) => `${s}: ${q}`).join(", ");
                    return `
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.8rem;">
                        <div>
                          <strong style="color: var(--text-main); font-size: 0.85rem;">${c.city}</strong>
                          ${c.projectName ? `<span class="badge badge-primary" style="font-size: 0.65rem; margin-inline-start: 4px;">${c.projectName}</span>` : ''}
                          <div style="color: var(--text-muted); font-size: 0.72rem; margin-top: 1px;">${c.totalWorkers} موظف • ${sizesStr}</div>
                        </div>
                        <strong style="color: #10b981; font-size: 0.95rem; white-space: nowrap;">${c.totalQty} قطعة</strong>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>

              <!-- Import Mode Selector -->
              <div style="padding: 0.65rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem;">طريقة تسجيل أمر الصرف:</div>
                <div style="display: flex; gap: 1rem; font-size: 0.78rem; flex-wrap: wrap;">
                  <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                    <input type="radio" name="orders_import_mode" value="PER_PROJECT" ${parsed.projectsList && parsed.projectsList.length > 1 ? 'checked' : ''}>
                    <strong>أمر صرف منفصل لكل مشروع</strong> ${parsed.projectsList && parsed.projectsList.length > 1 ? '<span style="color: #2563eb; font-weight: 800;">(موصى به - تم اكتشاف ' + parsed.projectsList.length + ' مشاريع)</span>' : ''}
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                    <input type="radio" name="orders_import_mode" value="PER_CITY" ${(!parsed.projectsList || parsed.projectsList.length <= 1) ? 'checked' : ''}>
                    <strong>أمر صرف منفصل لكل مدينة</strong>
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                    <input type="radio" name="orders_import_mode" value="MASTER">
                    <strong>أمر صرف مجمع شامل للملف بالكامل</strong>
                  </label>
                </div>
              </div>
            </div>
          `;
        }

      } catch (err) {
        console.error("Excel parse error:", err);
        alert("حدث خطأ أثناء قراءة ملف الإكسل: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function confirmOrdersExcelImport() {
    const p = parsedOrdersBatchData || window.parsedOrdersBatchData;
    if (!p) return;
    const modeEl = document.querySelector('input[name="orders_import_mode"]:checked');
    let mode = modeEl ? modeEl.value : (p.projectsList && p.projectsList.length > 1 ? "PER_PROJECT" : "MASTER");
    const stock = (window.state && window.state.stock) ? window.state.stock : [];

    function buildItemsFromSizes(sizesMap) {
      return Object.entries(sizesMap).map(([sz, qty]) => {
        const matchedStock = stock.find(s => s.name.toLowerCase().includes(sz.toLowerCase())) || stock[0];
        return {
          stockId: matchedStock ? matchedStock.id : "",
          itemName: matchedStock ? `${matchedStock.name} (مقاس ${sz})` : `زي موحد / تيشيرت (مقاس ${sz})`,
          size: sz,
          quantity: qty
        };
      });
    }

    window.state.orders = window.state.orders || [];

    // Mode 1: PER_PROJECT (Default when multiple projects exist)
    if (mode === "PER_PROJECT" || (p.projectsList && p.projectsList.length > 1 && mode !== "PER_CITY")) {
      Object.values(p.countByProject).forEach((projData, pIdx) => {
        const projItems = buildItemsFromSizes(projData.sizes);
        const cityList = Array.isArray(projData.cities) ? projData.cities : (projData.cities instanceof Set ? Array.from(projData.cities) : Object.keys(projData.citiesMap || {}));
        const cityNames = cityList.join("، ");
        const spvList = Array.isArray(projData.spvs) ? projData.spvs : (projData.spvs instanceof Set ? Array.from(projData.spvs) : []);
        const spvsNames = spvList.join(" / ") || "إشراف ميداني";

        // Display title: "مشروع نادك (بلال محمد / طلال طلعت)"
        const clientNameStr = `${projData.displayProjectName} (${spvsNames})`;

        const newOrder = {
          id: "ord-" + Date.now() + "-" + pIdx,
          orderNumber: getNextOrderNumber(),
          projectName: projData.projectName || "",
          clientName: clientNameStr,
          city: cityNames,
          requester: spvList[0] || "مشرف المشروع",
          priority: "NORMAL",
          notes: `تم الاستيراد من ملف ${p.fileName || 'Excel'} - ${projData.displayProjectName}`,
          items: projItems,
          roster: projData.roster,
          countByCity: projData.citiesMap,
          countBySize: projData.sizes,
          netTotalQty: projData.totalQty,
          status: "PENDING",
          stockDeducted: false,
          createdAt: new Date().toISOString()
        };
        window.state.orders.unshift(newOrder);
      });
    }
    // Mode 2: PER_CITY
    else if (mode === "PER_CITY") {
      Object.values(p.countByCity).forEach((cityData, cIdx) => {
        const cityRoster = p.roster.filter(r => r.city === cityData.city && r.quantity > 0);
        const cityItems = buildItemsFromSizes(cityData.sizes);
        const spvsNames = Array.from(cityData.spvs).join(" / ") || "إشراف ميداني";

        // If city has an associated project name (e.g. نادك), display "مشروع نادك" instead of "مشروع الاحساء"
        const projTitle = cityData.projectName ? ("مشروع " + cityData.projectName) : ("مشروع " + cityData.city);
        const clientNameStr = `${projTitle} (${spvsNames})`;

        const newOrder = {
          id: "ord-" + Date.now() + "-" + cIdx,
          orderNumber: getNextOrderNumber(),
          projectName: cityData.projectName || "",
          clientName: clientNameStr,
          city: cityData.city,
          requester: Array.from(cityData.spvs)[0] || "مشرف المدينة",
          priority: "NORMAL",
          notes: `تم الاستيراد من ملف ${p.fileName || 'Excel'} - فرع ${cityData.city}`,
          items: cityItems,
          roster: cityRoster,
          countByCity: { [cityData.city]: cityData },
          countBySize: cityData.sizes,
          netTotalQty: cityData.totalQty,
          status: "PENDING",
          stockDeducted: false,
          createdAt: new Date().toISOString()
        };
        window.state.orders.unshift(newOrder);
      });
    }
    // Mode 3: MASTER (Single combined order)
    else {
      const masterItems = buildItemsFromSizes(p.countBySize);
      const singleProj = (p.distinctProjectNames && p.distinctProjectNames.length === 1) ? p.distinctProjectNames[0] : "";
      const clientNameStr = singleProj
        ? `مشروع ${singleProj} (${p.citiesList.slice(0, 3).join('، ')})`
        : `توريد كادر الميدان (${p.citiesList.slice(0, 3).join('، ')}${p.citiesList.length > 3 ? '...' : ''})`;

      const newOrder = {
        id: "ord-" + Date.now(),
        orderNumber: getNextOrderNumber(),
        projectName: singleProj,
        clientName: clientNameStr,
        city: p.citiesList.join("، "),
        requester: "Excel Batch Import",
        priority: "HIGH",
        notes: `ملف: ${p.fileName || 'Excel'} | إجمالي ${p.netTotalQty} قطعة عبر ${p.citiesList.length} مدن (${p.totalRecords} كادر مسجل)`,
        items: masterItems,
        roster: p.roster,
        countByCity: p.countByCity,
        countBySize: p.countBySize,
        netTotalQty: p.netTotalQty,
        status: "PENDING",
        stockDeducted: false,
        createdAt: new Date().toISOString()
      };
      window.state.orders.unshift(newOrder);
    }

    try {
      localStorage.setItem("ostan_orders", JSON.stringify(window.state.orders));
    } catch (e) {}

    const totalItems = p.netTotalQty;
    parsedOrdersBatchData = null;
    closeOrdersExcelImportModal();
    renderOrders();

    if (window.OstanStyle) {
      window.OstanStyle.showToast("تم اعتماد الاستيراد بنجاح", `تم تسجيل أوامر الصرف للمشاريع والمدن بإجمالي ${totalItems} قطعة.`);
    }
  }

  // Export to global window scope
  window.parseDualFormatExcel = parseDualFormatExcel;
  window.renderOrders = renderOrders;
  window.filterOrdersByStatus = filterOrdersByStatus;
  window.handleOrdersSearch = handleOrdersSearch;
  window.openCreateOrderModal = openCreateOrderModal;
  window.closeCreateOrderModal = closeCreateOrderModal;
  window.addOrderLineItem = addOrderLineItem;
  window.removeOrderLineItem = removeOrderLineItem;
  window.renderOrderLineItemRows = renderOrderLineItemRows;
  window.validateOrderStockLimit = validateOrderStockLimit;
  window.handleSaveManualOrder = handleSaveManualOrder;
  window.setOrderStatus = setOrderStatus;
  window.deleteOrder = deleteOrder;
  window.deleteAllCancelledOrders = deleteAllCancelledOrders;
  window.openOrderDetails = openOrderDetails;
  window.closeOrderDetailsModal = closeOrderDetailsModal;
  window.downloadOrdersExcelSample = downloadOrdersExcelSample;
  window.openOrdersExcelImportModal = openOrdersExcelImportModal;
  window.closeOrdersExcelImportModal = closeOrdersExcelImportModal;
  window.handleOrdersExcelFileSelected = handleOrdersExcelFileSelected;
  window.confirmOrdersExcelImport = confirmOrdersExcelImport;
  window.manualOrderLineItems = manualOrderLineItems;

  // Initial render when orders view is accessed
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      if (window.state && window.state.activeModule === "orders") {
        renderOrders();
      }
    }, 400);
  });
})();
