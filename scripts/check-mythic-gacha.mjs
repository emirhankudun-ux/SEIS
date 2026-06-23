import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const HTML_FILE = path.join(ROOT, "apps", "web", "mythic-gacha.html");
const CSS_FILE = path.join(ROOT, "apps", "web", "mythic-gacha.css");
const JS_FILE = path.join(ROOT, "apps", "web", "mythic-gacha.js");
const ROUTES_FILE = path.join(ROOT, "apps", "web", "src", "config", "routes.json");
const SERVICE_WORKER_FILE = path.join(ROOT, "apps", "web", "service-worker.js");
const SITEMAP_FILE = path.join(ROOT, "apps", "web", "sitemap.xml");
const INDEX_FILE = path.join(ROOT, "apps", "web", "index.html");
const ATLAS_FILE = path.join(ROOT, "apps", "web", "public", "media", "mythic", "shan-hai-creature-atlas.png");
const failures = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readText(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${path.relative(ROOT, file)}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    failures.push(`Invalid JSON in ${path.relative(ROOT, file)}: ${error.message}`);
    return null;
  }
}

const html = readText(HTML_FILE);
const css = readText(CSS_FILE);
const js = readText(JS_FILE);
const routes = readJson(ROUTES_FILE);
const serviceWorker = readText(SERVICE_WORKER_FILE);
const sitemap = readText(SITEMAP_FILE);
const indexHtml = readText(INDEX_FILE);

if (fs.existsSync(JS_FILE)) {
  const syntax = spawnSync("node", ["--check", JS_FILE], { cwd: ROOT, encoding: "utf8" });
  ensure(syntax.status === 0, `apps/web/mythic-gacha.js syntax check failed: ${syntax.stderr || syntax.stdout}`);
}

const creatureIds = [...js.matchAll(/"SHJ-\d{3}"/g)].map((match) => match[0]);
ensure(creatureIds.length === 60, `Mythic Gacha must define 60 creature records; found ${creatureIds.length}.`);
ensure(new Set(creatureIds).size === 60, "Mythic Gacha creature IDs must be unique.");

for (const marker of [
  "Single Draw",
  "Ten Draw",
  "Daily Free",
  "Legendary",
  "pity",
  "bestiary",
  "IndexedDB",
  "image-generation provider",
  "data-export-status",
  "data-action=\"draw-one\"",
  "data-action=\"draw-ten\"",
  "data-action=\"daily-draw\"",
  "data-action=\"export-active\"",
  "data-filter-search",
  "data-filter-rarity",
  "data-filter-element",
  "data-filter-state"
]) {
  ensure(html.includes(marker), `Mythic Gacha HTML missing marker: ${marker}`);
}

for (const marker of [
  "indexedDB.open",
  "DB_NAME",
  "CODE_WORKSPACE_DB_NAME",
  "MythicArchive",
  "BroadcastChannel",
  "dailyKey",
  "state.pity >= 79",
  "forceRare",
  "duplicateJade",
  "clampCurrency",
  "favorites",
  "exportActive",
  "resetProgressState",
  "showModal",
  "prefers-reduced-motion",
  "shan-hai-creature-atlas.png",
  "saveToCodeWorkspace"
]) {
  ensure(js.includes(marker), `Mythic Gacha runtime missing marker: ${marker}`);
}

for (const marker of [
  "Ten Draw needs",
  "control.disabled = !hasLastDraw",
  "elements.drawTen.disabled",
  "state.currency < cost",
  "state.currency = clampCurrency(state.currency - cost, 0)",
  "state.dailyKey = \"\""
]) {
  ensure(js.includes(marker), `Mythic Gacha runtime missing interaction-safety marker: ${marker}`);
}

for (const marker of [
  ".ritual-stage",
  ".draw-card",
  ".bestiary-grid",
  ".creature-card",
  ".detail-dialog",
  "prefers-reduced-motion",
  "@media (max-width: 860px)",
  "shan-hai-creature-atlas.png"
]) {
  ensure(css.includes(marker), `Mythic Gacha CSS missing marker: ${marker}`);
}

const routePaths = new Set((routes?.routes || []).map((route) => route.path));
ensure(routePaths.has("/mythic-gacha.html"), "routes config must include /mythic-gacha.html.");
ensure(serviceWorker.includes("./mythic-gacha.html"), "service worker must cache Mythic Gacha HTML.");
ensure(serviceWorker.includes("./mythic-gacha.css"), "service worker must cache Mythic Gacha CSS.");
ensure(serviceWorker.includes("./mythic-gacha.js"), "service worker must cache Mythic Gacha JS.");
ensure(serviceWorker.includes("./public/media/mythic/shan-hai-creature-atlas.png"), "service worker must cache mythic atlas.");
ensure(sitemap.includes("/mythic-gacha.html"), "sitemap must include Mythic Gacha route.");
ensure(indexHtml.includes('href="./mythic-gacha.html"'), "home page must link to Mythic Gacha.");
ensure(fs.existsSync(ATLAS_FILE), "Mythic atlas asset must exist.");

if (failures.length > 0) {
  console.error("Mythic Gacha check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Mythic Gacha check passed.");
