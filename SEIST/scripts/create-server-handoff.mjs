import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = "handoff/server";
const requiredFiles = [
  "dist/seis-static.zip",
  "dist/server-upload-manifest.json",
  "deploy/upload-plan.json",
  "deploy/provider-matrix.json",
  "releases/latest.json"
];

const missing = requiredFiles.filter(file => !existsSync(file));
if (missing.length > 0) {
  throw new Error(`Missing handoff inputs: ${missing.join(", ")}`);
}

mkdirSync(outputDir, { recursive: true });

const manifest = JSON.parse(readFileSync("dist/server-upload-manifest.json", "utf8"));
const uploadPlan = JSON.parse(readFileSync("deploy/upload-plan.json", "utf8"));
const latest = JSON.parse(readFileSync("releases/latest.json", "utf8"));
const matrix = JSON.parse(readFileSync("deploy/provider-matrix.json", "utf8"));

const handoffManifest = {
  version: 1,
  status: uploadPlan.status,
  activeTarget: uploadPlan.activeTarget,
  liveUploadBlocked: !uploadPlan.activeTarget,
  package: {
    path: manifest.packagePath,
    bytes: manifest.packageBytes,
    sha256: manifest.sha256
  },
  latestRelease: latest.releaseDir,
  providerCount: matrix.providers.length,
  requiredBeforeUpload: [
    "confirmed_domain_or_server",
    "confirmed_upload_path",
    "checksum_match",
    "rollback_package_available"
  ]
};

writeFileSync(join(outputDir, "server-handoff-manifest.json"), `${JSON.stringify(handoffManifest, null, 2)}\n`);
writeFileSync(join(outputDir, "upload-checklist.md"), buildChecklist(handoffManifest, uploadPlan));
writeFileSync(join(outputDir, "README.md"), buildReadme(handoffManifest));

copyFileSync("dist/server-upload-manifest.json", join(outputDir, "server-upload-manifest.json"));
copyFileSync("deploy/upload-plan.json", join(outputDir, "upload-plan.json"));
copyFileSync("deploy/provider-matrix.json", join(outputDir, "provider-matrix.json"));
copyFileSync("releases/latest.json", join(outputDir, "latest-release.json"));

console.log(`Server handoff ready: ${outputDir}`);

function buildReadme(data) {
  return `# SEIS Server Handoff

This folder is the operator-facing handoff for the current SEIS static release.

## Package

- Package: \`${data.package.path}\`
- Bytes: \`${data.package.bytes}\`
- SHA-256: \`${data.package.sha256}\`
- Latest backup: \`${data.latestRelease}\`

## Upload Status

Live upload is ${data.liveUploadBlocked ? "blocked until a target is confirmed" : "ready for the configured target"}.

Do not upload raw repository files. Upload only the verified package after the server target, document root, and rollback path are confirmed.
`;
}

function buildChecklist(data, uploadPlan) {
  const steps = uploadPlan.steps.map((step, index) => `${index + 1}. ${step}`).join("\n");
  return `# Server Upload Checklist

## Required Gates

- [ ] Confirm domain/server.
- [ ] Confirm upload path or document root.
- [ ] Verify SHA-256: \`${data.package.sha256}\`
- [ ] Confirm rollback package from \`${data.latestRelease}\`.
- [ ] Confirm \`/health.json\` after upload.

## Planned Steps

${steps}
`;
}
