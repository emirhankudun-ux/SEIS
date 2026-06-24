#!/usr/bin/env node
// SEIS full-stack production-stack governance check.
// Asserts that the real production layers behind SEIS (mapped in
// SEIS_FULLSTACK_STACK.md) keep their evidence on disk. `present`/`partial`
// layers must have their evidence file; `target` layers (not built in this
// repo — e.g. load balancing, observability) must keep a contract section in
// the doc so the gap cannot be silently forgotten.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docPath = "SEIS_FULLSTACK_STACK.md";
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));

// Layer map. Keep in lock-step with the table in SEIS_FULLSTACK_STACK.md.
const LAYERS = [
  { layer: "frontend", status: "present", evidence: "apps/web/index.html" },
  { layer: "backend-apis", status: "partial", evidence: "polyglot/php/contact-endpoint.php" },
  { layer: "database-storage", status: "present", evidence: "polyglot/sql/audit_ledger.sqlite.sql" },
  { layer: "auth-permissions", status: "present", evidence: "packages/seis-ai/models/permission-policy-seed-v0.json" },
  { layer: "hosting-deployment", status: "present", evidence: "scripts/build-static.mjs" },
  { layer: "cloud-compute", status: "present", evidence: "scripts/provision-gcp-cloud-server.mjs" },
  { layer: "cicd", status: "present", evidence: ".github/workflows/ci.yml" },
  { layer: "security", status: "present", evidence: "SECURITY.md" },
  { layer: "rate-limiting", status: "partial", evidence: "polyglot/php/contact-endpoint.php" },
  { layer: "caching-cdn", status: "partial", evidence: "polyglot/python/seis_sw_cache_audit.py" },
  { layer: "monitoring-logging", status: "partial", evidence: ".github/workflows/security-guardian.yml" },
  { layer: "backups-recovery", status: "present", evidence: "scripts/restore-latest-release.mjs" },
  { layer: "testing", status: "present", evidence: "scripts/polyglot-check.sh" },
  { layer: "load-balancing-scaling", status: "target", contractHeading: "## Target: Load balancing & scaling" },
  { layer: "observability", status: "target", contractHeading: "## Target: Observability" },
];

if (!exists(docPath)) {
  console.error(`SEIS full-stack stack check failed:\n- missing ${docPath}`);
  process.exit(1);
}
const doc = fs.readFileSync(path.join(root, docPath), "utf8");

for (const { layer, status, evidence, contractHeading } of LAYERS) {
  if (status === "target") {
    if (!doc.includes(contractHeading)) {
      failures.push(`target layer "${layer}" lost its contract section (${contractHeading}) in ${docPath}`);
    }
    continue;
  }
  if (!exists(evidence)) {
    failures.push(`${status} layer "${layer}" lost its evidence: ${evidence}`);
  }
  // Each present/partial layer must also appear in the doc's layer map table.
  if (!doc.includes(evidence)) {
    failures.push(`layer "${layer}" evidence ${evidence} is not referenced in ${docPath}`);
  }
}

if (failures.length) {
  console.error("SEIS full-stack stack check failed:");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

const counts = LAYERS.reduce((acc, l) => ((acc[l.status] = (acc[l.status] ?? 0) + 1), acc), {});
console.log(
  `SEIS full-stack stack: OK — ${LAYERS.length} layers ` +
    `(${counts.present ?? 0} present, ${counts.partial ?? 0} partial, ${counts.target ?? 0} target)`
);
