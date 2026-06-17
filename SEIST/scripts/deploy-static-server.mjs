import { existsSync, readFileSync } from "node:fs";

const targetPath = "deploy/server-targets.json";
const packagePath = "dist/seis-static.zip";
const manifestPath = "dist/server-upload-manifest.json";

if (!existsSync(packagePath) || !existsSync(manifestPath)) {
  throw new Error("Missing deploy package or manifest. Run npm run build:static && npm run prepare:server first.");
}

const targets = JSON.parse(readFileSync(targetPath, "utf8"));

if (!targets.activeTarget) {
  console.log("No active server target is configured.");
  console.log("Package is ready but live upload is intentionally blocked until domain/server/path is confirmed.");
  console.log(`Upload candidate: ${packagePath}`);
  process.exit(0);
}

throw new Error(`Active target "${targets.activeTarget}" requires a provider-specific deploy adapter before upload.`);
