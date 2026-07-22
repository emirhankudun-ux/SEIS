import fs from "node:fs";
import path from "node:path";

export const PROJECT_MANIFEST_AUDIT_ID = "seis-project-manifest-audit";
export const PROJECT_MANIFEST_PATH = "project.ecosystem.yaml";
export const MAX_MANIFEST_BYTES = 160_000;

const REQUIRED_VALUES = [
  ["schema_version", "2"],
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
  ["plugin_boundary.direct_repo_distribution.separate_marketplace_cards", "false"],
  ["plugin_boundary.direct_repo_distribution.source_packages_retained", "true"],
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
  const value = (suffix) => toNumber(scalars.get(`plugin_boundary.direct_repo_distribution.${suffix}`)?.value);
  const declaredCardCount = value("marketplace_projection.card_count");
  const declaredCanonicalCardCount = value("marketplace_projection.canonical_card_count");
  const declaredBundleCardCount = value("marketplace_projection.bundle_card_count");
  const declaredApplicationBundleCardCount = value("marketplace_projection.application_bundle_card_count");
  const declaredTopicBundleCardCount = value("marketplace_projection.topic_bundle_card_count");
  const declaredRetainedSourceCapabilityCount = value("source_capabilities.retained_count");
  const declaredMigratedRootSourceCount = value("source_capabilities.migrated_root_count");
  const declaredApplicationSourceCount = value("source_capabilities.application_count");
  const declaredTopicSourceCount = value("source_capabilities.topic_count");
  const sourceManifestApplicationCount = toNumber(sourceManifest?.pluginCount);
  const marketplaceCards = Array.isArray(marketplace?.plugins) ? marketplace.plugins : [];
  const marketplaceCanonicalCardCount = marketplaceCards.filter((plugin) => plugin?.name === "seis-ai-agent" && plugin?.source?.path === "./plugins/seis-ai-agent").length;
  const marketplaceBundleCards = marketplaceCards.filter((plugin) => plugin?.source?.path?.startsWith("./plugins/seis-bundles/"));
  const marketplaceApplicationBundleCardCount = marketplaceBundleCards.filter((plugin) => plugin?.name?.startsWith("seis-application-bundle-")).length;
  const marketplaceTopicBundleCardCount = marketplaceBundleCards.filter((plugin) => plugin?.name?.startsWith("seis-topic-bundle-")).length;
  const familyMarketplaceCardCount = toNumber(publicFamily?.marketplace?.publicPluginCount);
  const familyCanonicalCardCount = toNumber(publicFamily?.marketplace?.canonicalOrchestratorCount);
  const familyBundleCardCount = Array.isArray(publicFamily?.bundlePackages) ? publicFamily.bundlePackages.length : null;
  const familyApplicationBundleCardCount = Array.isArray(publicFamily?.bundlePackages) ? publicFamily.bundlePackages.filter((bundle) => bundle?.family === "application").length : null;
  const familyTopicBundleCardCount = Array.isArray(publicFamily?.bundlePackages) ? publicFamily.bundlePackages.filter((bundle) => bundle?.family === "topic").length : null;
  const familyMigratedRootSourceCount = Array.isArray(publicFamily?.migratedRootPlugins) ? publicFamily.migratedRootPlugins.length : null;
  const familyApplicationSourceCount = Array.isArray(publicFamily?.applicationPlugins) ? publicFamily.applicationPlugins.length : null;
  const familyTopicSourceCount = Array.isArray(publicFamily?.topicPlugins) ? publicFamily.topicPlugins.length : null;
  const familyRetainedSourceCapabilityCount = toNumber(publicFamily?.marketplace?.sourceCapabilityCount);

  if (sourceManifest && sourceManifest.owner !== "apps/seis-core") findings.push(finding("error", "app-source-manifest-owner-mismatch"));
  if (marketplace && (marketplace.name !== "seis-repo" || marketplace.interface?.displayName !== "SEIS Repo")) findings.push(finding("error", "repo-marketplace-identity-mismatch"));
  if (!equalKnown(declaredCardCount, marketplaceCards.length, familyMarketplaceCardCount)) findings.push(finding("error", "marketplace-card-count-mismatch"));
  if (!equalKnown(declaredCanonicalCardCount, marketplaceCanonicalCardCount, familyCanonicalCardCount)) findings.push(finding("error", "canonical-card-count-mismatch"));
  if (!equalKnown(declaredBundleCardCount, marketplaceBundleCards.length, familyBundleCardCount)) findings.push(finding("error", "bundle-card-count-mismatch"));
  if (!equalKnown(declaredApplicationBundleCardCount, marketplaceApplicationBundleCardCount, familyApplicationBundleCardCount)) findings.push(finding("error", "application-bundle-card-count-mismatch"));
  if (!equalKnown(declaredTopicBundleCardCount, marketplaceTopicBundleCardCount, familyTopicBundleCardCount)) findings.push(finding("error", "topic-bundle-card-count-mismatch"));
  if (!equalKnown(declaredApplicationSourceCount, sourceManifestApplicationCount, familyApplicationSourceCount)) findings.push(finding("error", "application-source-count-mismatch"));
  if (!equalKnown(declaredTopicSourceCount, familyTopicSourceCount)) findings.push(finding("error", "topic-source-count-mismatch"));
  if (!equalKnown(declaredMigratedRootSourceCount, familyMigratedRootSourceCount)) findings.push(finding("error", "migrated-root-source-count-mismatch"));
  if (!equalKnown(declaredRetainedSourceCapabilityCount, familyRetainedSourceCapabilityCount, declaredMigratedRootSourceCount + declaredApplicationSourceCount + declaredTopicSourceCount)) findings.push(finding("error", "retained-source-capability-count-mismatch"));

  return {
    declaredMarketplaceCardCount: declaredCardCount,
    declaredCanonicalCardCount,
    declaredBundleCardCount,
    declaredApplicationBundleCardCount,
    declaredTopicBundleCardCount,
    marketplaceCardCount: marketplaceCards.length,
    marketplaceCanonicalCardCount,
    marketplaceBundleCardCount: marketplaceBundleCards.length,
    marketplaceApplicationBundleCardCount,
    marketplaceTopicBundleCardCount,
    publicFamilyMarketplaceCardCount: familyMarketplaceCardCount,
    declaredRetainedSourceCapabilityCount,
    declaredMigratedRootSourceCount,
    declaredApplicationSourceCount,
    declaredTopicSourceCount,
    sourceManifestApplicationCount,
    publicFamilyRetainedSourceCapabilityCount: familyRetainedSourceCapabilityCount,
    publicFamilyMigratedRootSourceCount: familyMigratedRootSourceCount,
    publicFamilyApplicationSourceCount: familyApplicationSourceCount,
    publicFamilyTopicSourceCount: familyTopicSourceCount,
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
    declaredMarketplaceCardCount: null,
    declaredCanonicalCardCount: null,
    declaredBundleCardCount: null,
    declaredApplicationBundleCardCount: null,
    declaredTopicBundleCardCount: null,
    marketplaceCardCount: null,
    marketplaceCanonicalCardCount: null,
    marketplaceBundleCardCount: null,
    marketplaceApplicationBundleCardCount: null,
    marketplaceTopicBundleCardCount: null,
    publicFamilyMarketplaceCardCount: null,
    declaredRetainedSourceCapabilityCount: null,
    declaredMigratedRootSourceCount: null,
    declaredApplicationSourceCount: null,
    declaredTopicSourceCount: null,
    sourceManifestApplicationCount: null,
    publicFamilyRetainedSourceCapabilityCount: null,
    publicFamilyMigratedRootSourceCount: null,
    publicFamilyApplicationSourceCount: null,
    publicFamilyTopicSourceCount: null,
  };
}
