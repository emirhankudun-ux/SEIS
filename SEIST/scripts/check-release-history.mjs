import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const releasesDir = "releases";
const latestPath = join(releasesDir, "latest.json");
const failures = [];

if (!existsSync(latestPath)) {
  failures.push("missing releases/latest.json");
} else {
  const latest = JSON.parse(readFileSync(latestPath, "utf8"));
  for (const key of ["releaseDir", "packagePath", "manifestPath", "sha256"]) {
    if (!latest[key]) failures.push(`latest release missing ${key}`);
  }
  if (latest.packagePath && !existsSync(latest.packagePath)) {
    failures.push(`latest package missing: ${latest.packagePath}`);
  }
  if (latest.manifestPath && !existsSync(latest.manifestPath)) {
    failures.push(`latest manifest missing: ${latest.manifestPath}`);
  }
}

if (existsSync(releasesDir)) {
  const releaseFolders = readdirSync(releasesDir)
    .filter(name => name !== "latest.json")
    .filter(name => statSync(join(releasesDir, name)).isDirectory());

  if (releaseFolders.length < 1) {
    failures.push("expected at least one release backup folder");
  }
}

if (failures.length > 0) {
  console.error("SEIS release history check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS release history check passed.");

