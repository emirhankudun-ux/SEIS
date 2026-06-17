import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = "dist/server-drop";
const packagePath = "dist/seis-static.zip";
const manifestPath = "dist/server-upload-manifest.json";
const uploadPlanPath = "deploy/upload-plan.json";
const latestPath = "releases/latest.json";

for (const file of [packagePath, manifestPath, uploadPlanPath, latestPath]) {
  if (!existsSync(file)) {
    throw new Error(`Missing server drop input: ${file}`);
  }
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

copyFileSync(packagePath, join(outputDir, "seis-static.zip"));
copyFileSync(manifestPath, join(outputDir, "server-upload-manifest.json"));
copyFileSync(uploadPlanPath, join(outputDir, "upload-plan.json"));
copyFileSync(latestPath, join(outputDir, "release-latest.json"));

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const plan = JSON.parse(readFileSync(uploadPlanPath, "utf8"));

const readme = [
  "# UI-UX Digital Lab Server Drop",
  "",
  "Upload only `seis-static.zip` after the server target is confirmed.",
  "",
  `- SHA-256: \`${manifest.sha256}\``,
  `- Bytes: \`${manifest.packageBytes}\``,
  `- Upload status: \`${plan.status}\``,
  `- Active target: \`${plan.activeTarget || "not configured"}\``,
  "",
  "Required before live deploy:",
  "",
  ...manifest.requiredBeforeLiveDeploy.map(item => `- ${item}`),
  "",
  "Files in this drop:",
  "",
  "- `seis-static.zip`",
  "- `server-upload-manifest.json`",
  "- `upload-plan.json`",
  "- `release-latest.json`",
  "",
  "Do not upload the full repository, `.next`, `.playwright-mcp`, or legacy source dumps.",
  ""
].join("\n");

writeFileSync(join(outputDir, "README.md"), readme);
console.log(`Server drop ready: ${outputDir}`);
