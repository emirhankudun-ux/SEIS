import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const failures = [];
const root = process.cwd();
const pageIds = [
  ["index", "overview", "SEIS Website"],
  ["seis-ai", "seis-ai", "SEIS AI"],
  ["seis-os", "seis-os", "SEIS OS"],
  ["seis-code", "seis-code", "SEIS Code"],
  ["seis-design", "seis-design", "SEIS Design"],
  ["seis-data", "seis-data", "SEIS Data"],
  ["seis-search", "seis-search", "SEIS Search"],
  ["seis-cloud", "seis-cloud", "SEIS Cloud"],
  ["seis-store", "seis-store", "SEIS Store"],
  ["seis-agents", "seis-agents", "SEIS Agents"]
];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

for (const [fileBase, pageId, title] of pageIds) {
  const path = `apps/web/website/${fileBase}.html`;
  ensure(existsSync(join(root, path)), `missing website page: ${path}`);
  if (!existsSync(join(root, path))) continue;
  const html = read(path);
  ensure(html.includes('data-product-page'), `${path} must mount product page runtime`);
  ensure(html.includes(`data-page="${pageId}"`), `${path} must declare data-page="${pageId}"`);
  ensure(html.includes("./product-page.css"), `${path} must use shared website CSS`);
  ensure(html.includes("./product-page.js"), `${path} must use shared website JS`);
  ensure(html.includes(title), `${path} must include title marker ${title}`);
}

for (const asset of [
  "apps/web/website/product-page.css",
  "apps/web/website/product-page.js"
]) {
  ensure(existsSync(join(root, asset)), `missing website asset: ${asset}`);
}

const js = read("apps/web/website/product-page.js");
for (const marker of [
  "Local Demo",
  "SEIS AI",
  "SEIS OS",
  "SEIS Code",
  "SEIS Design",
  "SEIS Data",
  "SEIS Search",
  "SEIS Cloud",
  "SEIS Store",
  "SEIS Agents",
  "Copy page brief",
  "Year 5"
]) {
  ensure(js.includes(marker), `website runtime missing marker: ${marker}`);
}

const desktop = read("apps/web/desktop.js");
for (const route of [
  "seis-website-hub",
  "seis-website-ai",
  "seis-website-os",
  "seis-website-code",
  "seis-website-design",
  "seis-website-data",
  "seis-website-search",
  "seis-website-cloud",
  "seis-website-store",
  "seis-website-agents"
]) {
  ensure(desktop.includes(route), `desktop route manifest missing ${route}`);
}
ensure(desktop.includes('["seis-website", "SEIS Website"'), "desktop app catalog must include SEIS Website");
ensure(desktop.includes("renderSeisWebsiteApp"), "desktop must render SEIS Website app");
ensure(desktop.includes("seis-website-map.md"), "SEIS Website app must save a local VFS map");

const serviceWorker = read("apps/web/service-worker.js");
for (const [fileBase] of pageIds) {
  const path = `./website/${fileBase}.html`;
  ensure(serviceWorker.includes(path), `service worker must precache ${path}`);
}
ensure(serviceWorker.includes("./website/product-page.css"), "service worker must precache website CSS");
ensure(serviceWorker.includes("./website/product-page.js"), "service worker must precache website JS");

const readme = read("README.md");
ensure(readme.includes("website/index.html"), "README must document website route");
ensure(readme.includes("npm run check:seis-website-pages"), "README must document website validation");

if (failures.length) {
  console.error("SEIS website pages check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`SEIS website pages check passed for ${pageIds.length} product pages.`);
