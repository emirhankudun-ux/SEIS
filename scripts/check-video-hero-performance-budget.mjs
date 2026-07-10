import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB_ROOT = path.join(ROOT, "apps", "web");
const SHOWCASE_DIR = path.join(WEB_ROOT, "showcase");
const MANIFEST_FILE = path.join(SHOWCASE_DIR, "video-heroes.json");
const CSS_FILE = path.join(SHOWCASE_DIR, "video-hero.css");
const JS_FILE = path.join(SHOWCASE_DIR, "video-hero.js");
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const failures = [];

const requiredHeroes = [
  { id: "nature", file: "nature.html", next: "still-life" },
  { id: "still-life", file: "still-life.html", next: "materials" },
  { id: "materials", file: "materials.html", next: "metal-parts" },
  { id: "metal-parts", file: "metal-parts.html", next: "nature" }
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

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(file);
    if (entry.isFile()) return [file];
    return [];
  });
}

const manifest = readJson(MANIFEST_FILE);
const css = readText(CSS_FILE);
const js = readText(JS_FILE);
const heroes = new Map((manifest?.heroes || []).map((hero) => [hero.id, hero]));
const committedVideos = walkFiles(WEB_ROOT).filter((file) => VIDEO_EXTENSIONS.has(path.extname(file).toLowerCase()));

ensure(committedVideos.length === 0, `Video Hero budget forbids committed video binaries under apps/web: ${committedVideos.map((file) => path.relative(ROOT, file)).join(", ")}`);
ensure(manifest?.mediaPolicy?.runtimeStorage?.includes("avoid committing large video binaries"), "manifest must document remote runtime media storage policy.");
ensure(manifest?.mediaPolicy?.loading?.includes("metadata preload"), "manifest loading policy must mention metadata preload.");
ensure(manifest?.mediaPolicy?.loading?.includes("visibility-based pause"), "manifest loading policy must mention visibility-based pause.");
ensure(manifest?.mediaPolicy?.loading?.includes("reduced-motion fallback"), "manifest loading policy must mention reduced-motion fallback.");
ensure(manifest?.mediaPolicy?.license?.includes("Pexels"), "manifest license policy must retain source provenance context.");

for (const required of requiredHeroes) {
  const hero = heroes.get(required.id);
  const nextHero = heroes.get(required.next);
  const html = readText(path.join(SHOWCASE_DIR, required.file));

  ensure(Boolean(hero), `${required.id} missing manifest record.`);
  ensure(hero?.format === "video/mp4", `${required.id} must declare video/mp4 format.`);
  ensure(["portrait", "landscape"].includes(hero?.orientation), `${required.id} must declare supported orientation.`);
  ensure(hero?.status === "remote-video", `${required.id} must declare remote-video status.`);
  ensure(hero?.videoUrl?.startsWith("https://videos.pexels.com/"), `${required.id} must use approved remote video host.`);
  ensure(hero?.sourcePage?.startsWith("https://www.pexels.com/"), `${required.id} must retain Pexels source-page provenance.`);
  ensure(!hero?.videoUrl?.includes("/public/media/"), `${required.id} must not point videoUrl at committed public media.`);

  ensure(html.includes('<link rel="preconnect" href="https://videos.pexels.com">'), `${required.id} must preconnect to remote video host.`);
  ensure(html.includes('<link rel="dns-prefetch" href="https://videos.pexels.com">'), `${required.id} must dns-prefetch remote video host.`);
  ensure(html.includes('preload="metadata"'), `${required.id} must keep metadata preload.`);
  ensure(html.includes("muted loop playsinline"), `${required.id} video must be muted, looping, and inline.`);
  ensure(!/<video[^>]*\sautoplay\b/i.test(html), `${required.id} must not rely on raw autoplay attribute; runtime handles autoplay fallback.`);
  ensure(html.includes(hero?.videoUrl || "__missing__"), `${required.id} page must use manifest video URL.`);
  ensure(nextHero && html.includes(`data-next-video="${nextHero.videoUrl}"`), `${required.id} must preload the next theme video on intent.`);
  ensure(html.includes("data-video-status") && html.includes('aria-live="polite"'), `${required.id} must expose loading/playback state in an aria-live status.`);
}

for (const marker of [
  "min-width: 320px",
  "100svh",
  "object-fit: cover",
  ".video-hero.is-video-ready .video-hero__fallback",
  ".video-hero.is-reduced-motion .video-hero__media video",
  ".video-hero.is-video-error .video-hero__media video",
  "@media (prefers-reduced-motion: reduce)",
  "min-height: 44px",
  "focus-visible"
]) {
  ensure(css.includes(marker), `video hero CSS missing performance/accessibility marker: ${marker}.`);
}

ensure(!css.includes("letter-spacing: -"), "video hero CSS must not use negative letter spacing.");

for (const marker of [
  "video.play()",
  "is-autoplay-blocked",
  "IntersectionObserver",
  "visibilitychange",
  "document.createElement(\"link\")",
  "link.rel = \"preload\"",
  "link.as = \"video\"",
  "pointerenter",
  "touchstart",
  "passive: true",
  "prefers-reduced-motion: reduce"
]) {
  ensure(js.includes(marker), `video hero runtime missing loading optimization marker: ${marker}.`);
}

if (failures.length > 0) {
  console.error("Video Hero performance budget check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Video Hero performance budget check passed.");
