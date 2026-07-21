import fs from "node:fs";
import path from "node:path";

export const PROJECT_MANIFEST_AUDIT_ID = "seis-project-manifest-audit";
export const PROJECT_MANIFEST_PATH = "project.ecosystem.yaml";
export const MAX_MANIFEST_BYTES = 160_000;

const REQUIRED_VALUES = [
  ["project.id", "seis-plugin-root"],
  ["project.display_name", "SEIS Core App-Owned Plugins"],
  ["project.visibility", "public-repo-internal-local"],
  ["project.horizon", "5-years"],
  ["ecosystem.canonical_owner_repo", "SEIS"],
  ["plugin_boundary.application", "apps/seis-core"],
  ["plugin_boundary.source_root", "plugins/seis-core"],
  ["plugin_boundary.marketplace_mutation", "false"],
  ["plugin_boundary.direct_repo_distribution.enabled", "true"],
  ["plugin_boundary.direct_repo_distribution.public_repository_available", "true"],
  ["plugin_boundary.direct_repo_distribution.public_audience", "everyone"],
  ["plugin_boundary.direct_repo_distribution.marketplace_name", "seis-repo"],
  ["plugin_boundary.direct_repo_distribution.public_marketplace", "true"],
  ["architecture.source_of_truth", "plugins/seis-core"],
  ["security.default_plugin_permissions.write", "[]"],
  ["security.default_plugin_permissions.network", "[]"],
  ["security.default_plugin_permissions.secrets", "[]"],
];

export function auditProjectManifest(rootPath, options = {}) {
  const root = path.resolve(rootPath);
  const manifestPath = resolveBoundedPath(root, options.manifestPath || PROJECT_MANIFEST_PATH);
  const findings = [];
  const manifestRelativePath = path.relative(root, manifestPath).split(path.sep).join("/");

  if (!manifestPath || !fs.existsSync(manifestPath)) {
    findings.push(finding("error", "project-manifest-missing"));
    return result({ findings, checks: [], counts: emptyCounts(), manifestRelativePath });
  }
  const stat = fs.statSync(manifestPath);
  if (stat.size > MAX_MANIFEST_BYTES) {
    findings.push(finding("error", "project-manifest-too-large"));
    return result({ findings, checks: [], counts: emptyCounts(), manifestRelativePath });
  }

  const yaml = fs.readFileSync(manifestPath, "utf8");
  const scalars = parseYamlScalars(yaml);
  const checks = REQUIRED_VALUES.map(([key, expected]) => {
    const record = scalars.get(key);
    const observed = record?.value === expected;
    if (!observed) findings.push(finding("error", record ? "project-manifest-value-mismatch" : "project-manifest-value-missing", key));
    return {
      id: key,
      expected,
      observed,
      line: record?.line ?? null,
    };
  });

  const sourceManifest = readJson(root, "apps/seis-core/data/seis-core-plugin-sources.json", findings, "app-source-manifest");
  const marketplace = readJson(root, ".agents/plugins/marketplace.json", findings, "repo-marketplace");
  const publicFamily = readJson(root, "content/development/seis-public-plugin-family.json", findings, "public-plugin-family");
  const counts = reconcileCounts({ scalars, sourceManifest, marketplace, publicFamily, findings });

  return result({ findings, checks, counts, manifestRelativePath });
}

function reconcileCounts({ scalars, sourceManifest, marketplace, publicFamily, findings }) {
  const declaredTotal = toNumber(scalars.get("plugin_boundary.direct_repo_distribution.marketplace_entry_count")?.value);
  const declaredApplication = toNumber(scalars.get("plugin_boundary.direct_repo_distribution.application_marketplace_entry_count")?.value);
  const sourceCount = toNumber(sourceManifest?.pluginCount);
  const marketplaceCards = Array.isArray(marketplace?.plugins) ? marketplace.plugins : [];
  const marketplaceApplicationCount = marketplaceCards.filter((plugin) => plugin?.source?.path?.startsWith("./plugins/seis-core/")).length;
  const familyApplicationCount = Array.isArray(publicFamily?.applicationPlugins) ? publicFamily.applicationPlugins.length : null;
  const familyTotal = toNumber(publicFamily?.marketplace?.publicPluginCount);

  if (sourceManifest && sourceManifest.owner !== "apps/seis-core") findings.push(finding("error", "app-source-manifest-owner-mismatch"));
  if (marketplace && (marketplace.name !== "seis-repo" || marketplace.interface?.displayName !== "SEIS Repo")) findings.push(finding("error", "repo-marketplace-identity-mismatch"));
  if (!equalKnown(declaredApplication, sourceCount, marketplaceApplicationCount, familyApplicationCount)) findings.push(finding("error", "application-plugin-count-mismatch"));
  if (!equalKnown(declaredTotal, marketplaceCards.length, familyTotal)) findings.push(finding("error", "marketplace-entry-count-mismatch"));

  return {
    declaredMarketplaceEntryCount: declaredTotal,
    declaredApplicationMarketplaceEntryCount: declaredApplication,
    sourceManifestPluginCount: sourceCount,
    marketplaceApplicationPluginCount: marketplaceApplicationCount,
    marketplaceEntryCount: marketplaceCards.length,
    publicFamilyApplicationPluginCount: familyApplicationCount,
    publicFamilyMarketplaceEntryCount: familyTotal,
  };
}

function result({ findings, checks, counts, manifestRelativePath }) {
  const errorCount = findings.filter((item) => item.severity === "error").length;
  return {
    state: errorCount === 0 ? "ready" : "attention",
    ok: errorCount === 0,
    mode: "project-manifest-governance-read-only",
    auditId: PROJECT_MANIFEST_AUDIT_ID,
    manifestPath: manifestRelativePath || PROJECT_MANIFEST_PATH,
    checks,
    counts,
    errorCount,
    warningCount: findings.filter((item) => item.severity === "warning").length,
    findings,
    permissions: {
      read: [
        PROJECT_MANIFEST_PATH,
        "apps/seis-core/data/seis-core-plugin-sources.json",
        ".agents/plugins/marketplace.json",
        "content/development/seis-public-plugin-family.json",
      ],
      write: [],
      network: [],
      secrets: [],
    },
    limitations: [
      "This audit reads only bounded checked-in governance and marketplace metadata.",
      "It does not install, enable, execute, publish, authorize, or release a plugin.",
      "A ready result proves declared local metadata alignment, not live GitHub, provider, or runtime availability.",
    ],
  };
}

function parseYamlScalars(source) {
  const records = new Map();
  const stack = [];
  for (const [index, line] of source.split(/\r?\n/).entries()) {
    const match = /^(\s*)([A-Za-z_][A-Za-z0-9_-]*):(?:\s*(.*?))?\s*$/.exec(line);
    if (!match) continue;
    const indent = match[1].replaceAll("\t", "  ").length;
    const key = match[2];
    const raw = (match[3] || "").replace(/\s+#.*$/, "").trim();
    while (stack.length > 0 && stack.at(-1).indent >= indent) stack.pop();
    const pathKey = [...stack.map((item) => item.key), key].join(".");
    if (raw) records.set(pathKey, { value: stripQuotes(raw), line: index + 1 });
    stack.push({ key, indent });
  }
  return records;
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, "");
}

function resolveBoundedPath(root, candidate) {
  if (typeof candidate !== "string" || !candidate.trim()) return null;
  const resolved = path.resolve(root, candidate);
  return resolved === root || resolved.startsWith(`${root}${path.sep}`) ? resolved : null;
}

function readJson(root, relativePath, findings, label) {
  const absolutePath = resolveBoundedPath(root, relativePath);
  if (!absolutePath || !fs.existsSync(absolutePath)) {
    findings.push(finding("error", `${label}-missing`));
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch {
    findings.push(finding("error", `${label}-invalid-json`));
    return null;
  }
}

function equalKnown(...values) {
  const known = values.filter((value) => Number.isInteger(value));
  return known.length === values.length && new Set(known).size === 1;
}

function toNumber(value) {
  return Number.isInteger(value) ? value : Number.isInteger(Number(value)) ? Number(value) : null;
}

function finding(severity, code, marker = null) {
  return marker ? { severity, code, marker } : { severity, code };
}

function emptyCounts() {
  return {
    declaredMarketplaceEntryCount: null,
    declaredApplicationMarketplaceEntryCount: null,
    sourceManifestPluginCount: null,
    marketplaceApplicationPluginCount: null,
    marketplaceEntryCount: null,
    publicFamilyApplicationPluginCount: null,
    publicFamilyMarketplaceEntryCount: null,
  };
}
