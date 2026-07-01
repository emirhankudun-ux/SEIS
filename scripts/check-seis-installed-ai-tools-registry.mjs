#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  registry: "content/development/seis-installed-ai-tools-registry.json",
  docs: "docs/ai/installed-ai-tools-registry.md",
  aiCore: "docs/ai/seis-ai-core.md",
  appleReadiness: "docs/apple/APPLE_PUBLIC_READINESS.md",
  swiftFoundation: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleFirstFoundation.swift",
  swiftToolingSnapshot: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisInstalledAIToolingSnapshot.swift",
  packageJson: "package.json"
};

for (const [label, filePath] of Object.entries(files)) {
  ensureFile(filePath, label);
}

const registry = readJson(files.registry, "installed AI tools registry");
const docs = readText(files.docs, "installed AI tools docs");
const aiCore = readText(files.aiCore, "AI Core docs");
const appleReadiness = readText(files.appleReadiness, "Apple readiness docs");
const swiftFoundation = readText(files.swiftFoundation, "Swift Apple-first foundation");
const swiftToolingSnapshot = readText(files.swiftToolingSnapshot, "Swift installed AI tooling snapshot");
const packageJson = readJson(files.packageJson, "package.json");

if (registry) {
  ensure(registry.id === "seis-installed-ai-tools-registry", "registry id mismatch");
  ensure(registry.status === "active-public-safe-registry", "registry status mismatch");
  ensure(registry.qualityGate === "npm run check:seis-installed-ai-tools-registry", "registry qualityGate mismatch");
  ensure(registry.truthBoundary?.noKeyCoreDemoRequired === true, "no-key core demo must remain required");
  ensure(registry.truthBoundary?.liveProviderClaimsAllowed === false, "live provider claims must be false");
  ensure(registry.truthBoundary?.credentialStorageAllowed === false, "credential storage must be false");
  ensure(registry.truthBoundary?.privateVaultContentAllowed === false, "private vault content must be false");
  ensure(registry.truthBoundary?.sshExecutionAllowed === false, "SSH execution must be false");
  ensure(registry.truthBoundary?.githubMutationAllowed === false, "GitHub mutation must be false");
  ensure(registry.truthBoundary?.singleWriterDefault === "codex", "single writer default must be codex");

  for (const status of ["available", "manual", "demo", "planned", "unknown"]) {
    ensure(registry.statusVocabulary?.includes(status), `status vocabulary missing: ${status}`);
  }

  ensure(Array.isArray(registry.tools) && registry.tools.length >= 11, "registry must include the SEIS AI tools bridge set");
  const tools = new Map((registry.tools || []).map((tool) => [tool.id, tool]));
  for (const id of [
    "codex-current-session",
    "xcode-seis-platform-swift",
    "claude-code-cli-auth-gated",
    "gemini-cli-auth-gated",
    "kimi-code-cli-login-required",
    "cursor-desktop-secondary-review",
    "lm-studio-local-model-lab",
    "openai-cli-auth-gated",
    "aider-cli-patch-helper",
    "goose-cli-automation-helper",
    "hermes-desktop-auth-gated"
  ]) {
    ensure(tools.has(id), `tool missing: ${id}`);
  }

  for (const [id, tool] of tools) {
    ensureNonEmptyString(tool.name, `${id}.name`);
    ensureNonEmptyString(tool.toolType, `${id}.toolType`);
    ensureNonEmptyString(tool.category, `${id}.category`);
    ensureNonEmptyString(tool.runtimeClass, `${id}.runtimeClass`);
    ensure(registry.statusVocabulary.includes(tool.status), `${id}.status must use registry vocabulary`);
    ensure(typeof tool.requiresAccount === "boolean", `${id}.requiresAccount must be boolean`);
    ensure(typeof tool.requiresApiKey === "boolean", `${id}.requiresApiKey must be boolean`);
    ensure(typeof tool.canWriteRepository === "boolean", `${id}.canWriteRepository must be boolean`);
    ensureArrayWithMinimum(tool.bestFor, 2, `${id}.bestFor`);
    ensureArrayWithMinimum(tool.limitations, 2, `${id}.limitations`);
    ensureArrayWithMinimum(tool.safetyNotes, 2, `${id}.safetyNotes`);
    ensureArrayWithMinimum(tool.relatedAgents, 1, `${id}.relatedAgents`);
    ensureArrayWithMinimum(tool.relatedModules, 1, `${id}.relatedModules`);
    ensureNonEmptyString(tool.publicPrivateRisk, `${id}.publicPrivateRisk`);
    ensureNonEmptyString(tool.recommendedContextPack, `${id}.recommendedContextPack`);
  }

  const codex = tools.get("codex-current-session");
  ensure(codex?.category === "primary-writer", "Codex must be primary writer");
  ensure(codex?.canWriteRepository === true, "Codex must be the only AI writer in this registry slice");

  const xcode = tools.get("xcode-seis-platform-swift");
  ensure(xcode?.status === "available", "Xcode must be marked available");
  ensure(xcode?.requiresApiKey === false, "Xcode must not require an API key");
  ensure(xcode?.canWriteRepository === true, "Xcode can write repository files and must be handoff-gated");
  ensure(String(xcode?.observedState || "").includes("packages/seis_platform_swift"), "Xcode observed state must point to Swift package");
  ensure(
    (xcode?.limitations || []).some((limitation) => String(limitation).includes("not build evidence")),
    "Xcode limitations must say presence is not build evidence"
  );

  const claude = tools.get("claude-code-cli-auth-gated");
  ensure(claude?.status === "available", "Claude Code CLI must be available after local login");
  ensure(claude?.requiresAccount === true, "Claude Code CLI must still require a local Claude account session");
  ensure(claude?.requiresApiKey === false, "Claude Code CLI should not require ANTHROPIC_API_KEY when local Claude auth is present");
  ensure(claude?.canWriteRepository === false, "Claude Code CLI must not write the repository by default");
  ensure(String(claude?.observedState || "").includes("loggedIn true"), "Claude observed state must record loggedIn true without personal account details");

  const hermes = tools.get("hermes-desktop-auth-gated");
  ensure(hermes?.status === "available", "Hermes must be available after local provider config is fixed");
  ensure(hermes?.requiresAccount === true, "Hermes must require account/auth");
  ensure(hermes?.requiresApiKey === false, "Hermes should not require a repository API key after local OpenAI Codex provider config");
  ensure(hermes?.canWriteRepository === false, "Hermes must not be a repository writer");
  ensure(String(hermes?.observedState || "").includes("HERMES_OK"), "Hermes observed state must record the verified HERMES_OK smoke");
  ensure(
    (hermes?.limitations || []).some((limitation) => String(limitation).includes("Nous Portal")),
    "Hermes limitations must keep the unresolved Nous Portal boundary"
  );
  ensure(
    (hermes?.safetyNotes || []).some((note) => String(note).includes("Never paste credentials")),
    "Hermes safety notes must forbid credentials"
  );

  for (const id of [
    "gemini-cli-auth-gated",
    "openai-cli-auth-gated",
    "aider-cli-patch-helper",
    "goose-cli-automation-helper"
  ]) {
    const tool = tools.get(id);
    ensure(tool?.status === "manual", `${id} must stay manual/auth-gated`);
    ensure(tool?.requiresAccount === true, `${id} must require an external account or auth setup`);
    ensure(tool?.requiresApiKey === true, `${id} must require external provider/auth setup`);
    ensure(tool?.canWriteRepository === false, `${id} must not write the repository by default`);
    ensure(String(tool?.publicPrivateRisk || "").includes("safe") || String(tool?.publicPrivateRisk || "").includes("gated"), `${id} must document public/private risk`);
  }

  const cursor = tools.get("cursor-desktop-secondary-review");
  ensure(cursor?.status === "available", "Cursor must be marked available when installed");
  ensure(cursor?.canWriteRepository === false, "Cursor must remain a secondary review surface");
  ensure(String(cursor?.observedState || "").includes("Cursor"), "Cursor observed state must describe the installed app");

  const kimi = tools.get("kimi-code-cli-login-required");
  ensure(kimi?.status === "manual", "Kimi must stay manual until login is configured");
  ensure(kimi?.requiresAccount === true, "Kimi must require Moonshot/Kimi account login");
  ensure(kimi?.requiresApiKey === false, "Kimi Code login route should not require an API key in the registry");
  ensure(kimi?.canWriteRepository === false, "Kimi must not write the repository by default");
  ensure(String(kimi?.observedState || "").includes("provider list is empty"), "Kimi observed state must record empty provider list");
  ensure(String(kimi?.observedState || "").includes("membership benefits"), "Kimi observed state must record the membership blocker");

  const lmStudio = tools.get("lm-studio-local-model-lab");
  ensure(lmStudio?.status === "available", "LM Studio must be marked available when installed");
  ensure(lmStudio?.requiresApiKey === false, "LM Studio must not require a provider API key");
  ensure(lmStudio?.canWriteRepository === false, "LM Studio must not write the repository");
  ensure(
    (lmStudio?.limitations || []).some((limitation) => String(limitation).includes("does not prove that any model is downloaded")),
    "LM Studio limitations must say installation is not model readiness"
  );

  for (const rule of [
    "Codex remains the only writer",
    "Xcode may be used to inspect and run the Swift package",
    "Claude and Hermes are available through local user auth/config",
    "bounded helper or review routes",
    "Hermes may receive only sanitized context",
    "No tool may receive provider keys",
    "API keys, desktop app state, local model caches",
    "Secondary tool output remains candidate evidence"
  ]) {
    ensure(registry.handoffRules?.some((candidate) => String(candidate).includes(rule)), `handoff rule missing: ${rule}`);
  }
}

if (docs) {
  for (const phrase of [
    "Installed AI Tools Registry",
    "seis-installed-ai-tools-registry.json",
    "npm run check:seis-installed-ai-tools-registry",
    "Codex",
    "Xcode",
    "Claude Code CLI",
    "Gemini CLI",
    "Kimi Code CLI",
    "Cursor",
    "LM Studio",
    "OpenAI CLI",
    "Aider",
    "Goose",
    "Hermes",
    "HERMES_OK",
    "Gemini Code Assist for individuals",
    "membership benefits",
    "Xcode presence is not build evidence",
    "Codex remains the only writer",
    "SEIS AI Tools Bridge",
    "metadata-first"
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (aiCore) {
  ensure(aiCore.includes("Installed AI tools registry"), "AI Core docs must mention Installed AI tools registry");
  ensure(aiCore.includes(files.registry), "AI Core docs must link registry JSON");
}

if (appleReadiness) {
  ensure(appleReadiness.includes("Hermes"), "Apple readiness docs must mention Hermes");
  ensure(appleReadiness.includes("Xcode 26.6"), "Apple readiness docs must mention observed Xcode version");
}

if (swiftFoundation) {
  for (const phrase of ["SEISLocalDevelopmentTool", "xcode-seis-platform-swift"]) {
    ensure(swiftFoundation.includes(phrase), `Swift foundation missing phrase: ${phrase}`);
  }
}

if (swiftToolingSnapshot) {
  for (const phrase of ["SEISInstalledAIToolSnapshot", "claude-code-cli-auth-gated", "hermes-desktop-auth-gated", "CLAUDE_OK", "HERMES_OK"]) {
    ensure(swiftToolingSnapshot.includes(phrase), `Swift tooling snapshot missing phrase: ${phrase}`);
  }
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-installed-ai-tools-registry"] === "node scripts/check-seis-installed-ai-tools-registry.mjs",
    "package.json must expose check:seis-installed-ai-tools-registry"
  );
}

validateNoSensitivePatterns(files.registry, registry);
validateNoSensitivePatterns(files.docs, docs);

finish("SEIS installed AI tools registry check passed.");

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
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}

function ensureNonEmptyString(candidate, label) {
  ensure(typeof candidate === "string" && candidate.trim().length > 0, `${label} must be a non-empty string`);
}

function ensureArrayWithMinimum(candidate, minimum, label) {
  ensure(Array.isArray(candidate) && candidate.length >= minimum, `${label} must include at least ${minimum} entries`);
}

function validateNoSensitivePatterns(relativePath, content) {
  const text = typeof content === "string" ? content : JSON.stringify(content || {});
  const patterns = [
    ["private key block", /BEGIN (OPENSSH|RSA|EC) PRIVATE KEY/],
    ["GitHub token", new RegExp("ghp" + "_|" + "github" + "_pat" + "_")],
    [
      "API key assignment",
      new RegExp(
        "(?:" +
          ["OPENAI", "ANTHROPIC", "GEMINI"].map((provider) => provider + "_API" + "_KEY").join("|") +
          "|" +
          "PRIVATE" +
          "_KEY" +
          "|" +
          "AWS" +
          "_SECRET" +
          "_ACCESS" +
          "_KEY" +
          ")="
      )
    ],
    ["password assignment", new RegExp("password" + "=", "i")],
    ["token assignment", new RegExp("token" + "=", "i")]
  ];
  for (const [label, pattern] of patterns) {
    ensure(!pattern.test(text), `${relativePath} contains sensitive pattern category: ${label}`);
  }
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS installed AI tools registry check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
