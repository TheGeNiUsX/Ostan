const fs = require('fs');
const path = require('path');

console.log('=== APPLYING SIDEBAR NAV CSS & MERGED PROFILE FIX ===');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Insert complete sidebar navigation CSS after brand-logo-box svg rule using regex
const brandLogoSvgRegex = /\.brand-logo-box svg\s*\{[\s\S]*?width:\s*100%\s*!important;[\s\S]*?height:\s*100%\s*!important;[\s\S]*?\}/;

const sidebarNavCss = `.brand-logo-box svg {
      width: 100% !important;
      height: 100% !important;
    }

    /* Sidebar Navigation Architecture & Structure */
    .brand-header {
      height: 60px;
      padding-inline: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }

    .nav-sections-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.85rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .nav-group-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-section-title {
      padding-inline: 0.75rem;
      margin-bottom: 0.35rem;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-faint);
      display: block;
    }

    .nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0.85rem;
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid transparent;
      width: 100%;
      user-select: none;
    }

    .nav-item:hover {
      background: var(--bg-surface-hover);
      color: var(--text-main);
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(84, 17, 29, 0.12) 0%, rgba(84, 17, 29, 0.04) 100%);
      color: var(--primary-500);
      font-weight: 700;
      border-inline-start: 3px solid var(--primary-500);
    }

    [data-theme="dark"] .nav-item.active {
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0.05) 100%);
      color: #818cf8;
      border-inline-start: 3px solid #6366f1;
    }

    .nav-item.locked {
      opacity: 0.6;
    }`;

if (brandLogoSvgRegex.test(html)) {
  html = html.replace(brandLogoSvgRegex, sidebarNavCss);
  console.log('✅ Injected sidebar navigation CSS');
} else {
  console.error('❌ Could not find brandLogoSvgRegex in index.html');
}

// 2. Replace sidebar footer with merged user profile pill and exit door icon
const oldFooterRegex = /<!-- User Profile & Sign Out Footer -->[\s\S]*?<\/aside>/;
const newFooter = `<!-- User Profile & Sign Out Footer (Merged with Door Exit with Arrow) -->
      <div style="padding: 0.85rem 1rem; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; background: var(--bg-surface-elevated);">
        <div style="display: flex; align-items: center; gap: 0.65rem; min-width: 0; flex: 1;">
          <div id="sidebar-user-avatar" class="user-avatar-circle" style="width: 36px; height: 36px; font-size: 0.85rem; background: linear-gradient(135deg, #6366f1, #06b6d4); flex-shrink: 0;">
            O
          </div>
          <div style="min-width: 0; flex: 1;">
            <div id="sidebar-user-name" style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              Osama Al-Twaish
            </div>
            <div style="margin-top: 1px;">
              <span id="sidebar-user-role" class="badge badge-rose" style="font-size: 0.62rem; padding: 0.1rem 0.45rem;">
                SUPER_ADMIN
              </span>
            </div>
          </div>
        </div>

        <!-- Exit Door with Arrow SVG Logout Button -->
        <button onclick="userLogout()" class="btn btn-ghost" title="Sign Out (تسجيل الخروج)" style="padding: 0.45rem; color: #ef4444; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; border: 1px solid rgba(239, 68, 68, 0.2);" aria-label="Sign Out">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>`;

if (oldFooterRegex.test(html)) {
  html = html.replace(oldFooterRegex, newFooter);
  console.log('✅ Replaced sidebar footer with merged user profile & door exit icon');
} else {
  console.log('ℹ️ Footer already replaced or not matching old regex');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ index.html successfully updated!');
