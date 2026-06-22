import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const SHOWCASE_DIR = path.join(ROOT, "apps", "web", "showcase");
const MANIFEST_FILE = path.join(SHOWCASE_DIR, "video-heroes.json");
const CSS_FILE = path.join(SHOWCASE_DIR, "video-hero.css");
const JS_FILE = path.join(SHOWCASE_DIR, "video-hero.js");
const ROUTES_FILE = path.join(ROOT, "apps", "web", "src", "config", "routes.json");
const SERVICE_WORKER_FILE = path.join(ROOT, "apps", "web", "service-worker.js");
const SITEMAP_FILE = path.join(ROOT, "apps", "web", "sitemap.xml");
const failures = [];

const requiredHeroes = [
  { id: "nature", file: "nature.html", themeClass: "theme-nature", title: "Untamed Silence" },
  { id: "still-life", file: "still-life.html", themeClass: "theme-still-life", title: "Objects in Quiet Light" },
  { id: "materials", file: "materials.html", themeClass: "theme-materials", title: "Tactile Memory" },
  { id: "metal-parts", file: "metal-parts.html", themeClass: "theme-metal-parts", title: "Precision in Motion" }
];

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

const manifest = readJson(MANIFEST_FILE);
const css = readText(CSS_FILE);
const js = readText(JS_FILE);
const routes = readJson(ROUTES_FILE);
const serviceWorker = readText(SERVICE_WORKER_FILE);
const sitemap = readText(SITEMAP_FILE);

if (fs.existsSync(JS_FILE)) {
  const syntax = spawnSync("node", ["--check", JS_FILE], { cwd: ROOT, encoding: "utf8" });
  ensure(syntax.status === 0, `video-hero.js syntax check failed: ${syntax.stderr || syntax.stdout}`);
}

ensure(manifest?.version === 1, "video hero manifest version must be 1.");
ensure(Array.isArray(manifest?.heroes), "video hero manifest must define heroes array.");
ensure(manifest?.heroes?.length === 4, "video hero manifest must define exactly four heroes.");

for (const required of requiredHeroes) {
  const record = manifest?.heroes?.find((hero) => hero.id === required.id);
  const htmlFile = path.join(SHOWCASE_DIR, required.file);
  const html = readText(htmlFile);

  ensure(Boolean(record), `manifest missing ${required.id}.`);
  ensure(record?.title === required.title, `${required.id} manifest title mismatch.`);
  ensure(record?.videoUrl?.startsWith("https://videos.pexels.com/"), `${required.id} video URL must use the approved remote video host.`);
  ensure(record?.sourcePage?.startsWith("https://www.pexels.com/"), `${required.id} must keep source page provenance.`);
  ensure(record?.status === "remote-video", `${required.id} status must be remote-video.`);

  ensure(html.includes(required.themeClass), `${required.id} page missing theme class.`);
  ensure(html.includes(record?.videoUrl || "__missing__"), `${required.id} page must use manifest video URL.`);
  ensure(html.includes("muted loop playsinline"), `${required.id} video must be muted, looping, and inline.`);
  ensure(html.includes('preload="metadata"'), `${required.id} must metadata-preload video.`);
  ensure(html.includes('data-video-action="toggle-play"'), `${required.id} missing play/pause control.`);
  ensure(html.includes('data-video-action="toggle-mute"'), `${required.id} missing mute control.`);
  ensure(html.includes('data-video-action="fullscreen"'), `${required.id} missing fullscreen control.`);
  ensure(html.includes("data-smooth-scroll"), `${required.id} missing CTA smooth-scroll hook.`);
  ensure(html.includes("aria-live=\"polite\""), `${required.id} missing video status live region.`);
  ensure(html.includes('href="../favicon.svg"'), `${required.id} page must link the shared SVG favicon.`);
  ensure(html.includes('href="../favicon.ico"'), `${required.id} page must link the shared ICO fallback.`);
  ensure(html.includes("./video-hero.js"), `${required.id} page must load shared runtime.`);
  ensure(html.includes("./video-hero.css"), `${required.id} page must load shared styles.`);
}

for (const marker of ["prefers-reduced-motion", ".video-hero", ".video-hero__controls", ".theme-nature", ".theme-still-life", ".theme-materials", ".theme-metal-parts", "100svh"]) {
  ensure(css.includes(marker), `video hero CSS missing ${marker}.`);
}

for (const marker of ["IntersectionObserver", "visibilitychange", "requestFullscreen", "data-next-video", "prefers-reduced-motion", "preload"]) {
  ensure(js.includes(marker), `video hero runtime missing ${marker}.`);
}

const routePaths = new Set((routes?.routes || []).map((route) => route.path));
for (const required of requiredHeroes) {
  const route = `/showcase/${required.file}`;
  ensure(routePaths.has(route), `routes config missing ${route}.`);
  ensure(serviceWorker.includes(`./showcase/${required.file}`), `service worker missing ${required.file}.`);
  ensure(sitemap.includes(`/showcase/${required.file}`), `sitemap missing ${required.file}.`);
}

ensure(serviceWorker.includes("./showcase/video-heroes.json"), "service worker must cache video hero manifest.");
ensure(serviceWorker.includes("./showcase/video-hero.css"), "service worker must cache video hero CSS.");
ensure(serviceWorker.includes("./showcase/video-hero.js"), "service worker must cache video hero JS.");
ensure(serviceWorker.includes("./favicon.ico"), "service worker must cache favicon.ico fallback.");
ensure(serviceWorker.includes("./favicon.svg"), "service worker must cache favicon.svg.");

if (failures.length > 0) {
  console.error("Video hero showcase check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Video hero showcase check passed.");
