import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [sourceArg = "."] = process.argv.slice(2);
const sourceRoot = path.resolve(process.cwd(), sourceArg);
const requiredFiles = ["index.html", "styles.css", "app.js", "manifest.webmanifest"];
const ignoredDirs = new Set(["dist", "node_modules"]);
const errors = [];

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(path.join(directory, entry.name), files);
      continue;
    }

    if (entry.isFile()) files.push(path.join(directory, entry.name));
  }

  return files;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(sourceRoot, file))) errors.push(`Missing required static app file: ${file}`);
}

for (const file of walk(sourceRoot)) {
  const ext = path.extname(file);
  const textExtensions = new Set([".css", ".html", ".js", ".json", ".svg", ".txt", ".webmanifest", ".xml"]);

  if (textExtensions.has(ext) || path.basename(file) === "manifest.webmanifest") {
    const text = fs.readFileSync(file, "utf8");
    if (!text.endsWith("\n")) errors.push(`${path.relative(sourceRoot, file)} should end with a newline.`);
    if (/[ \t]+$/m.test(text)) errors.push(`${path.relative(sourceRoot, file)} contains trailing whitespace.`);
  }

  if (ext === ".json" || path.basename(file) === "manifest.webmanifest") {
    JSON.parse(fs.readFileSync(file, "utf8"));
  }

  if (ext === ".js" || ext === ".mjs") {
    const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (result.status !== 0) {
      errors.push(`${path.relative(sourceRoot, file)} failed JavaScript syntax check.\n${result.stderr.trim()}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Static app check passed for ${path.relative(process.cwd(), sourceRoot)}.`);
