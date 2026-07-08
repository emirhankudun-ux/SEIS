import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  flightDeck: "apps/web/seis-demo-flight-deck.html",
  routes: "apps/web/src/config/routes.json",
  serviceWorker: "apps/web/service-worker.js",
  landing: "apps/web/index.html",
  readme: "README.md",
  staticRoutesCheck: "scripts/check-seis-static-demo-routes.mjs",
  packageJson: "package.json"
};

function read(file) {
  const absolute = join(root, file);
  if (!existsSync(absolute)) {
    failures.push(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(absolute, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

const flightDeck = read(files.flightDeck);
const routesText = read(files.routes);
const serviceWorker = read(files.serviceWorker);
const landing = read(files.landing);
const readme = read(files.readme);
const staticRoutesCheck = read(files.staticRoutesCheck);
const packageJson = read(files.packageJson);

let routes = [];
try {
  const parsed = JSON.parse(routesText);
  routes = parsed && Array.isArray(parsed.routes) ? parsed.routes : [];
} catch (error) {
  failures.push(`routes JSON could not be parsed: ${error.message}`);
}

const routePaths = routes.map((route) => route.path);

for (const snippet of [
  "SEIS Demo Flight Deck",
  "seis.demoFlightDeck.v1",
  "seis-linux-replica.html?demo=live",
  "seis-linux-replica-public-demo.html",
  "desktop.html",
  "seis-code.html",
  "website/seis-ai.html",
  "website/seis-design.html",
  "website/seis-search.html",
  "website/seis-cloud.html",
  "website/seis-store.html",
  "mythic-gacha.html",
  "219",
  "No API keys",
  "No SSH execution",
  "No deployment",
  "Local Demo",
  "Approval-gated",
  "navigator.clipboard",
  "aria-pressed",
  "prefers-reduced-motion"
]) {
  ensure(flightDeck.includes(snippet), `flight deck must include marker: ${snippet}`);
}

ensure(routePaths.includes("/seis-demo-flight-deck.html"), "routes.json must register /seis-demo-flight-deck.html.");
ensure(serviceWorker.includes("./seis-demo-flight-deck.html"), "service worker must precache the demo flight deck.");
ensure(staticRoutesCheck.includes("/seis-demo-flight-deck.html"), "static route check must require the demo flight deck route.");
ensure(staticRoutesCheck.includes("./seis-demo-flight-deck.html"), "static route check must require the demo flight deck precache asset.");
ensure(landing.includes("./seis-demo-flight-deck.html"), "landing page must link the demo flight deck.");
ensure(readme.includes("seis-demo-flight-deck.html"), "README must document the demo flight deck route.");
ensure(packageJson.includes("\"check:seis-demo-flight-deck\""), "package.json must expose check:seis-demo-flight-deck.");

for (const forbidden of [
  "sk-",
  "ghp_",
  "github_pat_",
  ["BEGIN", "OPENSSH", "PRIVATE KEY"].join(" "),
  ["BEGIN", "RSA", "PRIVATE KEY"].join(" ")
]) {
  ensure(!flightDeck.includes(forbidden), `flight deck must not contain sensitive marker: ${forbidden}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  route: "/seis-demo-flight-deck.html",
  checkedFiles: Object.keys(files).length,
  state: "browser-local",
  liveClaims: "none"
}, null, 2));
