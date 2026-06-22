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

const html = read("apps/web/index.html");
const css = read("apps/web/styles.css");

ensure(html.includes("name=\"viewport\""), "HTML must define a responsive viewport.");
ensure(css.includes("@media (max-width: 900px)"), "CSS must include the mobile breakpoint.");
ensure(css.includes("grid-template-columns: 1fr"), "Mobile layout must collapse multi-column grids.");
ensure(css.includes("min-height: 2.2rem"), "Touch controls must keep a stable minimum height.");
ensure(css.includes("flex-wrap: wrap"), "Navigation and metadata chips must be allowed to wrap.");
ensure(css.includes("box-sizing: border-box"), "Layout sizing must stay predictable.");
ensure(!css.includes("letter-spacing: -"), "Negative letter spacing is not allowed in this foundation.");
ensure(!css.includes("100vw"), "Avoid 100vw surfaces that can create horizontal overflow.");

if (failures.length > 0) {
  console.error("Mobile ergonomics check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Mobile ergonomics check passed.");
