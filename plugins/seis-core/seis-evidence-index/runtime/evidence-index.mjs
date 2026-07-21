import fs from "node:fs";
import path from "node:path";

export const EVIDENCE_INDEX_ID = "seis-evidence-index";
export const WAVE_EVIDENCE_PATH = "content/development/seis-public-plugin-wave-1-evidence-index.json";
export const WAVE_PROGRAM_PATH = "content/development/seis-public-plugin-wave-1-program.json";
export const MAX_INPUT_BYTES = 512 * 1024;

const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

export function auditEvidenceIndex(rootPath, options = {}) {
  const root = path.resolve(rootPath);
  const findings = [];
  const checks = [];
  const evidence = readJsonBounded(
    root,
    options.evidencePath || WAVE_EVIDENCE_PATH,
    findings,
    "wave-evidence-index"
  );
  const program = readJsonBounded(
    root,
    options.programPath || WAVE_PROGRAM_PATH,
    findings,
    "wave-program"
  );

  if (evidence) {
    addCheck(checks, findings, "wave-evidence-id", evidence.id === "seis-public-plugin-wave-1-evidence-index");
    addCheck(checks, findings, "wave-evidence-marketplace", evidence.marketplace?.name === "seis-repo" && evidence.marketplace?.displayName === "SEIS Repo");
    addCheck(
      checks,
      findings,
      "wave-evidence-public-count",
      Number.isInteger(evidence.marketplace?.publicCardCount)
        && evidence.marketplace.publicCardCount > 0
        && evidence.marketplace.publicCardCount === evidence.marketplace?.expectedCardCount
    );
    addCheck(
      checks,
      findings,
      "wave-evidence-app-count",
      Number.isInteger(evidence.marketplace?.applicationPluginCount)
        && evidence.marketplace.applicationPluginCount > 0
        && evidence.marketplace.applicationPluginCount === evidence.release?.appPluginCount
    );
    addCheck(
      checks,
      findings,
      "wave-evidence-contracts",
      Array.isArray(evidence.contracts)
        && evidence.contracts.length > 0
        && evidence.contracts.every((contract) => typeof contract?.id === "string" && typeof contract?.state === "string")
    );
  }

  if (program) {
    addCheck(checks, findings, "wave-program-id", program.id === "seis-public-plugin-wave-1-program");
    addCheck(checks, findings, "wave-program-progress", program.status === "in-progress" && Array.isArray(program.steps) && program.steps.length === 100);
  }

  const serializedInputs = [evidence, program].filter(Boolean).map((record) => JSON.stringify(record)).join("\n");
  if (serializedInputs && hasUnsafeInput(serializedInputs)) {
    findings.push({ severity: "error", code: "unsafe-input-content" });
  }

  return result({ evidence, program, checks, findings });
}

function result({ evidence, program, checks, findings }) {
  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  const contracts = Array.isArray(evidence?.contracts) ? evidence.contracts : [];
  const steps = Array.isArray(program?.steps) ? program.steps : [];
  const attentionContractIds = contracts
    .filter((contract) => contract?.state === "attention")
    .map((contract) => contract.id)
    .filter(Boolean)
    .sort();
  const inProgressStepNumbers = steps
    .filter((step) => step?.status === "in-progress" && Number.isInteger(step.number))
    .map((step) => step.number)
    .sort((left, right) => left - right);

  return {
    state: errorCount === 0 ? "ready" : "attention",
    ok: errorCount === 0,
    mode: "public-evidence-index-read-only",
    indexId: EVIDENCE_INDEX_ID,
    summary: {
      marketplaceName: evidence?.marketplace?.name === "seis-repo" ? "seis-repo" : null,
      marketplaceDisplayName: evidence?.marketplace?.displayName === "SEIS Repo" ? "SEIS Repo" : null,
      publicCardCount: numberOrNull(evidence?.marketplace?.publicCardCount),
      expectedCardCount: numberOrNull(evidence?.marketplace?.expectedCardCount),
      applicationPluginCount: numberOrNull(evidence?.marketplace?.applicationPluginCount),
      releaseLabel: stringOrNull(evidence?.release?.label),
      releaseSemver: stringOrNull(evidence?.release?.semver),
      recordedAttentionContractIds: attentionContractIds,
      completedWaveStepCount: steps.filter((step) => step?.status === "completed").length,
      inProgressWaveStepNumbers: inProgressStepNumbers,
    },
    checks,
    errorCount,
    warningCount: findings.filter((finding) => finding.severity === "warning").length,
    findings,
    permissions: {
      read: [WAVE_EVIDENCE_PATH, WAVE_PROGRAM_PATH],
      write: [],
      network: [],
      secrets: [],
    },
    limitations: [
      "This plugin reads only bounded checked-in evidence and program records.",
      "A ready result means the index inputs are structurally safe and internally coherent; it does not erase recorded attention states.",
      "It does not prove live GitHub, provider, browser, installation, publication, deployment, or release behavior.",
    ],
  };
}

function addCheck(checks, findings, id, observed) {
  checks.push({ id, observed: Boolean(observed) });
  if (!observed) findings.push({ severity: "error", code: "evidence-index-check-failed", marker: id });
}

function readJsonBounded(root, relativePath, findings, label) {
  const absolutePath = resolveBoundedPath(root, relativePath);
  if (!absolutePath || !fs.existsSync(absolutePath)) {
    findings.push({ severity: "error", code: label + "-missing" });
    return null;
  }
  try {
    const stat = fs.lstatSync(absolutePath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      findings.push({ severity: "error", code: label + "-unsafe-file" });
      return null;
    }
    if (stat.size > MAX_INPUT_BYTES) {
      findings.push({ severity: "error", code: label + "-too-large" });
      return null;
    }
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch {
    findings.push({ severity: "error", code: label + "-invalid-json" });
    return null;
  }
}

function resolveBoundedPath(root, candidate) {
  if (typeof candidate !== "string" || !candidate.trim()) return null;
  const resolved = path.resolve(root, candidate);
  return resolved === root || resolved.startsWith(root + path.sep) ? resolved : null;
}

function hasUnsafeInput(value) {
  return MACHINE_PATH_PATTERN.test(value) || SECRET_PATTERNS.some((pattern) => pattern.test(value));
}

function numberOrNull(value) {
  return Number.isInteger(value) ? value : null;
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value : null;
}
