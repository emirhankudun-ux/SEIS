import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignored = new Set([".git", ".serena", "node_modules", ".next", "dist", "__MACOSX"]);
const extensions = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".html", ".json", ".md"]);
const errors = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!extensions.has(path.extname(entry.name))) continue;
    const text = fs.readFileSync(full, "utf8");
    if (text.includes("\t")) errors.push(`${path.relative(root, full)} contains tab indentation.`);
    if (/[ \t]+$/m.test(text)) errors.push(`${path.relative(root, full)} contains trailing whitespace.`);
    if (!text.endsWith("\n")) errors.push(`${path.relative(root, full)} should end with a newline.`);
  }
}

walk(root);

if (errors.length) {
  console.error(errors.slice(0, 40).join("\n"));
  if (errors.length > 40) console.error(`...and ${errors.length - 40} more`);
  process.exit(1);
}

console.log("Lint check passed.");
