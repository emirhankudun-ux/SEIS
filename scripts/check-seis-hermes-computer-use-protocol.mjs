#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const paths = {
  protocol: "content/development/seis-hermes-computer-use-protocol.json",
  providerRegistry: "content/development/seis-ai-core-provider-registry.json",
  aiCliStack: "docs/development/ai-cli-stack.md",
  modelRouter: "docs/ai/model-router.md",
  w64Ledger: "reports/seis-ai-routing/w64-hermes-computer-use-ledger.md",
  docsIndex: "docs/INDEX.md",
  packageJson: "package.json",
};

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(abs(relativePath), label);
}

const protocol = readJson(paths.protocol, "Hermes Computer Use protocol");
const providerRegistry = readJson(paths.providerRegistry, "provider registry");
const aiCliStack = readText(paths.aiCliStack, "AI CLI stack docs");
const modelRouter = readText(paths.modelRouter, "model router docs");
const w64Ledger = readText(paths.w64Ledger, "W64 Hermes ledger");
const docsIndex = readText(paths.docsIndex, "docs index");
const packageJson = readJson(paths.packageJson, "package.json");
const publicSafeTexts = [
  [JSON.stringify(protocol ?? {}, null, 2), "Hermes Computer Use protocol"],
  [w64Ledger, "W64 Hermes ledger"],
  [aiCliStack, "AI CLI stack docs"],
  [docsIndex, "docs index"],
];
const userHomePathPattern = new RegExp("\\/" + "Users" + "\\/");
const privatePathPattern = new RegExp("\\/" + "private" + "\\/");
const rawProviderPrefixPattern = new RegExp("\\b" + ["x", "a", "i"].join("") + ":\\s*", "i");
const rawModelNamePattern = new RegExp("\\b" + ["gr", "ok"].join("") + "\\b", "i");
const openAIKeyAssignmentPattern = new RegExp(["OPENAI", "API", "KEY"].join("_") + "\\s*=", "i");
const anthropicKeyAssignmentPattern = new RegExp(["ANTHROPIC", "API", "KEY"].join("_") + "\\s*=", "i");
const privateKeyBlockPattern = new RegExp(
  "BEGIN (?:RSA |OPENSSH |EC )?" + ["PRIVATE", "KEY"].join(" "),
  "i"
);
const forbiddenPublicEvidencePatterns = [
  [userHomePathPattern, "local macOS user path"],
  [privatePathPattern, "private temp or local path"],
  [/\b20\d{6}_\d{6}_[a-z0-9]+\b/i, "raw timestamp session id"],
  [rawProviderPrefixPattern, "raw provider prefix"],
  [rawModelNamePattern, "raw model name"],
  [openAIKeyAssignmentPattern, "raw OpenAI key assignment"],
  [anthropicKeyAssignmentPattern, "raw Anthropic key assignment"],
  [privateKeyBlockPattern, "private key block"],
];
const mutationCommandPatterns = [
  [/\bssh\s+(?:[-\w]+@|-[A-Za-z])/i, "SSH command"],
  [/\bscp\s+(?:[-\w./]+@|-[A-Za-z])/i, "SCP command"],
  [/\brsync\s+(?:[-\w./]+@|-[A-Za-z])/i, "rsync command"],
  [/\bgit\s+push\b/i, "git push command"],
  [/\bgh\s+pr\s+(create|merge|close|reopen|edit)\b/i, "GitHub PR mutation command"],
  [/\bgh\s+release\s+(create|delete|edit|upload)\b/i, "GitHub release mutation command"],
  [/\b(vercel|wrangler|firebase)\s+deploy\b/i, "deploy command"],
];
const mutationScanTexts = [
  [w64Ledger, "W64 Hermes ledger"],
  [aiCliStack, "AI CLI stack docs"],
  [docsIndex, "docs index"],
];

if (protocol) {
  ensure(protocol.id === "seis-hermes-computer-use-protocol", "protocol id mismatch");
  ensure(protocol.status === "documented-protocol", "protocol status must be documented-protocol");
  ensure(protocol.qualityGate === "npm run check:seis-hermes-computer-use-protocol", "quality gate mismatch");
  ensure(protocol.appBinding?.bundleIdentifier === "com.nousresearch.hermes", "Hermes bundle id mismatch");
  ensure(protocol.appBinding?.observedWorkspace === "canonical-seis-repo-visible", "observed workspace must be public-safe context, not a local path");
  ensure(protocol.appBinding?.observedBranch === "feature-branch-visible", "observed branch must be public-safe context");
  ensure(protocol.appBinding?.rawLocalPathRecorded === false, "raw local paths must not be recorded");
  ensure(protocol.truthBoundary?.includes("does not read credentials"), "truthBoundary must forbid credential reads");
  ensure(protocol.truthBoundary?.includes("call providers directly"), "truthBoundary must forbid direct provider calls");
  ensure(protocol.truthBoundary?.includes("claim model execution success"), "truthBoundary must block model execution success claims");

  ensureArrayIncludesAll(protocol.allowedPromptClasses, [
    "public-safe-policy-review",
    "repo-only-ledger-review",
    "read-only-boundary-check",
  ], "allowedPromptClasses");
  ensureArrayIncludesAll(protocol.forbiddenPromptContent, [
    "credentials",
    "tokens",
    "private keys",
    "unredacted provider errors",
    "deployment commands",
    "SSH commands",
  ], "forbiddenPromptContent");

  ensureArrayIncludesAll(protocol.submitProtocol?.requiredPreflight, [
    "Call Computer Use get_app_state before interaction.",
    "Use a tiny public-safe prompt whose requested output is bounded.",
  ], "submitProtocol.requiredPreflight");
  ensureArrayIncludesAll(protocol.submitProtocol?.preferredInputPath, [
    "Use Computer Use type_text so the app's input state updates.",
    "Confirm the submit control is exposed as Send.",
    "Click the Send control by accessibility element index when available.",
    "Record that a session route exists if the URL changes, but redact the raw session id from repo evidence.",
  ], "submitProtocol.preferredInputPath");
  ensureArrayIncludesAll(protocol.submitProtocol?.avoidPaths, [
    "Do not rely on set_value alone when the Send button does not appear.",
    "Do not click Start voice conversation as a send substitute.",
  ], "submitProtocol.avoidPaths");
  ensureArrayIncludesAll(protocol.submitProtocol?.knownHermesAmbiguities, [
    "set_value may populate the text field visually without enabling Send.",
    "A submitted session can exist without any visible model answer; this is not usable model-output evidence.",
  ], "submitProtocol.knownHermesAmbiguities");

  ensure(protocol.fallbackPolicy?.providerRegistry === paths.providerRegistry, "fallbackPolicy must point to provider registry");
  ensure(protocol.fallbackPolicy?.mode === "local-first-when-adequate", "fallbackPolicy mode mismatch");
  ensureArrayIncludesAll(protocol.fallbackPolicy?.eligibleOnlyWhen, [
    "installed",
    "credentialed",
    "quotaReady",
    "ownerApproved",
    "verified",
    "not blocked",
  ], "fallbackPolicy.eligibleOnlyWhen");
  ensure(protocol.fallbackPolicy?.rateLimitHandling?.includes("Never pretend the fallback provider is the original provider."), "fallbackPolicy must forbid hidden provider substitution");

  ensureArrayIncludesAll(protocol.requiredLedgerFields, [
    "ownerSignal",
    "workspaceContext",
    "branchContext",
    "sessionIdRedacted",
    "visibleSelectedModelRedacted",
    "visibleSelectedModelClass",
    "promptClass",
    "promptTextPublicSafe",
    "secretsRequested",
    "providerCallsClaimed",
    "liveExecutionClaim",
    "responseVisible",
    "repoEvidenceUsed",
    "uiAmbiguities",
  ], "requiredLedgerFields");

  const observedRuns = Array.isArray(protocol.observedRuns) ? protocol.observedRuns : [];
  ensure(observedRuns.length > 0, "observedRuns must include at least one Hermes run");
  const w64 = observedRuns.find((run) => run.id === "w64-hermes-provider-routing-review");
  ensure(w64?.sessionIdRedacted === true, "W64 observed run must redact the session id");
  ensure(w64?.visibleSelectedModelRedacted === true, "W64 observed run must redact the visible selected model");
  ensure(w64?.visibleSelectedModelClass === "external-provider-ui-label-redacted", "W64 observed run must keep only a selected-model class");
  ensure(w64?.promptSubmitted === "ui-submit-observed", "W64 observed run must record UI submit observation only");
  ensure(w64?.responseVisible === false, "W64 observed run must record no visible response");
  ensure(w64?.secretsRequested === false, "W64 observed run must record no secrets");
  ensure(w64?.providerCallsClaimed === false, "W64 observed run must not claim provider calls");
  ensure(w64?.liveExecutionClaim === "none", "W64 observed run must not claim live execution");
  ensure(w64?.repoEvidenceUsed === "ui-submit-ledger-only-no-model-output", "W64 observed run must use ledger-only evidence without model output");
  ensure(w64?.rawLocalPathRecorded === false, "W64 observed run must not record raw local paths");
  ensure(w64?.rawSessionIdRecorded === false, "W64 observed run must not record raw session ids");
  ensure(w64?.exactModelNameRecorded === false, "W64 observed run must not record exact model names");
  ensure(w64?.ledger === paths.w64Ledger, "W64 observed run ledger path mismatch");
  ensureArrayIncludesAll(w64?.uiAmbiguities, [
    "voice-control-click-produced-microphone-notification",
    "set-value-did-not-enable-send",
    "type-text-enabled-send",
    "no-response-visible-after-3m20s",
  ], "W64 uiAmbiguities");

  ensure(protocol.publicSafety?.rawLocalPathsAllowed === false, "publicSafety must forbid raw local paths");
  ensure(protocol.publicSafety?.rawSessionIdsAllowed === false, "publicSafety must forbid raw session ids");
  ensure(protocol.publicSafety?.exactModelNamesAllowed === false, "publicSafety must forbid exact model names");
  ensure(protocol.publicSafety?.providerOutputAsEvidenceAllowed === false, "publicSafety must forbid provider output as evidence when no response is visible");
  ensure(protocol.publicSafety?.secretValuesAllowed === false, "publicSafety must forbid secret values");
}

ensure(providerRegistry?.routingPriority?.mode === "local-first-when-adequate", "provider registry must keep local-first routing priority");
ensure(providerRegistry?.sourceOfTruth?.hermesComputerUseProtocol === paths.protocol, "provider registry must link the Hermes protocol");
ensureArrayIncludesAll(providerRegistry?.providerReadinessAxes?.map((axis) => axis.axis), [
  "installed",
  "credentialed",
  "quotaReady",
  "ownerApproved",
  "verified",
  "blocked",
], "provider registry readiness axes");
ensure(providerRegistry?.truthBoundary?.includes("no live provider calls"), "provider registry must forbid live provider calls for this evidence layer");
ensure(providerRegistry?.truthBoundary?.includes("no SSH checks"), "provider registry must forbid SSH checks for this evidence layer");
ensure(providerRegistry?.truthBoundary?.includes("no deployment"), "provider registry must forbid deployment for this evidence layer");
ensure(providerRegistry?.truthBoundary?.includes("no GitHub mutation"), "provider registry must forbid GitHub mutation for this evidence layer");

for (const [text, label] of [
  [aiCliStack, "AI CLI stack docs"],
  [modelRouter, "model router docs"],
]) {
  ensure(text.includes("local-first"), `${label} must mention local-first fallback`);
  ensure(text.includes("Rate Limited"), `${label} must mention Rate Limited handling`);
}

ensure(aiCliStack.includes(paths.protocol), "AI CLI stack docs must link the Hermes protocol");
ensure(aiCliStack.includes("provider-call claims"), "AI CLI stack docs must mention provider-call claim boundary");
ensure(docsIndex.includes(paths.protocol), "docs index must link the Hermes protocol");
ensure(docsIndex.includes(paths.w64Ledger), "docs index must link the W64 Hermes ledger");
ensure(protocol?.sourceOfTruth?.aiCliStack === paths.aiCliStack, "protocol must link AI CLI stack docs");
ensure(protocol?.sourceOfTruth?.modelRouter === paths.modelRouter, "protocol must link model router docs");
ensure(protocol?.sourceOfTruth?.providerRegistry === paths.providerRegistry, "protocol must link provider registry");
ensure(protocol?.sourceOfTruth?.w64HermesLedger === paths.w64Ledger, "protocol must link W64 Hermes ledger");

ensure(w64Ledger.includes("Session id: redacted"), "W64 ledger must redact the session id");
ensure(w64Ledger.includes("Visible selected model: redacted"), "W64 ledger must redact the selected model");
ensure(w64Ledger.includes("raw local path is"), "W64 ledger must explain local path redaction");
ensure(w64Ledger.includes("Live execution claim: none"), "W64 ledger must not claim live execution");
ensure(w64Ledger.includes("No Hermes answer was visible"), "W64 ledger must record no visible answer");
ensure(w64Ledger.includes("Provider calls: not claimed"), "W64 ledger must record no provider-call claim");

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-hermes-computer-use-protocol"] === "node scripts/check-seis-hermes-computer-use-protocol.mjs",
    "package.json must expose check:seis-hermes-computer-use-protocol"
  );
  ensure(
    packageJson.scripts?.["quality:governance"]?.includes("npm run check:seis-hermes-computer-use-protocol"),
    "quality:governance must include check:seis-hermes-computer-use-protocol"
  );
}

for (const [text, label] of publicSafeTexts) {
  for (const [pattern, description] of forbiddenPublicEvidencePatterns) {
    ensure(!pattern.test(text), `${label} must not include ${description}`);
  }
}

for (const [text, label] of mutationScanTexts) {
  for (const [pattern, description] of mutationCommandPatterns) {
    ensure(!pattern.test(text), `${label} must not include a runnable ${description}`);
  }
}

if (failures.length) {
  console.error("SEIS Hermes Computer Use protocol check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Hermes Computer Use protocol check passed.");

function abs(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}`);
  }
}

function readJson(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}
