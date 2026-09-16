const fs = require('fs');
const path = require('path');

const enginePath = path.join(__dirname, '..', 'orders-engine.js');
let engineCode = fs.readFileSync(enginePath, 'utf8');

console.log('--- 1. Updating parseDualFormatExcel in orders-engine.js ---');

// Replace parseDualFormatExcel function
const oldParseFnRegex = /function parseDualFormatExcel\(jsonRows\) \{[\s\S]*?return \{\s*roster: roster,\s*countByCity: countByCity,\s*countBySize: countBySize,\s*netTotalQty: netTotalQty,\s*totalRecords: roster\.length,\s*zeroQtyCount: zeroQtyCount,\s*citiesList: Object\.keys\(countByCity\),\s*sizesList: Object\.keys\(countBySize\)\s*\};\s*\}/;

const newParseFn = `function parseDualFormatExcel(jsonRows) {
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
        pVal = pVal.replace(/^مشروع\s+/i, "").replace(/^Project\s+/i, "").trim();
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
        rowProj = rowProj.replace(/^مشروع\s+/i, "").replace(/^Project\s+/i, "").trim();
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
  }`;

if (oldParseFnRegex.test(engineCode)) {
  engineCode = engineCode.replace(oldParseFnRegex, newParseFn);
  console.log('✅ Updated parseDualFormatExcel with project recognition');
} else {
  console.error('❌ Could not match oldParseFnRegex!');
  process.exit(1);
}

console.log('--- 2. Updating Excel preview modal to show Project breakdown ---');
const oldPreviewModalRegex = /<!-- 2\. COUNT BY CITY[\s\S]*?<!-- Import Mode Selector -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*`;/;

const newPreviewModal = `<!-- 2. COUNT BY PROJECT (Displayed when projects exist) -->
              \${parsed.distinctProjectNames && parsed.distinctProjectNames.length > 0 ? \`
                <div style="background: var(--bg-surface); border: 1.5px solid rgba(37, 99, 235, 0.25); border-radius: var(--radius-md); padding: 0.85rem;">
                  <div style="font-weight: 800; font-size: 0.88rem; color: #2563eb; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <span>🏗️ المشاريع المكتشفة في الملف (Detected Projects):</span>
                    <span class="badge badge-primary" style="font-size: 0.72rem;">\${parsed.projectsList.length} مشاريع</span>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.5rem;">
                    \${Object.values(parsed.countByProject).map(p => \`
                      <div style="padding: 0.55rem 0.75rem; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <strong style="color: var(--text-main); font-size: 0.88rem;">\${p.displayProjectName}</strong>
                          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                            المدن: \${Array.from(p.cities).join('، ')} • \${p.totalWorkers} كادر
                          </div>
                        </div>
                        <span class="badge badge-emerald" style="font-size: 0.85rem; font-weight: 800;">\${p.totalQty} قطعة</span>
                      </div>
                    \`).join("")}
                  </div>
                </div>
              \` : ''}

              <!-- 3. COUNT BY CITY (Compact horizontal grid) -->
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
                          \${c.projectName ? \`<span class="badge badge-primary" style="font-size: 0.65rem; margin-inline-start: 4px;">\${c.projectName}</span>\` : ''}
                          <div style="color: var(--text-muted); font-size: 0.72rem; margin-top: 1px;">\${c.totalWorkers} موظف • \${sizesStr}</div>
                        </div>
                        <strong style="color: #10b981; font-size: 0.95rem; white-space: nowrap;">\${c.totalQty} قطعة</strong>
                      </div>
                    \`;
                  }).join("")}
                </div>
              </div>

              <!-- Import Mode Selector -->
              <div style="padding: 0.65rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem;">طريقة تسجيل أمر الصرف:</div>
                <div style="display: flex; gap: 1rem; font-size: 0.78rem; flex-wrap: wrap;">
                  <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                    <input type="radio" name="orders_import_mode" value="PER_PROJECT" \${parsed.projectsList && parsed.projectsList.length > 1 ? 'checked' : ''}>
                    <strong>أمر صرف منفصل لكل مشروع</strong> \${parsed.projectsList && parsed.projectsList.length > 1 ? '<span style="color: #2563eb; font-weight: 800;">(موصى به - تم اكتشاف ' + parsed.projectsList.length + ' مشاريع)</span>' : ''}
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                    <input type="radio" name="orders_import_mode" value="PER_CITY" \${(!parsed.projectsList || parsed.projectsList.length <= 1) ? 'checked' : ''}>
                    <strong>أمر صرف منفصل لكل مدينة</strong>
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                    <input type="radio" name="orders_import_mode" value="MASTER">
                    <strong>أمر صرف مجمع شامل للملف بالكامل</strong>
                  </label>
                </div>
              </div>
            </div>
          \`;`;

if (oldPreviewModalRegex.test(engineCode)) {
  engineCode = engineCode.replace(oldPreviewModalRegex, newPreviewModal);
  console.log('✅ Updated Excel preview modal with Project breakdown and mode radio');
} else {
  console.error('❌ Could not match oldPreviewModalRegex!');
  process.exit(1);
}

console.log('--- 3. Updating confirmOrdersExcelImport to split orders by Project ---');
const oldConfirmFnRegex = /function confirmOrdersExcelImport\(\) \{[\s\S]*?renderOrders\(\);[\s\S]*?window\.OstanStyle\.showToast\([\s\S]*?\);\s*\}\s*\}/;

const newConfirmFn = `function confirmOrdersExcelImport() {
    if (!parsedOrdersBatchData) return;

    const p = parsedOrdersBatchData;
    const modeEl = document.querySelector('input[name="orders_import_mode"]:checked');
    let mode = modeEl ? modeEl.value : (p.projectsList && p.projectsList.length > 1 ? "PER_PROJECT" : "MASTER");
    const stock = (window.state && window.state.stock) ? window.state.stock : [];

    function buildItemsFromSizes(sizesMap) {
      return Object.entries(sizesMap).map(([sz, qty]) => {
        const matchedStock = stock.find(s => s.name.toLowerCase().includes(sz.toLowerCase())) || stock[0];
        return {
          stockId: matchedStock ? matchedStock.id : "",
          itemName: matchedStock ? \`\${matchedStock.name} (مقاس \${sz})\` : \`زي موحد / تيشيرت (مقاس \${sz})\`,
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
        const cityNames = Array.from(projData.cities).join("، ");
        const spvsNames = Array.from(projData.spvs).join(" / ") || "إشراف ميداني";

        // Display title: "مشروع نادك (بلال محمد / طلال طلعت)"
        const clientNameStr = \`\${projData.displayProjectName} (\${spvsNames})\`;

        const newOrder = {
          id: "ord-" + Date.now() + "-" + pIdx,
          orderNumber: getNextOrderNumber(),
          projectName: projData.projectName || "",
          clientName: clientNameStr,
          city: cityNames,
          requester: Array.from(projData.spvs)[0] || "مشرف المشروع",
          priority: "NORMAL",
          notes: \`تم الاستيراد من ملف \${p.fileName || 'Excel'} - \${projData.displayProjectName}\`,
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
        const clientNameStr = \`\${projTitle} (\${spvsNames})\`;

        const newOrder = {
          id: "ord-" + Date.now() + "-" + cIdx,
          orderNumber: getNextOrderNumber(),
          projectName: cityData.projectName || "",
          clientName: clientNameStr,
          city: cityData.city,
          requester: Array.from(cityData.spvs)[0] || "مشرف المدينة",
          priority: "NORMAL",
          notes: \`تم الاستيراد من ملف \${p.fileName || 'Excel'} - فرع \${cityData.city}\`,
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
        ? \`مشروع \${singleProj} (\${p.citiesList.slice(0, 3).join('، ')})\`
        : \`توريد كادر الميدان (\${p.citiesList.slice(0, 3).join('، ')}\${p.citiesList.length > 3 ? '...' : ''})\`;

      const newOrder = {
        id: "ord-" + Date.now(),
        orderNumber: getNextOrderNumber(),
        projectName: singleProj,
        clientName: clientNameStr,
        city: p.citiesList.join("، "),
        requester: "Excel Batch Import",
        priority: "HIGH",
        notes: \`ملف: \${p.fileName || 'Excel'} | إجمالي \${p.netTotalQty} قطعة عبر \${p.citiesList.length} مدن (\${p.totalRecords} كادر مسجل)\`,
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
      window.OstanStyle.showToast("تم اعتماد الاستيراد بنجاح", \`تم تسجيل أوامر الصرف للمشاريع والمدن بإجمالي \${totalItems} قطعة.\`);
    }
  }`;

if (oldConfirmFnRegex.test(engineCode)) {
  engineCode = engineCode.replace(oldConfirmFnRegex, newConfirmFn);
  console.log('✅ Updated confirmOrdersExcelImport with project splitting logic');
} else {
  console.error('❌ Could not match oldConfirmFnRegex!');
  process.exit(1);
}

console.log('--- 4. Updating renderOrders table row to display Project Name in Red Marked Box ---');
// In renderOrders, line 308:
const oldRowTitleCode = `<strong style="color: var(--text-main);">\${o.clientName || "طلب كادر الميدان"}</strong>`;

const newRowTitleCode = `<strong style="color: var(--text-main); font-size: 0.9rem;">
                        \${(() => {
                          if (o.projectName) {
                            const pName = o.projectName.startsWith("مشروع") ? o.projectName : ("مشروع " + o.projectName);
                            const parenIdx = (o.clientName || "").indexOf("(");
                            const spvsPart = parenIdx !== -1 ? (" " + o.clientName.substring(parenIdx)) : "";
                            return pName + spvsPart;
                          }
                          return o.clientName || "طلب كادر الميدان";
                        })()}
                      </strong>`;

if (engineCode.includes(oldRowTitleCode)) {
  engineCode = engineCode.replace(oldRowTitleCode, newRowTitleCode);
  console.log('✅ Updated order row client title in renderOrders');
} else {
  console.log('⚠️ oldRowTitleCode not matched directly, checking regex');
  engineCode = engineCode.replace(
    /<strong style="color: var\(--text-main\);"[^>]*>\s*\$\{o\.clientName \|\| "طلب كادر الميدان"\}\s*<\/strong>/,
    newRowTitleCode
  );
}

// Add sample column to downloadOrdersExcelSample
engineCode = engineCode.replace(
  /\{ "City": "JUBAIL", "SPV": "Mohamed Hasona Hassan Jubail Team", "Merchandiser Name": "Abdo Abdalla Alraad JUBAIL Eshhar", "USER REF\.#": "nadec\.131", "T-shirt size": "XXL", "Quantity": 1, "Mobile": "593532219" \}/,
  `{ "City": "JUBAIL", "SPV": "Mohamed Hasona Hassan Jubail Team", "Merchandiser Name": "Abdo Abdalla Alraad JUBAIL Eshhar", "USER REF.#": "nadec.131", "T-shirt size": "XXL", "Quantity": 1, "Mobile": "593532219", "المشروع": "نادك" }`
);

fs.writeFileSync(enginePath, engineCode, 'utf8');
console.log('✅ Successfully updated orders-engine.js!');
