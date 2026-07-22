import fs from "node:fs";
import path from "node:path";

export const PLUGIN_CAPABILITY_COVERAGE_ID = "seis-plugin-capability-coverage";

export const PLUGIN_CAPABILITY_COVERAGE_SCOPE = Object.freeze({
  sourceManifestPath: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalogPath: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrixPath: "content/development/seis-core-plugin-matrix.json",
  marketplacePath: ".agents/plugins/marketplace.json",
  bundleCatalogPath: "content/development/seis-public-plugin-bundle-catalog.json",
});

export const PLUGIN_CAPABILITY_COVERAGE_LIMITS = Object.freeze({
  maxRegistryBytes: 512 * 1024,
  maxRegistryPlugins: 512,
  maxCapabilitiesPerPlugin: 64,
  maxCategoryKinds: 128,
  maxCapabilityTokens: 2048,
  maxReturnedCategoryKinds: 128,
  maxReturnedCapabilityTokenKinds: 256,
  maxReturnedFindings: 64,
});

const MACHINE_PATH_PATTERN = /(?:\/Users\/|\/home\/|[A-Za-z]:\\|[A-Za-z]:\/(?!\/))/g;
const CREDENTIAL_ASSIGNMENT_PATTERN = /["']?\b(?:api[_-]?key|access[_-]?token|auth(?:entication)?[_-]?token|password|secret)\b["']?\s*[:=]\s*["'][^"'\r\n]+["']/gi;
const SAFE_PLUGIN_NAME = /^[a-z0-9][a-z0-9-]{0,95}$/;

export function auditPluginCapabilityCoverage(rootPath) {
  const findings = [];
  const root = resolveRoot(rootPath);
  const inputs = {};
  const safetyCounters = {
    registryByteCount: 0,
    machineSpecificPathMarkerCount: 0,
    credentialAssignmentFindingCount: 0,
  };

  if (!root) {
    findings.push(error("invalid-repository-root"));
  } else {
    for (const [key, relativePath] of Object.entries(PLUGIN_CAPABILITY_COVERAGE_SCOPE)) {
      const result = readFixedRegistry(root, relativePath);
      if (!result.ok) {
        findings.push(error(result.code));
        continue;
      }

      inputs[key] = result.value;
      safetyCounters.registryByteCount += result.byteCount;
      safetyCounters.machineSpecificPathMarkerCount += countMatches(result.source, MACHINE_PATH_PATTERN);
      safetyCounters.credentialAssignmentFindingCount += countMatches(result.source, CREDENTIAL_ASSIGNMENT_PATTERN);
    }
  }

  if (safetyCounters.machineSpecificPathMarkerCount > 0) {
    findings.push(error("machine-path-marker-redacted", safetyCounters.machineSpecificPathMarkerCount));
  }
  if (safetyCounters.credentialAssignmentFindingCount > 0) {
    findings.push(error("credential-assignment-marker-found", safetyCounters.credentialAssignmentFindingCount));
  }

  let coverage = emptyCoverage();
  let reconciliation = emptyReconciliation();
  if (Object.keys(inputs).length === Object.keys(PLUGIN_CAPABILITY_COVERAGE_SCOPE).length
    && safetyCounters.machineSpecificPathMarkerCount === 0
    && safetyCounters.credentialAssignmentFindingCount === 0) {
    const source = parseSourceManifest(inputs.sourceManifestPath);
    const catalog = parseCatalog(inputs.catalogPath);
    const matrix = parseMatrix(inputs.matrixPath);
    const marketplace = parseMarketplace(inputs.marketplacePath);
    const bundleCatalog = parseBundleCatalog(inputs.bundleCatalogPath);
    for (const code of [...source.errors, ...catalog.errors, ...matrix.errors, ...marketplace.errors, ...bundleCatalog.errors]) {
      findings.push(error(code));
    }

    if (source.errors.length === 0 && catalog.errors.length === 0 && matrix.errors.length === 0 && marketplace.errors.length === 0 && bundleCatalog.errors.length === 0) {
      coverage = buildCoverage(catalog.plugins);
      for (const code of coverage.findings) findings.push(error(code));
      reconciliation = buildReconciliation({
        sourceNames: source.names,
        catalogNames: catalog.names,
        matrixNames: matrix.names,
        bundleApplicationNames: bundleCatalog.applicationMemberNames,
        marketplacePublicCardCount: marketplace.publicCardCount,
      });
      if (!reconciliation.reconciled) {
        findings.push(error("registry-projection-mismatch", reconciliation.mismatchCount));
      }
    }
  }

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  const attentionCount = findings.filter((finding) => finding.severity === "attention").length;
  const registryReadable = Object.keys(inputs).length === Object.keys(PLUGIN_CAPABILITY_COVERAGE_SCOPE).length;
  return {
    state: errorCount > 0 || attentionCount > 0 ? "attention" : "ready",
    ok: errorCount === 0,
    mode: "fixed-public-registry-capability-coverage-static-read-only",
    classification: "bounded-declared-seis-plugin-capability-coverage",
    plugin: PLUGIN_CAPABILITY_COVERAGE_ID,
    summary: {
      registryReadable,
      boundedRegistryByteCount: safetyCounters.registryByteCount,
      sourcePluginCount: reconciliation.sourcePluginCount,
      catalogPluginCount: reconciliation.catalogPluginCount,
      matrixPluginCount: reconciliation.matrixPluginCount,
      bundleApplicationMemberCount: reconciliation.bundleApplicationMemberCount,
      marketplacePublicCardCount: reconciliation.marketplacePublicCardCount,
      declaredCategoryCount: coverage.declaredCategoryKindCount,
      reportedCategoryCount: coverage.categoryCounts.length,
      declaredCapabilityTokenKindCount: coverage.declaredCapabilityTokenKindCount,
      reportedCapabilityTokenKindCount: coverage.capabilityTokenFrequencies.length,
      declaredCapabilityTokenCount: coverage.declaredCapabilityTokenCount,
      coverageOutputTruncated: coverage.categoryCountsTruncated || coverage.capabilityTokenFrequenciesTruncated,
      reconciliationAvailable: registryReadable && errorCount === 0,
    },
    coverage,
    reconciliation,
    attention: {
      disposition: errorCount > 0 || attentionCount > 0 ? "review-required" : "not-required",
      summary: errorCount > 0 || attentionCount > 0
        ? "Fixed public registry evidence needs review before aggregate coverage is available."
        : "The bounded static registry contract is available for aggregate coverage only.",
    },
    findings: sortFindings(findings).slice(0, PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxReturnedFindings),
    errorCount,
    warningCount: attentionCount,
    limits: PLUGIN_CAPABILITY_COVERAGE_LIMITS,
    permissions: {
      read: [
        "five fixed checked-in public SEIS Repo registry projections",
        "bounded derived category and capability coverage metadata",
      ],
      write: [],
      network: [],
      secrets: [],
    },
    outputBoundary: {
      rawRegistryContentReturned: false,
      rawDescriptionsReturned: false,
      rawCapabilityPhrasesReturned: false,
      rawMatchedValuesReturned: false,
      absolutePathsReturned: false,
      machineSpecificPathsReturned: false,
      aggregateOutputBounded: true,
    },
    safety: {
      fixedRegistryPaths: Object.values(PLUGIN_CAPABILITY_COVERAGE_SCOPE),
      regularFilesRequired: true,
      symlinkRefusal: true,
      machineSpecificPathMarkerCount: safetyCounters.machineSpecificPathMarkerCount,
      credentialAssignmentFindingCount: safetyCounters.credentialAssignmentFindingCount,
      readsPersonalMarketplace: false,
      writesFiles: false,
      usesNetwork: false,
      readsSecrets: false,
      installsPlugins: false,
      invokesProviders: false,
      deploysArtifacts: false,
      signsArtifacts: false,
      publicReleaseAllowed: false,
    },
    limitations: [
      "This audit reads only five bounded static public registry projections and reports derived coverage metadata.",
      "Declared registry entries do not prove manifest correctness, installation, MCP activation, runtime behavior, provider availability, deployment, signing, or release readiness.",
      "Malformed, unsafe, oversized, missing, non-regular, symlinked, or mismatched registry evidence is reported as attention without returning raw input values.",
      "The audit never follows symlinks, writes files, uses a network, reads a personal marketplace, reads credentials, or calls providers.",
    ],
  };
}

function parseSourceManifest(value) {
  const plugins = array(value?.plugins);
  const parsed = parsePluginNames(plugins);
  const errors = [...parsed.errors];
  if (value?.id !== "seis-core-plugin-sources") errors.push("invalid-source-manifest-id");
  if (!Array.isArray(value?.plugins)) errors.push("invalid-source-manifest-plugins");
  return { names: parsed.names, errors: unique(errors) };
}

function parseCatalog(value) {
  const plugins = array(value?.plugins);
  const parsed = parsePluginNames(plugins);
  const errors = [...parsed.errors];
  if (value?.id !== "seis-core-application-plugin-catalog") errors.push("invalid-catalog-id");
  if (!Array.isArray(value?.plugins)) errors.push("invalid-catalog-plugins");
  const normalizedPlugins = [];
  for (const plugin of plugins) {
    const name = safePluginName(plugin?.name);
    if (!name) continue;
    const category = normalizeToken(plugin?.category);
    if (!category) {
      errors.push("invalid-catalog-category");
      continue;
    }
    const capabilities = array(plugin?.capabilities);
    if (capabilities.length > PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxCapabilitiesPerPlugin) {
      errors.push("capability-count-limit-exceeded");
      continue;
    }
    const tokens = capabilities.map(normalizeToken).filter(Boolean);
    if (tokens.length !== capabilities.length) {
      errors.push("invalid-catalog-capability-token");
      continue;
    }
    normalizedPlugins.push({ name, category, capabilityTokens: tokens });
  }
  if (normalizedPlugins.length !== parsed.names.length) errors.push("catalog-plugin-coverage-incomplete");
  return { names: parsed.names, plugins: normalizedPlugins, errors: unique(errors) };
}

function parseMatrix(value) {
  const parsed = parsePluginNames(array(value?.plugins));
  const errors = [...parsed.errors];
  if (value?.id !== "seis-core-plugin-matrix") errors.push("invalid-matrix-id");
  if (!Array.isArray(value?.plugins)) errors.push("invalid-matrix-plugins");
  return { names: parsed.names, errors: unique(errors) };
}

function parseMarketplace(value) {
  const plugins = array(value?.plugins);
  const parsed = parsePluginNames(plugins);
  const errors = [...parsed.errors];
  if (value?.name !== "seis-repo") errors.push("invalid-marketplace-name");
  if (value?.interface?.displayName !== "SEIS Repo") errors.push("invalid-marketplace-display-name");
  if (!Array.isArray(value?.plugins)) errors.push("invalid-marketplace-plugins");
  return {
    publicCardCount: plugins.length,
    errors: unique(errors),
  };
}

function parseBundleCatalog(value) {
  const bundles = array(value?.bundles);
  const errors = [];
  const applicationMemberNames = [];
  if (value?.id !== "seis-public-plugin-bundle-catalog") errors.push("invalid-bundle-catalog-id");
  if (!Array.isArray(value?.bundles)) errors.push("invalid-bundle-catalog-bundles");
  if (bundles.length > PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxRegistryPlugins) errors.push("registry-plugin-count-limit-exceeded");
  for (const bundle of bundles) {
    if (!safePluginName(bundle?.id)) {
      errors.push("invalid-plugin-name");
      continue;
    }
    if (bundle?.family !== "application" && bundle?.family !== "topic") {
      errors.push("invalid-bundle-family");
      continue;
    }
    if (!Array.isArray(bundle?.memberNames) || bundle.memberNames.length === 0 || bundle.memberNames.length > 15) {
      errors.push("invalid-bundle-members");
      continue;
    }
    const parsed = parsePluginNames(bundle.memberNames.map((name) => ({ name })));
    errors.push(...parsed.errors);
    if (bundle.family === "application") applicationMemberNames.push(...parsed.names);
  }
  if (new Set(applicationMemberNames).size !== applicationMemberNames.length) errors.push("duplicate-bundle-member-name");
  return {
    applicationMemberNames: [...new Set(applicationMemberNames)].sort(),
    errors: unique(errors),
  };
}

function parsePluginNames(plugins) {
  const names = [];
  const errors = [];
  if (plugins.length > PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxRegistryPlugins) {
    errors.push("registry-plugin-count-limit-exceeded");
    return { names, errors };
  }
  for (const plugin of plugins) {
    const name = safePluginName(plugin?.name);
    if (!name) {
      errors.push("invalid-plugin-name");
      continue;
    }
    names.push(name);
  }
  if (new Set(names).size !== names.length) errors.push("duplicate-plugin-name");
  return { names: [...new Set(names)].sort(), errors: unique(errors) };
}

function buildCoverage(plugins) {
  const categoryCounts = countRecords(plugins.map((plugin) => plugin.category), "category");
  const capabilityTokens = plugins.flatMap((plugin) => plugin.capabilityTokens);
  const capabilityTokenFrequencies = countRecords(capabilityTokens, "token");
  const findings = [];
  if (categoryCounts.length > PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxCategoryKinds) findings.push("category-kind-limit-exceeded");
  if (capabilityTokenFrequencies.length > PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxCapabilityTokens) findings.push("capability-token-kind-limit-exceeded");
  const coverageAvailable = findings.length === 0;
  return {
    categoryCounts: coverageAvailable
      ? categoryCounts.slice(0, PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxReturnedCategoryKinds)
      : [],
    capabilityTokenFrequencies: coverageAvailable
      ? capabilityTokenFrequencies.slice(0, PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxReturnedCapabilityTokenKinds)
      : [],
    declaredCategoryKindCount: coverageAvailable ? categoryCounts.length : 0,
    declaredCapabilityTokenKindCount: coverageAvailable ? capabilityTokenFrequencies.length : 0,
    declaredCapabilityTokenCount: coverageAvailable ? capabilityTokens.length : 0,
    categoryCountsTruncated: coverageAvailable && categoryCounts.length > PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxReturnedCategoryKinds,
    capabilityTokenFrequenciesTruncated: coverageAvailable && capabilityTokenFrequencies.length > PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxReturnedCapabilityTokenKinds,
    coverageAvailable,
    findings,
  };
}

function buildReconciliation({ sourceNames, catalogNames, matrixNames, bundleApplicationNames, marketplacePublicCardCount }) {
  const source = new Set(sourceNames);
  const catalog = new Set(catalogNames);
  const matrix = new Set(matrixNames);
  const bundle = new Set(bundleApplicationNames);
  const differences = [
    differenceCount(source, catalog),
    differenceCount(catalog, source),
    differenceCount(source, matrix),
    differenceCount(matrix, source),
    differenceCount(source, bundle),
    differenceCount(bundle, source),
  ];
  const mismatchCount = differences.reduce((sum, count) => sum + count, 0);
  return {
    sourcePluginCount: source.size,
    catalogPluginCount: catalog.size,
    matrixPluginCount: matrix.size,
    bundleApplicationMemberCount: bundle.size,
    marketplacePublicCardCount: Number.isSafeInteger(marketplacePublicCardCount) ? marketplacePublicCardCount : 0,
    sourceMissingFromCatalogCount: differenceCount(source, catalog),
    catalogMissingFromSourceCount: differenceCount(catalog, source),
    sourceMissingFromMatrixCount: differenceCount(source, matrix),
    matrixMissingFromSourceCount: differenceCount(matrix, source),
    sourceMissingFromBundleCount: differenceCount(source, bundle),
    bundleMissingFromSourceCount: differenceCount(bundle, source),
    mismatchCount,
    reconciled: mismatchCount === 0,
  };
}

function countRecords(values, key) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ [key]: value, count }))
    .sort((left, right) => right.count - left.count || String(left[key]).localeCompare(String(right[key])));
}

function readFixedRegistry(root, relativePath) {
  const absolutePath = resolveBoundedPath(root, relativePath);
  if (!absolutePath) return { ok: false, code: "fixed-registry-path-escaped" };
  let stats;
  try {
    stats = fs.lstatSync(absolutePath);
  } catch {
    return { ok: false, code: "registry-missing" };
  }
  if (!stats.isFile() || stats.isSymbolicLink()) return { ok: false, code: "registry-not-regular-file" };
  if (stats.size > PLUGIN_CAPABILITY_COVERAGE_LIMITS.maxRegistryBytes) return { ok: false, code: "registry-byte-limit-exceeded" };
  let source;
  try {
    source = fs.readFileSync(absolutePath, "utf8");
  } catch {
    return { ok: false, code: "registry-unreadable" };
  }
  try {
    return { ok: true, value: JSON.parse(source), source, byteCount: Buffer.byteLength(source, "utf8") };
  } catch {
    return { ok: false, code: "registry-json-invalid" };
  }
}

function resolveRoot(rootPath) {
  if (!rootPath || typeof rootPath !== "string") return null;
  const root = path.resolve(rootPath);
  try {
    const stats = fs.lstatSync(root);
    return stats.isDirectory() && !stats.isSymbolicLink() ? root : null;
  } catch {
    return null;
  }
}

function resolveBoundedPath(root, relativePath) {
  const target = path.resolve(root, relativePath);
  const relation = path.relative(root, target);
  return relation && !relation.startsWith(`..${path.sep}`) && relation !== ".." && !path.isAbsolute(relation) ? target : null;
}

function safePluginName(value) {
  const name = typeof value === "string" ? value.trim() : "";
  return SAFE_PLUGIN_NAME.test(name) ? name : null;
}

function normalizeToken(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized && normalized.length <= 96 ? normalized : null;
}

function differenceCount(left, right) {
  let count = 0;
  for (const value of left) if (!right.has(value)) count += 1;
  return count;
}

function emptyCoverage() {
  return {
    categoryCounts: [],
    capabilityTokenFrequencies: [],
    declaredCategoryKindCount: 0,
    declaredCapabilityTokenKindCount: 0,
    declaredCapabilityTokenCount: 0,
    categoryCountsTruncated: false,
    capabilityTokenFrequenciesTruncated: false,
    coverageAvailable: false,
    findings: [],
  };
}

function emptyReconciliation() {
  return {
    sourcePluginCount: 0,
    catalogPluginCount: 0,
    matrixPluginCount: 0,
    bundleApplicationMemberCount: 0,
    marketplacePublicCardCount: 0,
    sourceMissingFromCatalogCount: 0,
    catalogMissingFromSourceCount: 0,
    sourceMissingFromMatrixCount: 0,
    matrixMissingFromSourceCount: 0,
    sourceMissingFromBundleCount: 0,
    bundleMissingFromSourceCount: 0,
    mismatchCount: 0,
    reconciled: false,
  };
}

function error(code, count = 1) {
  return { severity: "error", code, count };
}

function sortFindings(findings) {
  return [...findings].sort((left, right) => left.code.localeCompare(right.code));
}

function countMatches(source, pattern) {
  const matches = source.match(pattern);
  return matches ? matches.length : 0;
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(values)];
}
