import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const targetsPath = "deploy/server-targets.json";
const packagePath = "dist/seis-static.zip";
const manifestPath = "dist/server-upload-manifest.json";
const packagedSourcePaths = [
  "apps/web",
  "content",
  "deploy/server-targets.json",
  "docs/deployment",
  "docs/governance",
  "docs/polyglot",
  "docs/reports",
  "docs/server",
  "docs/strategy",
  "packages/design-tokens/seis.tokens.css",
  "polyglot/contracts",
  "server/apache",
  "server/php"
];

const failures = [];

if (!existsSync(targetsPath)) failures.push(`missing ${targetsPath}`);
if (!existsSync(packagePath)) failures.push(`missing ${packagePath}`);
if (!existsSync(manifestPath)) failures.push(`missing ${manifestPath}`);

let targets = null;
let manifest = null;

if (existsSync(targetsPath)) {
  targets = JSON.parse(readFileSync(targetsPath, "utf8"));
}

if (existsSync(manifestPath)) {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
}

const confirmationFlow = targets?.confirmationFlow || {};
const confirmationQuestions = confirmationFlow.requiredQuestions || [];

if (targets && targets.requiresUserConfirmation !== true) {
  failures.push("server targets must require user confirmation before live upload");
}

if (targets && confirmationFlow.status !== "blocked_until_confirmed") {
  failures.push("server target confirmation flow must stay blocked_until_confirmed");
}

if (targets && confirmationQuestions.length < 4) {
  failures.push("server target confirmation flow must define at least four required questions");
}

for (const question of confirmationQuestions) {
  if (!question.id || !question.question || !Array.isArray(question.blocks) || question.blocks.length === 0) {
    failures.push("each server target confirmation question must define id, question, and blocked fields");
  }
}

if (existsSync(packagePath) && manifest) {
  const digest = createHash("sha256").update(readFileSync(packagePath)).digest("hex");
  if (digest !== manifest.sha256) {
    failures.push("server package sha256 does not match manifest");
  }
}

const sourceFreshness = getSourceFreshness(packagedSourcePaths, manifest?.generatedAt);
if (!sourceFreshness.ok) {
  failures.push(sourceFreshness.message);
}

const activeTarget = targets?.activeTarget || null;
if (activeTarget) {
  const candidate = (targets.candidates || []).find(item => item.id === activeTarget);
  const values = targets.targetConfig?.values || {};
  if (!candidate) {
    failures.push(`active target is not listed in candidates: ${activeTarget}`);
  } else {
    const missing = (candidate.requiredInput || []).filter(key => !values[key]);
    if (missing.length > 0) {
      failures.push(`active target missing configured values: ${missing.join(", ")}`);
    }
  }
}

if (failures.length > 0) {
  console.error("SEIS deploy readiness failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  activeTarget,
  packagePath,
  sha256: manifest?.sha256 || null,
  latestSourcePath: sourceFreshness.latestPath,
  liveUploadBlocked: !activeTarget,
  confirmationQuestions: confirmationQuestions.length
}, null, 2));

function getSourceFreshness(paths, generatedAt) {
  if (!generatedAt) {
    return {
      ok: false,
      latestPath: null,
      message: "server upload manifest must include generatedAt"
    };
  }

  const generatedTime = Date.parse(generatedAt);
  if (!Number.isFinite(generatedTime)) {
    return {
      ok: false,
      latestPath: null,
      message: "server upload manifest generatedAt must be a valid timestamp"
    };
  }

  const latest = paths
    .filter(path => existsSync(path))
    .map(path => getLatestModifiedSource(path))
    .reduce((current, candidate) => candidate.mtimeMs > current.mtimeMs ? candidate : current, {
      path: null,
      mtimeMs: 0
    });

  if (latest.path && latest.mtimeMs > generatedTime + 2_000) {
    return {
      ok: false,
      latestPath: latest.path,
      message: `server package is older than packaged source: ${latest.path}`
    };
  }

  return {
    ok: true,
    latestPath: latest.path,
    message: "server package is fresh"
  };
}

function getLatestModifiedSource(path) {
  const stat = statSync(path);

  if (!stat.isDirectory()) {
    return {
      path,
      mtimeMs: stat.mtimeMs
    };
  }

  return readdirSync(path)
    .filter(name => name !== ".DS_Store")
    .map(name => getLatestModifiedSource(join(path, name)))
    .reduce((current, candidate) => candidate.mtimeMs > current.mtimeMs ? candidate : current, {
      path,
      mtimeMs: stat.mtimeMs
    });
}
