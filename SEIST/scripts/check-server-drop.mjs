import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = "dist/server-drop";
const failures = [];

for (const file of [
  "seis-static.zip",
  "server-upload-manifest.json",
  "upload-plan.json",
  "release-latest.json",
  "README.md"
]) {
  if (!existsSync(join(root, file))) {
    failures.push(`missing server drop file: ${file}`);
  }
}

if (existsSync(join(root, "seis-static.zip")) && existsSync(join(root, "server-upload-manifest.json"))) {
  const bytes = readFileSync(join(root, "seis-static.zip"));
  const manifest = JSON.parse(readFileSync(join(root, "server-upload-manifest.json"), "utf8"));
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== manifest.sha256) {
    failures.push("server drop package hash does not match manifest");
  }
}

if (existsSync(join(root, "upload-plan.json"))) {
  const plan = JSON.parse(readFileSync(join(root, "upload-plan.json"), "utf8"));
  if (!plan.package?.sha256) {
    failures.push("server drop upload plan is missing package sha256");
  }
}

if (failures.length > 0) {
  console.error("SEIS server drop check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS server drop check passed.");
