#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { buildApplicationPluginCatalog } from "../plugins/seis-core/runtime/plugin-catalog.mjs";

const root = process.cwd();
const outputPath = path.join(root, "apps", "seis-core", "data", "seis-core-plugin-catalog.json");
const checkMode = process.argv.includes("--check");
const catalog = {
  ...buildApplicationPluginCatalog(root, { limit: 100, includeStatus: true }),
  generatedAt: "2026-07-15",
};
const expected = `${JSON.stringify(catalog, null, 2)}\n`;

if (checkMode) {
  const actual = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  if (actual !== expected) {
    console.error("SEIS Core plugin catalog is stale. Run: npm run automation:seis-core-plugin-catalog");
    process.exit(1);
  }
  console.log("SEIS Core app plugin catalog check passed.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, expected);
console.log(`Wrote ${outputPath} for ${catalog.counts.discovered} app-owned plugins.`);
