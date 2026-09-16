const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('id="view-settings"')) {
    console.log('view-settings is at line:', i + 1);
  }
});
