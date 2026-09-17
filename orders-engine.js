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

  // Helper: Reliable single source of truth for orders in memory & persistence
  function getActiveOrders() {
    if (!window.state) window.state = {};
    if (!window.state.orders || !Array.isArray(window.state.orders)) {
      try {
        const saved = localStorage.getItem("ostan_orders");
        window.state.orders = saved ? JSON.parse(saved) : [];
      } catch (e) {
        window.state.orders = [];
      }
    }
    return window.state.orders;
  }

  function persistOrders() {
    if (!window.state) window.state = {};
    const ords = window.state.orders || [];
    try {
      localStorage.setItem("ostan_orders", JSON.stringify(ords));
    } catch (e) {}
    if (typeof saveState === "function") {
      try { saveState(); } catch (e) {}
    }
  }

  // Helper: Project-Aware and Size-Aware Stock Item Matcher
  function findMatchingStockItem(stock, targetProject, targetSize, itemDesc) {
    if (!stock || stock.length === 0) return null;
    const proj = (targetProject || "").trim().toLowerCase();
    const sz = (targetSize || "").trim().toUpperCase();
    const desc = (itemDesc || "").trim().toLowerCase();

    const getProj = (s) => (s.projectName || (typeof getStockItemProject === "function" ? getStockItemProject(s) : "") || "").trim().toLowerCase();

    // If a project is designated for this order/line:
    if (proj) {
      // Priority 1: Exact project match AND exact size match
      let match = stock.find(s => {
        const sProj = getProj(s);
        const sSize = (s.size || "").trim().toUpperCase();
        const sName = (s.name || "").toLowerCase();
        const projMatches = (sProj === proj || sProj.includes(proj) || sName.includes(proj));
        const sizeMatches = sz ? (sSize === sz || sName.toUpperCase().includes(sz)) : true;
        return projMatches && sizeMatches;
      });
      if (match) return match;

      // Priority 2: If target size is specified, check if there's a "Standard" (generic un-sized) item for this project
      if (sz && sz !== "STANDARD") {
        match = stock.find(s => {
          const sProj = getProj(s);
          const sSize = (s.size || "").trim().toUpperCase();
          const sName = (s.name || "").toLowerCase();
          const projMatches = (sProj === proj || sProj.includes(proj) || sName.includes(proj));
          const isStandard = (!sSize || sSize === "STANDARD" || sSize === "ALL");
          return projMatches && isStandard;
        });
        if (match) return match;

        // STRICT SIZE ISOLATION:
        // If order requested size (e.g. "L"), NEVER steal from a conflicting specific size (e.g. "2XL")!
        return null;
      }

      // Priority 3: If no size was specified, match any wearable/item of this project
      match = stock.find(s => {
        const sProj = getProj(s);
        const sName = (s.name || "").toLowerCase();
        const sCat = (s.category || "").toLowerCase();
        const projMatches = (sProj === proj || sProj.includes(proj) || sName.includes(proj));
        const isClothing = (sCat.includes("t-shirt") || sCat.includes("تيشيرت") || sCat.includes("uniform") || sCat.includes("زي") || sName.includes("بلوز") || sName.includes("تيشيرت"));
        return projMatches && isClothing;
      });
      if (match) return match;

      match = stock.find(s => {
        const sProj = getProj(s);
        const sName = (s.name || "").toLowerCase();
        return (sProj === proj || sProj.includes(proj) || sName.includes(proj));
      });
      if (match) return match;

      // STRICT PROTECTION: If this order is for project "نادك", DO NOT match items of another project (like "سدافكو")!
      return null;
    }

    // For general non-project orders (e.g. city general dispatches):
    // Only search items that have NO project assigned
    const availableStock = stock.filter(s => !getProj(s));

    // 1. Match size
    if (sz && sz !== "STANDARD") {
      let match = availableStock.find(s => {
        const sSize = (s.size || "").trim().toUpperCase();
        const sName = (s.name || "").toUpperCase();
        return sSize === sz || sName.includes(sz);
      });
      if (match) return match;

      // Check standard size fallback
      match = availableStock.find(s => {
        const sSize = (s.size || "").trim().toUpperCase();
        return !sSize || sSize === "STANDARD" || sSize === "ALL";
      });
      if (match) return match;

      return null; // Do not cross-steal different specific size
    }

    // 2. Match general clothing/tools
    let match = availableStock.find(s => {
      const sCat = (s.category || "").toLowerCase();
      const sName = (s.name || "").toLowerCase();
      return (sCat.includes("t-shirt") || sCat.includes("تيشيرت") || sCat.includes("tools") || sCat.includes("أدوات") || sName.includes("تيشيرت") || sName.includes("أدوات"));
    });
    if (match) return match;

    return availableStock[0] || null;
  }

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

      // Project (المشروع) - strictly per row, no city-wide leakage
      let rowProj = "";
      if (projectKey && row[projectKey] != null) rowProj = String(row[projectKey]).trim();
      if (!rowProj) rowProj = getRowVal(row, ["المشروع", "اسم المشروع", "مشروع", "Project", "Project Name", "Client", "العميل"]);
      if (rowProj) {
        rowProj = rowProj.replace(/^مشروع\s+/i, "").replace(/^Project\s+/i, "").trim();
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

      // 1. Group by City (Neutral city telemetry)
      if (!countByCity[city]) {
        countByCity[city] = { city: city, totalWorkers: 0, totalQty: 0, sizes: {}, spvs: new Set() };
      }
      countByCity[city].totalWorkers++;
      countByCity[city].totalQty += qty;
      countByCity[city].sizes[size] = (countByCity[city].sizes[size] || 0) + qty;
      if (spv) countByCity[city].spvs.add(spv);

      // 2. Group by Project & City (Smart Separation)
      // Explicit project rows are scoped solely to their project (e.g. نادك).
      // Rows without a project are grouped by city (e.g. مشروع الاحساء, مشروع الدمام).
      const projKey = rowProj ? rowProj : ("city_" + city);
      const displayTitle = rowProj ? ("مشروع " + rowProj) : ("مشروع " + city);
      if (!countByProject[projKey]) {
        countByProject[projKey] = {
          key: projKey,
          projectName: rowProj || "",
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
    const orders = getActiveOrders();
    const existing = orders.map(o => {
      const m = (o.orderNumber || "").match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    });
    const maxNum = existing.length > 0 ? Math.max(...existing) : 1000;
    return "ORD-" + (maxNum + 1);
  }

  // Sizing ordering rank for natural clothing progression
  const SIZE_ORDER_RANK = {
    "STANDARD": 0,
    "موحد": 0,
    "ALL": 0,
    "عام": 0,
    "XXS": 1,
    "XS": 2,
    "S": 3,
    "M": 4,
    "L": 5,
    "XL": 6,
    "2XL": 7,
    "3XL": 8,
    "4XL": 9,
    "5XL": 10,
    "6XL": 11,
    "7XL": 12
  };

  function sortSizesList(sizesArray) {
    return (sizesArray || []).slice().sort((a, b) => {
      const rankA = SIZE_ORDER_RANK[String(a).toUpperCase().trim()] ?? 99;
      const rankB = SIZE_ORDER_RANK[String(b).toUpperCase().trim()] ?? 99;
      if (rankA !== rankB) return rankA - rankB;
      return String(a).localeCompare(String(b));
    });
  }

  let ordersDemandScope = "ACTIVE"; // "ACTIVE" (Pending+Approved), "FILTERED", "ALL"

  function setOrdersDemandScope(newScope) {
    ordersDemandScope = newScope;
    renderOrders();
  }

  function toggleOrdersDemandCollapse() {
    let cur = false;
    try {
      if (typeof localStorage !== "undefined") {
        cur = localStorage.getItem("ostan_orders_demand_collapsed") === "true";
        localStorage.setItem("ostan_orders_demand_collapsed", cur ? "false" : "true");
      }
    } catch (e) {}
    renderOrders();
  }

  function computeOrdersDemand(targetOrders) {
    const stock = (window.state && window.state.stock) ? window.state.stock : [];
    const typeMap = {};
    const grandSizes = {};
    let grandTotalQty = 0;

    targetOrders.forEach(o => {
      if (Array.isArray(o.items) && o.items.length > 0) {
        o.items.forEach(it => {
          const qty = Number(it.quantity) || 0;
          if (qty <= 0) return;

          const rawSize = it.size || "Standard";
          const sz = normalizeSizeName(rawSize);

          let baseName = (it.itemName || "").trim();
          baseName = baseName.replace(/\s*[\(\[](?:مقاس|size)[:\s]*[^)\]]+[\)\]]/gi, "").trim();
          if (!baseName) baseName = "زي موحد / تيشيرت";

          let proj = (it.projectName || o.projectName || "").trim();
          if (!proj && typeof getStockItemProject === "function") {
            proj = getStockItemProject(it) || "";
          }

          const stockItem = it.stockId ? stock.find(s => s.id === it.stockId) : findMatchingStockItem(stock, proj, sz, baseName);
          if (stockItem && stockItem.name) {
            const cleanStockName = stockItem.name.replace(/\s*[\(\[](?:مقاس|size)[:\s]*[^)\]]+[\)\]]/gi, "").trim();
            if (cleanStockName) baseName = cleanStockName;
            if (!proj && stockItem.projectName) proj = stockItem.projectName;
          }

          const groupKey = (baseName + "___" + proj).toLowerCase();
          if (!typeMap[groupKey]) {
            typeMap[groupKey] = {
              baseName: baseName,
              projectName: proj,
              totalQty: 0,
              sizes: {},
              orderNumbers: new Set()
            };
          }

          typeMap[groupKey].totalQty += qty;
          typeMap[groupKey].sizes[sz] = (typeMap[groupKey].sizes[sz] || 0) + qty;
          typeMap[groupKey].orderNumbers.add(o.orderNumber || o.id);

          grandSizes[sz] = (grandSizes[sz] || 0) + qty;
          grandTotalQty += qty;
        });
      } else if (o.countBySize && Object.keys(o.countBySize).length > 0) {
        const proj = (o.projectName || "").trim();
        let baseName = proj ? (`بلوزة / تيشيرت - ${proj}`) : "تيشيرت / زي موحد";
        const groupKey = (baseName + "___" + proj).toLowerCase();

        if (!typeMap[groupKey]) {
          typeMap[groupKey] = {
            baseName: baseName,
            projectName: proj,
            totalQty: 0,
            sizes: {},
            orderNumbers: new Set()
          };
        }

        Object.entries(o.countBySize).forEach(([rawSz, rawQty]) => {
          const qty = Number(rawQty) || 0;
          if (qty <= 0) return;
          const sz = normalizeSizeName(rawSz);

          typeMap[groupKey].totalQty += qty;
          typeMap[groupKey].sizes[sz] = (typeMap[groupKey].sizes[sz] || 0) + qty;
          typeMap[groupKey].orderNumbers.add(o.orderNumber || o.id);

          grandSizes[sz] = (grandSizes[sz] || 0) + qty;
          grandTotalQty += qty;
        });
      }
    });

    return {
      types: Object.values(typeMap),
      grandSizes: grandSizes,
      grandTotalQty: grandTotalQty,
      ordersCount: targetOrders.length
    };
  }

  function copyOrdersDemandSummary() {
    const allOrders = getActiveOrders();
    const activeOrders = allOrders.filter(o => o.status === "PENDING" || o.status === "APPROVED");
    let targetOrders = [];
    if (ordersDemandScope === "ACTIVE") {
      targetOrders = activeOrders;
    } else if (ordersDemandScope === "ALL") {
      targetOrders = allOrders.filter(o => o.status !== "CANCELLED");
    } else {
      targetOrders = allOrders.filter(o => {
        if (currentOrdersFilterStatus !== "ALL" && o.status !== currentOrdersFilterStatus) return false;
        if (currentOrdersSearchQuery) {
          const q = currentOrdersSearchQuery;
          const matchNum = (o.orderNumber || "").toLowerCase().includes(q);
          const matchClient = (o.clientName || "").toLowerCase().includes(q);
          const matchCity = (o.city || "").toLowerCase().includes(q);
          const matchItem = (o.items || []).some(i => (i.itemName || "").toLowerCase().includes(q));
          if (!matchNum && !matchClient && !matchCity && !matchItem) return false;
        }
        return true;
      });
    }

    const demand = computeOrdersDemand(targetOrders);
    const lang = document.documentElement.getAttribute("lang") || "en";

    let text = lang === "ar"
      ? `📊 كشف حصر إجمالي الاحتياج والمقاسات المطلوبة (${demand.ordersCount} طلبات):\n`
      : `📊 Total Required Demand & Sizing Summary (${demand.ordersCount} orders):\n`;

    demand.types.forEach(t => {
      const projStr = t.projectName ? ` [مشروع: ${t.projectName}]` : "";
      text += `\n📦 ${t.baseName}${projStr}\n`;
      text += `   ${lang === 'ar' ? 'إجمالي المطلوب:' : 'Total Required:'} ${t.totalQty} ${lang === 'ar' ? 'قطعة' : 'pcs'}\n`;
      text += `   ${lang === 'ar' ? 'تفصيل المقاسات:' : 'Sizes Breakdown:'}\n`;
      const sorted = sortSizesList(Object.keys(t.sizes));
      sorted.forEach(sz => {
        text += `   • ${sz}: ${t.sizes[sz]} ${lang === 'ar' ? 'قطعة' : 'pcs'}\n`;
      });
    });

    text += `\n========================================\n`;
    text += `${lang === 'ar' ? 'الإجمالي العام لكافة الأصناف:' : 'Grand Total:'} ${demand.grandTotalQty} ${lang === 'ar' ? 'قطعة' : 'pcs'}\n`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (window.OstanStyle) {
          window.OstanStyle.showToast(
            lang === "ar" ? "تم النسخ بنجاح" : "Copied to Clipboard",
            lang === "ar" ? "تم نسخ كشف المقاسات والكميات بنجاح!" : "Demand breakdown copied to clipboard!"
          );
        } else {
          alert(lang === "ar" ? "تم نسخ الكشف بنجاح!" : "Demand summary copied!");
        }
      });
    }
  }

  function renderOrdersDemandSummary(allOrders, filteredOrders) {
    const container = document.getElementById("orders-demand-summary-container");
    if (!container) return;

    if (!allOrders || allOrders.length === 0) {
      container.innerHTML = "";
      return;
    }

    const lang = document.documentElement.getAttribute("lang") || "en";
    const stock = (window.state && window.state.stock) ? window.state.stock : [];

    const activeOrders = allOrders.filter(o => o.status === "PENDING" || o.status === "APPROVED");
    let targetOrders = [];
    if (ordersDemandScope === "ACTIVE") {
      targetOrders = activeOrders;
    } else if (ordersDemandScope === "ALL") {
      targetOrders = allOrders.filter(o => o.status !== "CANCELLED");
    } else {
      // FILTERED
      targetOrders = filteredOrders.filter(o => o.status !== "CANCELLED");
    }

    let isCollapsed = false;
    try {
      if (typeof localStorage !== "undefined") {
        isCollapsed = localStorage.getItem("ostan_orders_demand_collapsed") === "true";
      }
    } catch (e) {}
    const demand = computeOrdersDemand(targetOrders);
    const sortedGrandSizes = sortSizesList(Object.keys(demand.grandSizes));

    const scopeLabelActive = lang === 'ar' ? 'الاحتياج النشط (معلق + معتمد)' : 'Active Demand';
    const scopeLabelFiltered = lang === 'ar' ? 'التصفية الحالية' : 'Current View';
    const scopeLabelAll = lang === 'ar' ? 'كافة الطلبيات' : 'All Orders';

    if (isCollapsed) {
      container.innerHTML = `
        <div class="glass-panel accent-stripe-indigo" style="margin-bottom: 1rem; padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; border: 1px solid rgba(99, 102, 241, 0.25); background: linear-gradient(180deg, rgba(99, 102, 241, 0.03) 0%, var(--bg-surface) 100%);">
          <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <span style="font-size: 1.15rem;">📦</span>
            <span style="font-weight: 800; font-size: 0.92rem; color: var(--text-main);">
              ${lang === 'ar' ? 'حصر إجمالي الاحتياج والمقاسات المطلوبة:' : 'Total Required Materials & Sizing:'}
            </span>
            <span class="badge badge-primary" style="font-size: 0.8rem; font-weight: 800; padding: 0.2rem 0.65rem;">
              ${demand.grandTotalQty} ${lang === 'ar' ? 'قطعة مطلوبة' : 'pcs needed'}
            </span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">
              (${demand.ordersCount} ${lang === 'ar' ? 'طلب' : 'orders'} • ${sortedGrandSizes.length} ${lang === 'ar' ? 'مقاسات' : 'sizes'})
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button onclick="copyOrdersDemandSummary()" class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" title="${lang === 'ar' ? 'نسخ كشف الاحتياج والمقاسات' : 'Copy Demand Report'}">
              📋 ${lang === 'ar' ? 'نسخ الكشف' : 'Copy'}
            </button>
            <button onclick="toggleOrdersDemandCollapse()" class="btn btn-ghost" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; color: #6366f1; font-weight: 700;">
              ${lang === 'ar' ? 'توسيع التفاصيل ▼' : 'Expand Details ▼'}
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Expanded view
    container.innerHTML = `
      <div class="glass-panel accent-stripe-indigo" style="margin-bottom: 1.15rem; padding: 1.15rem 1.4rem; border: 1px solid rgba(99, 102, 241, 0.25); background: linear-gradient(180deg, rgba(99, 102, 241, 0.03) 0%, var(--bg-surface) 100%);">
        
        <!-- Header & Top Controls -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid rgba(99, 102, 241, 0.15); padding-bottom: 0.85rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">📦</span>
              <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin: 0;">
                ${lang === 'ar' ? 'إجمالي الاحتياج والمقاسات المطلوبة لكافة الطلبيات' : 'Total Required Materials & Sizing Breakdown'}
              </h3>
            </div>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin: 3px 0 0 0;">
              ${lang === 'ar' ? 'حصر وتجميع إجمالي الكميات والمقاسات المطلوبة لتجهيز وتوريد الطلبيات مع مقارنة رصيد المستودع.' : 'Aggregated total quantities and sizes needed across orders with live warehouse inventory comparison.'}
            </p>
          </div>

          <!-- Scope and Action Buttons -->
          <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
            <div style="display: inline-flex; background: rgba(0,0,0,0.04); padding: 2px; border-radius: 6px; gap: 2px;">
              <button onclick="setOrdersDemandScope('ACTIVE')" class="btn ${ordersDemandScope === 'ACTIVE' ? 'btn-primary' : 'btn-ghost'}" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; ${ordersDemandScope === 'ACTIVE' ? '' : 'color: var(--text-muted);'}">
                ⚡ ${scopeLabelActive} (${activeOrders.length})
              </button>
              <button onclick="setOrdersDemandScope('FILTERED')" class="btn ${ordersDemandScope === 'FILTERED' ? 'btn-primary' : 'btn-ghost'}" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; ${ordersDemandScope === 'FILTERED' ? '' : 'color: var(--text-muted);'}">
                🔍 ${scopeLabelFiltered} (${filteredOrders.length})
              </button>
              <button onclick="setOrdersDemandScope('ALL')" class="btn ${ordersDemandScope === 'ALL' ? 'btn-primary' : 'btn-ghost'}" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; ${ordersDemandScope === 'ALL' ? '' : 'color: var(--text-muted);'}">
                🌐 ${scopeLabelAll} (${allOrders.length})
              </button>
            </div>

            <button onclick="copyOrdersDemandSummary()" class="btn btn-secondary" style="padding: 0.28rem 0.75rem; font-size: 0.75rem;" title="${lang === 'ar' ? 'نسخ كشف الاحتياج والمقاسات للحافظة' : 'Copy demand report to clipboard'}">
              📋 ${lang === 'ar' ? 'نسخ الكشف' : 'Copy'}
            </button>

            <button onclick="toggleOrdersDemandCollapse()" class="btn btn-ghost" style="padding: 0.28rem 0.55rem; font-size: 0.75rem; color: var(--text-muted);" title="${lang === 'ar' ? 'طي هذه اللوحة' : 'Collapse panel'}">
              ${lang === 'ar' ? 'طي ▲' : 'Collapse ▲'}
            </button>
          </div>
        </div>

        ${demand.types.length === 0 ? `
          <div style="padding: 1.5rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            ${lang === 'ar' ? 'لا توجد طلبيات تتطلب الصرف ضمن النطاق المحدد.' : 'No active orders requiring fulfillment in this selected scope.'}
          </div>
        ` : `
          <!-- KPI Metrics Row -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75rem; margin-top: 1rem;">
            <div style="padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">
                ${lang === 'ar' ? 'إجمالي القطع المطلوبة' : 'Total Units Needed'}
              </div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #4338ca; margin-top: 2px;">
                ${demand.grandTotalQty} <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">${lang === 'ar' ? 'قطعة' : 'pcs'}</span>
              </div>
            </div>

            <div style="padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">
                ${lang === 'ar' ? 'عدد الطلبيات المشمولة' : 'Orders Included'}
              </div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #0284c7; margin-top: 2px;">
                ${demand.ordersCount} <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">${lang === 'ar' ? 'طلب' : 'orders'}</span>
              </div>
            </div>

            <div style="padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">
                ${lang === 'ar' ? 'عدد الأصناف والمشاريع' : 'Distinct Item Types'}
              </div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #d97706; margin-top: 2px;">
                ${demand.types.length} <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">${lang === 'ar' ? 'صنف' : 'types'}</span>
              </div>
            </div>

            <div style="padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">
                ${lang === 'ar' ? 'المقاسات المطلوبة' : 'Sizes in Demand'}
              </div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #059669; margin-top: 2px;">
                ${sortedGrandSizes.length} <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">${lang === 'ar' ? 'مقاسات' : 'sizes'}</span>
              </div>
            </div>
          </div>

          <!-- Combined Grand Sizes Ribbon -->
          <div style="margin-top: 0.85rem; padding: 0.75rem 1rem; background: rgba(99, 102, 241, 0.06); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1rem;">🏷️</span>
              <span style="font-size: 0.82rem; font-weight: 700; color: #4338ca;">
                ${lang === 'ar' ? 'إجمالي المقاسات المجمعة لكافة الطلبيات:' : 'Total Combined Sizing Breakdown:'}
              </span>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${sortedGrandSizes.map(sz => {
                const q = demand.grandSizes[sz];
                return `
                  <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.85rem; background: #ffffff; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <span style="font-size: 0.85rem; font-weight: 800; color: #4f46e5;"><bdi dir="ltr" style="unicode-bidi: isolate;">${sz}</bdi>:</span>
                    <span style="font-size: 1.05rem; font-weight: 900; color: #1e1b4b;">${q}</span>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Types Breakdown Cards (Wider & Larger UI) -->
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1.15rem;">
            ${demand.types.map(t => {
              const sortedTypeSizes = sortSizesList(Object.keys(t.sizes));
              const projBadge = t.projectName ? `
                <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 3px 10px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 6px; font-size: 0.78rem; color: #b45309; font-weight: 700;">
                  🏗️ ${lang === 'ar' ? 'مشروع:' : 'Project:'} ${t.projectName}
                </span>` : '';

              return `
                <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.15rem 1.4rem; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                      <span style="font-weight: 800; font-size: 1.05rem; color: var(--text-main);">
                        👕 ${t.baseName}
                      </span>
                      ${projBadge}
                      <span style="font-size: 0.8rem; color: var(--text-muted);">
                        (${t.orderNumbers.size} ${lang === 'ar' ? 'طلبيات مشمولة' : 'orders included'})
                      </span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                      <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;">
                        ${lang === 'ar' ? 'إجمالي المطلوب لهذا الصنف:' : 'Item Total Demand:'}
                      </span>
                      <span class="badge badge-primary" style="font-size: 0.95rem; font-weight: 900; padding: 0.35rem 0.9rem; border-radius: 8px;">
                        ${t.totalQty} ${lang === 'ar' ? 'قطعة' : 'pcs'}
                      </span>
                    </div>
                  </div>

                  <!-- Sizes Cards Grid for this Item (Wider & Larger Cards) -->
                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 0.75rem;">
                    ${sortedTypeSizes.map(sz => {
                      const reqQty = t.sizes[sz];
                      const matchedStock = findMatchingStockItem(stock, t.projectName, sz, t.baseName);
                      let stockIndicator = "";
                      let progressBar = "";

                      if (matchedStock) {
                        const inStock = Number(matchedStock.quantity) || 0;
                        const diff = inStock - reqQty;
                        const pct = Math.min(100, Math.round((inStock / Math.max(1, reqQty)) * 100));

                        if (diff >= 0) {
                          stockIndicator = `
                            <div style="font-size: 0.74rem; color: #059669; font-weight: 700; margin-top: 5px; display: flex; align-items: center; justify-content: space-between;">
                              <span>${lang === 'ar' ? 'المخزون:' : 'Stock:'} <strong>${inStock}</strong></span>
                              <span style="background: rgba(5, 150, 105, 0.1); padding: 1px 6px; border-radius: 4px;">✓ ${lang === 'ar' ? 'متوفر' : 'OK'}</span>
                            </div>`;
                          progressBar = `
                            <div style="width: 100%; height: 4px; background: rgba(5, 150, 105, 0.15); border-radius: 2px; margin-top: 6px; overflow: hidden;">
                              <div style="width: 100%; height: 100%; background: #059669;"></div>
                            </div>`;
                        } else {
                          stockIndicator = `
                            <div style="font-size: 0.74rem; color: #e11d48; font-weight: 800; margin-top: 5px; background: rgba(225, 29, 72, 0.08); padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; justify-content: space-between;">
                              <span>${lang === 'ar' ? 'المتوفر:' : 'Stock:'} <strong>${inStock}</strong></span>
                              <span>⚠️ -${Math.abs(diff)}</span>
                            </div>`;
                          progressBar = `
                            <div style="width: 100%; height: 4px; background: rgba(225, 29, 72, 0.15); border-radius: 2px; margin-top: 6px; overflow: hidden;">
                              <div style="width: ${pct}%; height: 100%; background: #e11d48;"></div>
                            </div>`;
                        }
                      } else {
                        stockIndicator = `
                          <div style="font-size: 0.72rem; color: var(--text-faint); margin-top: 5px; font-style: italic;">
                            ${lang === 'ar' ? '⚠️ غير مسجل بالمستودع' : '⚠️ No warehouse SKU'}
                          </div>`;
                        progressBar = `
                          <div style="width: 100%; height: 4px; background: rgba(0,0,0,0.06); border-radius: 2px; margin-top: 6px;"></div>`;
                      }

                      return `
                        <div style="background: var(--bg-surface-elevated, #f8fafc); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.7rem 0.85rem; transition: transform 0.15s ease, box-shadow 0.15s ease;">
                          <div style="display: flex; justify-content: space-between; align-items: baseline;">
                            <span style="font-size: 0.92rem; font-weight: 800; color: #4338ca;">
                              <bdi dir="ltr" style="unicode-bidi: isolate;">${sz}</bdi>
                            </span>
                            <span style="font-size: 1.25rem; font-weight: 900; color: var(--text-main);">
                              ${reqQty}
                            </span>
                          </div>
                          ${progressBar}
                          ${stockIndicator}
                        </div>
                      `;
                    }).join("")}
                  </div>

                </div>
              `;
            }).join("")}
          </div>
        `}
      </div>
    `;
  }

  function renderOrders(filterStatus, searchQuery) {
    if (filterStatus) currentOrdersFilterStatus = filterStatus;
    if (typeof searchQuery === "string") currentOrdersSearchQuery = searchQuery.toLowerCase().trim();

    const container = document.getElementById("orders-table-container");
    if (!container) return;

    const lang = document.documentElement.getAttribute("lang") || "en";
    const orders = getActiveOrders();

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

    // Render Total Demand & Sizing Breakdown Matrix
    renderOrdersDemandSummary(orders, filtered);

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
                ? `<span class="badge badge-rose">${lang === 'ar' ? 'عاجل جداً' : 'Urgent'}</span>`
                : o.priority === "HIGH"
                ? `<span class="badge badge-amber">${lang === 'ar' ? 'عالي' : 'High'}</span>`
                : `<span class="badge badge-secondary">${lang === 'ar' ? 'عادي' : 'Normal'}</span>`;

              const statusBadge = o.status === "DONE"
                ? `<span class="badge badge-emerald">${lang === 'ar' ? '✓ تم الصرف والخصم' : '✓ Completed'}</span>`
                : o.status === "APPROVED"
                ? `<span class="badge badge-cyan">${lang === 'ar' ? 'معتمد للتجهيز' : 'Approved'}</span>`
                : o.status === "CANCELLED"
                ? `<span class="badge badge-rose">${lang === 'ar' ? 'ملغي' : 'Cancelled'}</span>`
                : `<span class="badge badge-amber">${lang === 'ar' ? 'قيد المراجعة' : 'Pending'}</span>`;

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
              const cityTag = o.city ? `<span class="badge badge-secondary" style="font-size: 0.72rem;">🏙️ ${o.city}</span>` : '';

              const curUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
              const canApprove = typeof hasUserPermission === "function" ? hasUserPermission("orders", "approve", curUser) : true;
              const canDone = typeof hasUserPermission === "function" ? hasUserPermission("orders", "done", curUser) : true;
              const canCancel = typeof hasUserPermission === "function" ? hasUserPermission("orders", "cancel", curUser) : true;
              const canDelete = typeof hasUserPermission === "function" ? hasUserPermission("orders", "delete", curUser) : true;
              const isSuper = typeof isMasterSuperAdmin === "function" ? isMasterSuperAdmin(curUser) : false;

              return `
                <tr>
                  <td>
                    <strong style="color: var(--primary-500); font-family: monospace; font-size: 0.85rem;">
                      ${o.orderNumber || o.id}
                    </strong>
                    <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
                      ${new Date(o.createdAt || Date.now()).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
                    </div>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                      <strong style="color: var(--text-main); font-size: 0.9rem;">
                        ${(() => {
                          if (o.projectName) {
                            const pName = o.projectName.startsWith("مشروع") ? o.projectName : ((lang === 'ar' ? "مشروع " : "Project ") + o.projectName);
                            const parenIdx = (o.clientName || "").indexOf("(");
                            const spvsPart = parenIdx !== -1 ? (" " + o.clientName.substring(parenIdx)) : "";
                            return pName + spvsPart;
                          }
                          return o.clientName || (lang === 'ar' ? "طلب كادر الميدان" : "Field Staff Request");
                        })()}
                      </strong>
                      ${cityTag}
                    </div>
                    ${o.roster && o.roster.length > 0 ? `
                      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                        👥 ${lang === 'ar' ? `يشمل ${o.roster.length} موظف ميداني مسجل` : `Includes ${o.roster.length} field staff`}
                      </div>
                    ` : ''}
                  </td>
                  <td>
                    <div style="display: flex; gap: 0.3rem; flex-wrap: wrap; max-width: 320px;">
                      ${sizePills}
                    </div>
                  </td>
                  <td>
                    <strong style="font-size: 0.95rem; color: #10b981;">${totalQty}</strong> <span style="font-size: 0.72rem; color: var(--text-muted);">${lang === 'ar' ? 'قطعة' : 'pcs'}</span>
                  </td>
                  <td>${priorityBadge}</td>
                  <td>
                    ${statusBadge}
                    ${o.stockDeducted ? `<div style="font-size: 0.65rem; color: #10b981; margin-top: 2px;">${lang === 'ar' ? '✓ تم خصم المخزون' : '✓ Stock Deducted'}</div>` : ''}
                  </td>
                  <td style="text-align: end;">
                    <div style="display: inline-flex; align-items: center; gap: 0.35rem;">
                      ${(o.status === "PENDING" && canApprove) ? `
                        <button onclick="setOrderStatus('${o.id}', 'APPROVED')" class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.72rem; color: #0284c7;" title="${lang === 'ar' ? 'اعتماد الطلب' : 'Approve Order'}">
                          ✓ ${lang === 'ar' ? 'اعتماد' : 'Approve'}
                        </button>
                      ` : ''}
                      ${(o.status === "PENDING" && canCancel) ? `
                        <button onclick="setOrderStatus('${o.id}', 'CANCELLED')" class="btn btn-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; color: #ef4444;" title="${lang === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}">
                          ✕ ${lang === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                      ` : ''}

                      ${(o.status === "APPROVED" && canDone) ? `
                        <button onclick="setOrderStatus('${o.id}', 'DONE')" class="btn btn-primary" style="padding: 0.25rem 0.65rem; font-size: 0.72rem; background: #059669;" title="${lang === 'ar' ? 'صرف واكتمال وخصم المستودع' : 'Fulfill order and deduct stock'}">
                          📦 ${lang === 'ar' ? 'صرف واكتمال' : 'Fulfill'}
                        </button>
                      ` : ''}
                      ${(o.status === "APPROVED" && canCancel) ? `
                        <button onclick="setOrderStatus('${o.id}', 'CANCELLED')" class="btn btn-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; color: #ef4444;" title="${lang === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}">
                          ✕ ${lang === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                      ` : ''}

                      ${(o.status === "CANCELLED" && canDelete) ? `
                        <button onclick="deleteOrder('${o.id}')" class="btn btn-ghost" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25); background: rgba(239, 68, 68, 0.06); font-weight: 700;" title="${lang === 'ar' ? 'حذف الطلب الملغي نهائياً' : 'Delete Cancelled Order'}">
                          🗑️ ${lang === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      ` : ''}

                      ${(o.status === "DONE" && canDelete && isSuper) ? `
                        <button onclick="deleteOrder('${o.id}')" class="btn btn-ghost" style="padding: 0.25rem 0.55rem; font-size: 0.72rem; color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25); background: rgba(239, 68, 68, 0.06); font-weight: 700;" title="${lang === 'ar' ? 'حذف الطلب المكتمل واسترجاع المخزون (صلاحية المدير العام)' : 'Delete Completed Order & Restore Stock (Super Admin)'}">
                          🗑️ ${lang === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      ` : ''}

                      <button onclick="openOrderDetails('${o.id}')" class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;" title="${lang === 'ar' ? 'عرض السند والتفاصيل' : 'View Slip & Details'}">
                        👁️ ${lang === 'ar' ? 'سند' : 'Slip'}
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
    const curUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    const lang = document.documentElement.getAttribute("lang") || "en";
    if (typeof hasUserPermission === "function" && !hasUserPermission("orders", "create", curUser)) {
      const msg = lang === "ar" ? "عذراً، ليس لديك صلاحية لإنشاء طلبات صرف جديدة." : "Permission denied: You do not have permission to create orders.";
      if (window.OstanStyle) window.OstanStyle.showToast("صلاحية محظورة", msg, "warning");
      else alert(msg);
      return;
    }

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
    const lang = document.documentElement.getAttribute("lang") || "en";

    container.innerHTML = manualOrderLineItems.map((item, idx) => `
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <select class="input-field" style="flex: 2; font-size: 0.82rem;" onchange="window.manualOrderLineItems[${idx}].stockId = this.value; window.validateOrderStockLimit(${idx}, this.value)">
          <option value="">${lang === 'ar' ? '-- اختر مادة من المخزون --' : '-- Select warehouse item --'}</option>
          ${stock.map(s => {
            const sizeBadge = (s.size && s.size !== 'All') ? ` [${lang === 'ar' ? 'مقاس: ' : 'Size: '}${s.size}]` : '';
            const projName = s.projectName || (typeof getStockItemProject === 'function' ? getStockItemProject(s) : '');
            const projBadge = projName ? ` [${lang === 'ar' ? 'مشروع: ' : 'Project: '}${projName}]` : '';
            return `
              <option value="${s.id}" ${item.stockId === s.id ? 'selected' : ''}>
                ${s.name}${sizeBadge}${projBadge} (${lang === 'ar' ? 'المتوفر بالمستودع:' : 'In Stock:'} ${s.quantity})
              </option>
            `;
          }).join("")}
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
          size: s ? s.size : undefined,
          projectName: s ? (s.projectName || (typeof getStockItemProject === "function" ? getStockItemProject(s) : undefined)) : undefined,
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
      projectName: client,
      requester: requester,
      priority: priority,
      notes: notes,
      items: validItems,
      status: "PENDING",
      stockDeducted: false,
      createdAt: new Date().toISOString()
    };

    const orders = getActiveOrders();
    orders.unshift(newOrder);
    persistOrders();

    closeCreateOrderModal();
    renderOrders();

    if (window.OstanStyle) {
      window.OstanStyle.showToast("تم إنشاء الطلب بنجاح", `تم تسجيل أمر الصرف ${num} بنجاح وحفظه في النظام.`);
    }
  }

  // Helper for safe HTML insertion
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =========================================================================
  // MODAL: ORDER FULFILLMENT & DEDUCTION CONFIRMATION (PROFESSIONAL UI)
  // =========================================================================
  let pendingFulfillAction = null;

  function closeOrderFulfillConfirmModal() {
    const modal = document.getElementById("modal-order-fulfill-confirm");
    if (modal) modal.style.display = "none";
    pendingFulfillAction = null;
  }

  function openOrderFulfillConfirmModal({ order, deductionsPlan, onConfirm }) {
    pendingFulfillAction = onConfirm;
    const modal = (typeof document !== "undefined" && document.getElementById) ? document.getElementById("modal-order-fulfill-confirm") : null;
    if (!modal || modal.nodeType !== 1) {
      // Fallback if modal DOM element is not present (e.g. headless unit testing)
      if (typeof onConfirm === "function") onConfirm();
      return;
    }

    const lang = document.documentElement.getAttribute("lang") || "en";
    const isAr = lang === "ar";

    // Detect inventory shortages or unlinked stock items
    const shortages = deductionsPlan.filter(d => !d.stockItem || d.stockItem.quantity < d.qty);
    const hasShortage = shortages.length > 0;

    // Elements
    const iconBox = document.getElementById("fulfill-confirm-icon-box");
    const titleEl = document.getElementById("fulfill-confirm-title");
    const subTitleEl = document.getElementById("fulfill-confirm-subtitle");
    const warningBanner = document.getElementById("fulfill-confirm-warning-banner");
    const orderMeta = document.getElementById("fulfill-confirm-order-meta");
    const itemsList = document.getElementById("fulfill-confirm-items-list");
    const btnCancel = document.getElementById("btn-fulfill-confirm-cancel");
    const btnExecute = document.getElementById("btn-fulfill-confirm-execute");
    const box = document.getElementById("fulfill-confirm-box");

    // Styling based on shortages
    if (hasShortage) {
      if (box) box.style.borderColor = "rgba(245, 158, 11, 0.4)";
      if (iconBox) {
        iconBox.innerHTML = "⚠️";
        iconBox.style.background = "rgba(245, 158, 11, 0.15)";
        iconBox.style.borderColor = "rgba(245, 158, 11, 0.4)";
      }
      if (titleEl) {
        titleEl.textContent = isAr 
          ? `تأكيد صرف الطلب (${order.orderNumber || order.id}) مع وجود نقص بالمخزون`
          : `Confirm Order Fulfillment (${order.orderNumber || order.id}) - Stock Shortage Detected`;
      }
      if (subTitleEl) {
        subTitleEl.textContent = isAr
          ? "تنبيه: بعض الأصناف المطلوبة غير متوفرة بالكامل أو غير مسجلة في مستودع هذا المشروع."
          : "Notice: Some requested items are not fully available or not linked to this project's warehouse.";
      }
      if (warningBanner) {
        warningBanner.style.display = "block";
        warningBanner.innerHTML = isAr
          ? `<strong>⚠️ تحذير عجز المخزون:</strong> يوجد عدد <strong>(${shortages.length})</strong> صنف غير متوفر بالكمية المطلوبة في المستودع لهذا المقاس/المشروع. في حال المتابعة، سيتم خصم الكميات المتوفرة فقط وتحديد الطلب كمكتمل.`
          : `<strong>⚠️ Inventory Shortage Warning:</strong> There are <strong>(${shortages.length})</strong> items with insufficient warehouse stock for this size/project. If you proceed, only available stock will be deducted and the order marked as completed.`;
      }
      if (btnExecute) {
        btnExecute.style.background = "#d97706";
        btnExecute.style.borderColor = "#d97706";
        btnExecute.innerHTML = isAr ? "⚠️ تأكيد الصرف والمتابعة" : "⚠️ Confirm & Proceed Anyway";
      }
    } else {
      if (box) box.style.borderColor = "rgba(16, 185, 129, 0.35)";
      if (iconBox) {
        iconBox.innerHTML = "📦";
        iconBox.style.background = "rgba(16, 185, 129, 0.12)";
        iconBox.style.borderColor = "rgba(16, 185, 129, 0.3)";
      }
      if (titleEl) {
        titleEl.textContent = isAr
          ? `تأكيد تسليم وصرف أمر الطلب (${order.orderNumber || order.id})`
          : `Confirm Order Fulfillment (${order.orderNumber || order.id})`;
      }
      if (subTitleEl) {
        subTitleEl.textContent = isAr
          ? "كافة المواد متوفرة في المستودع وجاهزة للخصم الفوري من الرصيد."
          : "All items are in stock and ready to be deducted from live inventory.";
      }
      if (warningBanner) {
        warningBanner.style.display = "none";
      }
      if (btnExecute) {
        btnExecute.style.background = "#059669";
        btnExecute.style.borderColor = "#059669";
        btnExecute.innerHTML = isAr ? "📦 تأكيد واكتمال الصرف" : "📦 Confirm & Deduct Stock";
      }
    }

    if (btnCancel) {
      btnCancel.textContent = isAr ? "إلغاء" : "Cancel";
    }

    // Render Order Metadata Bar
    if (orderMeta) {
      orderMeta.innerHTML = `
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="color:var(--text-muted); font-weight:600;">${isAr ? "العميل / المشروع:" : "Client / Project:"}</span>
          <strong>${escapeHtml(order.clientName || "-")} ${order.projectName ? `<span class="badge badge-subtle" style="font-size:0.75rem;">${escapeHtml(order.projectName)}</span>` : ""}</strong>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="color:var(--text-muted); font-weight:600;">${isAr ? "إجمالي المواد:" : "Total Items:"}</span>
          <span class="badge badge-primary" style="font-weight:700;">${order.items ? order.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0) : 0} ${isAr ? "قطعة" : "pcs"}</span>
        </div>
      `;
    }

    // Render Items Breakdown List
    if (itemsList) {
      itemsList.innerHTML = deductionsPlan.map(d => {
        const isMissing = !d.stockItem;
        const isShortage = isMissing || d.stockItem.quantity < d.qty;
        const availableQty = d.stockItem ? d.stockItem.quantity : 0;
        const bg = isShortage ? "rgba(244, 63, 94, 0.06)" : "var(--bg-surface-elevated, #f8fafc)";
        const border = isShortage ? "rgba(244, 63, 94, 0.3)" : "var(--border-subtle)";

        let statusBadge = "";
        if (isMissing) {
          statusBadge = `<span class="badge" style="background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; font-size:0.72rem; font-weight:700;">
            ⚠️ ${isAr ? "غير متوفر بالمستودع لهذا المقاس/المشروع" : "Not available in warehouse for this size/project"}
          </span>`;
        } else if (d.stockItem.quantity < d.qty) {
          statusBadge = `<span class="badge" style="background:#fffbeb; color:#b45309; border:1px solid #fde68a; font-size:0.72rem; font-weight:700;">
            ⚠️ ${isAr ? `المتوفر بالمستودع: ${availableQty} (عجز: ${d.qty - availableQty})` : `Available: ${availableQty} (Shortage: ${d.qty - availableQty})`}
          </span>`;
        } else {
          statusBadge = `<span class="badge" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-size:0.72rem; font-weight:700;">
            ✓ ${isAr ? `متوفر بالمستودع (${availableQty})` : `In Stock (${availableQty})`}
          </span>`;
        }

        return `
          <div style="background:${bg}; border:1px solid ${border}; border-radius:var(--radius-md); padding:0.65rem 0.85rem; display:flex; justify-content:space-between; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            <div style="display:flex; flex-direction:column; gap:2px; min-width:180px; flex:1;">
              <div style="font-weight:700; font-size:0.85rem; color:var(--text-main);">
                ${escapeHtml(d.displayName)}
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted);">
                ${d.item && d.item.size && d.item.size !== 'Standard' ? `<span style="display:inline-block; margin-right:4px; font-weight:600; color:var(--primary);">${isAr ? 'المقاس:' : 'Size:'} ${escapeHtml(d.item.size)}</span> • ` : ''}
                ${isAr ? 'الكمية المطلوبة للصرف:' : 'Requested Qty:'} <strong>${d.qty}</strong> ${isAr ? 'قطعة' : 'pcs'}
              </div>
            </div>
            <div>
              ${statusBadge}
            </div>
          </div>
        `;
      }).join("");
    }

    // Bind execute button click
    if (btnExecute) {
      btnExecute.onclick = () => {
        const action = pendingFulfillAction;
        closeOrderFulfillConfirmModal();
        if (typeof action === "function") action();
      };
    }

    modal.style.display = "flex";
  }

  // LIVE STOCK DEDUCTION WORKFLOW
  function setOrderStatus(orderId, newStatus) {
    const orders = getActiveOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const lang = document.documentElement.getAttribute("lang") || "en";
    const curUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;

    if (newStatus === "APPROVED" && typeof hasUserPermission === "function" && !hasUserPermission("orders", "approve", curUser)) {
      const msg = lang === "ar" ? "عذراً، ليس لديك صلاحية لاعتماد الطلبيات." : "Permission denied: You do not have permission to approve orders.";
      if (window.OstanStyle) window.OstanStyle.showToast("صلاحية محظورة", msg, "warning");
      else alert(msg);
      return;
    }
    if (newStatus === "DONE" && typeof hasUserPermission === "function" && !hasUserPermission("orders", "done", curUser)) {
      const msg = lang === "ar" ? "عذراً، ليس لديك صلاحية لتسليم وصرف الطلبيات من المخزون." : "Permission denied: You do not have permission to complete orders.";
      if (window.OstanStyle) window.OstanStyle.showToast("صلاحية محظورة", msg, "warning");
      else alert(msg);
      return;
    }
    if (newStatus === "CANCELLED" && typeof hasUserPermission === "function" && !hasUserPermission("orders", "cancel", curUser)) {
      const msg = lang === "ar" ? "عذراً، ليس لديك صلاحية لإلغاء الطلبيات." : "Permission denied: You do not have permission to cancel orders.";
      if (window.OstanStyle) window.OstanStyle.showToast("صلاحية محظورة", msg, "warning");
      else alert(msg);
      return;
    }

    if (newStatus === "DONE") {
      const stock = (window.state && window.state.stock) ? window.state.stock : [];
      const deductionsPlan = [];

      (order.items || []).forEach(it => {
        let stockItem = null;
        if (it.stockId) {
          stockItem = stock.find(s => s.id === it.stockId);
        }

        // Project Mismatch Guard: If stockItem belongs to a DIFFERENT project than this order, discard it!
        if (stockItem && order.projectName) {
          const sProj = (stockItem.projectName || (typeof getStockItemProject === "function" ? getStockItemProject(stockItem) : "") || "").trim().toLowerCase();
          const oProj = order.projectName.trim().toLowerCase();
          if (sProj && oProj && sProj !== oProj && !sProj.includes(oProj) && !oProj.includes(sProj)) {
            stockItem = null;
          }
        }

        // Size Mismatch Guard: If it.size is specified, stockItem MUST match that size or be Standard!
        if (stockItem && it.size && it.size !== "Standard" && it.size !== "All") {
          const sSize = (stockItem.size || "").trim().toUpperCase();
          const reqSize = it.size.trim().toUpperCase();
          if (sSize && sSize !== "STANDARD" && sSize !== "ALL" && sSize !== reqSize) {
            stockItem = null; // Discard! Must not take from 2XL if order requested L!
          }
        }

        // If not found or had a mismatch, match cleanly using findMatchingStockItem
        if (!stockItem) {
          stockItem = findMatchingStockItem(stock, order.projectName, it.size, it.itemName);
        }

        if (stockItem) {
          it.stockId = stockItem.id;
          it.itemName = (stockItem.size && stockItem.size === it.size) ? stockItem.name : `${stockItem.name}${it.size && it.size !== 'Standard' ? ' (مقاس ' + it.size + ')' : ''}`;
        }

        deductionsPlan.push({
          item: it,
          stockItem: stockItem,
          displayName: stockItem ? `${stockItem.name}${it.size && it.size !== 'Standard' ? ' (مقاس ' + it.size + ')' : ''}` : (it.itemName || it.name),
          qty: Number(it.quantity) || 1
        });
      });

      const executeFulfillment = () => {
        // Apply deductions only to confirmed matching stock items
        deductionsPlan.forEach(d => {
          if (d.stockItem) {
            d.stockItem.quantity = Math.max(0, d.stockItem.quantity - d.qty);
            if (typeof syncStockItemToFirestore === "function") {
              syncStockItemToFirestore(d.stockItem);
            }

            if (d.stockItem.quantity <= (d.stockItem.threshold || 5)) {
              if (window.OstanStyle) {
                window.OstanStyle.showToast("⚠️ تنبيه نقص المخزون", `الصنف ${d.stockItem.name} وصل للحد الأدنى (${d.stockItem.quantity} متبقي)!`, "warning");
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

        persistOrders();

        if (window.OstanStyle) {
          window.OstanStyle.showToast(lang === 'ar' ? "تم الصرف وخصم المخزون" : "Fulfillment Complete", `تم اكتمال الطلب ${order.orderNumber} وخصم الكميات من المستودع بنجاح!`);
        }
      };

      const modalEl = typeof document !== "undefined" ? document.getElementById("modal-order-fulfill-confirm") : null;
      if (modalEl && modalEl.nodeType === 1) {
        openOrderFulfillConfirmModal({ order, deductionsPlan, onConfirm: executeFulfillment });
      } else if (typeof confirm === "function") {
        // Fallback for headless environments without DOM modal
        const itemSummary = deductionsPlan.map(d => {
          if (d.stockItem) {
            return `• ${d.displayName}: ${d.qty} ${lang === 'ar' ? 'قطعة (المتوفر بالمستودع:' : 'pcs (In stock:'} ${d.stockItem.quantity})`;
          } else {
            return `• ${d.displayName}: ${d.qty} ${lang === 'ar' ? 'قطعة [⚠️ تنبيه: غير متوفر بالمستودع لهذا المقاس/المشروع!]' : 'pcs [⚠️ Warning: Not available in warehouse for this size/project!]'}`;
          }
        }).join("\n");
        const confirmMsg = lang === "ar"
          ? `هل أنت متأكد من تسليم أمر الصرف (${order.orderNumber}) وخصم المواد التالية من المخزون؟\n\n${itemSummary}`
          : `Confirm completion of order ${order.orderNumber} and deduct items from warehouse inventory?\n\n${itemSummary}`;
        if (confirm(confirmMsg)) {
          executeFulfillment();
        }
      } else {
        executeFulfillment();
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
    persistOrders();

    renderOrders();
    if (window.OstanStyle) {
      window.OstanStyle.showToast("تحديث حالة الطلب", `تم تغيير حالة الطلب ${order.orderNumber} إلى ${newStatus}`);
    }
  }

  // Delete Cancelled or Completed Order (Completed restricted strictly to Super Admin)
  function deleteOrder(orderId) {
    const orders = getActiveOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const lang = document.documentElement.getAttribute("lang") || "en";
    const curUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    const isSuper = typeof isMasterSuperAdmin === "function" ? isMasterSuperAdmin(curUser) : (curUser && (curUser.role === "SUPER_ADMIN" || curUser.role === "superadmin"));

    if (typeof hasUserPermission === "function" && !hasUserPermission("orders", "delete", curUser)) {
      const msg = lang === "ar" ? "عذراً، ليس لديك صلاحية لحذف الطلبيات." : "Permission denied: You do not have permission to delete orders.";
      if (window.OstanStyle) window.OstanStyle.showToast("صلاحية محظورة", msg, "warning");
      else alert(msg);
      return;
    }

    // Business Rule: Completed orders (DONE) can ONLY be deleted by Super Admin!
    if (order.status === "DONE" && !isSuper) {
      const msg = lang === "ar"
        ? "عذراً، صلاحية حذف الطلبات المكتملة والمصروفة محصورة فقط بالمدير العام (Super Admin) لضمان سلامة المخزون والتدقيق المالي."
        : "Permission denied: Only Super Admin can delete completed orders.";
      if (window.OstanStyle) window.OstanStyle.showToast("صلاحية محظورة", msg, "warning");
      else alert(msg);
      return;
    }

    if (order.status !== "DONE" && order.status !== "CANCELLED") {
      const msg = lang === "ar"
        ? "لا يمكن حذف الطلب وهو نشط! يرجى إلغاء الطلب أولاً قبل حذفه."
        : "Cannot delete an active order! Please cancel the order before deleting it.";
      if (window.OstanStyle) window.OstanStyle.showToast("تنبيه", msg, "warning");
      else alert(msg);
      return;
    }

    const performDelete = () => {
      // Automatic Stock Rollback: If order had items deducted (DONE or CANCELLED), restore them to available warehouse stock!
      if (order.stockDeducted) {
        const stock = window.state.stock || [];
        (order.items || []).forEach(it => {
          let stockItem = it.stockId ? stock.find(s => s.id === it.stockId) : null;
          if (!stockItem && it.itemName) {
            stockItem = stock.find(s => s.name.trim().toLowerCase() === it.itemName.trim().toLowerCase());
          }
          if (stockItem) {
            stockItem.quantity += Number(it.quantity) || 0;
            if (typeof syncStockItemToFirestore === "function") {
              syncStockItemToFirestore(stockItem);
            }
          }
        });
        order.stockDeducted = false;
        if (typeof saveState === "function") saveState();
        if (typeof renderWarehouse === "function") renderWarehouse();
        if (typeof renderDashboard === "function") renderDashboard();
      }

      window.state.orders = orders.filter(o => o.id !== orderId);
      persistOrders();

      closeOrderDetailsModal();
      renderOrders();
      if (typeof updateCounts === "function") updateCounts();

      const successMsg = lang === "ar"
        ? `تم حذف الطلب (${order.orderNumber || order.id}) بنجاح وإعادة رصيد المواد إلى المستودع.`
        : `Order (${order.orderNumber || order.id}) has been deleted successfully and items returned to stock.`;

      if (window.OstanStyle) {
        window.OstanStyle.showToast(lang === "ar" ? "تم الحذف واسترجاع المخزون" : "Deleted & Stock Restored", successMsg);
      }
    };

    let title = "";
    let desc = "";
    let targetName = `${order.orderNumber || order.id} (${order.clientName || ""})`;

    if (order.status === "DONE") {
      title = lang === "ar" ? "⚠️ تأكيد حذف أمر صرف مكتمل (صلاحية المدير العام)" : "⚠️ Confirm Deletion of Completed Order (Super Admin)";
      desc = lang === "ar"
        ? `طلب الصرف رقم (${order.orderNumber || order.id}) مكتمل وتم صرف كمياته من المخزون مسبقاً.\n\nسيتم حذف هذا السجل نهائياً وإعادة كافة الكميات المصروفة تلقائياً إلى رصيد المستودع المتوفر.`
        : `Order (${order.orderNumber || order.id}) is COMPLETED and items were already deducted from inventory.\n\nAre you sure you want to permanently delete this order record?\nAll deducted item quantities will be automatically restored back to available warehouse stock.`;
    } else {
      title = lang === "ar" ? "تأكيد حذف الطلب الملغي" : "Confirm Deletion of Cancelled Order";
      desc = lang === "ar"
        ? `هل أنت متأكد من حذف الطلب الملغي (${order.orderNumber || order.id}) نهائياً من النظام؟ هذا الإجراء لا يمكن التراجع عنه.`
        : `Are you sure you want to permanently delete cancelled order (${order.orderNumber || order.id})? This action cannot be undone.`;
    }

    if (typeof window !== "undefined" && typeof window.openConfirmDeleteModal === "function") {
      window.openConfirmDeleteModal({
        title,
        targetName,
        desc,
        isPermanent: true,
        onConfirm: performDelete
      });
    } else if (typeof confirm === "function") {
      if (confirm(`${title}\n\n${targetName}\n\n${desc}`)) {
        performDelete();
      }
    } else {
      performDelete();
    }
  }

  // Delete All Cancelled Orders
  function deleteAllCancelledOrders() {
    const orders = getActiveOrders();
    const cancelledOrders = orders.filter(o => o.status === "CANCELLED");
    if (cancelledOrders.length === 0) return;

    const lang = document.documentElement.getAttribute("lang") || "en";
    const curUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;

    if (typeof hasUserPermission === "function" && !hasUserPermission("orders", "delete", curUser)) {
      const msg = lang === "ar" ? "عذراً، ليس لديك صلاحية لحذف الطلبيات." : "Permission denied: You do not have permission to delete orders.";
      if (window.OstanStyle) window.OstanStyle.showToast("صلاحية محظورة", msg, "warning");
      else alert(msg);
      return;
    }

    const performBulkDelete = () => {
      // Rollback any stock on cancelled orders
      cancelledOrders.forEach(o => {
        if (o.stockDeducted) {
          const stock = window.state.stock || [];
          (o.items || []).forEach(it => {
            let stockItem = it.stockId ? stock.find(s => s.id === it.stockId) : null;
            if (!stockItem && it.itemName) {
              stockItem = stock.find(s => s.name.trim().toLowerCase() === it.itemName.trim().toLowerCase());
            }
            if (stockItem) {
              stockItem.quantity += Number(it.quantity) || 0;
              if (typeof syncStockItemToFirestore === "function") {
                syncStockItemToFirestore(stockItem);
              }
            }
          });
          o.stockDeducted = false;
        }
      });

      window.state.orders = orders.filter(o => o.status !== "CANCELLED");
      persistOrders();

      if (typeof saveState === "function") saveState();
      if (typeof renderWarehouse === "function") renderWarehouse();
      renderOrders();
      if (typeof updateCounts === "function") updateCounts();

      if (window.OstanStyle) {
        window.OstanStyle.showToast(
          lang === "ar" ? "تم الحذف" : "Deleted",
          lang === "ar" ? `تم حذف ${cancelledOrders.length} طلب ملغي بنجاح.` : `Deleted ${cancelledOrders.length} cancelled orders successfully.`
        );
      }
    };

    const title = lang === "ar" ? "حذف كافة الطلبيات الملغية" : "Delete All Cancelled Orders";
    const targetName = lang === "ar" ? `${cancelledOrders.length} طلبية ملغية` : `${cancelledOrders.length} cancelled orders`;
    const desc = lang === "ar"
      ? `هل أنت متأكد من حذف كافة الطلبيات الملغية (${cancelledOrders.length} طلب) نهائياً من النظام؟ لا يمكن التراجع عن هذه الخطوة.`
      : `Are you sure you want to permanently delete all ${cancelledOrders.length} cancelled orders? This action cannot be undone.`;

    if (typeof window !== "undefined" && typeof window.openConfirmDeleteModal === "function") {
      window.openConfirmDeleteModal({
        title,
        targetName,
        desc,
        isPermanent: true,
        onConfirm: performBulkDelete
      });
    } else if (typeof confirm === "function") {
      if (confirm(`${title}\n\n${targetName}\n\n${desc}`)) {
        performBulkDelete();
      }
    } else {
      performBulkDelete();
    }
  }

  // View Order Details Modal (with City Breakdown, Sizing Breakdown & Merchandiser Roster)
  function openOrderDetails(orderId) {
    const orders = getActiveOrders();
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
    const curUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    const lang = document.documentElement.getAttribute("lang") || "en";
    if (typeof hasUserPermission === "function" && !hasUserPermission("orders", "excel", curUser)) {
      const msg = lang === "ar" ? "عذراً، ليس لديك صلاحية لاستيراد الطلبيات عبر إكسل." : "Permission denied: You do not have permission to import orders via Excel.";
      if (window.OstanStyle) window.OstanStyle.showToast("صلاحية محظورة", msg, "warning");
      else alert(msg);
      return;
    }

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
                    <input type="radio" name="orders_import_mode" value="PER_PROJECT" checked>
                    <strong>فصل أوامر الصرف حسب المشاريع والمدن (تلقائي ذكي)</strong>
                    <span style="color: #2563eb; font-weight: 800;">(موصى به - ينشئ أمراً مستقلاً لكل مشروع ولكل مدينة)</span>
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
    let mode = modeEl ? modeEl.value : "PER_PROJECT";
    const stock = (window.state && window.state.stock) ? window.state.stock : [];

    function buildItemsFromSizes(sizesMap, projName) {
      return Object.entries(sizesMap).map(([sz, qty]) => {
        const matchedStock = findMatchingStockItem(stock, projName, sz, "تيشيرت");
        let displayName = "";
        if (matchedStock) {
          displayName = (matchedStock.size && matchedStock.size === sz) ? matchedStock.name : `${matchedStock.name} (مقاس ${sz})`;
        } else if (projName) {
          displayName = `بلوزة / تيشيرت ${projName} (مقاس ${sz})`;
        } else {
          displayName = `زي موحد / تيشيرت (مقاس ${sz})`;
        }
        return {
          stockId: matchedStock ? matchedStock.id : "",
          itemName: displayName,
          size: sz,
          quantity: qty
        };
      });
    }

    const currentOrders = getActiveOrders();

    const existingNums = currentOrders.map(o => {
      const m = (o.orderNumber || "").match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    });
    let curMaxNum = existingNums.length > 0 ? Math.max(...existingNums) : 1000;

    if (mode === "MASTER") {
      curMaxNum++;
      const singleProj = (p.distinctProjectNames && p.distinctProjectNames.length === 1) ? p.distinctProjectNames[0] : "";
      const masterItems = buildItemsFromSizes(p.countBySize, singleProj);
      const clientNameStr = singleProj
        ? `مشروع ${singleProj} (${p.citiesList.slice(0, 3).join('، ')})`
        : `توريد كادر الميدان (${p.citiesList.slice(0, 3).join('، ')}${p.citiesList.length > 3 ? '...' : ''})`;

      const newOrder = {
        id: "ord-" + Date.now(),
        orderNumber: "ORD-" + curMaxNum,
        projectName: singleProj,
        clientName: clientNameStr,
        city: p.citiesList.join("، "),
        requester: "Excel Batch Import",
        priority: "HIGH",
        notes: `ملف: ${p.fileName || 'Excel'} | إجمالي ${p.netTotalQty} قطعة عبر ${p.citiesList.length} مدن (${p.totalRecords} كادر مسجل)`,
        items: masterItems,
        roster: p.roster.filter(r => r.quantity > 0),
        countByCity: p.countByCity,
        countBySize: p.countBySize,
        netTotalQty: p.netTotalQty,
        status: "PENDING",
        stockDeducted: false,
        createdAt: new Date().toISOString()
      };
      currentOrders.unshift(newOrder);
    } else {
      // Default: Separate each distinct project and each city roster
      Object.values(p.countByProject).forEach((projData, pIdx) => {
        curMaxNum++;
        const projItems = buildItemsFromSizes(projData.sizes, projData.projectName);
        const cityList = Array.isArray(projData.cities) ? projData.cities : Array.from(projData.cities || []);
        const cityNames = cityList.join("، ");
        const spvList = Array.isArray(projData.spvs) ? projData.spvs : Array.from(projData.spvs || []);
        const spvsNames = spvList.join(" / ") || "إشراف ميداني";

        // Display title: e.g. "مشروع نادك (بلال محمد)" or "مشروع الاحساء (بلال محمد / طلال طلعت)"
        const clientNameStr = `${projData.displayProjectName} (${spvsNames})`;

        const newOrder = {
          id: "ord-" + Date.now() + "-" + pIdx,
          orderNumber: "ORD-" + curMaxNum,
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
        currentOrders.unshift(newOrder);
      });
    }

    persistOrders();

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
  window.renderOrdersDemandSummary = renderOrdersDemandSummary;
  window.setOrdersDemandScope = setOrdersDemandScope;
  window.toggleOrdersDemandCollapse = toggleOrdersDemandCollapse;
  window.copyOrdersDemandSummary = copyOrdersDemandSummary;
  window.openOrderFulfillConfirmModal = openOrderFulfillConfirmModal;
  window.closeOrderFulfillConfirmModal = closeOrderFulfillConfirmModal;

  // Populate window.state.orders immediately from persistent storage
  try {
    getActiveOrders();
  } catch (e) {}

  // Initial render when orders view is accessed
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      getActiveOrders();
      if (window.state && window.state.activeModule === "orders") {
        renderOrders();
      }
    }, 400);
  });
})();
