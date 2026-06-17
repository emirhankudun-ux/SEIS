import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const releaseDir = join("releases", stamp);
const packagePath = "dist/seis-static.zip";
const manifestPath = "dist/server-upload-manifest.json";

mkdirSync(releaseDir, { recursive: true });
copyFileSync(packagePath, join(releaseDir, "seis-static.zip"));
copyFileSync(manifestPath, join(releaseDir, "server-upload-manifest.json"));

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const latest = {
  version: 1,
  releaseDir,
  packagePath: join(releaseDir, "seis-static.zip"),
  manifestPath: join(releaseDir, "server-upload-manifest.json"),
  sha256: manifest.sha256,
  packageBytes: manifest.packageBytes,
  createdAt: new Date().toISOString()
};

writeFileSync("releases/latest.json", `${JSON.stringify(latest, null, 2)}\n`);
console.log(`Release backup created: ${releaseDir}`);

