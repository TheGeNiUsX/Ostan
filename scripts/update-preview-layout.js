const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'orders-engine.js');
let code = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

const startIdx = code.indexOf('        if (preview) {');
const endIdx = code.indexOf('              <!-- Import Mode Selector -->');

if (startIdx !== -1 && endIdx !== -1) {
  const target = code.substring(startIdx, endIdx);

  const replacement = `        // Compact dropzone into a sleek top banner so nothing gets pushed down
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

              <!-- 2. COUNT BY CITY (Compact horizontal grid) -->
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
        }
`;

  code = code.replace(target, replacement);
  fs.writeFileSync(p, code, 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'orders-engine.js'), code, 'utf8');
  console.log('✅ Successfully updated preview layout in orders-engine.js and public/orders-engine.js');
} else {
  console.error('❌ Could not find target boundaries');
}
