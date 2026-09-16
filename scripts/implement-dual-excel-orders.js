const fs = require('fs');
const path = require('path');

console.log('=== IMPLEMENTING DUAL-FORMAT EXCEL PARSER WITH CITY, SIZE & QTY COUNTING ===');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// The replacement parser and analytics controller
const newExcelAndAnalyticsCode = `    // =========================================================================
    // DUAL-FORMAT EXCEL ORDERS PARSER & CITY / SIZE / QTY ENGINE
    // =========================================================================
    let parsedOrdersBatchData = null;

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

      const roster = [];
      const countByCity = {};
      const countBySize = {};
      let netTotalQty = 0;
      let zeroQtyCount = 0;

      jsonRows.forEach((row, idx) => {
        // City
        let city = getRowVal(row, ["City", "city", "المدينة", "مدينة", "الموقع", "Location"]);
        if (!city) city = "المنطقة الرئيسية";
        city = city.trim();

        // Supervisor
        const spv = getRowVal(row, ["SPV", "Supervisor", "المشرف", "مشرف", "اسم المشرف", "Team", "الفريق"]);
        const spvPhone = getRowVal(row, ["جوال المشرف", "هاتف المشرف", "SPV Mobile", "Supervisor Mobile"]);

        // Merchandiser / Recipient
        let name = getRowVal(row, ["Merchandiser Name", "Merchandiser", "الاسم", "اسم الموظف", "Name", "Employee", "المستلم"]);
        if (!name) name = "موظف ميداني " + (idx + 1);

        // User Ref #
        const ref = getRowVal(row, ["USER REF.#", "USER REF", "Ref", "الرقم المرجعي", "كود"]);

        // Size
        const rawSize = getRowVal(row, ["T-shirt size", "Shirt size", "المقاس", "مقاس", "Size", "size"]);
        const size = normalizeSizeName(rawSize);

        // Quantity
        const qty = getRowQuantity(row, rowKeys, sizeKeyIdx);

        // Category / Item description
        let itemDesc = getRowVal(row, ["عمود2", "الصنف", "المادة", "الأدوات", "البيان", "Item Name", "Item", "Description"]);
        if (!itemDesc) {
          itemDesc = rawSize ? "تيشيرت / زي موحد" : "أدوات ومهمات";
        }

        // Mobile
        const mobile = getRowVal(row, ["Mobile", "Mobile Number", "الجوال", "الهاتف", "Phone", "رقم الجوال"]);

        // Record merchandiser entry
        roster.push({
          index: idx + 1,
          city: city,
          supervisor: spv,
          supervisorPhone: spvPhone,
          name: name,
          ref: ref,
          size: size,
          quantity: qty,
          itemDesc: itemDesc,
          mobile: mobile
        });

        if (qty <= 0) {
          zeroQtyCount++;
          return; // Skip 0 quantities from fulfillment totals
        }

        netTotalQty += qty;

        // Group by City
        if (!countByCity[city]) {
          countByCity[city] = { city: city, totalWorkers: 0, totalQty: 0, sizes: {}, spvs: new Set() };
        }
        countByCity[city].totalWorkers++;
        countByCity[city].totalQty += qty;
        countByCity[city].sizes[size] = (countByCity[city].sizes[size] || 0) + qty;
        if (spv) countByCity[city].spvs.add(spv);

        // Group by Size
        countBySize[size] = (countBySize[size] || 0) + qty;
      });

      return {
        roster: roster,
        countByCity: countByCity,
        countBySize: countBySize,
        netTotalQty: netTotalQty,
        totalRecords: roster.length,
        zeroQtyCount: zeroQtyCount,
        citiesList: Object.keys(countByCity),
        sizesList: Object.keys(countBySize)
      };
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
            label.textContent = \`✓ تم تحليل الملف بنجاح: \${file.name}\`;
          }
          if (btn) {
            btn.style.display = "inline-flex";
            btn.textContent = \`تأكيد استيراد الطلب (إجمالي \${parsed.netTotalQty} قطعة عبر \${parsed.citiesList.length} مدن)\`;
          }

          if (preview) {
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

                <!-- 1. COUNT BY SIZE (توزيع المقاسات) -->
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

                <!-- 2. COUNT BY CITY (إحصاء وتوزيع المدن) -->
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
                            <div style="font-size: 0.7rem; color: var(--text-faint);">\${sizesStr}</div>
                          </div>
                          <div style="font-weight: 800; color: #10b981; font-size: 0.85rem;">\${c.totalQty} قطعة</div>
                        </div>
                      \`;
                    }).join("")}
                  </div>
                </div>

                <!-- Import Mode Selector -->
                <div style="padding: 0.65rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                  <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem;">طريقة تسجيل أمر الصرف:</div>
                  <div style="display: flex; gap: 1rem; font-size: 0.78rem;">
                    <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                      <input type="radio" name="orders_import_mode" value="MASTER" checked>
                      <strong>أمر صرف مجمع شامل للمدن</strong> (مع سجل تفصيلي لكل كادر ومقاس)
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                      <input type="radio" name="orders_import_mode" value="PER_CITY">
                      <strong>أمر صرف منفصل لكل مدينة</strong>
                    </label>
                  </div>
                </div>
              </div>\`;
          }

        } catch (err) {
          console.error("Excel parse error:", err);
          alert("حدث خطأ أثناء قراءة ملف الإكسل: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }
    window.handleOrdersExcelFileSelected = handleOrdersExcelFileSelected;

    function confirmOrdersExcelImport() {
      if (!parsedOrdersBatchData) return;

      const p = parsedOrdersBatchData;
      const mode = document.querySelector('input[name="orders_import_mode"]:checked')?.value || "MASTER";
      const stock = state.stock || [];

      // Helper to map size breakdown to order items
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

      state.orders = state.orders || [];

      if (mode === "PER_CITY") {
        // Create one order for each city
        Object.values(p.countByCity).forEach((cityData, cIdx) => {
          const cityRoster = p.roster.filter(r => r.city === cityData.city && r.quantity > 0);
          const cityItems = buildItemsFromSizes(cityData.sizes);

          const newOrder = {
            id: "ord-" + Date.now() + "-" + cIdx,
            orderNumber: getNextOrderNumber(),
            clientName: \`مشروع \${cityData.city} (\${Array.from(cityData.spvs).join(' / ') || 'إشراف ميداني'})\`,
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
          state.orders.unshift(newOrder);
        });
      } else {
        // Create One Master Order
        const masterItems = buildItemsFromSizes(p.countBySize);
        const newOrder = {
          id: "ord-" + Date.now(),
          orderNumber: getNextOrderNumber(),
          clientName: \`توريد كادر الميدان (\${p.citiesList.slice(0, 3).join('، ')}\${p.citiesList.length > 3 ? '...' : ''})\`,
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
        state.orders.unshift(newOrder);
      }

      try {
        localStorage.setItem("ostan_orders", JSON.stringify(state.orders));
      } catch (e) {}

      const totalItems = p.netTotalQty;
      parsedOrdersBatchData = null;
      closeOrdersExcelImportModal();
      renderOrders();

      if (window.OstanStyle) {
        window.OstanStyle.showToast("تم اعتماد الاستيراد بنجاح", \`تم تسجيل أمر الصرف وحساب المقاسات والمدن بإجمالي \${totalItems} قطعة.\`);
      }
    }
    window.confirmOrdersExcelImport = confirmOrdersExcelImport;

    // Upgraded renderOrders to display City & Size pills
    function renderOrders(filterStatus, searchQuery) {
      if (filterStatus) currentOrdersFilterStatus = filterStatus;
      if (typeof searchQuery === "string") currentOrdersSearchQuery = searchQuery.toLowerCase().trim();

      const container = document.getElementById("orders-table-container");
      if (!container) return;

      const lang = document.documentElement.getAttribute("lang") || "en";
      const orders = state.orders || [];

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
        container.innerHTML = \`
          <div style="padding: 3rem 1rem; text-align: center; color: var(--text-faint);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📦</div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-muted);">
              \${lang === "ar" ? "لا توجد أوامر صرف مطابقة." : "No matching orders found."}
            </div>
            <div style="font-size: 0.8rem; margin-top: 4px;">
              \${lang === "ar" ? "يمكنك إنشاء طلب جديد أو استيراد ملف إكسل بالمدن والمقاسات." : "Create a new order manually or import an Excel spreadsheet."}
            </div>
          </div>\`;
        return;
      }

      container.innerHTML = \`
        <div class="table-responsive-wrapper">
          <table class="matrix-table" style="min-width: 820px;">
            <thead>
              <tr>
                <th>\${lang === "ar" ? "رقم الطلب" : "Order #"}</th>
                <th>\${lang === "ar" ? "المدينة والجهة المستلمة" : "City & Recipient"}</th>
                <th>\${lang === "ar" ? "إحصاء المقاسات والكميات" : "Sizes & Quantity Breakdown"}</th>
                <th>\${lang === "ar" ? "إجمالي الكمية" : "Total Qty"}</th>
                <th>\${lang === "ar" ? "الأولوية" : "Priority"}</th>
                <th>\${lang === "ar" ? "الحالة" : "Status"}</th>
                <th style="text-align: end;">\${lang === "ar" ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              \${filtered.map(o => {
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
                  sizePills = Object.entries(o.countBySize).map(([sz, q]) => \`
                    <span style="display: inline-block; padding: 1px 6px; background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 4px; font-size: 0.72rem; color: #2563eb; font-weight: 700;">
                      \${sz}: \${q}
                    </span>
                  \`).join(" ");
                } else {
                  sizePills = (o.items || []).map(it => \`
                    <span style="display: inline-block; padding: 1px 6px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; font-size: 0.72rem;">
                      \${it.itemName}: \${it.quantity}
                    </span>
                  \`).join(" ");
                }

                // City badge
                const cityTag = o.city ? \`<span class="badge badge-cyan" style="font-size: 0.65rem; padding: 1px 6px;">🏙️ \${o.city}</span>\` : '';

                return \`
                  <tr>
                    <td style="font-weight: 800; color: #2563eb;">\${o.orderNumber || o.id}</td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                        <strong style="color: var(--text-main);">\${o.clientName || "طلب كادر الميدان"}</strong>
                        \${cityTag}
                      </div>
                      \${o.roster && o.roster.length > 0 ? \`
                        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                          👥 يشمل \${o.roster.length} موظف ميداني مسجل
                        </div>
                      \` : ''}
                    </td>
                    <td>
                      <div style="display: flex; gap: 0.3rem; flex-wrap: wrap; max-width: 320px;">
                        \${sizePills}
                      </div>
                    </td>
                    <td>
                      <strong style="font-size: 0.95rem; color: #10b981;">\${totalQty}</strong> <span style="font-size: 0.72rem; color: var(--text-muted);">قطعة</span>
                    </td>
                    <td>\${priorityBadge}</td>
                    <td>
                      \${statusBadge}
                      \${o.stockDeducted ? '<div style="font-size: 0.65rem; color: #10b981; margin-top: 2px;">✓ تم خصم المخزون</div>' : ''}
                    </td>
                    <td style="text-align: end;">
                      <div style="display: inline-flex; align-items: center; gap: 0.35rem;">
                        \${o.status === "PENDING" ? \`
                          <button onclick="setOrderStatus('\${o.id}', 'APPROVED')" class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.72rem; color: #0284c7;" title="Approve Order">
                            ✓ اعتماد
                          </button>
                          <button onclick="setOrderStatus('\${o.id}', 'CANCELLED')" class="btn btn-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; color: #ef4444;" title="Cancel Order">
                            ✕ إلغاء
                          </button>
                        \` : ''}

                        \${o.status === "APPROVED" ? \`
                          <button onclick="setOrderStatus('\${o.id}', 'DONE')" class="btn btn-primary" style="padding: 0.25rem 0.65rem; font-size: 0.72rem; background: #059669;" title="Fulfill order and deduct items from warehouse inventory">
                            📦 صرف واكتمال
                          </button>
                          <button onclick="setOrderStatus('\${o.id}', 'CANCELLED')" class="btn btn-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; color: #ef4444;" title="Cancel Order">
                            ✕ إلغاء
                          </button>
                        \` : ''}

                        <button onclick="openOrderDetails('\${o.id}')" class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;" title="View Details / Print Slip">
                          👁️ سند
                        </button>
                      </div>
                    </td>
                  </tr>
                \`;
              }).join("")}
            </tbody>
          </table>
        </div>\`;
    }
    window.renderOrders = renderOrders;

    // Upgraded openOrderDetails to show City & Size tables and Merchandiser Roster
    function openOrderDetails(orderId) {
      const order = (state.orders || []).find(o => o.id === orderId);
      if (!order) return;
      const lang = document.documentElement.getAttribute("lang") || "en";

      const container = document.getElementById("order-details-content");
      if (!container) return;

      const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-US") : "-";
      const totalQty = order.netTotalQty || (order.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

      container.innerHTML = \`
        <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
          <!-- Top Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.85rem; margin-bottom: 1rem;">
            <div>
              <div style="font-size: 1.25rem; font-weight: 800; color: #2563eb;">سند صرف وتوريد: \${order.orderNumber || order.id}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">تاريخ الإنشاء: \${dateStr} | \${order.clientName || ''}</div>
            </div>
            <span class="badge \${order.status === 'DONE' ? 'badge-emerald' : order.status === 'APPROVED' ? 'badge-cyan' : 'badge-amber'}" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">
              \${order.status}
            </span>
          </div>

          <!-- Summary Badges Bar -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; margin-bottom: 1rem;">
            <div style="padding: 0.65rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 0.7rem; color: var(--text-muted);">إجمالي الكمية المطلوبة</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: #10b981;">\${totalQty} قطعة</div>
            </div>
            <div style="padding: 0.65rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 0.7rem; color: var(--text-muted);">المدن المشمولة</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: #2563eb;">\${order.countByCity ? Object.keys(order.countByCity).length : (order.city ? 1 : "-")}</div>
            </div>
            <div style="padding: 0.65rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 0.7rem; color: var(--text-muted);">حالة خصم المستودع</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: \${order.stockDeducted ? '#10b981' : '#f59e0b'}; margin-top: 4px;">
                \${order.stockDeducted ? "✓ تم الخصم" : "⏳ معلق"}
              </div>
            </div>
          </div>

          <!-- 1. SIZE BREAKDOWN MATRIX -->
          \${order.countBySize ? \`
            <div style="margin-bottom: 1rem;">
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">📏 إحصاء المقاسات (Count by Size):</div>
              <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                \${Object.entries(order.countBySize).map(([sz, q]) => \`
                  <div style="padding: 0.35rem 0.75rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 0.78rem;">
                    <strong style="color: #2563eb;">\${sz}:</strong> \${q} قطعة
                  </div>
                \`).join("")}
              </div>
            </div>
          \` : ''}

          <!-- 2. CITY BREAKDOWN TABLE -->
          \${order.countByCity && Object.keys(order.countByCity).length > 0 ? \`
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
                  \${Object.values(order.countByCity).map(c => \`
                    <tr>
                      <td style="font-weight: 700;">\${c.city}</td>
                      <td>\${c.totalWorkers} موظف</td>
                      <td>\${Object.entries(c.sizes || {}).map(([s, q]) => \`\${s}:\${q}\`).join(", ")}</td>
                      <td><strong style="color: #10b981;">\${c.totalQty} قطعة</strong></td>
                    </tr>
                  \`).join("")}
                </tbody>
              </table>
            </div>
          \` : ''}

          <!-- 3. DETAILED ROSTER -->
          \${order.roster && order.roster.length > 0 ? \`
            <div style="margin-top: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">👥 كشف الكوادر المستلمين (\${order.roster.length} موظف):</div>
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
                    \${order.roster.map(r => \`
                      <tr style="\${r.quantity <= 0 ? 'opacity: 0.5;' : ''}">
                        <td>\${r.index || '-'}</td>
                        <td style="font-weight: 700;">\${r.name}</td>
                        <td>\${r.city}</td>
                        <td>\${r.supervisor || '-'}</td>
                        <td style="direction: ltr; text-align: start;">\${r.mobile || '-'}</td>
                        <td><span class="badge badge-secondary">\${r.size || '-'}</span></td>
                        <td><strong style="color: \${r.quantity > 0 ? '#10b981' : '#94a3b8'};">\${r.quantity}</strong></td>
                      </tr>
                    \`).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          \` : ''}
        </div>
      \`;

      const modal = document.getElementById("modal-order-details");
      if (modal) modal.style.display = "flex";
    }
    window.openOrderDetails = openOrderDetails;
`;

// Replace the old parser code with the enhanced dual-format parser
const oldParserRegex = /\/\/ Helper: generate next sequential Order Number[\s\S]*?window\.openOrderDetails = openOrderDetails;/;

if (oldParserRegex.test(html)) {
  html = html.replace(oldParserRegex, newExcelAndAnalyticsCode);
  console.log('✅ Replaced Excel parser and analytics with dual-format city/size/qty engine');
} else {
  console.error('❌ Could not locate oldParserRegex in index.html');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ index.html updated successfully with dual-format Excel & City/Size/Qty counting!');
`;

fs.writeFileSync(path.join(__dirname, 'implement-dual-excel-orders.js'), code, 'utf8');
console.log('✅ Created scripts/implement-dual-excel-orders.js');
