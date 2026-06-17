const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const sourceDir = path.join(ROOT, "apps", "web");
const releaseDir = path.join(ROOT, "release", "web");
const files = ["index.html", "styles.css", "app.js"];

if (!fs.existsSync(sourceDir)) {
  console.error("Source web directory is missing.");
  process.exit(1);
}

fs.mkdirSync(releaseDir, { recursive: true });

for (const file of files) {
  const source = path.join(sourceDir, file);
  const target = path.join(releaseDir, file);

  if (!fs.existsSync(source)) {
    console.error(`Missing source file: ${source}`);
    process.exit(1);
  }

  fs.copyFileSync(source, target);
}

console.log(`Release refreshed at ${releaseDir}`);
