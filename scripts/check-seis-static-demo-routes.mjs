import { existsSync, readFileSync, statSync } from "node:fs";
import { join, normalize } from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const failures = [];

const REQUIRED_ROUTES = [
  "/",
  "/desktop.html",
  "/seis-code.html",
  "/seis-linux-replica.html",
  "/seis-linux-replica-public-demo.html",
  "/seis-demo-flight-deck.html",
  "/mythic-gacha.html",
  "/showcase/nature.html",
  "/showcase/still-life.html",
  "/showcase/materials.html",
  "/showcase/metal-parts.html"
];

const REQUIRED_PRECACHE = [
  "./index.html",
  "./desktop.html",
  "./seis-code.html",
  "./seis-linux-replica.html",
  "./seis-linux-replica-public-demo.html",
  "./seis-demo-flight-deck.html",
  "./mythic-gacha.html",
  "./showcase/nature.html",
  "./showcase/still-life.html",
  "./showcase/materials.html",
  "./showcase/metal-parts.html",
  "./website/index.html",
  "./manifest.json",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./favicon.ico"
];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readText(relativePath) {
  const absolutePath = join(ROOT, relativePath);
  ensure(existsSync(absolutePath), `missing required file: ${relativePath}`);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
}

function routeToFile(routePath) {
  if (routePath === "/") return join(WEB_ROOT, "index.html");
  return join(WEB_ROOT, routePath.replace(/^\//, ""));
}

function webAssetPath(precachePath) {
  const normalized = precachePath.replace(/^\.\//, "");
  return normalize(join(WEB_ROOT, normalized || "index.html"));
}

function extractPrecache(serviceWorker) {
  const match = serviceWorker.match(/const PRECACHE = \[([\s\S]*?)\];/);
  ensure(Boolean(match), "service worker must define a PRECACHE array.");
  if (!match) return [];

  try {
    return vm.runInNewContext(`[${match[1]}]`, {}, { timeout: 1000 });
  } catch (error) {
    ensure(false, `service worker PRECACHE could not be parsed: ${error.message}`);
    return [];
  }
}

const routesJson = readText("apps/web/src/config/routes.json");
const serviceWorker = readText("apps/web/service-worker.js");
const landing = readText("apps/web/index.html");
const websiteProducts = readText("apps/web/website/product-page.js");
const readme = readText("README.md");

let registeredRoutes = [];
try {
  const parsed = JSON.parse(routesJson);
  registeredRoutes = Array.isArray(parsed.routes) ? parsed.routes.map((route) => route.path) : [];
} catch (error) {
  ensure(false, `routes.json is not valid JSON: ${error.message}`);
}

const precache = extractPrecache(serviceWorker);

for (const routePath of REQUIRED_ROUTES) {
  const filePath = routeToFile(routePath);
  ensure(registeredRoutes.includes(routePath), `routes.json must register ${routePath}.`);
  ensure(existsSync(filePath) && statSync(filePath).isFile(), `route file missing for ${routePath}: ${filePath}`);
}

for (const assetPath of REQUIRED_PRECACHE) {
  const filePath = webAssetPath(assetPath);
  ensure(precache.includes(assetPath), `service worker must precache ${assetPath}.`);
  ensure(existsSync(filePath) && statSync(filePath).isFile(), `precache asset missing on disk: ${assetPath}`);
}

for (const marker of [
  "desktop.html",
  "seis-code.html",
  "seis-linux-replica.html",
  "seis-linux-replica-public-demo.html",
  "seis-demo-flight-deck.html",
  "mythic-gacha.html",
  "showcase/*.html"
]) {
  ensure(readme.includes(marker), `README must document demo route marker: ${marker}`);
}

ensure(readme.includes("Local Demo"), "README must document Local Demo mode.");
ensure(readme.includes("No SSH") || readme.includes("SSH"), "README must document SSH/cloud boundary.");
ensure(readme.includes("provider keys") || readme.includes("provider key"), "README must document provider-key boundary.");
ensure(readme.includes("docs/demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md"), "README must link the Linux Replica public walkthrough.");
ensure(landing.includes("./seis-linux-replica.html?demo=live"), "landing page must expose the Linux Replica live demo deep link.");
ensure(landing.includes("./seis-demo-flight-deck.html"), "landing page must expose the SEIS Demo Flight Deck.");
ensure(websiteProducts.includes("../seis-linux-replica.html?demo=live"), "website product pages must expose the Linux Replica live demo deep link.");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  checkedRoutes: REQUIRED_ROUTES.length,
  checkedPrecacheAssets: REQUIRED_PRECACHE.length,
  routeRegistry: "apps/web/src/config/routes.json",
  serviceWorker: "apps/web/service-worker.js",
  landingDeepLink: "apps/web/index.html -> ./seis-linux-replica.html?demo=live",
  flightDeckLink: "apps/web/index.html -> ./seis-demo-flight-deck.html",
  productPageDeepLink: "apps/web/website/product-page.js -> ../seis-linux-replica.html?demo=live"
}, null, 2));
