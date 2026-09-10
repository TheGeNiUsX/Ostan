import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

try {
  let commit = '';
  let message = '';
  try {
    commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    message = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).split('\n')[0].trim();
  } catch (e) {
    commit = 'v-' + Date.now().toString(36);
    message = 'System maintenance update';
  }

  const now = Date.now();
  const dateStr = new Date().toISOString();

  let vJson = { version: '1.0.0', commit: '', buildTime: 0 };
  const vPath = path.join(process.cwd(), 'version.json');
  if (fs.existsSync(vPath)) {
    try {
      vJson = JSON.parse(fs.readFileSync(vPath, 'utf8'));
    } catch (e) {}
  }

  // Increment patch version
  const parts = (vJson.version || '1.0.0').split('.');
  const patch = parseInt(parts[2] || '0', 10) + 1;
  const newVer = `${parts[0] || '1'}.${parts[1] || '0'}.${patch}`;

  const updatedVersion = {
    version: newVer,
    commit: commit,
    buildTime: now,
    releaseDate: dateStr,
    message: message || 'Latest system enhancements'
  };

  fs.writeFileSync(vPath, JSON.stringify(updatedVersion, null, 2) + '\n', 'utf8');
  console.log(`[Version Tracker] ✅ Updated version.json -> v${newVer} (${commit}) at ${dateStr}`);

  // Update index.html embedded build info
  const indexPath = path.join(process.cwd(), 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    const regex = /window\.OSTAN_BUILD\s*=\s*{[\s\S]*?};/;
    const newBuildStr = `window.OSTAN_BUILD = ${JSON.stringify(updatedVersion, null, 2)};`;
    if (regex.test(indexHtml)) {
      indexHtml = indexHtml.replace(regex, newBuildStr);
      fs.writeFileSync(indexPath, indexHtml, 'utf8');
      console.log(`[Version Tracker] ✅ Updated embedded window.OSTAN_BUILD in index.html`);
    } else {
      console.log(`[Version Tracker] ℹ️ window.OSTAN_BUILD not found in index.html, will be embedded upon script addition.`);
    }
  }
} catch (err) {
  console.error('[Version Tracker] ❌ Error updating build version:', err);
}
