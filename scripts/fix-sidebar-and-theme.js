const fs = require('fs');
const path = require('path');

console.log('=== FIXING SIDEBAR SQUISH & THEME DEFAULT ===');

const indexPath = path.join(__dirname, '..', 'index.html');
const stylePath = path.join(__dirname, '..', 'style.js');
const pubStylePath = path.join(__dirname, '..', 'public', 'style.js');

// 1. UPDATE index.html
let html = fs.readFileSync(indexPath, 'utf8');

// Ensure html tag defaults to light
html = html.replace(/<html\s+lang="en"\s+dir="ltr"\s+data-theme="[^"]*">/i, '<html lang="en" dir="ltr" data-theme="light">');

// Fix app-shell and app-sidebar CSS
const oldShellCssRegex = /\/\*\s*Edge-to-Edge Fluid Shell with Moveable Sidebar Interaction\s*\*\/[\s\S]*?\.main-wrapper\s*\{[\s\S]*?\}/;
const newShellCss = `/* Edge-to-Edge Fluid Shell with Moveable Sidebar Interaction */
    .app-shell {
      display: grid;
      grid-template-columns: 280px 1fr;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      transition: grid-template-columns 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .app-shell.sidebar-collapsed {
      grid-template-columns: 0px 1fr !important;
    }

    .app-sidebar {
      background: var(--bg-surface);
      border-inline-end: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      user-select: none;
      width: 280px;
      min-width: 0;
      transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, visibility 0.28s;
      will-change: width, opacity;
      z-index: 30;
    }

    .app-shell.sidebar-collapsed .app-sidebar {
      width: 0 !important;
      min-width: 0 !important;
      max-width: 0 !important;
      opacity: 0 !important;
      pointer-events: none !important;
      overflow: hidden !important;
      visibility: hidden !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .main-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-app);
      min-width: 0;
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Fixed size for all brand logo containers to prevent SVG blowout */
    .brand-logo-box {
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      min-height: 32px !important;
      max-width: 32px !important;
      max-height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
    }
    .brand-logo-box svg {
      width: 100% !important;
      height: 100% !important;
    }`;

html = html.replace(oldShellCssRegex, newShellCss);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Updated index.html shell & logo sizing rules');

// 2. UPDATE style.js & public/style.js
let styleCode = fs.readFileSync(stylePath, 'utf8');

// Replace init in style.js to reset old dark theme cache on first run of v2
const oldInitRegex = /init:\s*function\s*\(\)\s*\{[\s\S]*?if\s*\(window\.matchMedia\)/;
const newInit = `init: function () {
      // Force default to light corporate theme on first load of this design version
      const versionKey = "ostan_theme_v2";
      let savedTheme = localStorage.getItem("ostan_theme");
      if (!localStorage.getItem(versionKey)) {
        savedTheme = "light";
        localStorage.setItem("ostan_theme", "light");
        localStorage.setItem(versionKey, "true");
      } else if (!savedTheme) {
        savedTheme = "light";
      }

      this.setTheme(savedTheme);

      const onDomReady = () => {
        updateThemeButtonUI();
        // Default sidebar to collapsed so it gives a clean full-screen dashboard
        const savedCollapsed = localStorage.getItem("ostan_sidebar_collapsed");
        const shouldCollapse = savedCollapsed === null ? true : (savedCollapsed === "true");
        const appShell = document.getElementById("app-shell-root") || document.querySelector(".app-shell");
        if (appShell && shouldCollapse) {
          appShell.classList.add("sidebar-collapsed");
        }
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onDomReady);
      } else {
        onDomReady();
      }

      if (window.matchMedia)`;

styleCode = styleCode.replace(oldInitRegex, newInit);
fs.writeFileSync(stylePath, styleCode, 'utf8');
fs.writeFileSync(pubStylePath, styleCode, 'utf8');
console.log('✅ Updated style.js & public/style.js with v2 theme reset to light and clean sidebar init');
