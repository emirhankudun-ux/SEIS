#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const shouldWrite = Boolean(args.write);
const shouldCheck = Boolean(args.check);

const paths = {
  workflow: ".github/workflows/security-guardian.yml",
  nextQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  outputJson:
    typeof args.output === "string"
      ? args.output
      : "reports/seis-public-demo/security-gate-redacted-latest.json",
  outputMarkdown:
    typeof args.markdown === "string"
      ? args.markdown
      : "reports/seis-public-demo/security-gate-redacted-latest.md"
};

const failures = [];
const workflowText = readText(paths.workflow, "security workflow");
const nextQueueText = readText(paths.nextQueue, "next PR queue");
const report = buildReport(new Date().toISOString());

validateReport(report, "generated security gate report");
validateSourceDocs();

if (shouldWrite) {
  writeJson(paths.outputJson, report);
  writeText(paths.outputMarkdown, renderMarkdown(report));
}

if (shouldCheck) {
  ensureFile(paths.outputJson, "security gate JSON artifact");
  ensureFile(paths.outputMarkdown, "security gate Markdown artifact");
  const existingJson = readJson(paths.outputJson, "security gate JSON artifact");
  const existingMarkdown = readText(paths.outputMarkdown, "security gate Markdown artifact");
  if (existingJson) validateReport(existingJson, "existing security gate report");
  for (const phrase of [
    "SEIS Public Demo Security Gate Redacted Evidence",
    "NO-GO-security-history-remediation-needed",
    "Current-tree scan: clean-redacted-no-git",
    "Full-history scan: blocked-redacted-findings",
    "Raw secret values stored: false",
    "Do not blanket-allowlist"
  ]) {
    ensure(existingMarkdown.includes(phrase), `Markdown artifact missing phrase: ${phrase}.`);
  }
}

if (failures.length > 0) {
  console.error("SEIS public demo security gate report check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (shouldWrite) {
  console.log(`Wrote ${paths.outputJson}`);
  console.log(`Wrote ${paths.outputMarkdown}`);
} else if (shouldCheck) {
  console.log("SEIS public demo security gate report check passed.");
} else {
  console.log(JSON.stringify(report, null, 2));
}

function buildReport(generatedAt) {
  return {
    id: "seis-public-demo-security-gate-redacted-pr104",
    title: "SEIS Public Demo Security Gate Redacted Evidence",
    generatedAt,
    status: "blocked-full-history-security-review",
    mode: "redacted-local-and-ci-evidence",
    decision: "NO-GO-security-history-remediation-needed",
    pullRequest: {
      number: 104,
      url: "https://github.com/emirhankudun-ux/SEIS/pull/104",
      branch: "codex/second-brain-readiness-agent-registry-20260701",
      base: "main"
    },
    activeGateImpacts: [
      {
        pullRequest: 104,
        url: "https://github.com/emirhankudun-ux/SEIS/pull/104",
        branch: "codex/second-brain-readiness-agent-registry-20260701",
        status: "blocked-by-full-history-secret-scan",
        failingGateNames: ["Secret & Vulnerability Scan", "Security Summary"],
        currentTreeScope: "clean-redacted-no-git",
        fullHistoryScope: "blocked-redacted-findings",
        mergeAllowed: false,
        releaseAllowed: false,
        requiresOwnerApproval: true
      },
      {
        pullRequest: 127,
        url: "https://github.com/emirhankudun-ux/SEIS/pull/127",
        branch: "codex/second-brain-agent-registry-roster-20260701-clean",
        status: "blocked-by-full-history-secret-scan",
        failingGateNames: ["Secret & Vulnerability Scan", "Security Summary"],
        currentTreeScope: "clean-redacted-no-git",
        fullHistoryScope: "blocked-redacted-findings",
        mergeAllowed: false,
        releaseAllowed: false,
        requiresOwnerApproval: true
      }
    ],
    relatedReleaseChecklist: "content/development/seis-public-demo-release-checklist-pr54.json",
    sourcePaths: {
      workflow: paths.workflow,
      nextQueue: paths.nextQueue,
      currentTreeFixture: "apps/web/test/scripts.test.js",
      historicalGeneratedBundle: "sources/github-unified-source/_generated/github-code-bundle.txt"
    },
    currentTreeSecretScan: {
      status: "clean-redacted-no-git",
      commandClass: "gitleaks detect --no-git --redact",
      findings: 0,
      rawSecretValuesStored: false,
      fullJobLogDownloaded: false,
      securityPolicyChanged: false,
      gitleaksAllowlistCommitted: false,
      remediation: "static i18n test fixture now uses the real weekly usage translation-key shape"
    },
    fullHistorySecretScan: {
      status: "blocked-redacted-findings",
      commandClass: "gitleaks detect --redact with full git history",
      totalFindings: 195,
      redacted: true,
      rawSecretValuesStored: false,
      fullJobLogDownloaded: false,
      findingsByRule: {
        "generic-api-key": 6,
        "curl-auth-header": 3,
        "sourcegraph-access-token": 185,
        "private-key": 1
      },
      findingsByPath: [
        {
          path: "sources/github-unified-source/_generated/github-code-bundle.txt",
          count: 194,
          category: "historical-generated-bundle"
        },
        {
          path: "apps/web/test/scripts.test.js",
          count: 1,
          category: "historical-static-test-fixture"
        }
      ],
      blockedCommitRefs: [
        {
          ref: "f3d385d",
          count: 194,
          category: "historical-generated-bundle"
        },
        {
          ref: "3126602",
          count: 1,
          category: "historical-static-test-fixture"
        }
      ]
    },
    requiredApprovalBeforeRemediation: [
      "history rewrite or affected path removal from repository history",
      "affected-secret rotation decision by repository owner",
      ".gitleaks.toml security-policy change",
      "reviewed security baseline for historical generated bundle findings",
      "merge or release after Security Summary passes"
    ],
    forbiddenRemediationWithoutApproval: [
      "printing raw finding values",
      "downloading or committing full CI job logs",
      "blanket-allowlisting the generated bundle",
      "weakening the Secret & Vulnerability Scan workflow",
      "force-pushing rewritten history"
    ],
    releaseImpact: {
      mergeAllowed: false,
      publicDemoReleaseAllowed: false,
      pagesPublicationAllowed: false,
      statusReason: "GitHub Secret & Vulnerability Scan and Security Summary remain failing until full-history remediation is approved and completed."
    },
    safetyBoundary: {
      rawSecretValuesStored: false,
      privateKeyBodyStored: false,
      fullSecurityLogStored: false,
      gitleaksPolicyChanged: false,
      historyRewritePerformed: false,
      forcePushPerformed: false,
      secretRotationPerformed: false,
      githubMutationPerformedByReport: false,
      providerCallsPerformed: false,
      sshExecuted: false,
      deploymentPerformed: false,
      releaseApprovalGranted: false
    }
  };
}

function validateReport(value, label) {
  ensure(value?.id === "seis-public-demo-security-gate-redacted-pr104", `${label} id mismatch.`);
  ensure(value?.status === "blocked-full-history-security-review", `${label} status mismatch.`);
  ensure(value?.mode === "redacted-local-and-ci-evidence", `${label} mode mismatch.`);
  ensure(value?.decision === "NO-GO-security-history-remediation-needed", `${label} decision mismatch.`);
  ensure(value?.pullRequest?.number === 104, `${label} must bind PR #104.`);
  ensure(
    (value?.activeGateImpacts || []).some((item) => item.pullRequest === 127),
    `${label} must record PR #127 as an actively impacted gate.`
  );
  for (const impact of value?.activeGateImpacts || []) {
    ensure(impact.status === "blocked-by-full-history-secret-scan", `${label} active gate impact ${impact.pullRequest} status mismatch.`);
    ensureIncludes(impact.failingGateNames, "Secret & Vulnerability Scan", `${label} active gate impact ${impact.pullRequest} failing gates`);
    ensureIncludes(impact.failingGateNames, "Security Summary", `${label} active gate impact ${impact.pullRequest} failing gates`);
    ensure(impact.currentTreeScope === "clean-redacted-no-git", `${label} active gate impact ${impact.pullRequest} current tree scope mismatch.`);
    ensure(impact.fullHistoryScope === "blocked-redacted-findings", `${label} active gate impact ${impact.pullRequest} full history scope mismatch.`);
    ensure(impact.mergeAllowed === false, `${label} active gate impact ${impact.pullRequest} must block merge.`);
    ensure(impact.releaseAllowed === false, `${label} active gate impact ${impact.pullRequest} must block release.`);
    ensure(impact.requiresOwnerApproval === true, `${label} active gate impact ${impact.pullRequest} must require owner approval.`);
  }
  ensure(value?.currentTreeSecretScan?.status === "clean-redacted-no-git", `${label} must record current-tree clean scan.`);
  ensure(value?.currentTreeSecretScan?.findings === 0, `${label} current-tree findings must be zero.`);
  ensure(value?.currentTreeSecretScan?.rawSecretValuesStored === false, `${label} must not store raw current-tree finding values.`);
  ensure(value?.currentTreeSecretScan?.securityPolicyChanged === false, `${label} must not claim security policy change.`);
  ensure(value?.currentTreeSecretScan?.gitleaksAllowlistCommitted === false, `${label} must not commit a gitleaks allowlist.`);
  ensure(value?.fullHistorySecretScan?.status === "blocked-redacted-findings", `${label} must keep full-history blocker visible.`);
  ensure(value?.fullHistorySecretScan?.totalFindings >= 1, `${label} must include full-history finding count.`);
  ensure(value?.fullHistorySecretScan?.redacted === true, `${label} full-history scan must be redacted.`);
  ensure(value?.fullHistorySecretScan?.rawSecretValuesStored === false, `${label} must not store raw historical finding values.`);
  ensure(value?.fullHistorySecretScan?.fullJobLogDownloaded === false, `${label} must not store full job logs.`);
  ensure(
    (value?.fullHistorySecretScan?.findingsByPath || []).some((item) =>
      item.path === "sources/github-unified-source/_generated/github-code-bundle.txt"
    ),
    `${label} must identify the historical generated bundle path.`
  );
  ensure(
    (value?.fullHistorySecretScan?.blockedCommitRefs || []).some((item) =>
      item.ref === "f3d385d"
    ),
    `${label} must identify the generated-bundle historical commit prefix.`
  );
  for (const required of [
    "history rewrite or affected path removal from repository history",
    "affected-secret rotation decision by repository owner",
    ".gitleaks.toml security-policy change",
    "reviewed security baseline for historical generated bundle findings"
  ]) {
    ensureIncludes(value?.requiredApprovalBeforeRemediation, required, `${label} approval requirements`);
  }
  for (const forbidden of [
    "printing raw finding values",
    "downloading or committing full CI job logs",
    "blanket-allowlisting the generated bundle",
    "weakening the Secret & Vulnerability Scan workflow"
  ]) {
    ensureIncludes(value?.forbiddenRemediationWithoutApproval, forbidden, `${label} forbidden remediation`);
  }
  for (const [key, expected] of [
    ["rawSecretValuesStored", false],
    ["privateKeyBodyStored", false],
    ["fullSecurityLogStored", false],
    ["gitleaksPolicyChanged", false],
    ["historyRewritePerformed", false],
    ["forcePushPerformed", false],
    ["secretRotationPerformed", false],
    ["githubMutationPerformedByReport", false],
    ["providerCallsPerformed", false],
    ["sshExecuted", false],
    ["deploymentPerformed", false],
    ["releaseApprovalGranted", false]
  ]) {
    ensure(value?.safetyBoundary?.[key] === expected, `${label} safety boundary ${key} must be ${expected}.`);
  }
  ensure(!JSON.stringify(value).includes("REDACTED"), `${label} must store categories, not redacted value placeholders.`);
  validateNoCredentialPatterns(JSON.stringify(value), label);
}

function validateSourceDocs() {
  for (const phrase of ["fetch-depth: 0", "gitleaks detect", "--redact"]) {
    ensure(workflowText.includes(phrase), `security workflow missing phrase: ${phrase}`);
  }
  for (const phrase of ["PR #104 security scan remediation", "do not print values", "Do not blanket-allowlist"]) {
    ensure(nextQueueText.toLowerCase().includes(phrase.toLowerCase()), `NEXT_PR_QUEUE missing phrase: ${phrase}`);
  }
}

function renderMarkdown(value) {
  const ruleRows = Object.entries(value.fullHistorySecretScan.findingsByRule)
    .map(([rule, count]) => `| ${rule} | ${count} |`)
    .join("\n");
  const pathRows = value.fullHistorySecretScan.findingsByPath
    .map((item) => `| ${item.path} | ${item.count} | ${item.category} |`)
    .join("\n");
  const approval = value.requiredApprovalBeforeRemediation.map((item) => `- ${item}`).join("\n");
  const forbidden = value.forbiddenRemediationWithoutApproval.map((item) => `- ${item}`).join("\n");
  const activeImpacts = value.activeGateImpacts
    .map(
      (item) =>
        `| PR #${item.pullRequest} | ${item.branch} | ${item.status} | ${item.failingGateNames.join(", ")} | ${item.mergeAllowed} | ${item.releaseAllowed} |`
    )
    .join("\n");

  return `# SEIS Public Demo Security Gate Redacted Evidence

Generated: ${value.generatedAt}
Status: ${value.status}
Mode: ${value.mode}
Decision: ${value.decision}
PR: ${value.pullRequest.url}

This artifact stores only redacted categories, paths, counts, and approval
requirements. Raw secret values stored: ${value.safetyBoundary.rawSecretValuesStored}.

## Active Gate Impacts

| PR | Branch | Status | Failing gates | Merge allowed | Release allowed |
| --- | --- | --- | --- | --- | --- |
${activeImpacts}

## Current Tree

Current-tree scan: ${value.currentTreeSecretScan.status}
Findings: ${value.currentTreeSecretScan.findings}
Security policy changed: ${value.currentTreeSecretScan.securityPolicyChanged}
Gitleaks allowlist committed: ${value.currentTreeSecretScan.gitleaksAllowlistCommitted}

## Full History

Full-history scan: ${value.fullHistorySecretScan.status}
Total redacted findings: ${value.fullHistorySecretScan.totalFindings}

| Rule | Count |
| --- | ---: |
${ruleRows}

| Path | Count | Category |
| --- | ---: | --- |
${pathRows}

## Approval Required

${approval}

## Forbidden Without Approval

${forbidden}

Do not blanket-allowlist the generated bundle, weaken security scanning, print
raw values, or rewrite history without explicit owner approval.
`.trimEnd() + "\n";
}

function parseArgs(values) {
  return values.reduce((acc, value, index) => {
    if (!value.startsWith("--")) return acc;
    const key = value.slice(2);
    const next = values[index + 1];
    acc[key] = next && !next.startsWith("--") ? next : true;
    return acc;
  }, {});
}

function writeJson(targetPath, value) {
  const absolutePath = safeOutputPath(targetPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(targetPath, value) {
  const absolutePath = safeOutputPath(targetPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function safeOutputPath(targetPath) {
  const absolutePath = path.resolve(root, targetPath);
  const relativePath = path.relative(root, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    failures.push(`refusing to write outside repository: ${targetPath}`);
    return path.join(root, "reports", "seis-public-demo", "security-gate-refused-output.json");
  }
  return absolutePath;
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function readText(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) return "";
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    failures.push(`unable to read ${label}: ${error.message}`);
    return "";
  }
}

function readJson(filePath, label) {
  const text = readText(filePath, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureIncludes(values, expected, label) {
  ensure(Array.isArray(values), `${label} must be an array.`);
  ensure(Array.isArray(values) && values.includes(expected), `${label} missing ${expected}.`);
}

function validateNoCredentialPatterns(text, label) {
  const patterns = [
    [/sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API key"],
    [/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private key block"],
    [/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i, "inline credential assignment"]
  ];
  for (const [pattern, description] of patterns) {
    ensure(!pattern.test(text), `${label} contains ${description}.`);
  }
}
