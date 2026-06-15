const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const failures = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

const html = read("apps/web/seis-cockpit.html");
const css = read("apps/web/styles.css");
const js = read("apps/web/app.js");

ensure(html.includes("id=\"motion-mode\""), "motion mode control must be present.");
ensure(html.includes("section-reveal"), "sections must use reveal hooks.");
ensure(css.includes("prefers-reduced-motion"), "CSS must include reduced-motion fallback.");
ensure(css.includes("data-motion-mode=\"cinematic\""), "CSS must include cinematic mode selector.");
ensure(css.includes("data-motion-mode=\"balanced\""), "CSS must include balanced mode selector.");
ensure(css.includes("transition:"), "CSS must define controlled transitions.");
ensure(js.includes("prefers-reduced-motion"), "JS must read reduced-motion preference.");
ensure(js.includes("getDefaultMode"), "JS must choose a device-aware default mode.");
ensure(js.includes("setupReveals"), "JS must wire section reveal behavior.");
ensure(js.includes("setupParallax"), "JS must wire bounded parallax behavior.");
ensure(js.includes("requestAnimationFrame"), "JS motion updates must be animation-frame bounded.");

if (failures.length > 0) {
  console.error("Motion evidence check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Motion evidence check passed.");
