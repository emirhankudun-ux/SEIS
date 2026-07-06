#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const manifestPath = "content/development/seis-official-vendor-mcp-integration-candidates.json";
const docPath = "docs/platform/seis-official-vendor-mcp-integration-candidates.md";
const riskMatrixPath = "content/development/seis-mcp-permission-risk-matrix.json";

const requiredCandidateIds = [
  "github-mcp-server",
  "openai-connectors-mcp",
  "google-workspace-mcp",
  "cloudflare-mcp-servers",
  "vercel-mcp",
  "sentry-mcp",
  "atlassian-rovo-mcp",
  "notion-mcp",
  "stripe-mcp",
  "supabase-mcp",
  "microsoft-mcp-family",
  "linear-mcp"
];

const allowedOfficialDomains = [
  "github.com",
  "developers.openai.com",
  "developers.google.com",
  "developers.cloudflare.com",
  "vercel.com",
  "docs.sentry.io",
  "support.atlassian.com",
  "www.atlassian.com",
  "developers.notion.com",
  "docs.stripe.com",
  "supabase.com",
  "learn.microsoft.com"
];

const requiredEvidenceMarkers = [
  "owner approval",
  "redacted"
];

function fail(message) {
  failures.push(message);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function readText(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`Missing file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function ensureIncludesAll(actual, expected, label) {
  const actualSet = new Set(actual);
  for (const item of expected) {
    ensure(actualSet.has(item), `${label} missing ${item}`);
  }
}

function hostnameFor(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function textContainsSecretLikeValue(text, label) {
  ensure(!/\/Users\/[A-Za-z0-9._ -]+/.test(text), `${label} must not contain machine-local /Users paths.`);
  ensure(!/(^|[\s"'])~\/[A-Za-z0-9._/-]+/m.test(text), `${label} must not contain home-directory shorthand paths.`);
  ensure(!/(sk-[A-Za-z0-9_-]{16,}|BEGIN [A-Z ]*PRIVATE KEY)/.test(text), `${label} must not contain secret-like provider keys or private key markers.`);
  ensure(!/(ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})/.test(text), `${label} must not contain GitHub token-shaped values.`);
  ensure(!/(AKIA[0-9A-Z]{16})/.test(text), `${label} must not contain AWS access-key-shaped values.`);
}

const manifestText = readText(manifestPath);
const docText = readText(docPath);
const manifest = readJson(manifestPath);
const riskMatrix = readJson(riskMatrixPath);

textContainsSecretLikeValue(manifestText, "Official vendor MCP manifest");
textContainsSecretLikeValue(docText, "Official vendor MCP doc");

if (manifest) {
  ensure(manifest.id === "seis-official-vendor-mcp-integration-candidates", "Manifest id must be stable.");
  ensure(manifest.status === "research-public-safe", "Manifest status must be research-public-safe.");
  ensure(manifest.visibility === "public-safe", "Manifest visibility must be public-safe.");
  ensure(manifest.sourceOfTruth?.constitution === "AGENTS.md", "Manifest must cite AGENTS.md.");
  ensure(manifest.sourceOfTruth?.mcpRiskMatrix === riskMatrixPath, "Manifest must cite the MCP risk matrix.");
  ensure(manifest.sourceOfTruth?.platformDoc === docPath, "Manifest must cite its platform doc.");

  const boundary = manifest.truthBoundary ?? {};
  ensure(boundary.installationPerformed === false, "Manifest must not claim installation happened.");
  ensure(boundary.runtimeActivationPerformed === false, "Manifest must not claim runtime activation happened.");
  ensure(boundary.credentialsStored === false, "Manifest must not store credentials.");
  ensure(boundary.providerCallsPerformed === false, "Manifest must not claim provider calls.");
  ensure(boundary.externalMutationPerformed === false, "Manifest must not claim external mutation.");
  ensure(boundary.demoModeRemainsNoKey === true, "Manifest must keep demo mode no-key.");
  ensure(boundary.liveReadinessClaimAllowed === false, "Manifest must block live readiness claims.");
  ensure(boundary.packageRunnerDefault === "disabled-or-approval-gated", "Manifest must keep package runners disabled or approval-gated.");
  ensure(boundary.activationDefault === "document-only-until-owner-approval", "Manifest must keep activation document-only.");

  const policy = manifest.activationPolicy ?? {};
  ensure(policy.defaultMode === "document-only-until-owner-approval", "Activation default mode must be document-only.");
  ensure(policy.installationAllowedByThisManifest === false, "Manifest must not allow installation by itself.");
  ensure(policy.runtimeEnabledByThisManifest === false, "Manifest must not enable runtime by itself.");
  ensure(policy.blanketActivationAllowed === false, "Manifest must block blanket activation.");
  const approvalRequirements = asArray(policy.approvalRequirements).join(" ").toLowerCase();
  for (const marker of ["owner approval", "least-privilege", "credential isolation", "dry-run", "rollback", "redacted"]) {
    ensure(approvalRequirements.includes(marker), `Activation policy must include ${marker}.`);
  }

  const candidates = asArray(manifest.candidates);
  ensure(candidates.length >= requiredCandidateIds.length, "Manifest must include the required official vendor candidate set.");
  ensureIncludesAll(candidates.map((candidate) => candidate.id), requiredCandidateIds, "candidates");

  for (const candidate of candidates) {
    ensure(typeof candidate.vendor === "string" && candidate.vendor.length > 0, `${candidate.id} must declare vendor.`);
    ensure(typeof candidate.productName === "string" && candidate.productName.length > 0, `${candidate.id} must declare productName.`);
    ensure(candidate.runtimeState === "not-installed-by-this-manifest", `${candidate.id} must not be installed by this manifest.`);
    ensure(candidate.activationState === "not-enabled", `${candidate.id} must not be enabled.`);
    ensure(candidate.packageRunnerDefault === "disabled", `${candidate.id} package runner must default disabled.`);
    ensure(candidate.installPolicy.includes("approval") || candidate.installPolicy.includes("blocked"), `${candidate.id} install policy must be approval-gated or blocked.`);
    ensure(candidate.allowedMode.includes("document-only") || candidate.allowedMode === "do-not-install", `${candidate.id} allowed mode must be document-only or do-not-install.`);
    ensure(asArray(candidate.permissions).length > 0, `${candidate.id} must declare permissions.`);
    ensure(asArray(candidate.requiredEvidence).length >= 5, `${candidate.id} must include required evidence.`);

    const evidenceText = asArray(candidate.requiredEvidence).join(" ").toLowerCase();
    for (const marker of requiredEvidenceMarkers) {
      ensure(evidenceText.includes(marker), `${candidate.id} evidence must include ${marker}.`);
    }

    if (candidate.officialStatus !== "no-official-server-found") {
      ensure(asArray(candidate.sourceUrls).length > 0, `${candidate.id} must include official source URL(s).`);
      for (const sourceUrl of asArray(candidate.sourceUrls)) {
        const hostname = hostnameFor(sourceUrl);
        ensure(allowedOfficialDomains.includes(hostname), `${candidate.id} uses non-allowed source domain: ${sourceUrl}`);
      }
    }
  }

  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  ensure(byId.get("github-mcp-server")?.recommendedPriority === "P0", "GitHub must be P0.");
  ensure(byId.get("openai-connectors-mcp")?.recommendedPriority === "P0", "OpenAI must be P0.");
  ensure(byId.get("stripe-mcp")?.riskLevel === "very-high", "Stripe risk must be very-high.");
  ensure(byId.get("stripe-mcp")?.installPolicy === "sandbox-only-approval-gated", "Stripe must be sandbox-only approval-gated.");
  ensure(byId.get("linear-mcp")?.officialStatus === "no-official-server-found", "Linear must remain no-official-server-found.");
  ensure(byId.get("linear-mcp")?.allowedMode === "do-not-install", "Linear must stay do-not-install.");

  const gates = asArray(manifest.qualityGates);
  ensure(gates.length >= 8, "Manifest must include practical quality gates.");
  ensure(gates.some((gate) => gate.includes("No blanket MCP activation")), "Quality gates must block blanket MCP activation.");
  ensure(gates.some((gate) => gate.includes("No installation or runtime enablement")), "Quality gates must block runtime enablement.");
  ensure(gates.some((gate) => gate.includes("No credentials")), "Quality gates must block credentials.");
  ensure(gates.some((gate) => gate.includes("Public demo remains no-key")), "Quality gates must keep public demo no-key.");
}

if (riskMatrix) {
  ensure(riskMatrix.activationPolicy?.noBlanketActivation === true, "Risk matrix must block blanket activation.");
  ensure(riskMatrix.activationPolicy?.credentialStorageAllowed === false, "Risk matrix must block credential storage.");
  ensure(riskMatrix.activationPolicy?.externalMutationRequiresUserConfirmation === true, "Risk matrix must require owner confirmation for external mutation.");
}

for (const requiredSnippet of [
  "No MCP in this document is installed",
  "content/development/seis-official-vendor-mcp-integration-candidates.json",
  "node scripts/check-seis-official-vendor-mcp-integration-candidates.mjs",
  "GitHub MCP Server",
  "OpenAI MCP tools/connectors",
  "Stripe MCP",
  "Do not install",
  "Do not install all candidates together"
]) {
  ensure(docText.includes(requiredSnippet), `Doc missing snippet: ${requiredSnippet}`);
}

if (failures.length > 0) {
  console.error("SEIS official vendor MCP integration candidates check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS official vendor MCP integration candidates check passed.");
