import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const files = {
  policy: "docs/deployment/release-artifact-retention-policy.md",
  backupPlan: "docs/deployment/release-backup-plan.md",
  uploadRunbook: "docs/deployment/server-upload-runbook.md",
  latest: "releases/latest.json",
  packageJson: "package.json"
};

const failures = [];

function readText(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }

  return readFileSync(file, "utf8");
}

function readJson(file) {
  const text = readText(file);
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`invalid JSON in ${file}: ${error.message}`);
    return null;
  }
}

function requireIncludes(file, text, label = text) {
  const contents = readText(file);
  if (!contents.includes(text)) {
    failures.push(`${file} must include ${label}`);
  }
}

const policy = readText(files.policy);
const latest = readJson(files.latest);
const packageJson = readJson(files.packageJson) || {};

for (const phrase of [
  "tracked-retained",
  "explicit maintainer approval",
  "Do not deploy the whole repository",
  "releases/latest.json",
  "seis-static.zip",
  "server-upload-manifest.json",
  "GitHub Releases",
  "Git LFS",
  "object storage",
  "npm run check:release-artifact-policy"
]) {
  if (!policy.includes(phrase)) {
    failures.push(`${files.policy} must include ${phrase}`);
  }
}

requireIncludes(files.backupPlan, "release-artifact-retention-policy.md");
requireIncludes(files.uploadRunbook, "release-artifact-retention-policy.md");

if (packageJson.scripts?.["check:release-artifact-policy"] !== "node scripts/check-release-artifact-policy.mjs") {
  failures.push(`${files.packageJson} must expose check:release-artifact-policy`);
}

if (latest) {
  for (const field of ["releaseDir", "packagePath", "manifestPath", "sha256", "packageBytes", "createdAt"]) {
    if (!latest[field]) {
      failures.push(`${files.latest} missing ${field}`);
    }
  }

  if (latest.packagePath && !existsSync(latest.packagePath)) {
    failures.push(`${files.latest} packagePath does not exist: ${latest.packagePath}`);
  }

  if (latest.manifestPath && !existsSync(latest.manifestPath)) {
    failures.push(`${files.latest} manifestPath does not exist: ${latest.manifestPath}`);
  }

  if (latest.packagePath && existsSync(latest.packagePath)) {
    const bytes = readFileSync(latest.packagePath);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (sha256 !== latest.sha256) {
      failures.push(`${files.latest} sha256 does not match packagePath contents`);
    }
    if (bytes.length !== latest.packageBytes) {
      failures.push(`${files.latest} packageBytes does not match packagePath contents`);
    }
  }

  if (latest.manifestPath && existsSync(latest.manifestPath)) {
    const manifest = readJson(latest.manifestPath);
    if (manifest?.sha256 !== latest.sha256) {
      failures.push("latest manifest sha256 must match releases/latest.json");
    }
    if (manifest?.packageBytes !== latest.packageBytes) {
      failures.push("latest manifest packageBytes must match releases/latest.json");
    }
    if (manifest?.liveUploadBlocked !== true) {
      failures.push("latest manifest must keep liveUploadBlocked true");
    }
  }
}

if (existsSync("releases")) {
  const releaseDirs = readdirSync("releases")
    .map((name) => join("releases", name))
    .filter((path) => statSync(path).isDirectory());

  if (releaseDirs.length < 1) {
    failures.push("releases must contain at least one retained release directory");
  }

  for (const dir of releaseDirs) {
    const packagePath = join(dir, "seis-static.zip");
    const manifestPath = join(dir, "server-upload-manifest.json");
    if (!existsSync(packagePath)) {
      failures.push(`${dir} missing seis-static.zip`);
    }
    if (!existsSync(manifestPath)) {
      failures.push(`${dir} missing server-upload-manifest.json`);
    }
  }
}

const sensitivePatterns = [
  ["SSH private key", /BEGIN (OPENSSH|RSA|EC) PRIVATE KEY/],
  ["GitHub token", /ghp_|github_pat_/],
  ["strict OpenAI key token", /sk-[A-Za-z0-9_-]{20,}/],
  ["OpenAI key assignment", /OPENAI_API_KEY=/],
  ["Anthropic key assignment", /ANTHROPIC_API_KEY=/],
  ["Gemini key assignment", /GEMINI_API_KEY=/],
  ["Private key assignment", /PRIVATE_KEY=/],
  ["AWS secret key", /AWS_SECRET_ACCESS_KEY/],
  ["Password assignment", /password=/i],
  ["Token assignment", /token=/i]
];

for (const [label, pattern] of sensitivePatterns) {
  if (pattern.test(policy)) {
    failures.push(`${files.policy} must not include ${label}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS release artifact policy check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS release artifact policy check passed.");
