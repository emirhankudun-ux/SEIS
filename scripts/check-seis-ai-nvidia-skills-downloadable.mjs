#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const failures = [];
const base = "packages/seis-ai/downloadable/nvidia-skills";

const files = {
  readme: path.join(base, "README.md"),
  manifest: path.join(base, "nvidia-skills-downloadable-manifest.json"),
  catalog: path.join(base, "skills.sh.json"),
  license: path.join(base, "LICENSE"),
  packageJson: "package.json",
  aiCore: "docs/ai/seis-ai-core.md",
  qa: "docs/reviews/NVIDIA_SKILLS_DOWNLOADABLE_CATALOG_QA.md"
};

const packageJson = readJson(files.packageJson, "package.json");
const aiCore = readText(files.aiCore, "AI Core docs");
const qa = readText(files.qa, "NVIDIA skills downloadable QA");
const payloadFiles = [files.readme, files.manifest, files.catalog, files.license];
const hasDownloadablePayload = payloadFiles.every((filePath) => fs.existsSync(path.join(root, filePath)));

ensureFile(files.packageJson, "package.json");
ensureFile(files.aiCore, "AI Core docs");
ensureFile(files.qa, "NVIDIA skills downloadable QA");

if (!hasDownloadablePayload) {
  validatePublicBoundary(packageJson, aiCore, qa);
  finish("SEIS AI NVIDIA skills downloadable catalog boundary check passed without local payload.");
  process.exit(0);
}

for (const [label, filePath] of Object.entries({
  readme: files.readme,
  manifest: files.manifest,
  catalog: files.catalog,
  license: files.license
})) {
  ensureFile(filePath, label);
}

const manifest = readJson(files.manifest, "NVIDIA skills downloadable manifest");
const catalog = readJson(files.catalog, "NVIDIA skills catalog");
const readme = readText(files.readme, "NVIDIA skills downloadable README");

if (manifest) {
  ensure(manifest.id === "seis-ai-downloadable-nvidia-skills", "manifest id mismatch");
  ensure(manifest.version === "2026.06.30", "manifest version mismatch");
  ensure(manifest.snapshotDate === "2026-06-30", "manifest snapshotDate mismatch");
  ensure(manifest.source?.site === "https://build.nvidia.com/skills", "manifest source site mismatch");
  ensure(manifest.source?.repository === "https://github.com/NVIDIA/skills", "manifest source repository mismatch");
  ensureNonEmptyString(manifest.source?.commit, "manifest source commit");
  ensure(manifest.scope?.target === base, "manifest target mismatch");
  ensure(manifest.scope?.mode === "downloadable-catalog-snapshot", "manifest mode mismatch");
  ensure(manifest.scope?.globalAgentInstallPerformed === false, "global agent install must be false");
  ensure(manifest.scope?.liveProviderCallsPerformed === false, "live provider calls must be false");
  ensure(manifest.scope?.modelDownloadsPerformed === false, "model downloads must be false");
  ensure(manifest.scope?.credentialsStored === false, "credentials stored must be false");
  ensure(manifest.scope?.fullSkillMdEmbedded === false, "full SKILL.md embedding must be false");

  ensure(manifest.counts?.groupings === 14, "manifest must record 14 groupings for this snapshot");
  ensure(manifest.counts?.groupedCatalogSkills === 225, "manifest must record 225 grouped catalog skills");
  ensure(manifest.counts?.downloadableSkillDirectories === 226, "manifest must record 226 downloadable skill directories");
  ensure(manifest.counts?.skillCardsCopied === 226, "manifest must record 226 copied skill cards");
  ensure(manifest.counts?.signaturesCopied === 226, "manifest must record 226 copied signatures");
  ensure(manifest.counts?.ungroupedSkillDirectories === 1, "manifest must record one ungrouped skill directory");

  ensureArrayWithMinimum(manifest.safetyBoundary, 4, "manifest safetyBoundary");
  for (const phrase of [
    "repository-contained downloadable catalog snapshot",
    "does not install NVIDIA skills",
    "does not include SKILL.md",
    "after human review"
  ]) {
    ensure(manifest.safetyBoundary.some((item) => String(item).includes(phrase)), `safety boundary missing: ${phrase}`);
  }

  ensure(Array.isArray(manifest.entries), "manifest entries must be an array");
  ensure(manifest.entries?.length === manifest.counts?.downloadableSkillDirectories, "entry count must match downloadableSkillDirectories");

  const ids = new Set();
  let copiedCards = 0;
  let copiedSignatures = 0;
  let ungrouped = 0;

  for (const entry of manifest.entries || []) {
    ensureNonEmptyString(entry.id, "entry.id");
    ensure(!ids.has(entry.id), `duplicate skill id: ${entry.id}`);
    ids.add(entry.id);
    ensureNonEmptyString(entry.group, `${entry.id}.group`);
    ensure(typeof entry.catalogGrouped === "boolean", `${entry.id}.catalogGrouped must be boolean`);
    ensure(entry.sourcePath === `skills/${entry.id}`, `${entry.id}.sourcePath mismatch`);
    ensure(entry.localSkillCard === `skill-cards/${entry.id}/skill-card.md`, `${entry.id}.localSkillCard mismatch`);
    ensure(entry.localSignature === `skill-cards/${entry.id}/skill.oms.sig`, `${entry.id}.localSignature mismatch`);
    ensure(entry.fullSkillEmbedded === false, `${entry.id}.fullSkillEmbedded must be false`);
    ensure(
      entry.installCommand === `npx skills add nvidia/skills --skill ${entry.id} --agent codex`,
      `${entry.id}.installCommand mismatch`
    );

    const skillDir = path.join(root, base, "skill-cards", entry.id);
    const skillMd = path.join(skillDir, "SKILL.md");
    ensure(!fs.existsSync(skillMd), `${entry.id} must not embed SKILL.md`);

    const cardPath = path.join(root, base, entry.localSkillCard);
    const signaturePath = path.join(root, base, entry.localSignature);
    ensureFile(path.join(base, entry.localSkillCard), `${entry.id} skill card`);
    ensureFile(path.join(base, entry.localSignature), `${entry.id} signature`);

    if (fs.existsSync(cardPath)) {
      copiedCards += 1;
      ensure(sha256(cardPath) === entry.cardSha256, `${entry.id}.cardSha256 mismatch`);
    }
    if (fs.existsSync(signaturePath)) {
      copiedSignatures += 1;
      ensure(sha256(signaturePath) === entry.signatureSha256, `${entry.id}.signatureSha256 mismatch`);
    }
    if (!entry.catalogGrouped) ungrouped += 1;
  }

  ensure(copiedCards === manifest.counts?.skillCardsCopied, "copied card count mismatch");
  ensure(copiedSignatures === manifest.counts?.signaturesCopied, "copied signature count mismatch");
  ensure(ungrouped === manifest.counts?.ungroupedSkillDirectories, "ungrouped count mismatch");
  ensure(ids.has("accelerated-computing-cudf"), "expected cuDF skill missing");
  ensure(ids.has("aiq-research"), "expected AIQ research skill missing");
  ensure(ids.has("omniverse-cad-to-simready"), "expected Omniverse skill missing");
  ensure(ids.has("vss-summarize-video"), "expected VSS skill missing");
  ensure(ids.has("cuopt-multi-objective-exploration"), "expected ungrouped cuOpt skill missing");
}

if (catalog) {
  ensure(catalog.$schema === "https://skills.sh/schemas/skills.sh.schema.json", "skills.sh schema mismatch");
  ensure(Array.isArray(catalog.groupings) && catalog.groupings.length === 14, "skills.sh must include 14 groupings");
  const groupedSkillIds = new Set(catalog.groupings.flatMap((group) => group.skills || []));
  ensure(groupedSkillIds.size === 225, "skills.sh grouped skill count mismatch");
  ensure(groupedSkillIds.has("aiq-deploy"), "skills.sh missing aiq-deploy");
  ensure(groupedSkillIds.has("vss-ask-video"), "skills.sh missing vss-ask-video");
}

if (readme) {
  for (const phrase of [
    "NVIDIA Skills Downloadable Catalog for SEIS AI",
    "downloadable snapshot",
    "not a live agent install",
    "No NVIDIA API key",
    "Full `SKILL.md` runtime instruction bodies",
    "npm run check:seis-ai-nvidia-skills-downloadable"
  ]) {
    ensure(readme.includes(phrase), `README missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-ai-nvidia-skills-downloadable"] ===
      "node scripts/check-seis-ai-nvidia-skills-downloadable.mjs",
    "package.json must expose check:seis-ai-nvidia-skills-downloadable"
  );
}

if (aiCore) {
  ensure(aiCore.includes("NVIDIA Skills downloadable catalog"), "AI Core docs must mention NVIDIA Skills downloadable catalog");
  ensure(aiCore.includes(files.manifest), "AI Core docs must link the NVIDIA downloadable manifest");
  ensure(aiCore.includes("npm run check:seis-ai-nvidia-skills-downloadable"), "AI Core docs must include the NVIDIA downloadable validator");
}

if (qa) {
  ensure(qa.includes("Local Payload State"), "QA must document the local ignored payload state");
  ensure(qa.includes("ignored by `.gitignore`"), "QA must document that the catalog payload is ignored");
  ensure(qa.includes("Clean Checkout Behavior"), "QA must document clean checkout behavior");
}

ensureNoDisallowedFiles(base);
validateNoSensitivePatterns(files.readme, readme);
validateNoSensitivePatterns(files.manifest, manifest);
validateNoSensitivePatterns(files.catalog, catalog);
validateNoSensitivePatterns(files.qa, qa);

finish("SEIS AI NVIDIA skills downloadable catalog check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    failures.push(`${label} missing: ${relativePath}`);
  }
}

function readJson(relativePath, label) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    failures.push(`${label} could not be parsed: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  try {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}

function ensureNonEmptyString(value, label) {
  ensure(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`);
}

function ensureArrayWithMinimum(value, minimum, label) {
  ensure(Array.isArray(value), `${label} must be an array`);
  ensure(Array.isArray(value) && value.length >= minimum, `${label} must include at least ${minimum} entries`);
}

function validatePublicBoundary(packageJson, aiCore, qa) {
  if (packageJson) {
    ensure(
      packageJson.scripts?.["check:seis-ai-nvidia-skills-downloadable"] ===
        "node scripts/check-seis-ai-nvidia-skills-downloadable.mjs",
      "package.json must expose check:seis-ai-nvidia-skills-downloadable"
    );
  }

  if (aiCore) {
    ensure(aiCore.includes("NVIDIA Skills downloadable catalog"), "AI Core docs must mention NVIDIA Skills downloadable catalog");
    ensure(aiCore.includes(files.manifest), "AI Core docs must link the NVIDIA downloadable manifest path");
    ensure(aiCore.includes("npm run check:seis-ai-nvidia-skills-downloadable"), "AI Core docs must include the NVIDIA downloadable validator");
  }

  if (qa) {
    ensure(qa.includes("Local Payload State"), "QA must document local payload state");
    ensure(qa.includes("ignored by `.gitignore`"), "QA must document ignored payload behavior");
    ensure(qa.includes("Clean Checkout Behavior"), "QA must document clean checkout behavior");
    ensure(qa.includes("not a live NVIDIA provider connection"), "QA must retain no-live-provider boundary");
  }

  validateNoSensitivePatterns(files.qa, qa);
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function ensureNoDisallowedFiles(relativeDir) {
  const dir = path.join(root, relativeDir);
  if (!fs.existsSync(dir)) return;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      const relativePath = path.relative(root, fullPath);
      if (entry.isDirectory()) {
        ensure(entry.name !== ".git", `downloadable catalog must not include git metadata: ${relativePath}`);
        ensure(entry.name !== "scripts", `downloadable catalog must not include runtime scripts: ${relativePath}`);
        ensure(entry.name !== "references", `downloadable catalog must not include full reference payloads: ${relativePath}`);
        ensure(entry.name !== "assets", `downloadable catalog must not include asset payloads: ${relativePath}`);
        stack.push(fullPath);
      } else {
        ensure(entry.name !== "SKILL.md", `downloadable catalog must not embed SKILL.md: ${relativePath}`);
        ensure(!entry.name.endsWith(".key"), `downloadable catalog must not include key files: ${relativePath}`);
        ensure(!entry.name.endsWith(".pem"), `downloadable catalog must not include pem files: ${relativePath}`);
      }
    }
  }
}

function validateNoSensitivePatterns(relativePath, value) {
  const text = typeof value === "string" ? value : JSON.stringify(value || {}, null, 2);
  const patterns = [
    [/BEGIN OPENSSH PRIVATE KEY/, "OpenSSH private key"],
    [/BEGIN RSA PRIVATE KEY/, "RSA private key"],
    [/BEGIN EC PRIVATE KEY/, "EC private key"],
    [/ghp_[A-Za-z0-9]{20,}/, "GitHub personal access token"],
    [/github_pat_[A-Za-z0-9_]{20,}/, "GitHub fine-grained token"],
    [/sk-[A-Za-z0-9]{20,}/, "OpenAI-style secret key"],
    [/OPENAI_API_KEY\s*=/, "OpenAI API key assignment"],
    [/ANTHROPIC_API_KEY\s*=/, "Anthropic API key assignment"],
    [/GEMINI_API_KEY\s*=/, "Gemini API key assignment"],
    [/PRIVATE_KEY\s*=/, "private key assignment"],
    [/AWS_SECRET_ACCESS_KEY\s*=/, "AWS secret access key assignment"]
  ];

  for (const [pattern, label] of patterns) {
    if (pattern.test(text)) failures.push(`${relativePath} contains potential ${label}`);
  }
}

function finish(message) {
  if (failures.length > 0) {
    console.error("SEIS AI NVIDIA skills downloadable catalog check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}
