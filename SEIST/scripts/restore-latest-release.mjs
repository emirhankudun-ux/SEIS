import { copyFileSync, existsSync, readFileSync } from "node:fs";

const latestPath = "releases/latest.json";

if (!existsSync(latestPath)) {
  throw new Error("Missing releases/latest.json");
}

const latest = JSON.parse(readFileSync(latestPath, "utf8"));

if (!existsSync(latest.packagePath) || !existsSync(latest.manifestPath)) {
  throw new Error("Latest release files are missing.");
}

copyFileSync(latest.packagePath, "dist/seis-static.zip");
copyFileSync(latest.manifestPath, "dist/server-upload-manifest.json");

console.log(`Restored release ${latest.releaseDir} to dist/.`);

