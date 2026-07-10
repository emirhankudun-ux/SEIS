import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "search-center.html"), "utf8");
const css = fs.readFileSync(path.join(root, "search-center.css"), "utf8");
const js = fs.readFileSync(path.join(root, "search-center.js"), "utf8");

const requiredTabs = ["AI", "Web", "Code", "Design", "Cloud", "Apps", "Plugins", "Files"];

test("Search Center shell includes required tabs and runtime contract", () => {
  for (const tab of requiredTabs) {
    assert.ok(html.includes(`data-tab="${tab}"`), `missing tab: ${tab}`);
  }

  const requiredMarkers = [
    "SEIS Search Center",
    "SEIS Core / Browser-local search surface",
    "data-seis-search=\"browser-local\"",
    "Connected results from SEIS AI, Code, Design, Cloud, Website, Plugins, Files, and Apps",
    "browser-local",
    "localStorage key: seis.search.center.v1",
    "networkRequested: false",
    "liveWebSearch: false",
    "providerCalled: false",
    "filesystemRead: false",
    "Cmd K",
    "id=\"searchMain\"",
    "aria-live=\"polite\"",
    "Search Center"
  ];

  for (const marker of requiredMarkers) {
    assert.ok(html.includes(marker), `missing marker: ${marker}`);
  }
});

test("Search Center JS keeps browser-local state and safe flags", () => {
  const required = [
    "STORE_KEY",
    "seis.search.center.v1",
    "safetyFlags",
    "networkRequested",
    "liveWebSearch",
    "providerCalled",
    "filesystemRead",
    "localStorage",
    "loadState",
    "persistState",
    "applySearch",
    "renderTabs",
    "renderResults",
    "renderPreview",
    "handleTabClick",
    "handleCommandClick",
    "handleKeyboardShortcuts",
    "activeResults",
    "state.selectedResultId",
  ];

  for (const marker of required) {
    assert.ok(js.includes(marker), `missing JS marker: ${marker}`);
  }
});

test("Search Center keeps direct-file compatible startup", () => {
  assert.ok(html.includes('src="./search-center.js"'), "Search Center HTML must reference the classic browser entrypoint.");
  assert.equal(html.includes('type="module"'), false, "Search Center must not require module script loading for direct-file startup.");
  assert.equal(html.includes("search-center.mjs"), false, "Search Center must not reference the HTTP-only module entrypoint.");
});

test("Search Center does not include provider or network access patterns", () => {
  const forbiddenPatterns = [
    /fetch\s*\(/i,
    /XMLHttpRequest/i,
    /WebSocket/i,
    /EventSource/i,
    /navigator\.sendBeacon/i,
    /OPENAI_API_KEY/i,
    /GITHUB_TOKEN/i,
    /PRIVATE KEY/i,
    /BEGIN RSA PRIVATE KEY/i,
    /new\s+File\s*\(/i,
    /new\s+Blob\s*\(/i,
    /window\.open\(/i,
    /\binnerHTML\b/i,
    /\beval\s*\(/i,
    /document\.write/i,
    /console\.log/i,
    /\bTODO\b/i,
  ];

  for (const pattern of forbiddenPatterns) {
    assert.equal(pattern.test(html), false, `forbidden HTML pattern found: ${pattern}`);
    assert.equal(pattern.test(js), false, `forbidden JS pattern found: ${pattern}`);
  }
});

test("Search Center CSS provides responsive and accessible layout", () => {
  const markers = [
    "--surface",
    "search-shell",
    "search-tabs",
    "result-item",
    "preview-panel",
    "status-pill",
    "prefers-reduced-motion",
    "html.reduce-motion",
    "scroll-behavior: auto",
    "@media print",
    "@media (max-width: 1080px)",
    "@media (max-width: 640px)",
    ".skip-link",
    "result-list",
  ];

  for (const marker of markers) {
    assert.ok(css.includes(marker), `missing CSS marker: ${marker}`);
  }
});
