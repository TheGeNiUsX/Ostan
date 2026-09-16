const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const inlineScriptRegex = /<script>\s*\/\/\s*={10,}\s*\/\/\s*INVENTORY ORDERS & LIVE STOCK TRACKING ENGINE[\s\S]*?<\/script>\s*<\/body>/;

if (inlineScriptRegex.test(html)) {
  html = html.replace(inlineScriptRegex, '</body>');
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✅ Removed duplicate inline script, now cleanly driven by orders-engine.js');
} else {
  console.log('ℹ️ Inline script already cleaned or not matching');
}
