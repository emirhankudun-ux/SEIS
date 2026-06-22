const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const sourceDir = path.join(ROOT, "apps", "web");
const releaseDir = path.join(ROOT, "release", "web");
const files = [
  ["seis-cockpit.html", "index.html"],
  ["styles.css", "styles.css"],
  ["app.js", "app.js"]
];

if (!fs.existsSync(sourceDir)) {
  console.error("Source web directory is missing.");
  process.exit(1);
}

fs.mkdirSync(releaseDir, { recursive: true });

for (const [sourceFile, targetFile] of files) {
  const source = path.join(sourceDir, sourceFile);
  const target = path.join(releaseDir, targetFile);

  if (!fs.existsSync(source)) {
    console.error(`Missing source file: ${source}`);
    process.exit(1);
  }

  fs.copyFileSync(source, target);
}

console.log(`Release refreshed at ${releaseDir}`);
