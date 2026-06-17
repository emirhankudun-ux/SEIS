import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";

const packagePath = "dist/seis-static.zip";
const manifestPath = "dist/server-upload-manifest.json";
const targetPath = "deploy/server-targets.json";

if (!existsSync(packagePath)) {
  throw new Error(`Missing server package: ${packagePath}. Run npm run build:static first.`);
}

const bytes = readFileSync(packagePath);
const stat = statSync(packagePath);
const targets = existsSync(targetPath) ? JSON.parse(readFileSync(targetPath, "utf8")) : { activeTarget: null };
const manifest = {
  version: 1,
  packagePath,
  packageBytes: stat.size,
  sha256: createHash("sha256").update(bytes).digest("hex"),
  generatedAt: new Date().toISOString(),
  deployStatus: "ready_for_confirmed_server",
  activeTarget: targets.activeTarget || null,
  liveUploadBlocked: !targets.activeTarget,
  preservation: {
    backupCommand: "npm run build:static && npm run prepare:server",
    releaseLedger: "releases/latest.json"
  },
  contents: [
    "static web shell",
    "localized routes",
    "curated artwork",
    "UI-UX Digital Lab operating model",
    "deployment runbooks",
    "polyglot experience contract"
  ],
  requiredBeforeLiveDeploy: ["confirmed_domain_or_server", "confirmed_upload_path"]
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Server upload manifest ready: ${manifestPath}`);
