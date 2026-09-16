// Copy of orders-engine.js for public assets
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'orders-engine.js');
const dst = path.join(__dirname, '..', 'public', 'orders-engine.js');
fs.copyFileSync(src, dst);
console.log('✅ Copied orders-engine.js to public/orders-engine.js');
