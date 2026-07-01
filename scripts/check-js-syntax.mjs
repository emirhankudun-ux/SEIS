#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const skipParts = new Set([
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "releases",
  "SEIST",
  "vendor",
]);
const extensions = new Set([".cjs", ".js", ".mjs"]);
const failures = [];

const tracked = spawnSync("git", ["ls-files", "-z"], {
  encoding: "buffer",
  maxBuffer: 100 * 1024 * 1024,
});

if (tracked.status !== 0) {
  console.error("Unable to list tracked files for JavaScript syntax check.");
  process.exit(tracked.status || 1);
}

const files = tracked.stdout
  .toString("utf8")
  .split("\0")
  .filter(Boolean)
  .filter((file) => extensions.has(file.slice(file.lastIndexOf("."))))
  .filter((file) => !file.split("/").some((part) => skipParts.has(part)))
  .sort();

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.status !== 0) {
    const firstLine = `${result.stderr || result.stdout}`.split(/\r?\n/).find(Boolean) || "syntax check failed";
    failures.push(`${file}: ${firstLine}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS JavaScript syntax check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`SEIS JavaScript syntax check passed for ${files.length} tracked files.`);
