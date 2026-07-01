import { existsSync, readFileSync } from "node:fs";

const files = {
  matrix: "content/development/seis-public-readiness-status.json",
  doc: "docs/governance/public-readiness-status.md",
  publicReadiness: "docs/PUBLIC_READINESS.md",
  index: "docs/INDEX.md",
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
    failures.push(`${file} must be valid JSON: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function includesAll(text, label, phrases) {
  for (const phrase of phrases) {
    ensure(text.includes(phrase), `${label} must include ${phrase}`);
  }
}

const matrix = readJson(files.matrix);
const doc = readText(files.doc);
const publicReadiness = readText(files.publicReadiness);
const index = readText(files.index);
const packageJson = readJson(files.packageJson) || {};

ensure(matrix?.id === "seis-public-readiness-status", "matrix id mismatch");
ensure(matrix?.status === "active-review-matrix-not-release-claim", "matrix status mismatch");
ensure(matrix?.qualityGate === "npm run check:seis-public-readiness-status", "matrix quality gate mismatch");
ensure(matrix?.publicReadyClaimAllowed === false, "matrix must not allow public-ready claim");
ensure(matrix?.noKeyDemoRequired === true, "matrix must require no-key demo");
ensure(matrix?.liveClaimsRequireCurrentEvidence === true, "matrix must require current evidence for live claims");
ensure(matrix?.securityBoundary?.secretsAllowed === false, "matrix must forbid secrets");
ensure(matrix?.securityBoundary?.privateVaultMaterialAllowed === false, "matrix must forbid private vault material");
ensure(matrix?.securityBoundary?.realSSHCredentialsAllowed === false, "matrix must forbid real SSH credentials");
ensure(matrix?.securityBoundary?.browserProviderSecretsAllowed === false, "matrix must forbid browser provider secrets");
ensure(matrix?.securityBoundary?.githubMutationAllowed === false, "matrix must forbid GitHub mutation");

const requiredSurfaceIds = [
  "identity",
  "onboarding",
  "environment-template",
  "web-demo",
  "apple-first",
  "second-brain",
  "local-ai",
  "ai-core",
  "seis-ssh",
  "github-governance",
  "security",
  "public-indexing",
  "release-artifacts",
  "publication"
];

const surfaces = Array.isArray(matrix?.surfaces) ? matrix.surfaces : [];
const surfaceIds = new Set(surfaces.map((surface) => surface.id));

for (const id of requiredSurfaceIds) {
  ensure(surfaceIds.has(id), `matrix missing surface ${id}`);
}

for (const surface of surfaces) {
  ensure(typeof surface.title === "string" && surface.title.length > 0, `${surface.id} must have title`);
  ensure(typeof surface.status === "string" && surface.status.length > 0, `${surface.id} must have status`);
  ensure(surface.publicSafe === true, `${surface.id} must be public-safe`);
  ensure(surface.liveClaimAllowed === false, `${surface.id} must block live claims`);
  ensure(Array.isArray(surface.evidence) && surface.evidence.length > 0, `${surface.id} must list evidence`);
  ensure(Array.isArray(surface.requiredChecks) && surface.requiredChecks.length > 0, `${surface.id} must list required checks`);
  ensure(Array.isArray(surface.blockers) && surface.blockers.length > 0, `${surface.id} must list blockers`);
  ensure(typeof surface.nextAction === "string" && surface.nextAction.length > 0, `${surface.id} must list next action`);
}

includesAll(doc, "public readiness status doc", [
  "active-review-matrix-not-release-claim",
  "not a release approval",
  "metadata-only-strict-live-gated",
  "blocked-human-review-required",
  "npm run check:seis-public-readiness",
  "npm run check:seis-env-example",
  "npm run check:seis-public-readiness-docs",
  "npm run check:seis-brain-context-packs",
  "npm run check:seis-public-readiness-status",
  "pre-production-noindex-validator-backed",
  "tracked-retained-approval-gated",
  "Local redacted Git history scan is passing"
]);

includesAll(publicReadiness, "public readiness docs", [
  "content/development/seis-public-readiness-status.json",
  "docs/governance/public-readiness-status.md",
  "npm run check:seis-public-readiness",
  "npm run check:seis-env-example",
  "npm run check:seis-brain-context-packs",
  "npm run check:seis-public-readiness-status"
]);

includesAll(index, "docs index", [
  "governance/public-readiness-status.md",
  "seis-public-readiness-status.json"
]);

ensure(
  packageJson.scripts?.["check:seis-public-readiness"] ===
    "node scripts/check-seis-public-readiness.mjs",
  "package.json must expose check:seis-public-readiness"
);
ensure(
  packageJson.scripts?.["check:seis-public-readiness-docs"] ===
    "node scripts/check-seis-public-readiness-docs.mjs",
  "package.json must expose check:seis-public-readiness-docs"
);
ensure(
  packageJson.scripts?.["check:seis-public-readiness-status"] ===
    "node scripts/check-seis-public-readiness-status.mjs",
  "package.json must expose check:seis-public-readiness-status"
);
ensure(
  packageJson.scripts?.["check:seis-env-example"] ===
    "node scripts/check-seis-env-example.mjs",
  "package.json must expose check:seis-env-example"
);
ensure(
  packageJson.scripts?.["check:seis-brain-context-packs"] ===
    "node scripts/check-seis-brain-context-packs.mjs",
  "package.json must expose check:seis-brain-context-packs"
);

const combined = [
  JSON.stringify(matrix),
  doc,
  publicReadiness,
  index
].join("\n");

const sensitivePatterns = [
  ["SSH private key", /BEGIN (OPENSSH|RSA|EC) PRIVATE KEY/],
  ["GitHub token", /ghp_|github_pat_/],
  ["OpenAI key value", /OPENAI_API_KEY=.+/],
  ["Anthropic key value", /ANTHROPIC_API_KEY=.+/],
  ["Gemini key value", /GEMINI_API_KEY=.+/],
  ["Private key value", /PRIVATE_KEY=.+/],
  ["AWS secret key", /AWS_SECRET_ACCESS_KEY=.+/],
  ["Password value", /password=.+/i],
  ["Token value", /token=.+/i]
];

for (const [label, pattern] of sensitivePatterns) {
  ensure(!pattern.test(combined), `public readiness status must not include ${label}`);
}

if (failures.length > 0) {
  console.error("SEIS public readiness status check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS public readiness status check passed.");
